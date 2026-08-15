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
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <AnimatePresence>
        {slides.map((slide, index) => (
          index === currentSlide && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="100vw"
                className="object-cover md:object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
              <div className="absolute inset-0 grid-overlay opacity-20" />
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Ambient Particles - fewer on mobile */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => {
            if (typeof window !== 'undefined' && window.innerWidth < 768 && i >= 15) return null
            return (
              <motion.div
                key={i}
                className="absolute h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-theme-20"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                animate={{
                  y: ['0%', '100%'],
                  opacity: [0, 0.4, 0],
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
            )
          })}
        </div>
      )}

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-30" />

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-6 sm:py-0">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl"
        >
          {/* Badge - smaller on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-3 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full glass px-2.5 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm text-theme border border-theme-30"
          >
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme opacity-75" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
              <span className="relative inline-flex rounded-full h-full w-full" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
            </span>
            {slides[currentSlide].badge}
          </motion.div>
          
          {/* Title - responsive sizes */}
          <h1 className="mb-2 sm:mb-4 text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
            <span className="text-white">{slides[currentSlide].title}</span>
          </h1>
          
          {/* Subtitle - responsive */}
          <p className="mb-4 sm:mb-8 text-sm sm:text-lg md:text-xl text-gray-300 max-w-2xl">
            {slides[currentSlide].subtitle}
          </p>
          
          {/* Buttons - smaller on mobile */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Link href={slides[currentSlide].link}>
              <Button className="gaming-btn text-xs sm:text-base md:text-lg px-3 sm:px-6 md:px-8 py-2 sm:py-4 md:py-6 group">
                {slides[currentSlide].cta}
                <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="border-theme-30 text-white hover:bg-theme-10 hover:border-theme-50 transition-all text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-6">
                Browse All
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-4 sm:mt-8 md:mt-12 flex flex-wrap gap-2 sm:gap-4 md:gap-8 justify-center sm:justify-start"
          >
            {[
              { label: 'Active Gamers', value: '10K+' },
              { label: 'Premium Items', value: '500+' },
              { label: 'Satisfied Users', value: '98%' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 border border-theme-10">
                <div className="text-xs sm:text-base md:text-2xl font-bold text-theme neon-glow">{stat.value}</div>
                <div className="text-[8px] sm:text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Slide Navigation */}
        <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-6 sm:w-8 md:w-12 gradient-theme neon-glow' 
                  : 'w-1.5 sm:w-2 bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}