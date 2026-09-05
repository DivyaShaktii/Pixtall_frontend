import React from 'react';
import { motion } from 'framer-motion';
import { RevealText } from './RevealText';

const images = [
  {
    src: "/gallery/catalog-indian-menswear-v2.webp",
    alt: "AI-generated Indian menswear portrait with a charcoal shirt and ivory tailored trousers"
  },
  {
    src: "/gallery/catalog-retro-basketball-sneakers-v2.webp",
    alt: "AI-generated catalog photo of logo-free red, black, and ivory high-top basketball sneakers"
  },
  {
    src: "/gallery/catalog-velora-skincare.webp",
    alt: "AI-generated product photo of VELORA Hydrating Serum and Daily Moisturizer"
  },
  {
    src: "/gallery/catalog-satin-dress.webp",
    alt: "AI-generated catalog photo of a model wearing a burgundy satin midi dress"
  },
  {
    src: "/gallery/stallpix-generated-1.png",
    alt: "AI-generated product photo of a rose-gold mesh-strap watch on a wrist"
  },
  {
    src: "/gallery/stallpix-generated-3.png",
    alt: "AI-generated portrait of a model wearing a pink floral jewelry set"
  },
  {
    src: "/gallery/catalog-indian-rings.webp",
    alt: "AI-generated close-up of gold rings on a hand resting on rose-colored saree fabric"
  },
  {
    src: "/gallery/catalog-watch-editorial.webp",
    alt: "AI-generated close-up of a rose-gold mesh watch styled with a charcoal jacket on a walnut surface"
  },
  {
    src: "/gallery/catalog-fullbody-emerald-saree.webp",
    alt: "AI-generated full-body Indian model in an emerald silk saree with gold polki earrings and sandals"
  },
  {
    src: "/gallery/catalog-fullbody-sneaker-streetwear.webp",
    alt: "AI-generated full-body Indian model in a burgundy jacket and charcoal jeans wearing logo-free high-top sneakers"
  },
  {
    src: "/gallery/catalog-studio-jewelry-earrings-v1.webp",
    alt: "AI-generated close-up of an Indian model wearing a gold polki and pearl earring with a small dusty-rose saree accent"
  },
  {
    src: "/gallery/catalog-studio-fashion-shirt-v1.webp",
    alt: "AI-generated Indian model wearing a sage-green linen shirt with stone-colored trousers"
  },
  {
    src: "/gallery/catalog-studio-fashion-jeans-v1.webp",
    alt: "AI-generated product-focused view of straight-leg indigo jeans worn with an ivory top and flats"
  },
  {
    src: "/gallery/catalog-studio-fashion-skirt-v1.webp",
    alt: "AI-generated product-focused view of a camel pleated midi skirt worn with an ivory top"
  },
  {
    src: "/gallery/catalog-studio-accessories-bag-v1.webp",
    alt: "AI-generated close-up of a cognac leather handbag with gold hardware held by an Indian model"
  },
  {
    src: "/gallery/catalog-studio-accessories-watch-v1.webp",
    alt: "AI-generated close-up of a blue-dial steel watch with a brown leather strap on a wrist"
  },
  {
    src: "/gallery/catalog-studio-beauty-lipstick-v1.webp",
    alt: "AI-generated VELORA rose-nude lipstick in a champagne-metal tube with its cap"
  },
  {
    src: "/gallery/catalog-studio-beauty-perfume-v1.webp",
    alt: "AI-generated VELORA Amber perfume in a clear glass bottle with a dark wooden cap"
  },
  {
    src: "/gallery/catalog-studio-beauty-skincare-v1.webp",
    alt: "AI-generated VELORA Hydrating Serum and Daily Moisturizer with readable product labels"
  },
  {
    src: "/gallery/catalog-studio-food-packaged_food-v1.webp",
    alt: "AI-generated PANTRY Basmati Rice pouch with a transparent product window"
  },
  {
    src: "/gallery/catalog-studio-jewelry-ring-v1.webp",
    alt: "AI-generated close-up of a gold ring with a pale-green stone worn on a hand"
  },
  {
    src: "/gallery/catalog-studio-jewelry-necklace-v1.webp",
    alt: "AI-generated close-up of a gold necklace with a teardrop pendant and pearl worn by an Indian model"
  },
  {
    src: "/gallery/catalog-studio-jewelry-bracelet-v1.webp",
    alt: "AI-generated close-up of a delicate gold link bracelet with clear stones on a wrist"
  },
  {
    src: "/gallery/catalog-studio-footwear-sneakers-v1.webp",
    alt: "AI-generated logo-free ivory, burgundy, and black retro basketball high-top sneakers"
  },
  {
    src: "/gallery/catalog-studio-footwear-boots-v1.webp",
    alt: "AI-generated dark-brown leather Chelsea boots with elastic side panels"
  },
  {
    src: "/gallery/catalog-studio-footwear-sandals-v1.webp",
    alt: "AI-generated tan leather crossover sandals with buckled ankle straps"
  },
  {
    src: "/gallery/catalog-studio-footwear-heels-v1.webp",
    alt: "AI-generated champagne-beige slingback pumps with pointed toes and block heels"
  }
];

export function Gallery() {
  return (
    <section id="gallery" className="relative w-full py-24 z-10 bg-white/[0.01] border-y border-white/5">
      <div className="mx-auto w-full px-5">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            className="text-xs font-medium uppercase tracking-[0.2em] text-[#a3e635] inline-block"
          >
            Stunning Results
          </motion.span>
          <RevealText
            as="h2"
            text="Luxury fashion catalog outputs."
            className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          />
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map(({ src, alt }, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-black break-inside-avoid"
            >
              <img 
                src={src} 
                alt={alt}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
