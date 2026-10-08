"use client";

import { useTranslation } from "@/i18n/LanguageContext";

export function HowLanternChecks() {
  const { t } = useTranslation();
  const tools = [
    { name: "nav.scanner", description: "checks.scanner" },
    { name: "nav.approvals", description: "checks.approvals" },
    { name: "nav.txPreview", description: "checks.preview" },
    { name: "nav.domainCheck", description: "checks.domains" },
    { name: "nav.scamLab", description: "checks.lab" },
  ];

  return (
    <section id="how-lantern-checks" className="card-chrome p-6 sm:p-8 space-y-6 scroll-mt-24">
      <h2 className="font-serif text-3xl sm:text-4xl text-white">{t("checks.title")}</h2>
      <p className="text-sm text-[var(--muted)] leading-relaxed">{t("checks.intro")}</p>
      <dl className="divide-y divide-[var(--border)]">
        {tools.map((tool) => (
          <div key={tool.name} className="py-4 grid gap-2 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-white font-medium">{t(tool.name)}</dt>
            <dd className="text-sm text-[var(--muted)] leading-relaxed">{t(tool.description)}</dd>
          </div>
        ))}
      </dl>
      <div className="text-xs text-[var(--muted)] space-y-3 border-t border-[var(--border)] pt-4">
        <p>{t("checks.reviewed")}</p>
        <a href="https://github.com/arpitb496-cpu/sol-kavach/issues" target="_blank" rel="noreferrer" className="inline-block text-white underline underline-offset-4">
          {t("checks.contact")}
        </a>
      </div>
    </section>
  );
}
