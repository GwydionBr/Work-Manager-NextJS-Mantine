"use client";

/**
 * Re-export useFormatter from FormatterContext for convenience.
 * This hook provides SSR-safe formatting functions.
 *
 * Make sure to wrap your app with FormatterProvider in your root layout.
 */
export { useFormatter } from "@/contexts/LocaleContext";
