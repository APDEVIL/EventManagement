"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value by the given delay (default 350ms).
 * Use this for search inputs to avoid firing a tRPC query on every keystroke.
 *
 * @example
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search);
 * // pass debouncedSearch to tRPC query input
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}