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
    title: "Silver Peacock Earrings",
    tag: "Mix",
    date: "10.07.2026",
    model: "Female",
    category: "Jewelry",
    aspect: "4:5",
    quality: "4K",
    photos: [
      "/examples/studio-output.png",
      "/examples/model-option-a.png",
      "/examples/model-option-b.png",
      "/examples/model-reference.png"
    ]
  },
  {
    id: "session-2",
    title: "Silver Peacock Earrings",
    tag: "Studio",
    date: "09.07.2026",
    model: "Female",
    category: "Jewelry",
    aspect: "1:1",
    quality: "4K",
    photos: [
      "/examples/studio-output.png",
      "/examples/model-option-b.png"
    ]
  },
  {
    id: "session-3",
    title: "Silver Peacock Earrings",
    tag: "Outdoor",
    date: "05.07.2026",
    model: "Female",
    category: "Jewelry",
    aspect: "9:16",
    quality: "4K",
    photos: [
      "/examples/model-option-a.png"
    ]
  }
];