"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "validation.required" }),
  contact: z.string().min(5, { message: "validation.required" }).refine(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^09\d{9}$/.test(val),
    { message: "validation.invalidContact" }
  ),
  projectType: z.string().min(1, { message: "validation.required" }),
  description: z.string().min(10, { message: "validation.minDescription" }),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function OrderForm() {
  const t = useTranslations("Order");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert(t("formSubmit") + " ✅");
        setIsSuccess(true);
        reset(); 
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error(error);
      alert("Network Error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-10">
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <div className="relative">
          <label className="mb-2 block text-xs font-mono uppercase tracking-widest text-muted">
            {t("formName")}
          </label>
          <input
            {...register("name")}
            className={`w-full border-b bg-transparent pb-3 text-base text-foreground outline-none transition-colors ${
              errors.name ? "border-red-500 focus:border-red-500" : "border-border focus:border-brand"
            }`}
            placeholder="..."
          />
          {errors.name && (
            <p className="mt-1 text-[10px] text-red-500">{t(errors.name.message as any)}</p>
          )}
        </div>
        <div className="relative">
          <label className="mb-2 block text-xs font-mono uppercase tracking-widest text-muted">
            {t("formContact")}
          </label>
          <input
            {...register("contact")}
            dir="ltr"
            className={`w-full border-b bg-transparent pb-3 text-base text-foreground outline-none transition-colors ${
              errors.contact ? "border-red-500 focus:border-red-500" : "border-border focus:border-brand"
            }`}
            placeholder="..."
          />
          {errors.contact && (
            <p className="mt-1 text-[10px] text-red-500">{t(errors.contact.message as any)}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-mono uppercase tracking-widest text-muted">
          {t("formProjectType")}
        </label>
        <select
          {...register("projectType")}
          className={`w-full border-b bg-transparent pb-3 text-base text-foreground outline-none transition-colors appearance-none ${
            errors.projectType ? "border-red-500 focus:border-red-500" : "border-border focus:border-brand"
          }`}
        >
          <option value="" disabled className="bg-card">...</option>
          <option value="custom" className="bg-card">{t("formTypeCustom")}</option>
          <option value="corporate" className="bg-card">{t("formTypeCorporate")}</option>
          <option value="dev" className="bg-card">{t("formTypeDev")}</option>
          <option value="other" className="bg-card">{t("formTypeOther")}</option>
        </select>
        {errors.projectType && (
          <p className="mt-1 text-[10px] text-red-500">{t(errors.projectType.message as any)}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-mono uppercase tracking-widest text-muted">
          {t("formDescription")}
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className={`w-full resize-none border-b bg-transparent pb-3 text-base text-foreground outline-none transition-colors ${
            errors.description ? "border-red-500 focus:border-red-500" : "border-border focus:border-brand"
          }`}
          placeholder="..."
        />
        {errors.description && (
          <p className="mt-1 text-[10px] text-red-500">{t(errors.description.message as any)}</p>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <label className="mb-2 block text-xs font-mono uppercase tracking-widest text-muted">
            {t("formBudget")}
          </label>
          <input
            {...register("budget")}
            className="w-full border-b border-border bg-transparent pb-3 text-base text-foreground outline-none transition-colors focus:border-brand"
            placeholder={t("formBudgetPlaceholder")}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-mono uppercase tracking-widest text-muted">
            {t("formTimeline")}
          </label>
          <input
            {...register("timeline")}
            className="w-full border-b border-border bg-transparent pb-3 text-base text-foreground outline-none transition-colors focus:border-brand"
            placeholder={t("formTimelinePlaceholder")}
          />
        </div>
      </div>

      <div className="pt-4 md:pt-6">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="group flex w-full items-center justify-center gap-3 rounded-md bg-brand px-8 py-4 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
        >
          {isSubmitting ? t("formSubmitting") : t("formSubmit")}
          {!isSubmitting && (
            <span className="transition group-hover:translate-x-1 rtl:rotate-180">
              →
            </span>
          )}
        </button>
      </div>
    </form>
  );
}