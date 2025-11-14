import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="mb-4 font-serif text-8xl font-bold text-black md:text-9xl">
          404
        </h1>
        <h2 className="mb-6 font-serif text-3xl text-black md:text-4xl">
          Page Not Found
        </h2>
        <p className="mb-8 text-lg text-gray-700">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded border-2 border-black bg-black px-6 py-3 font-serif text-lg text-white transition-colors hover:bg-white hover:text-black"
        >
          Return to Today&apos;s Puzzle
        </Link>
      </div>
    </div>
  );
}
