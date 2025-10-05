"use client"

import { memo } from "react"

export const SearchFooter = memo(() => (
  <div className="bg-zinc-800 px-4 py-6 border-b border-zinc-700">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded"></div>
        <p className="text-sm font-medium text-zinc-300">
          Precisa de ajuda?
        </p>
      </div>
      <p className="text-sm text-zinc-400 text-center leading-relaxed">
        Caso não encontre o evento desejado, entre em contato com nosso suporte através do email{' '}
        <a
          href="mailto:suporte@reticket.com"
          className="text-blue-400 hover:text-blue-300 underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          suporte@reticket.com
        </a>
      </p>
    </div>
  </div>
))

SearchFooter.displayName = "SearchFooter"
