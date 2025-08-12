import TopicSpace from '@/components/topic/TopicSpace';

interface PageProps {
  params: {
    id: string;
    summaryId: string;
  };
}

export default function SummaryPage({ params }: PageProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <TopicSpace topicId={params.id} summaryId={params.summaryId} />
    </main>
  );
}
