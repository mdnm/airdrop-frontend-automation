import { CronJob } from "cron";
import dotenv from 'dotenv';
import pino from "pino";
import puppeteer from "puppeteer";
import useProxy from 'puppeteer-page-proxy';
import { addZkSyncNetwork, goToSyncSwapAndChangeNetwork, handleOpenStartingCurrencySelectorModal } from './actions.js';
import { sleep } from './utils.js';

dotenv.config();

const logger = pino({
  prettyPrint: false,
  level: "info",
});

async function runAutomatedTransaction() {
  const extensionPath = process.env.EXTENSION_PATH;

  if (!extensionPath) {
    throw new Error("Extension path is not defined");
  }

  const walletResponse = await fetch(`${process.env.WALLET_MANAGER_URL}/transaction/fetch`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!walletResponse.ok && walletResponse.status !== 404) {
    throw new Error("Error during fetching wallet");
  }
    
  if (walletResponse.status === 404) {
    logger.info("No wallet to process");
    return;
  }

  const wallet = await walletResponse.json();
    
  logger.info(wallet, "Wallet to process")

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  let timeout;

  try {
    const [mainPage] = await browser.pages();

    logger.info("Opening Metamask extension");

    timeout = setTimeout(async () => {

      const [,metamaskPage] = await browser.pages();

      
      await sleep();
      
      const currentWalletInput = await metamaskPage.waitForSelector("#current-wallet-input");
      await currentWalletInput.type(`${wallet.walletId}`);
      
      await sleep(30000);
      
      await metamaskPage.close();
      
      logger.info("Adding zkSync network");
      
      await useProxy(mainPage, wallet.walletIp);
      await mainPage.goto("https://www.myip.com");

      await sleep(100000)

      await addZkSyncNetwork(mainPage);

      logger.info("Going to SyncSwap and changing network");

      await goToSyncSwapAndChangeNetwork(mainPage);

      await sleep(10000);

      logger.info("Opening currency selector modal");

      await handleOpenStartingCurrencySelectorModal(mainPage);

      await sleep(10000);

      logger.info("Successful transaction");

      await browser.close();

      await fetch(`${process.env.WALLET_MANAGER_URL}/transaction/push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletId: wallet.walletId, success: true }),
      });
    }, 10000);
  } catch (err) { 
    logger.error(err, "Error during transaction");

    browser.close();

    await fetch(`${process.env.WALLET_MANAGER_URL}/transaction/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletId: wallet.walletId, success: false }),
    });
    
    clearTimeout(timeout);
  }
}

try {
  const job = new CronJob("0 */30 * * * *", runAutomatedTransaction);
  
  job.start();
  
  logger.info("Cron job started");

  runAutomatedTransaction();
} catch (err) {
  logger.error(err, "Error during cron job initialization");
  shutdownProcedure();
};

function shutdownProcedure() {
  console.log('*** App is now closing ***');
  process.exit(0);  
}

process.on('SIGINT', () => {
  console.log('*** Signal received ****');
  console.log('*** App will be closed in 10 sec ****');
  setTimeout(shutdownProcedure, 10000);
});
