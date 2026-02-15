import eventData from "../data/event.json";

export default function Contact() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Contact</h1>

      <p>Email: {eventData.contact.email}</p>
      <p>Phone: {eventData.contact.phone}</p>
    </div>
  );
}
