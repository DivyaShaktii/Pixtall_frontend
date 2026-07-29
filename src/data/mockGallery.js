/**
 * Placeholder gallery data — swap for a real fetch once the database is
 * wired up, e.g.:
 *
 *   const sessions = await fetch(`/api/sessions?user=${currentUser.id}`)
 *     .then(r => r.json());
 *
 * Each "session" is one generation run: the product it was made from,
 * the settings used, and every photo produced from it (Pixtall can
 * generate more than one variant per run). Keep this shape when you
 * connect a real endpoint — or map your API response into it.
 */
export const mockGallerySessions = [
  {
    id: "session-1",
    title: "Premium Handbag",
    tag: "Studio",
    date: "28.07.2026",
    model: "Female",
    category: "Accessories",
    aspect: "4:5",
    quality: "4K",
    photos: [
      "/gallery/stallpix-generated-1.png",
      "/gallery/stallpix-generated-1 (1).png",
      "/gallery/stallpix-generated-1 (2).png",
      "/gallery/stallpix-generated-1 (3).png",
      "/gallery/stallpix-generated-1 (4).png",
      "/gallery/stallpix-generated-1 (5).png",
      "/gallery/stallpix-generated-1 (6).png",
      "/gallery/stallpix-generated-1 (7).png",
      "/gallery/stallpix-generated-1 (8).png"
    ]
  },
  {
    id: "session-2",
    title: "Luxury Jacket",
    tag: "Outdoor",
    date: "27.07.2026",
    model: "Male",
    category: "Outerwear",
    aspect: "4:5",
    quality: "4K",
    photos: [
      "/gallery/stallpix-generated-2.png",
      "/gallery/stallpix-generated-2 (1).png",
      "/gallery/stallpix-generated-2 (2).png",
      "/gallery/stallpix-generated-2 (3).png"
    ]
  },
  {
    id: "session-3",
    title: "Ecom Shoots",
    tag: "Studio",
    date: "26.07.2026",
    model: "Female",
    category: "General",
    aspect: "1:1",
    quality: "4K",
    photos: [
      "/gallery/ecom_1.png",
      "/gallery/ecom_2.png",
      "/gallery/ecom_3.png"
    ]
  }
];