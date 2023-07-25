import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Countdown from "react-countdown";
import { ILocalStorage, LocalStorage } from "../../../../chrome/localStorage";
import { HourRange } from "../../../../contexts/SettingsContext";

const OpenStartingCurrencySelectorModalEventName =
  "openStartingCurrencySelectorModal";
const OpenOtherCurrencySelectorModalEventName =
  "openOtherCurrencySelectorModal";
const SelectStartingCurrencyEventName = "selectStartingCurrency";
const SelectOtherCurrencyEventName = "selectOtherCurrency";
const SelectAmountEventName = "selectAmount";
const ClickUnlockButtonEventName = "clickUnlockButton";
const ClickSwapButtonEventName = "clickSwapButton";
const CloseUnlockSuccessModalEventName = "closeUnlockSuccessModal";
const CloseSwapSuccessModalEventName = "closeSwapSuccessModal";

const MINIMUM_TIME_BETWEEN_ACTIONS = 15000;
const RANDOM_TIME_BETWEEN_ACTIONS = 5000;

function getWaitTime() {
  return (
    Math.floor(Math.random() * RANDOM_TIME_BETWEEN_ACTIONS) +
    MINIMUM_TIME_BETWEEN_ACTIONS
  );
}

async function openCurrencySelectorModal(
  currencyPosition: number,
  retryCount = 0
) {
  const time = getWaitTime();

  new Promise((resolve) => {
    setTimeout(() => {
      const swapButtons =
        document.querySelectorAll<HTMLButtonElement>(".swap-token-btn");

      const currency = swapButtons[currencyPosition];

      if (!currency) {
        if (retryCount >= 3) {
          alert("Could not find currency selector button");
          return;
        }

        openCurrencySelectorModal(currencyPosition, retryCount + 1).then(() => {
          resolve(null);
        });
      } else {
        currency.click();
        resolve(null);
      }
    }, time);
  });
}

async function handleOpenStartingCurrencySelectorModal() {
  await openCurrencySelectorModal(0);

  dispatchEvent(new CustomEvent(SelectStartingCurrencyEventName));
}

async function handleOpenOtherCurrencySelectorModal() {
  await openCurrencySelectorModal(1);

  dispatchEvent(new CustomEvent(SelectOtherCurrencyEventName));
}

async function selectCurrency(
  isSelectingStartingCurrency: boolean,
  retryCount = 0
) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(() => {
      const tokensContainer = document.querySelector<HTMLDivElement>(
        ".token-selector-currencies"
      );

      if (!tokensContainer) {
        if (retryCount >= 3) {
          alert("Could not find currency container");
          return;
        }

        selectCurrency(isSelectingStartingCurrency, retryCount + 1).then(() => {
          resolve(null);
        });
      } else {
        const currencyButton = Array.from(tokensContainer?.children).find(
          (token: HTMLDivElement) => {
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

        if (!currencyButton) {
          if (retryCount >= 3) {
            alert("Could not find currency button");
            return;
          }

          selectCurrency(isSelectingStartingCurrency, retryCount + 1).then(
            () => {
              resolve(null);
            }
          );
        } else {
          (currencyButton as HTMLDivElement).click();
          resolve(null);
        }
      }
    }, time);
  });
}

async function handleSelectStartingCurrency() {
  await selectCurrency(true);

  dispatchEvent(new CustomEvent(OpenOtherCurrencySelectorModalEventName));
}

async function handleSelectOtherCurrency() {
  await selectCurrency(false);

  dispatchEvent(new CustomEvent(SelectAmountEventName));
}

async function selectAmount(amount: string, retryCount = 0) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        ".MuiButton-outlined"
      );

      const amountButton = Array.from(buttons).find((button) => {
        return button.innerHTML.includes(amount);
      });

      if (!amountButton) {
        if (retryCount >= 3) {
          alert("Could not find amount button");
          return;
        }

        selectAmount(amount, retryCount + 1).then(() => {
          resolve(null);
        });
      } else {
        amountButton.click();
        resolve(null);
      }
    }, time);
  });
}

async function handleSelectAmount() {
  await selectAmount("100%");

  dispatchEvent(new CustomEvent(ClickUnlockButtonEventName));
}

async function clickSwapButton(retryCount = 0) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        ".MuiButton-contained"
      );

      const swapButton = Array.from(buttons).find((button) => {
        return button.innerHTML.includes("Swap");
      });

      if (!swapButton) {
        if (retryCount >= 3) {
          alert("Could not find swap button");
          return;
        }

        clickSwapButton(retryCount + 1).then(() => {
          resolve(null);
        });
      } else {
        swapButton.click();
        resolve(null);
      }
    }, time);
  });
}

async function handleClickSwapButton() {
  await clickSwapButton();

  dispatchEvent(new CustomEvent(CloseSwapSuccessModalEventName));
}

async function clickUnlockButton() {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        ".MuiButton-contained"
      );

      if (!buttons) {
        resolve(false);
        return;
      }

      const unlockButton = Array.from(buttons).find((button) => {
        return button.innerHTML.includes("Unlock");
      });

      if (!unlockButton) {
        resolve(false);
        return;
      }

      unlockButton.click();
      resolve(true);
    }, time);
  });
}

async function handleClickUnlockButton() {
  const foundUnlockButton = await clickUnlockButton();

  if (foundUnlockButton) {
    dispatchEvent(new CustomEvent(CloseUnlockSuccessModalEventName));
  } else {
    dispatchEvent(new CustomEvent(ClickSwapButtonEventName));
  }
}

async function closeSuccessModal(retryCount = 0) {
  const time = getWaitTime();

  return new Promise((resolve) => {
    setTimeout(() => {
      const modalOverlay = document.querySelector<HTMLDivElement>(
        ".background-overlay"
      );

      if (!modalOverlay) {
        if (retryCount >= 3) {
          alert("Could not find success modal");
          return;
        }

        closeSuccessModal(retryCount + 1).then(() => {
          resolve(null);
        });
      } else {
        modalOverlay.click();
        resolve(null);
      }
    }, time);
  });
}

async function handleCloseUnlockSuccessModal() {
  await closeSuccessModal();

  dispatchEvent(new CustomEvent(ClickSwapButtonEventName));
}

async function handleCloseSwapSuccessModal() {
  await closeSuccessModal();
}

const storage: ILocalStorage = new LocalStorage();

export default function Settings() {
  const [settings, setSettings] = useState<
    | {
        isRunning: boolean;
        dailyHourRange: HourRange;
        numberOfSwaps: number;
        maxTimeIntervalBetweenSwaps: number;
      }
    | undefined
  >(undefined);
  const [lastDayRun, setLastDayRun] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function loadSettings() {
      const [
        isRunning,
        dailyHourRange,
        numberOfSwaps,
        maxTimeIntervalBetweenSwaps,
        storedLastDayRun,
      ] = await Promise.all([
        storage.load<boolean>("isRunning"),
        storage.load<HourRange>("dailyHourRange"),
        storage.load<number>("numberOfSwaps"),
        storage.load<number>("maxTimeIntervalBetweenSwaps"),
        storage.load<number>("lastDayRun"),
      ]);

      setSettings({
        isRunning: isRunning ?? false,
        dailyHourRange: dailyHourRange ?? { start: 10, end: 16 },
        numberOfSwaps: numberOfSwaps ?? 2,
        maxTimeIntervalBetweenSwaps: maxTimeIntervalBetweenSwaps ?? 2,
      });

      if (storedLastDayRun) {
        setLastDayRun(new Date(storedLastDayRun));
      }
    }

    loadSettings();
  }, [settings?.isRunning]);

  const updateIsRunning = async (newIsRunning: boolean) => {
    await storage.save("isRunning", newIsRunning);

    setSettings((prevSettings) => {
      if (!prevSettings) {
        return prevSettings;
      }

      return {
        ...prevSettings,
        isRunning: newIsRunning,
      };
    });
  };

  if (window.location.hostname !== "syncswap.xyz") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "120px",
        left: "40px",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "20px",
        backgroundColor: "#f7fafc",
        borderRadius: "12px",
        boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05)",
      }}
    >
      {settings && (
        <App
          {...settings}
          updateIsRunning={updateIsRunning}
          lastDayRun={lastDayRun}
          setLastDayRun={setLastDayRun}
        />
      )}
    </div>
  );
}

function getTodayStartingHour(dailyHourRange: HourRange) {
  return Math.floor(
    Math.random() * (dailyHourRange.end - dailyHourRange.start + 1) +
      dailyHourRange.start
  );
}

const App = ({
  isRunning,
  dailyHourRange,
  numberOfSwaps,
  maxTimeIntervalBetweenSwaps,
  updateIsRunning,
  lastDayRun,
  setLastDayRun,
}: {
  isRunning: boolean;
  dailyHourRange: HourRange;
  numberOfSwaps: number;
  maxTimeIntervalBetweenSwaps: number;
  updateIsRunning: (newIsRunning: boolean) => void;
  lastDayRun: Date | undefined;
  setLastDayRun: (newLastDayRun: Date) => void;
}) => {
  const [nextRunInterval, setNextRunInterval] = useState<number>(0);
  const [numberOfSwapsDone, setNumberOfSwapsDone] = useState<number>(0);
  const [todayStartingHour, setTodayStartingHour] = useState<number>(
    getTodayStartingHour(dailyHourRange)
  );
  const interval = useRef<NodeJS.Timer | undefined>(undefined);

  useEffect(() => {
    window.addEventListener(
      OpenStartingCurrencySelectorModalEventName,
      handleOpenStartingCurrencySelectorModal
    );

    window.addEventListener(
      SelectStartingCurrencyEventName,
      handleSelectStartingCurrency
    );

    window.addEventListener(
      OpenOtherCurrencySelectorModalEventName,
      handleOpenOtherCurrencySelectorModal
    );

    window.addEventListener(
      SelectOtherCurrencyEventName,
      handleSelectOtherCurrency
    );

    window.addEventListener(SelectAmountEventName, handleSelectAmount);

    window.addEventListener(
      ClickUnlockButtonEventName,
      handleClickUnlockButton
    );

    window.addEventListener(
      CloseUnlockSuccessModalEventName,
      handleCloseUnlockSuccessModal
    );

    window.addEventListener(ClickSwapButtonEventName, handleClickSwapButton);

    window.addEventListener(
      CloseSwapSuccessModalEventName,
      handleCloseSwapSuccessModal
    );

    return () => {
      document.removeEventListener(
        OpenStartingCurrencySelectorModalEventName,
        handleOpenStartingCurrencySelectorModal
      );
      document.removeEventListener(
        SelectStartingCurrencyEventName,
        handleSelectStartingCurrency
      );
      document.removeEventListener(
        OpenOtherCurrencySelectorModalEventName,
        handleOpenOtherCurrencySelectorModal
      );
      document.removeEventListener(
        SelectOtherCurrencyEventName,
        handleSelectOtherCurrency
      );
      document.removeEventListener(SelectAmountEventName, handleSelectAmount);
      document.removeEventListener(
        ClickUnlockButtonEventName,
        clickUnlockButton
      );
      document.removeEventListener(
        CloseUnlockSuccessModalEventName,
        handleCloseUnlockSuccessModal
      );
      document.removeEventListener(
        ClickSwapButtonEventName,
        handleClickSwapButton
      );
      document.removeEventListener(
        CloseSwapSuccessModalEventName,
        handleCloseSwapSuccessModal
      );
    };
  }, []);

  useLayoutEffect(() => {
    const thirtyMinutes = 1000 * 60 * 30;
    const oneHour = 1000 * 60 * 60;

    if (window.location.hostname !== "syncswap.xyz") {
      return;
    }

    async function swap() {
      const today = new Date();
      const currentHour = today.getHours();
      const alreadyRanToday = lastDayRun?.getDate?.() === today.getDate();

      if (
        (alreadyRanToday && numberOfSwapsDone >= numberOfSwaps) ||
        todayStartingHour !== currentHour
      ) {
        return;
      }

      await storage.save("lastDayRun", today.getTime());
      setLastDayRun(today);

      document.styleSheets[0].insertRule(
        `
        * {
          cursor: wait !important;
        }
      `,
        0
      );

      for (let i = 0; i < numberOfSwaps; i++) {
        const time =
          Math.floor(Math.random() * oneHour * maxTimeIntervalBetweenSwaps) +
          oneHour;

        dispatchEvent(
          new CustomEvent(OpenStartingCurrencySelectorModalEventName)
        );

        const newNumberOfSwapsDone = i + 1;

        if (newNumberOfSwapsDone >= numberOfSwaps) {
          setNextRunInterval(0);
          setTodayStartingHour(getTodayStartingHour(dailyHourRange));
          setNumberOfSwapsDone(0);
        } else {
          setNumberOfSwapsDone(newNumberOfSwapsDone);
          setNextRunInterval(() => {
            return time;
          });

          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(null);
            }, time);
          });
        }
      }

      document.styleSheets[0].deleteRule(0);

      if (!interval.current) {
        interval.current = setInterval(() => {
          swap();
        }, thirtyMinutes);
      }
    }

    if (!isRunning) {
      clearEffect(interval);
      return;
    }

    swap();

    return () => {
      clearEffect(interval);
    };
  }, [isRunning]);

  const handleUpdateIsRunning = async (newIsRunning: boolean) => {
    updateIsRunning(newIsRunning);

    if (!newIsRunning) {
      setNextRunInterval(0);
      setNumberOfSwapsDone(0);
      setTodayStartingHour(getTodayStartingHour(dailyHourRange));
    }
  };

  const alreadyRanToday = lastDayRun?.getDate?.() === new Date().getDate();

  return (
    <>
      <span style={{ fontSize: "16px" }}>
        Auto Swapper{" "}
        {alreadyRanToday
          ? "already started today 🌞"
          : isRunning
          ? "is running ✅"
          : "isn't running ❌"}
      </span>
      <button
        style={{
          fontSize: "16px",
          borderRadius: "12px",
          padding: "8px 12px 8px 12px",
          border: "1px solid rgb(209 213 219)",
          color: "#fff",
          textTransform: "uppercase",
          fontWeight: "bold",
          backgroundColor: isRunning ? "#f56565" : "#48bb78",
        }}
        onClick={() => {
          handleUpdateIsRunning(!isRunning);
        }}
      >
        {isRunning ? "Stop" : "Start"}
      </button>

      {isRunning && (
        <>
          <span style={{ fontSize: "16px" }}>
            The next automation starts at {todayStartingHour}:00
          </span>
          <NextRunIntervalDisplay nextRunInterval={nextRunInterval} />
          <span style={{ fontSize: "16px" }}>
            Missing {numberOfSwaps - numberOfSwapsDone} swaps
          </span>
        </>
      )}
    </>
  );
};

const NextRunIntervalDisplay = ({
  nextRunInterval,
}: {
  nextRunInterval: number;
}) => {
  if (nextRunInterval <= 0) {
    return null;
  }

  return (
    <span style={{ fontSize: "16px" }}>
      Time until next run{" "}
      <Countdown key={nextRunInterval} date={Date.now() + nextRunInterval} />
    </span>
  );
};

function clearEffect(
  interval: React.MutableRefObject<NodeJS.Timer | undefined>
) {
  clearInterval(interval.current);
  document.styleSheets[0].deleteRule(0);
}
