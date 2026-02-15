import Link from "next/link";
import eventData from "../data/event.json";

export default function Header() {
  return (
    <header className="bg-blue-700 text-white p-4 mb-6">
      <div className="max-w-xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">{eventData.name}</h1>

        <nav className="space-x-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/programme">Programme</Link>
          <Link href="/sports">Sports</Link>
          <Link href="/venue">Venue</Link>
          <Link href="/gallery">Gallery</Link>
        </nav>
      </div>
    </header>
  );
}
