import sports from "../data/sports.json";
import SportCard from "../components/SportCard";

export default function Sports() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sports</h1>

      {sports.map((sport, index) => (
        <SportCard
          key={index}
          code={sport.code}
          location={sport.location}
          notes={sport.notes}
          drawUrl={sport.drawUrl}
        />
      ))}
    </div>
  );
}
