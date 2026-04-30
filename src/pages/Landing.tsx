import { useEffect } from 'react'
import { Navbar } from '../components/landing/Navbar'
import { HeroSection } from '../components/landing/HeroSection'
import { ProblemSection } from '../components/landing/ProblemSection'
import { PositioningSection } from '../components/landing/PositioningSection'
import { BrandStatement } from '../components/landing/BrandStatement'
import { SolutionSection } from '../components/landing/SolutionSection'
import { SocialProofSection } from '../components/landing/SocialProofSection'
import { TargetSection } from '../components/landing/TargetSection'
import { CtaSection } from '../components/landing/CtaSection'
import { Footer } from '../components/landing/Footer'

export default function Landing() {
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
      <Navbar showSectionNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <PositioningSection />
        <BrandStatement />
        <SolutionSection />
        <SocialProofSection />
        <TargetSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
