import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col items-center justify-center font-sans px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🏞️</div>
        <h1 className="text-3xl font-bold text-[#213DFF] mb-4">Destination Not Found</h1>
        <p className="text-gray-600 mb-6">
          The destination you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/wisata"
            className="bg-[#16A86E] text-white font-bold px-6 py-3 rounded-full shadow hover:bg-[#213DFF] transition text-center"
          >
            Browse All Destinations
          </Link>
          <Link
            href="/"
            className="bg-[#213DFF] text-white font-bold px-6 py-3 rounded-full shadow hover:bg-[#16A86E] transition text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
