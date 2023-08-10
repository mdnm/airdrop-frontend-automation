import puppeteer from "puppeteer";
import { addZkSyncNetwork, goToSyncSwapAndChangeNetwork, handleOpenStartingCurrencySelectorModal } from './actions';

async function runAutomatedTransaction() {
  const extensionPath = "./metamask-extension-with-plugins/dist/chrome";

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  try {
    const [mainPage] = await browser.pages();

    setTimeout(async () => {
      await addZkSyncNetwork(mainPage);

      await goToSyncSwapAndChangeNetwork(mainPage);

      await sleep(10000);

      await handleOpenStartingCurrencySelectorModal(mainPage);

      await sleep(10000);

      await browser.close();
    }, 10000);
  } catch (err) { console.error(err); }
}

function getTodayStartingHour() {
  const dailyHourRange = {
    start: 10,
    end: 17
  }

  return Math.floor(
    Math.random() * (dailyHourRange.end - dailyHourRange.start + 1) +
      dailyHourRange.start
  );
}