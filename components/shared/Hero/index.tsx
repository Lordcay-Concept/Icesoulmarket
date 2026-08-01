// components/shared/Hero/index.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Gamepad2, Sparkles, Crown, Zap } from 'lucide-react'
import Image from 'next/image'

const slides = [
  {
    id: 1,
    image: '/images/themes/theme-1.png',
    title: 'Premium COD Accounts',
    subtitle: 'Level up your game with max-level accounts',
    badge: '🔥 Hot Deal',
    cta: 'Browse Accounts',
    link: '/products?category=accounts',  
    icon: Crown,
  },
  {
    id: 2,
    image: '/images/skins/skin-1.png',
    title: 'Exclusive Weapon Skins',
    subtitle: 'Stand out with legendary skins',
    badge: '⚡ Legendary',
    cta: 'Browse Skins',
    link: '/products?category=skins',     
    icon: Zap,
  },
  {
    id: 3,
    image: '/images/coins/coin-1.png',
    title: 'COD Points & Currency',
    subtitle: 'Get the best value for your money',
    badge: '🎯 Best Value',
    cta: 'Buy Points',
    link: '/products?category=points',    
    icon: Sparkles,
  },
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden py-24 md:py-0">
      {/* Background Images */}
      <AnimatePresence>
        {slides.map((slide, index) => (
          index === currentSlide && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 md:to-transparent" />
              <div className="absolute inset-0 grid-overlay opacity-30" />
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Ambient Particles */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-emerald-400/20"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
              }}
              animate={{
                y: ['0%', '100%'],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 15 + Math.random() * 20,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 10,
              }}
              style={{
                left: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>
      )}

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none scanline" />

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-emerald-400 border border-emerald-400/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            {slides[currentSlide].badge}
          </motion.div>
          
          <h1 className="mb-3 md:mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
            <span className="text-white">{slides[currentSlide].title}</span>
          </h1>
          
          <p className="mb-6 md:mb-8 text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl">
            {slides[currentSlide].subtitle}
          </p>
          
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Link href={slides[currentSlide].link}>
              <Button className="gaming-btn text-base md:text-lg px-6 py-4 md:px-8 md:py-6 group">
                {slides[currentSlide].cta}
                <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="border-emerald-400/30 text-white hover:bg-emerald-400/10 hover:border-emerald-400/50 transition-all text-base md:text-lg px-6 py-4 md:px-8 md:py-6">
                Browse All
              </Button>
            </Link>
          </div>

          {/* Stats — hidden on the smallest screens to keep the hero compact and prevent overflow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="hidden sm:flex mt-10 md:mt-12 flex-wrap gap-4 md:gap-8"
          >
            {[
              { label: 'Active Gamers', value: '10K+' },
              { label: 'Premium Items', value: '500+' },
              { label: 'Satisfied Users', value: '98%' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-lg px-4 py-2 md:px-6 md:py-3 border border-emerald-400/10">
                <div className="text-xl md:text-2xl font-bold text-emerald-400 neon-glow">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Slide Navigation */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-10 md:w-12 bg-gradient-to-r from-emerald-400 to-green-500 neon-glow' 
                  : 'w-2 bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}