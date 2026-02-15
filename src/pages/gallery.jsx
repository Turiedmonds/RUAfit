import gallery from "../data/gallery.json";
import GalleryItem from "../components/GalleryItem";

export default function Gallery() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>

      <div className="grid grid-cols-2 gap-4">
        {gallery.map((photo, index) => (
          <GalleryItem
            key={index}
            image={photo.image}
            caption={photo.caption}
          />
        ))}
      </div>
    </div>
  );
}
