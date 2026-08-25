import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Error: ${error.message}`);
  }

  if (typeof error === "string") {
    throw new Error(`Error: ${error}`);
  }

  throw new Error("Unknown error occurred");
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

type FilterItem = {
  name: string;
  value: unknown;
};

export function compareArrays(
  array1: unknown[],
  array2: unknown[]
): boolean {
  if (array1.length !== array2.length) {
    return false;
  }

  const stringify = (value: unknown): string => {
    if (
      typeof value !== "object" ||
      value === null
    ) {
      return JSON.stringify(value);
    }

    const object = value as Record<string, unknown>;

    return JSON.stringify(
      Object.keys(object)
        .sort()
        .map((key) => [key, object[key]])
    );
  };

  const set = new Set(array1.map(stringify));

  return array2.every((item) => set.has(stringify(item)));
}

export function filterArray(
  array: FilterItem[],
  property: string
): unknown[] {
  return array
    .filter((item) => item.name === property)
    .map((item) => item.value);
}

export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function randomize<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}