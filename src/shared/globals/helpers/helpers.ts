import { randomInt } from 'crypto';

export function toFirstLetterUpperCase(str: string): string {
  const valueString = str.toLowerCase();
  return valueString
    .split(' ')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

export function generateRandomIntegers(length: number): number {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  const randomNumber = randomInt(min, max);

  return randomNumber;
}

export function parseRedisHashData<T = any>(data: T): T {
  if (typeof data !== 'object' || data === null) return data;

  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    try {
      result[key] = JSON.parse(value);
    } catch {
      result[key] = value;
    }
  }

  return result;
}
