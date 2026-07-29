import React from 'react'
import { motion } from 'framer-motion'
import { Aperture, UserFocus, Export } from '@phosphor-icons/react'
import { RevealText } from './RevealText'

const features = [
  {
    icon: Aperture,
    title: 'AI-powered product photography',
    body: 'Our engine understands product context — clothing, jewelry, beauty products, footwear, and accessories — to generate studio-quality images that meet Amazon and Flipkart listing standards automatically.',
  },
  {
    icon: UserFocus,
    title: 'Real model integration',
    body: 'Select a male or female model reference image. Pixtall AI composites your product onto the model to create authentic, human-led marketplace visuals that drive higher click-through rates on product listings.',
  },
  {
    icon: Export,
    title: 'Marketplace-ready output',
    body: 'Generate images in the exact aspect ratios required by Amazon India, Flipkart, Meesho, Etsy, Shopify, TikTok Shop, and WooCommerce — 1:1, 9:16, 4:5, 3:4, and 16:9 formats supported out of the box.',
  }
]

export function Features() {
  return (
    <section id="features" className="relative w-full py-32 z-10 border-t border-white/5 bg-[#070707]/50">

      <div className="mx-auto w-full px-5">
        <div className="max-w-3xl mb-16 flex flex-col items-start gap-6">
          <motion.h3 
            initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="tracking-[0.1em] text-4xl sm:text-6xl font-black text-[#a3e635] uppercase mb-2"
          >
            About Pixtall AI
          </motion.h3>
          <RevealText
            as="h2"
            text="AI product image generator for Amazon, Flipkart & every major marketplace"
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl leading-tight"
          />
          <RevealText
            as="p"
            delay={0.2}
            text="Pixtall AI is an intelligent product image generation engine built for ecommerce sellers. Upload your product photo and a model reference — our AI creates professional, conversion-ready listing images in seconds. No photography studio required."
            className="text-xl text-neutral-400 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-colors hover:border-[#a3e635]/30 hover:bg-white/[0.04]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#a3e635]/10 text-[#a3e635]">
                  <Icon className="h-6 w-6" weight="duotone" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-medium text-white">{feature.title}</h3>
                <p className="mt-4 text-xl leading-relaxed text-neutral-400 flex-grow">{feature.body}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-lg leading-relaxed text-neutral-500 max-w-5xl"
        >
          Pixtall AI is the smart product photography solution for Indian and global ecommerce sellers looking to scale their marketplace listings without expensive studio shoots. Whether you sell fashion, ethnic wear, sneakers, handbags, cosmetics, or packaged food on Amazon India, Flipkart, Meesho, Myntra, Nykaa, Shopify, or international platforms like Etsy, eBay, and TikTok Shop — our AI product image generator creates visuals that convert. Pixtall AI supports all major ecommerce categories including fashion & apparel, accessories, beauty & skincare, jewelry, footwear, and food products. Powered by advanced generative AI, it replaces traditional product photography workflows and delivers marketplace-compliant images in a fraction of the time and cost.
        </motion.div>
      </div>

    </section>
  )
}
