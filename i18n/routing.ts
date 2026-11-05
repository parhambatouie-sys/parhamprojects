import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fa", "en"],
  defaultLocale: "en", // زبان پیش‌فرض به انگلیسی تغییر کرد
  localePrefix: "always",
});