import { env } from "./env";

export const isMockMode = env.NEXT_PUBLIC_MOCK_DATA === "true";

export function getMockOrReal<T>(mockData: T, realFetcher: () => Promise<T>): Promise<T> {
  if (isMockMode) {
    return Promise.resolve(mockData);
  }
  return realFetcher();
}
