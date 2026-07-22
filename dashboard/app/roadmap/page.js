import Frame from "@/components/Frame";
import MarkdownEditor from "@/components/MarkdownEditor";
import PageHeader from "@/components/PageHeader";

export default function RoadmapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Phase Plan"
        title="Roadmap"
        desc="Prototype → production, with exit criteria for each phase."
      />
      <Frame eyebrow="docs/roadmap.md">
        <MarkdownEditor path="docs/roadmap.md" />
      </Frame>
    </div>
  );
}
