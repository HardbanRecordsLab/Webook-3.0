export {};

declare global {
  interface WindowStorageGetResult { value: string }

  interface Window {
    storage: {
      set: (key: string, value: string, personal?: boolean) => Promise<void>;
      get: (key: string) => Promise<WindowStorageGetResult | undefined>;
      remove: (key: string) => Promise<void>;
      list?: (prefix?: string) => Promise<string[]>;
    };
  }
}
