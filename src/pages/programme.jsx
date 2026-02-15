import programme from "../data/programme.json";
import ProgrammeDayCard from "../components/ProgrammeDayCard";

export default function Programme() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Programme</h1>

      {programme.map((day, index) => (
        <ProgrammeDayCard
          key={index}
          day={day.day}
          date={day.date}
          items={day.items}
        />
      ))}
    </div>
  );
}
