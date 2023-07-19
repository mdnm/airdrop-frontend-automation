export interface ILocalStorage {
  save<T>(key: string, value: T): Promise<void>;
  load<T>(key: string): Promise<T | undefined>;
  resetAll(): Promise<void>;
}

export class LocalStorage implements ILocalStorage {
  async save<T>(key: string, value: T) {
    return chrome.storage.local.set({ [key]: value });
  }

  async load<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        const value = result[key];
        if (value === null || value === undefined) {
          resolve(undefined);
        } else {
          resolve(value as T);
        }
      });
    });
  }

  async resetAll(): Promise<void> {
    await chrome.storage.local.clear();
  }
}
