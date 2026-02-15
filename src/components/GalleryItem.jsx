export default function GalleryItem({ image, caption }) {
  return (
    <figure className="bg-white rounded shadow p-2">
      <img className="w-full h-32 object-cover rounded" src={image} alt={caption} />
      <figcaption className="mt-2 text-sm text-gray-700">{caption}</figcaption>
    </figure>
  );
}
