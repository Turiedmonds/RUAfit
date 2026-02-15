import eventData from "../data/event.json";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center p-4 mt-10 text-sm text-gray-600">
      <p>{eventData.name}</p>
      <p>{eventData.dates}</p>
      <p>Contact: {eventData.contact.email}</p>
    </footer>
  );
}
