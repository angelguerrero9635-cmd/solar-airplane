import Frame from "@/components/Frame";
import MarkdownEditor from "@/components/MarkdownEditor";
import PageHeader from "@/components/PageHeader";

export default function CalculationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calculations"
        title="Calc"
        desc="Power budget, wing loading, and battery SOC. The .py scripts stay code-only — run them through Claude Code — but their write-ups live here for editing."
      />
      <Frame title="Power Budget" eyebrow="calculations/power_budget.md">
        <MarkdownEditor path="calculations/power_budget.md" />
      </Frame>
      <Frame title="Battery SOC" eyebrow="calculations/battery_soc.md">
        <MarkdownEditor path="calculations/battery_soc.md" />
      </Frame>
    </div>
  );
}
