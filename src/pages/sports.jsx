import sports from "../data/sports.json";

export default function Sports() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sports</h1>

      {sports.map((sport, index) => (
        <div key={index} className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold">{sport.code}</h2>
          <p className="text-gray-600">Location: {sport.location}</p>
          <p className="text-gray-600">{sport.notes}</p>
          <a
            className="text-blue-600 underline"
            href={sport.drawUrl}
            target="_blank"
          >
            View Draw
          </a>
        </div>
      ))}
    </div>
  );
}
