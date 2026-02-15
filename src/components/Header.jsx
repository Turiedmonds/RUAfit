import { useState } from "react";
import Link from "next/link";
import eventData from "../data/event.json";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-blue-700 text-white p-4 mb-6">
      <div className="max-w-xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">{eventData.name}</h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/programme">Programme</Link>
          <Link href="/sports">Sports</Link>
          <Link href="/venue">Venue</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/announcements">Announcements</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <nav className="md:hidden mt-4 space-y-2 text-sm bg-blue-600 p-4 rounded">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link><br />
          <Link href="/programme" onClick={() => setOpen(false)}>Programme</Link><br />
          <Link href="/sports" onClick={() => setOpen(false)}>Sports</Link><br />
          <Link href="/venue" onClick={() => setOpen(false)}>Venue</Link><br />
          <Link href="/gallery" onClick={() => setOpen(false)}>Gallery</Link><br />
          <Link href="/announcements" onClick={() => setOpen(false)}>Announcements</Link>
        </nav>
      )}
    </header>
  );
}
