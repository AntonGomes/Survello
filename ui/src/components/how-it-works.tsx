type Step = {
  title: string;
  description: string;
};

const STEPS: Step[] = [
  { title: "Add context", description: "Upload images or documents for reference." },
  { title: "Choose template", description: "Upload the template to fill." },
  { title: "Generate", description: "Let AI create your document." },
];

export function HowItWorks() {
  return (
    <section className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-3">How it works</h2>
      <div className="flex flex-col md:flex-row gap-6 text-sm text-muted-foreground">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-chart-3 text-[#0f172a] flex items-center justify-center font-semibold flex-shrink-0">
              {index + 1}
            </div>
            <div>
              <div className="font-medium text-foreground mb-1">{step.title}</div>
              {step.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
