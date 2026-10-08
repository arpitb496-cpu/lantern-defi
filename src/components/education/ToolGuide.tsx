"use client";

import { useTranslation } from "@/i18n/LanguageContext";

export function ToolGuide({ tool }: { tool: "scanner" | "scamLab" }) {
  const { t } = useTranslation();
  const prefix = `education.${tool}`;

  return (
    <section className="card-chrome p-6 sm:p-8 space-y-6">
      <p className="text-sm text-[var(--text)] leading-relaxed">{t(`${prefix}.intro`)}</p>
      <div className="border-l-2 border-[var(--muted)] pl-4 space-y-2">
        <h2 className="font-serif text-2xl text-white">{t("education.exampleTitle")}</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{t(`${prefix}.example`)}</p>
      </div>
      <div className="space-y-3">
        <h2 className="font-serif text-2xl text-white">{t("education.faqTitle")}</h2>
        {[1, 2, 3].map((questionNumber) => (
          <details key={questionNumber} className="rounded-xl border border-[var(--border)] p-4">
            <summary className="cursor-pointer text-sm text-white focus-visible:outline-offset-4">
              {t(`${prefix}.q${questionNumber}`)}
            </summary>
            <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
              {t(`${prefix}.a${questionNumber}`)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
