import programme from "../data/programme.json";

export default function Programme() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Programme</h1>

      {programme.map((day, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl font-semibold">{day.day} — {day.date}</h2>
          <ul className="mt-2">
            {day.items.map((item, i) => (
              <li key={i} className="border-b py-2">
                <strong>{item.time}</strong> — {item.activity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
