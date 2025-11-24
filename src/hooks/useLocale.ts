"use client";

/**
 * Re-export useLocale from FormatterContext for convenience.
 * This hook provides SSR-safe localized text formatting.
 *
 * Make sure to wrap your app with FormatterProvider in your root layout.
 */
export { useLocale } from "@/contexts/LocaleContext";
