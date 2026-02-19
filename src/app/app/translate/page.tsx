'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mic, Send } from 'lucide-react'
export default function TranslatePage() {
  const [text, setText] = useState('')
  const [speed, setSpeed] = useState(1)

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/app"
          className="p-2 rounded-lg text-white/60 hover:bg-background-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="page-title">Text to Sign</h1>
          <p className="page-subtitle">Enter text and see it translated to sign language</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="card p-6">
            <label className="block text-white/80 text-sm font-medium mb-3">Enter text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text to translate to sign language..."
              className="w-full min-h-[200px] p-4 rounded-lg bg-background-tertiary/50 border border-background-tertiary text-white placeholder:text-white/40 text-base outline-none focus:border-primary/50 resize-none transition-colors"
            />
            <div className="flex justify-end mt-4">
              <button
                disabled={!text.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-background font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
              >
                <Send className="h-4 w-4" />
                Translate
              </button>
            </div>
          </div>

          <div className="card p-6">
            <label className="block text-white/80 text-sm font-medium mb-3">Signing speed</label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">0.5x</span>
              <span className="text-primary font-semibold">{speed}x</span>
              <span className="text-white/60 text-sm">2x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-background-tertiary accent-primary"
            />
          </div>
        </div>

        {/* Output */}
        <div className="card p-6">
          <h3 className="text-white font-medium mb-4">Signing output</h3>
          <div className="aspect-video rounded-lg bg-background-tertiary/50 border border-background-tertiary flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-background-elevated/80 flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🤟</span>
              </div>
              <p className="text-white/50 text-sm">
                Enter text and tap Translate to see the sign
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
