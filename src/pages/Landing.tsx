import { Navbar } from '../components/landing/Navbar'
import { HeroSection } from '../components/landing/HeroSection'
import { ProblemSection } from '../components/landing/ProblemSection'
import { FeatureSection } from '../components/landing/FeatureSection'
import { TargetSection } from '../components/landing/TargetSection'
import { CtaSection } from '../components/landing/CtaSection'
import { Footer } from '../components/landing/Footer'

export default function Landing() {
  return (
    <div className="min-h-dvh bg-orbit-bg">
      <Navbar showSectionNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeatureSection />
        <TargetSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
