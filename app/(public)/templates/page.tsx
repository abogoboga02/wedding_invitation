import Link from "next/link";

import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";

import { ScrollReveal } from "../_components/ScrollReveal";
import { SectionIntro } from "../_components/SectionIntro";
import { TemplateShowcaseCard } from "../_components/TemplateShowcaseCard";

export default function TemplatesPage() {
  return (
    <main className="editorial-shell flex-1 py-12 sm:py-16">
      <section className="section-shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionIntro
            eyebrow="Template Library"
            title="Semua template undangan dalam satu katalog rapi."
            description="Halaman ini menampilkan seluruh template dari sumber data yang sama dengan landing page, sehingga mudah diskalakan hingga 100+ template."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-8 flex justify-center">
          <Link href="/#template" className="button-secondary inline-flex rounded-full px-6 py-3 text-sm font-semibold">
            Kembali ke Landing
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {TEMPLATE_OPTIONS.map((template, index) => (
            <TemplateShowcaseCard key={template.id} template={template} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
