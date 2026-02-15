import announcements from "../data/announcements.json";
import AnnouncementCard from "../components/AnnouncementCard";

export default function Announcements() {
  // Sort newest → oldest
  const sorted = [...announcements].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Announcements</h1>

      {sorted.length === 0 && (
        <p className="text-gray-600">No announcements yet.</p>
      )}

      {sorted.map((item, index) => (
        <AnnouncementCard
          key={index}
          message={item.message}
          timestamp={item.timestamp}
        />
      ))}
    </div>
  );
}
