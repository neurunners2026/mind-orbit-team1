import { useState, useCallback } from 'react'
import { Navbar } from '../components/landing/Navbar'
import { HeroSection } from '../components/landing/HeroSection'
import { ProblemSection } from '../components/landing/ProblemSection'
import { FeatureSection } from '../components/landing/FeatureSection'
import { TargetSection } from '../components/landing/TargetSection'
import { CtaSection } from '../components/landing/CtaSection'
import { Footer } from '../components/landing/Footer'
import { LoginModal } from '../components/auth/LoginModal'

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false)

  const openLogin = useCallback(() => setShowLogin(true), [])
  const closeLogin = useCallback(() => setShowLogin(false), [])

  return (
    <div className="min-h-dvh bg-orbit-bg">
      <Navbar showSectionNav onLoginClick={openLogin} />
      <main>
        <HeroSection onLoginClick={openLogin} />
        <ProblemSection />
        <FeatureSection />
        <TargetSection />
        <CtaSection onLoginClick={openLogin} />
      </main>
      <Footer />
      {showLogin && <LoginModal onClose={closeLogin} />}
    </div>
  )
}
