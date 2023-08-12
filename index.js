import { CronJob } from "cron";
import dotenv from 'dotenv';
import pino from "pino";
import puppeteer from "puppeteer";
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
  }

  const wallet = await walletResponse.json();
    
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

      await addZkSyncNetwork(mainPage);

      logger.info("Going to SyncSwap and changing network");

      await goToSyncSwapAndChangeNetwork(mainPage);

      await sleep(10000);

      logger.info("Opening currency selector modal");

      await handleOpenStartingCurrencySelectorModal(mainPage);

      await sleep(10000);

      logger.info("Successful transaction");

      await browser.close();
    }, 10000);
  } catch (err) { 
    console.error(err); 

    logger.error("Error during transaction");

    browser.close();
    
    clearTimeout(timeout);
  }
}

// Run every 30 minutes
const job = new CronJob("0 */30 * * * *", runAutomatedTransaction);

job.start();

logger.info("Cron job started");