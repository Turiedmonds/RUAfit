import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        Oops — the page you're looking for doesn't exist.
      </p>

      <Link
        href="/"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
      >
        Go back home
      </Link>
    </div>
  );
}
