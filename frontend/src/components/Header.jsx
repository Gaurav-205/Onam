import React, { useEffect, useMemo, useState } from 'react'

const Header = () => {
  const [flipKey, setFlipKey] = useState(0)
  const [isMalayalam, setIsMalayalam] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setIsMalayalam(prev => !prev)
      setFlipKey(k => k + 1)
    }, 4000) // slower language flip
    return () => clearInterval(id)
  }, [])

  const letters = useMemo(() => {
    const text = isMalayalam ? 'ഓണം' : 'ONAM'
    return text.split('')
  }, [isMalayalam])

  return (
    <div style={{ position: 'relative', height: '100vh', background: 'transparent' }}>
      <style>{`
        .onam-header-container { position: relative; max-width: 1400px; margin: 0 auto; height: 100%; padding: 0 16px; }
        .onam-logo { position: absolute; left: 16px; top: 16px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255,251,230,.9); border: 1px solid #ffe08a; box-shadow: 0 6px 18px rgba(0,0,0,.06); font-size: 22px; color: #7a4b00; font-weight: 800; z-index: 2; }
        .onam-title { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; gap: 10px; align-items: center; justify-content: center; z-index: 1; }
        .onam-letter { font-size: clamp(42px, 8vw, 96px); line-height: 1; font-weight: 900; color: #fff7e0; text-shadow: 0 2px 0 rgba(58,42,0,.25), 0 8px 32px rgba(0,0,0,.35); perspective: 1000px; display: inline-block; will-change: transform, opacity; backface-visibility: hidden; }
        .flip { transform-origin: 50% 50%; animation: flipIn 1.1s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes flipIn { 0% { transform: rotateY(90deg); opacity: 0; filter: blur(2px); } 50% { transform: rotateY(-15deg); opacity: 1; filter: blur(0); } 100% { transform: rotateY(0deg); opacity: 1; } }
      `}</style>

      <div className="onam-header-container">
        <div className="onam-logo" aria-label="Onam Logo">🌼</div>
        <div className="onam-title" aria-live="polite" aria-atomic="true">
          {letters.map((ch, i) => (
            <span key={`${flipKey}-${i}`} className="onam-letter flip" style={{ animationDelay: `${i * 180}ms` }}>
              {ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Header 