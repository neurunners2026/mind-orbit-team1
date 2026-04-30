import { useState, useCallback, useEffect } from 'react'
import { Navbar } from '../components/landing/Navbar'
import { HeroSection } from '../components/landing/HeroSection'
import { ProblemSection } from '../components/landing/ProblemSection'
import { PositioningSection } from '../components/landing/PositioningSection'
import { FeatureSection } from '../components/landing/FeatureSection'
import { TargetSection } from '../components/landing/TargetSection'
import { CtaSection } from '../components/landing/CtaSection'
import { Footer } from '../components/landing/Footer'
import { LoginModal } from '../components/auth/LoginModal'

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false)

  const openLogin = useCallback(() => setShowLogin(true), [])
  const closeLogin = useCallback(() => setShowLogin(false), [])

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal-on-scroll'),
    )

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          obs.unobserve(entry.target)
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-dvh bg-orbit-bg">
      <Navbar showSectionNav onLoginClick={openLogin} />
      <main>
        <HeroSection onLoginClick={openLogin} />
        <ProblemSection />
        <PositioningSection />
        <FeatureSection />
        <TargetSection />
        <CtaSection onLoginClick={openLogin} />
      </main>
      <Footer />
      {showLogin && <LoginModal onClose={closeLogin} />}
    </div>
  )
}
