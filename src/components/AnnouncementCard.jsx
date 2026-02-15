export default function AnnouncementCard({ message, timestamp }) {
  const date = new Date(timestamp).toLocaleString();

  return (
    <div className="p-4 border rounded mb-4 bg-yellow-50">
      <p className="text-gray-800">{message}</p>
      <p className="text-xs text-gray-500 mt-1">{date}</p>
    </div>
  );
}
