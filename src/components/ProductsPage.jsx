import { useEffect, useState } from "react";
import { SYSTEM_API_BASE_URL } from "../utils/apiConfig";
import { downloadImage } from "../utils/downloadImage";
import { authenticatedFetch } from "../lib/api";

/**
 * Fetches this user's uploaded product photos from the backend
 * (GET /products). Photos are pre-signed S3 URLs.
 */
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/products`)
      .then(response => {
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (cancelled) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="gallery-page">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight">Products</h1>
        <p className="text-slate text-lg">
          {status === "loading"
            ? "Loading…"
            : `${products.length} product${products.length === 1 ? "" : "s"}`}
        </p>
      </header>

      {status === "error" && (
        <div className="gallery-empty-state">
          <span className="gallery-empty-icon">⚠</span>
          <p>Couldn&rsquo;t load your products right now. Try refreshing the page.</p>
        </div>
      )}

      {status === "ready" && products.length === 0 && (
        <div className="gallery-empty-state">
          <span className="gallery-empty-icon">📦</span>
          <p>Nothing uploaded yet — product photos you generate from in Studio will show up here.</p>
        </div>
      )}

      {status === "ready" && products.length > 0 && (
        <div className="products-grid">
          {products.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-card-thumb">
                <img
                  src={product.url}
                  alt={product.productName || "Product photo"}
                  loading="lazy"
                  decoding="async"
                />
                <button
                  type="button"
                  className="product-card-download"
                  aria-label="Download this photo"
                  onClick={() => downloadImage(product.url, `${product.productName || "product"}.png`)}
                >
                  ⬇
                </button>
              </div>
              <div className="product-card-info">
                <strong>{product.productName}</strong>
                <span>
                  {[
                    product.marketplace,
                    product.createdAt ? new Date(product.createdAt).toLocaleDateString() : null
                  ].filter(Boolean).join(" · ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
