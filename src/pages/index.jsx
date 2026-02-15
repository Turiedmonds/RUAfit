import eventData from "../data/event.json";

export default function Home() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold">{eventData.name}</h1>
        <p className="text-gray-600">{eventData.dates}</p>
        <p className="text-gray-600">{eventData.location}</p>
      </header>

      <nav className="grid grid-cols-2 gap-4 text-center">
        <a className="p-4 bg-blue-600 text-white rounded" href="/programme">Programme</a>
        <a className="p-4 bg-blue-600 text-white rounded" href="/sports">Sports</a>
        <a className="p-4 bg-blue-600 text-white rounded" href="/venue">Venue</a>
        <a className="p-4 bg-blue-600 text-white rounded" href="/gallery">Gallery</a>
      </nav>
    </div>
  );
}
