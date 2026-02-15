export default function ProgrammeDayCard({ day, date, items }) {
  return (
    <section className="mb-6 rounded border border-gray-200 p-4">
      <h2 className="text-xl font-semibold">{day}</h2>
      <p className="text-sm text-gray-600 mb-3">{date}</p>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm">
            <span className="font-medium">{item.time}</span> — {item.activity}
          </li>
        ))}
      </ul>
    </section>
  );
}
