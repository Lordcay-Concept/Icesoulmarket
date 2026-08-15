// components/product/Pagination.tsx
'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `/products?${params.toString()}`
  }

  // Show a compact window of page numbers around the current page
  const getPageNumbers = () => {
    const pages: number[] = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <Link
        href={buildUrl(Math.max(1, currentPage - 1))}
        className={`p-2 rounded-lg border transition-all ${
          currentPage === 1
            ? 'border-gray-700 text-gray-600 pointer-events-none'
            : 'border-theme/20 text-gray-300 hover:border-theme/40 hover:text-theme'
        }`}
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {getPageNumbers()[0] > 1 && (
        <>
          <Link href={buildUrl(1)} className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-theme transition-colors">
            1
          </Link>
          {getPageNumbers()[0] > 2 && <span className="text-gray-600">…</span>}
        </>
      )}

      {getPageNumbers().map((page) => (
        <Link
          key={page}
          href={buildUrl(page)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            page === currentPage
              ? 'bg-theme/10 text-theme border border-theme/30'
              : 'text-gray-300 hover:text-theme'
          }`}
        >
          {page}
        </Link>
      ))}

      {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
        <>
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
            <span className="text-gray-600">…</span>
          )}
          <Link href={buildUrl(totalPages)} className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-theme transition-colors">
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildUrl(Math.min(totalPages, currentPage + 1))}
        className={`p-2 rounded-lg border transition-all ${
          currentPage === totalPages
            ? 'border-gray-700 text-gray-600 pointer-events-none'
            : 'border-theme/20 text-gray-300 hover:border-theme/40 hover:text-theme'
        }`}
        aria-disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}