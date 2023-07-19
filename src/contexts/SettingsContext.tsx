import { createContext, useEffect, useState } from "react";
import { ILocalStorage, LocalStorage } from "../chrome/localStorage";

export type HourRange = { start: number; end: number };

type SettingsContextType = {
  isRunning: boolean;
  dailyHourRange: HourRange;
  numberOfSwaps: number;
  maxTimeIntervalBetweenSwaps: number;
  startingCurrency: string;
  otherCurrency: string;
  handleUpdateIsRunning: (newIsRunning: boolean) => void;
  handleUpdateStartHour: (newStartHour: number) => void;
  handleUpdateEndHour: (newEndHour: number) => void;
  handleUpdateNumberOfSwaps: (newNumberOfSwaps: number) => void;
  handleUpdateMaxTimeIntervalBetweenSwaps: (
    newMaxTimeIntervalBetweenSwaps: number
  ) => void;
  handleUpdateStartingCurrency: (newStartingCurrency: string) => void;
  handleUpdateOtherCurrency: (newOtherCurrency: string) => void;
};

const storage: ILocalStorage = new LocalStorage();

export const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [dailyHourRange, setDailyHourRange] = useState<HourRange>({
    start: 10,
    end: 16,
  });
  const [numberOfSwaps, setNumberOfSwaps] = useState<number>(2);
  const [maxTimeIntervalBetweenSwaps, setMaxTimeIntervalBetweenSwaps] =
    useState<number>(3);
  const [startingCurrency, setStartingCurrency] = useState<string>("USDC");
  const [otherCurrency, setOtherCurrency] = useState<string>("USDT");

  const handleUpdateIsRunning = async (newIsRunning: boolean) => {
    await storage.save("isRunning", newIsRunning);
    setIsRunning(newIsRunning);
  };

  const handleUpdateStartHour = async (newStartHour: number) => {
    const newDailyHourRange = {
      end:
        newStartHour >= dailyHourRange.end
          ? newStartHour + 1
          : dailyHourRange.end,
      start: newStartHour,
    };
    await storage.save("dailyHourRange", newDailyHourRange);
    setDailyHourRange(newDailyHourRange);
    handleUpdateIsRunning(false);
  };

  const handleUpdateEndHour = async (newEndHour: number) => {
    const newDailyHourRange = {
      end: newEndHour,
      start:
        newEndHour <= dailyHourRange.start
          ? newEndHour - 1
          : dailyHourRange.start,
    };
    await storage.save("dailyHourRange", newDailyHourRange);
    setDailyHourRange(newDailyHourRange);
    handleUpdateIsRunning(false);
  };

  const handleUpdateNumberOfSwaps = async (newNumberOfSwaps: number) => {
    await storage.save("numberOfSwaps", newNumberOfSwaps);
    setNumberOfSwaps(newNumberOfSwaps);
    handleUpdateIsRunning(false);
  };

  const handleUpdateMaxTimeIntervalBetweenSwaps = async (
    newMaxTimeIntervalBetweenSwaps: number
  ) => {
    await storage.save(
      "maxTimeIntervalBetweenSwaps",
      newMaxTimeIntervalBetweenSwaps
    );
    setMaxTimeIntervalBetweenSwaps(newMaxTimeIntervalBetweenSwaps);
    handleUpdateIsRunning(false);
  };

  const handleUpdateStartingCurrency = async (newStartingCurrency: string) => {
    if (newStartingCurrency === otherCurrency) {
      await storage.save("otherCurrency", startingCurrency);
      await storage.save("startingCurrency", newStartingCurrency);
      setOtherCurrency(startingCurrency);
      setStartingCurrency(newStartingCurrency);
      handleUpdateIsRunning(false);
      return;
    }

    await storage.save("startingCurrency", newStartingCurrency);
    setStartingCurrency(newStartingCurrency);
    handleUpdateIsRunning(false);
  };

  const handleUpdateOtherCurrency = async (newOtherCurrency: string) => {
    if (newOtherCurrency === startingCurrency) {
      await storage.save("startingCurrency", otherCurrency);
      await storage.save("otherCurrency", newOtherCurrency);
      setStartingCurrency(otherCurrency);
      setOtherCurrency(newOtherCurrency);
      handleUpdateIsRunning(false);
      return;
    }

    await storage.save("otherCurrency", newOtherCurrency);
    setOtherCurrency(newOtherCurrency);
    handleUpdateIsRunning(false);
  };

  useEffect(() => {
    async function loadDataFromStorage() {
      const [
        defaultIsRunning,
        defaultDailyHourRange,
        defaultNumberOfSwaps,
        defaultMaxTimeIntervalBetweenSwaps,
        defaultStartingCurrency,
        defaultOtherCurrency,
      ] = await Promise.all([
        storage.load<boolean>("isRunning"),
        storage.load<HourRange>("dailyHourRange"),
        storage.load<number>("numberOfSwaps"),
        storage.load<number>("maxTimeIntervalBetweenSwaps"),
        storage.load<string>("startingCurrency"),
        storage.load<string>("otherCurrency"),
      ]);

      setIsRunning(defaultIsRunning);

      if (defaultDailyHourRange) {
        setDailyHourRange(defaultDailyHourRange);
      }

      if (defaultNumberOfSwaps) {
        setNumberOfSwaps(defaultNumberOfSwaps);
      }

      if (defaultMaxTimeIntervalBetweenSwaps) {
        setMaxTimeIntervalBetweenSwaps(defaultMaxTimeIntervalBetweenSwaps);
      }

      if (defaultStartingCurrency) {
        setStartingCurrency(defaultStartingCurrency);
      }

      if (defaultOtherCurrency) {
        setOtherCurrency(defaultOtherCurrency);
      }
    }

    loadDataFromStorage();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        isRunning,
        dailyHourRange,
        numberOfSwaps,
        maxTimeIntervalBetweenSwaps,
        startingCurrency,
        otherCurrency,
        handleUpdateIsRunning,
        handleUpdateStartHour,
        handleUpdateEndHour,
        handleUpdateNumberOfSwaps,
        handleUpdateMaxTimeIntervalBetweenSwaps,
        handleUpdateStartingCurrency,
        handleUpdateOtherCurrency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
