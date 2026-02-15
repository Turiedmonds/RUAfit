import gallery from "../data/gallery.json";

export default function Gallery() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>

      <div className="grid grid-cols-2 gap-4">
        {gallery.map((photo, index) => (
          <div key={index}>
            <img
              src={photo.image}
              alt={photo.caption}
              className="rounded shadow"
            />
            <p className="text-sm text-gray-600 mt-1">{photo.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
