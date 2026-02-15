export default function OfflinePage() {
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">You&apos;re offline</h1>
      <p className="text-gray-600 mb-6">
        It looks like you don&apos;t have an internet connection right now.
      </p>
      <button
        type="button"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => window.location.reload()}
      >
        Try again
      </button>
    </div>
  );
}
