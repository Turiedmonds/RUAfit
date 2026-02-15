export default function SportCard({ code, location, notes, drawUrl }) {
  return (
    <section className="mb-4 rounded border border-gray-200 p-4">
      <h2 className="text-xl font-semibold">{code}</h2>
      <p className="text-sm text-gray-700">Location: {location}</p>
      <p className="text-sm text-gray-700 mb-2">{notes}</p>
      <a className="text-blue-700 underline" href={drawUrl} target="_blank" rel="noreferrer">
        View draw
      </a>
    </section>
  );
}
