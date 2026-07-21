/**
 * Placeholder history data — swap this for a real fetch once the database
 * is wired up, e.g.:
 *
 *   const history = await fetch(`/api/generations?user=${currentUser.id}`)
 *     .then(r => r.json());
 *
 * Each row is one past generation: the product photo that was uploaded,
 * the image PixStall produced from it, and the settings used. The shape
 * below is what <App> expects — keep these field names when you connect
 * a real endpoint (or map your API response into this shape).
 */
export const mockHistory = [
  {
    id: "gen-1",
    productImg: "/examples/raw-product.png",
    outputImg: "/examples/studio-output.png",
    category: "Jewelry",
    subcategory: "Earrings",
    scene: "Outdoor",
    size: "4:5",
    model: "Female",
    createdAt: "2 hours ago"
  },
  {
    id: "gen-2",
    productImg: "/examples/raw-product.png",
    outputImg: "/examples/studio-output.png",
    category: "Jewelry",
    subcategory: "Earrings",
    scene: "Studio",
    size: "1:1",
    model: "Female",
    createdAt: "Yesterday"
  },
  {
    id: "gen-3",
    productImg: "/examples/raw-product.png",
    outputImg: "/examples/studio-output.png",
    category: "Jewelry",
    subcategory: "Earrings",
    scene: "Lifestyle",
    size: "9:16",
    model: "Female",
    createdAt: "2 days ago"
  },
  {
    id: "gen-4",
    productImg: "/examples/raw-product.png",
    outputImg: "/examples/studio-output.png",
    category: "Jewelry",
    subcategory: "Earrings",
    scene: "Mix",
    size: "4:5",
    model: "Female",
    createdAt: "5 days ago"
  }
];