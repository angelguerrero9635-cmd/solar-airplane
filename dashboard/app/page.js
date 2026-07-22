import Frame from "@/components/Frame";
import MarkdownEditor from "@/components/MarkdownEditor";
import PageHeader from "@/components/PageHeader";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project Rulebook"
        title="CLAUDE.md"
        desc="The single file every Claude session reads first. Edits here commit straight to the repo so Claude Code and Claude Chat both pick them up next time."
      />
      <Frame eyebrow="Root · Source of Truth">
        <MarkdownEditor path="CLAUDE.md" label="CLAUDE.md" />
      </Frame>
    </div>
  );
}
