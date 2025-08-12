import TopicSpace from '@/components/topic/TopicSpace';

interface PageProps {
  params: {
    id: string;
  };
}

export default function TopicPage({ params }: PageProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <TopicSpace topicId={params.id} />
    </main>
  );
}
