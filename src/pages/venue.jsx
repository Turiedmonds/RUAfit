import eventData from "../data/event.json";

export default function Venue() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Venue</h1>

      <p className="mb-4">{eventData.location}</p>

      <p className="text-gray-700 mb-4">
        Add maps, parking info, kai stalls, medical assistance, and other venue
        details here.
      </p>

      <iframe
        className="w-full h-64 rounded"
        src="https://www.google.com/maps/embed?pb="
        loading="lazy"
      ></iframe>
    </div>
  );
}
