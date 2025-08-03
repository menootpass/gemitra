import HeaderNavigation from "../../components/HeaderNavigation";
import EventDetailClient from "../../components/EventDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetail({ params }: PageProps) {
  const { slug } = await params;
  
  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col items-center font-sans px-4 pb-10 pt-24">
      <HeaderNavigation />
      
      <div className="w-full max-w-4xl mx-auto mt-8 mb-6 flex-1">
        <EventDetailClient slug={slug} />
      </div>
    </div>
  );
} 