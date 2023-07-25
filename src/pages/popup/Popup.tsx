import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import "@pages/popup/Popup.css";
import { Link, Route, Routes } from "react-router-dom";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { useSettings } from "../../hooks/useSettings";

const Settings = () => {
  const {
    dailyHourRange,
    handleUpdateStartHour,
    handleUpdateEndHour,
    numberOfSwaps,
    handleUpdateNumberOfSwaps,
    maxTimeIntervalBetweenSwaps,
    handleUpdateMaxTimeIntervalBetweenSwaps,
  } = useSettings();

  return (
    <>
      <span className="text-lg w-full justify-between flex gap-2">
        Randomly starting between{" "}
        <div className="flex gap-2">
          <HourSelector
            value={dailyHourRange.start}
            updateValue={handleUpdateStartHour}
            isStartHour
          />{" "}
          and{" "}
          <HourSelector
            value={dailyHourRange.end}
            updateValue={handleUpdateEndHour}
          />
        </div>
      </span>
      <div className="flex w-full justify-between gap-2">
        <span className="text-lg">Number of daily swaps</span>
        <select
          className="flex px-2 py-1 border border-gray-300 rounded-md text-lg"
          value={numberOfSwaps}
          onChange={(e) => handleUpdateNumberOfSwaps(Number(e.target.value))}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </select>
      </div>
      <div className="flex w-full justify-between gap-2">
        <span className="text-lg">Max hours interval between swaps</span>
        <select
          className="flex px-2 py-1 border border-gray-300 rounded-md text-lg"
          value={maxTimeIntervalBetweenSwaps}
          onChange={(e) =>
            handleUpdateMaxTimeIntervalBetweenSwaps(Number(e.target.value))
          }
        >
          <option value="0">1 hour</option>
          <option value="1">2 hours</option>
          <option value="2">3 hours</option>
        </select>
      </div>
      {/* <div className="text-lg flex w-full justify-between gap-2">
        <span>Starting currency</span>
        <CurrencySelector
          value={startingCurrency}
          updateValue={handleUpdateStartingCurrency}
        />
      </div>
      <div className="text-lg flex w-full justify-between gap-2">
        <span>Other currency</span>
        <CurrencySelector
          value={otherCurrency}
          updateValue={handleUpdateOtherCurrency}
        />
      </div> */}
      <p className="text-md">
        Note: Every time you change the settings, you need to stop and start the
        automation 2 times for the changes to take effect.
      </p>
    </>
  );
};

const Popup = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-2 p-4">
      <div className="w-full flex justify-end items-center">
        <Link to="/">
          <Cog6ToothIcon className="h-6 w-6 cursor-pointer text-gray-700" />
        </Link>
      </div>
      <h1 className="text-xl font-bold mb-4">SyncSwap Auto Swapper</h1>
      <SettingsProvider>
        <Routes>
          <Route path="/" element={<Settings />} index />
          <Route path="*" element={<Settings />} />
        </Routes>
      </SettingsProvider>
    </div>
  );
};

const HourSelector = ({
  value,
  updateValue,
  isStartHour,
}: {
  value: number;
  updateValue: (newValue: number) => void;
  isStartHour?: boolean;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateValue(Number(e.target.value));
  };

  return (
    <select
      className="flex px-2 py-1 border border-gray-300 rounded-md"
      onChange={handleChange}
      value={value}
    >
      {isStartHour && <option value="0">00:00</option>}
      <option value="1">01:00</option>
      <option value="2">02:00</option>
      <option value="3">03:00</option>
      <option value="4">04:00</option>
      <option value="5">05:00</option>
      <option value="6">06:00</option>
      <option value="7">07:00</option>
      <option value="8">08:00</option>
      <option value="9">09:00</option>
      <option value="10">10:00</option>
      <option value="11">11:00</option>
      <option value="12">12:00</option>
      <option value="13">13:00</option>
      <option value="14">14:00</option>
      <option value="15">15:00</option>
      <option value="16">16:00</option>
      <option value="17">17:00</option>
      <option value="18">18:00</option>
      <option value="19">19:00</option>
      <option value="20">20:00</option>
      <option value="21">21:00</option>
      <option value="22">22:00</option>
      {!isStartHour && <option value="23">23:00</option>}
    </select>
  );
};

const CurrencySelector = ({
  value,
  updateValue,
}: {
  value: string;
  updateValue: (newValue: string) => void;
}) => {
  return (
    <select
      className="flex px-2 py-1 border border-gray-300 rounded-md"
      onChange={(e) => updateValue(e.target.value)}
      value={value}
    >
      <option value="USDC">USDC</option>
      <option value="USDT">USDT</option>
    </select>
  );
};

export default Popup;
