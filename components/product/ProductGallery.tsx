// components/product/ProductGallery.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const displayImages = images && images.length > 0 ? images : ['/images/placeholder.jpg']

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current
    if (!container) return
    const clamped = Math.max(0, Math.min(index, displayImages.length - 1))
    container.scrollTo({ left: clamped * container.clientWidth, behavior: 'smooth' })
    setActiveIndex(clamped)
  }

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return
    const index = Math.round(container.scrollLeft / container.clientWidth)
    if (index !== activeIndex && index >= 0 && index < displayImages.length) {
      setActiveIndex(index)
    }
  }

  // Drag support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (displayImages.length <= 1) return
    setIsDragging(true)
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeft(scrollRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || displayImages.length <= 1) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 1.5
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScrollEnd = () => {
      const index = Math.round(container.scrollLeft / container.clientWidth)
      if (index !== activeIndex && index >= 0 && index < displayImages.length) {
        setActiveIndex(index)
      }
    }

    container.addEventListener('scrollend', handleScrollEnd)
    return () => container.removeEventListener('scrollend', handleScrollEnd)
  }, [activeIndex, displayImages.length])


  return (
    <div className="space-y-3">
      {/* Main image area */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-black-light border border-theme/20">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            displayImages.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          {displayImages.map((image, index) => (
            <div 
              key={index} 
              className="relative h-full w-full flex-shrink-0 snap-center"
              style={{ minWidth: '100%' }}
            >
              <Image
                src={image}
                alt={`${productName} - Image ${index + 1}`}
                fill
                className="object-contain"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {/* ✅ Arrow controls - always shown, disabled when only 1 image */}
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0 || displayImages.length <= 1}
          className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all z-10 ${
            activeIndex === 0 || displayImages.length <= 1
              ? 'opacity-30 cursor-not-allowed'
              : 'opacity-100'
          }`}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === displayImages.length - 1 || displayImages.length <= 1}
          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all z-10 ${
            activeIndex === displayImages.length - 1 || displayImages.length <= 1
              ? 'opacity-30 cursor-not-allowed'
              : 'opacity-100'
          }`}
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* ✅ Dot indicators - always shown */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-6 bg-theme' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image counter - always shown */}
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
          {activeIndex + 1} / {displayImages.length}
        </div>
      </div>

      {/* ✅ Thumbnail row - always shown, scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-theme/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              index === activeIndex
                ? 'border-theme'
                : 'border-theme/10 opacity-60 hover:opacity-100'
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <Image 
              src={image} 
              alt={`Thumbnail ${index + 1}`} 
              fill 
              className="object-contain" 
              sizes="64px"
            />
          </button>
        ))}
      </div>
    </div>
  )
}