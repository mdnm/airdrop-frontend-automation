import puppeteer from "puppeteer";

const MINIMUM_TIME_BETWEEN_ACTIONS = 15000;
const RANDOM_TIME_BETWEEN_ACTIONS = 5000;

function getWaitTime() {
  return (
    Math.floor(Math.random() * RANDOM_TIME_BETWEEN_ACTIONS) +
    MINIMUM_TIME_BETWEEN_ACTIONS
  );
}

async function openCurrencySelectorModal(
  page,
  currencyPosition
) {
  const time = getWaitTime();

  new Promise((resolve) => {
    setTimeout(async () => {
      const swapButtons = await page.$$(".swap-token-btn");

      const currency = swapButtons[currencyPosition];
      await currency?.click();
      resolve(null);
    }, time);
  });
}

async function handleOpenStartingCurrencySelectorModal(page) {
  await openCurrencySelectorModal(page, 0);

  await handleSelectStartingCurrency(page)
}

async function handleOpenOtherCurrencySelectorModal(page) {
  await openCurrencySelectorModal(page, 1);

  await handleSelectOtherCurrency(page)
}

async function selectCurrency(
  page,
  isSelectingStartingCurrency,
) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(async () => {
      await page.evaluate(
        async (isSelectingStartingCurrency) => {
          const tokensContainer = document.querySelector(".token-selector-currencies");
          if (!tokensContainer) {
            return;
          }

          const currencyButton = Array.from(tokensContainer?.children ?? []).find(
            (token) => {
              const currencyText = token?.innerText;
  
              const availableCurrenciesRegex = new RegExp("USDC|USDT");
  
              if (!availableCurrenciesRegex.test(currencyText)) {
                return false;
              }
  
              const amount = currencyText.split("\n\n")[2];
  
              if (isSelectingStartingCurrency && amount) {
                return true;
              } else if (!isSelectingStartingCurrency && !amount) {
                return true;
              }
  
              return false;
            }
          );
  
          await currencyButton?.click();
        }, isSelectingStartingCurrency
      );

      resolve(null);
    }, time);
  });
}

async function handleSelectStartingCurrency(page) {
  await selectCurrency(page, true);

  await handleOpenOtherCurrencySelectorModal(page)
}

async function handleSelectOtherCurrency(page) {
  await selectCurrency(page, false);

  await handleSelectAmount(page)
}

async function selectAmount(page, amount) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(async () => {
      await page.evaluate(async (amount) => {
        const buttons = document.querySelectorAll(".MuiButton-outlined")
        const amountButton = Array.from(buttons).find((button) => {
          return button.innerHTML.includes(amount);
        });
        await amountButton?.click();
      }, amount);
      
      resolve(null);        
    }, time);
  });
}

async function handleSelectAmount(page) {
  await selectAmount(page, "100%");

  await handleClickUnlockButton(page);
}

async function clickSwapButton(page) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(async () => {
      await page.evaluate(async () => {
        const buttons = document.querySelectorAll(".MuiButton-contained")
        const swapButton = Array.from(buttons).find((button) => {
          return button.innerHTML.includes("Swap");
        });
        await swapButton?.click();
      });
      resolve(null);
    }, time);
  });
}

async function handleClickSwapButton(page) {
  await clickSwapButton(page);
}

async function clickUnlockButton(page) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await page.evaluate(async () => {
        const buttons = document.querySelectorAll(".MuiButton-contained")
        if (!buttons) {
          return false;
        }
  
        const unlockButton = Array.from(buttons).find((button) => {
          return button.innerHTML.includes("Unlock");
        });
  
        if (!unlockButton) {
          return false;
        }
  
        await unlockButton.click();
        return true;
      });

      resolve(result);
    }, time);
  });
}

async function handleClickUnlockButton(page) {
  const foundUnlockButton = await clickUnlockButton(page);

  if (foundUnlockButton) {
    await handleCloseUnlockSuccessModal(page)
  } else {
    await handleClickSwapButton(page)
  }
}

async function closeSuccessModal(page) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(async () => {
      const modalOverlay = await page.$(
        ".background-overlay"
      );
      await modalOverlay?.click();
      resolve(null);
    }, time);
  });
}

async function handleCloseUnlockSuccessModal(page) {
  await closeSuccessModal(page);

  await handleClickSwapButton(page);
}

(async () => {
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
      await mainPage.goto("https://chainlist.org/chain/324", {timeout: 0, waitUntil: 'networkidle0'});

      const connectNetworkButton = await mainPage.$("button.border");
      await connectNetworkButton?.click();

      await new Promise(r => setTimeout(r, 2000));
      
      await mainPage.goto("https://syncswap.xyz", {timeout: 0, waitUntil: 'networkidle0'});
      await mainPage.setViewport({ width: 920, height: 800 });
      const closeOnboardingButton = await mainPage.$(".window .pointer");
      await closeOnboardingButton?.click();
      await new Promise(r => setTimeout(r, 2000));
      
      const connectWalletButton = await mainPage.waitForSelector('button')
      await connectWalletButton?.click();
      await new Promise(r => setTimeout(r, 2000));
      
      const connectToMetamaskButton = await mainPage.waitForSelector('div >>>> ::-p-text("Ethereum Wallet")')
      await connectToMetamaskButton?.click();
      await new Promise(r => setTimeout(r, 10000));
      
      const switchNetworkButton = await mainPage.waitForSelector('#swap-box > div:nth-child(1) > div > button')
      await switchNetworkButton?.click();
      
      await new Promise(r => setTimeout(r, 2000));
      const confirmSwitchNetworkButton = await mainPage.waitForSelector('#container > div > div:nth-child(3) > div > div > div > div > div.col2.gap-2.align > div.row.gap-1.align > div > button')
      await confirmSwitchNetworkButton?.click();
      
      await new Promise(r => setTimeout(r, 30000));
      
      await handleOpenStartingCurrencySelectorModal(mainPage);

      await new Promise(r => setTimeout(r, 30000));
    }, 10000);    
  } catch (err) { console.error(err); }
})();