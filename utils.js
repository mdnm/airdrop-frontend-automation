const MINIMUM_TIME_BETWEEN_ACTIONS = 15000;
const RANDOM_TIME_BETWEEN_ACTIONS = 5000;

export function getWaitTime() {
  return (
    Math.floor(Math.random() * RANDOM_TIME_BETWEEN_ACTIONS) +
    MINIMUM_TIME_BETWEEN_ACTIONS
  );
}

export function sleep(time = 2000) {
  return new Promise(r => setTimeout(r, time));
}