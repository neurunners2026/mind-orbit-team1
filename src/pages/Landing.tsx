import { useState } from 'react'
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

  return (
    <div className="min-h-dvh bg-orbit-bg">
      <Navbar showSectionNav onLoginClick={() => setShowLogin(true)} />
      <main>
        <HeroSection onLoginClick={() => setShowLogin(true)} />
        <ProblemSection />
        <FeatureSection />
        <TargetSection />
        <CtaSection onLoginClick={() => setShowLogin(true)} />
      </main>
      <Footer />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
