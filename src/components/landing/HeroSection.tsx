import { CTAButton } from './CTAButton'

function HeroMindMap() {
  return (
    <svg
      viewBox="0 0 380 220"
      className="w-full"
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Connection lines */}
      <g stroke="#7F77DD" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round">
        <line x1="190" y1="110" x2="72" y2="52" />
        <line x1="190" y1="110" x2="308" y2="52" />
        <line x1="190" y1="110" x2="60" y2="172" />
        <line x1="190" y1="110" x2="320" y2="172" />
        <line x1="190" y1="110" x2="190" y2="24" />
      </g>

      {/* Secondary lines (lighter) */}
      <g stroke="#7F77DD" strokeOpacity="0.15" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 6">
        <line x1="72" y1="52" x2="30" y2="84" />
        <line x1="308" y1="52" x2="350" y2="84" />
        <line x1="60" y1="172" x2="28" y2="148" />
        <line x1="320" y1="172" x2="356" y2="148" />
      </g>

      {/* Outer nodes (faint) */}
      <g fill="#7F77DD" fillOpacity="0.08" stroke="#7F77DD" strokeOpacity="0.2" strokeWidth="1">
        <circle cx="30" cy="84" r="12" />
        <circle cx="350" cy="84" r="10" />
        <circle cx="28" cy="148" r="10" />
        <circle cx="356" cy="148" r="12" />
      </g>

      {/* Satellite nodes */}
      <circle cx="72" cy="52" r="26" fill="#7F77DD" fillOpacity="0.12" stroke="#7F77DD" strokeOpacity="0.45" strokeWidth="1">
        <animate attributeName="cy" values="52;44;52" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="308" cy="52" r="22" fill="#6c5ce7" fillOpacity="0.10" stroke="#7F77DD" strokeOpacity="0.40" strokeWidth="1">
        <animate attributeName="cy" values="52;58;52" dur="9.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="172" r="22" fill="#7F77DD" fillOpacity="0.10" stroke="#7F77DD" strokeOpacity="0.40" strokeWidth="1">
        <animate attributeName="cy" values="172;164;172" dur="11s" repeatCount="indefinite" />
      </circle>
      <circle cx="320" cy="172" r="26" fill="#6c5ce7" fillOpacity="0.12" stroke="#7F77DD" strokeOpacity="0.45" strokeWidth="1">
        <animate attributeName="cy" values="172;180;172" dur="7.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="190" cy="24" r="18" fill="#7F77DD" fillOpacity="0.08" stroke="#7F77DD" strokeOpacity="0.30" strokeWidth="1">
        <animate attributeName="cy" values="24;18;24" dur="10s" repeatCount="indefinite" />
      </circle>

      {/* Central node glow */}
      <circle cx="190" cy="110" r="44" fill="#7F77DD" fillOpacity="0.08" />
      {/* Central node ring */}
      <circle cx="190" cy="110" r="34" fill="#7F77DD" fillOpacity="0.18" stroke="#7F77DD" strokeOpacity="0.65" strokeWidth="1.5" />
      {/* Central node core */}
      <circle cx="190" cy="110" r="22" fill="#7F77DD" fillOpacity="0.28" />
      {/* Central dot */}
      <circle cx="190" cy="110" r="6" fill="#c4bcff" fillOpacity="0.9" />
    </svg>
  )
}

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative scroll-mt-24 overflow-hidden border-b border-white/[0.06] pb-24 pt-16 md:pb-32 md:pt-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div className="hero-float-orb absolute -left-32 top-0 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="hero-float-orb absolute right-0 top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl [animation-delay:1.2s]" />
        <div className="hero-float-orb absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl [animation-delay:2.4s]" />
        <span className="hero-float-particle absolute left-[16%] top-[22%] h-2 w-2 rounded-full bg-violet-300/80 [--particle-duration:9s]" />
        <span className="hero-float-particle absolute left-[72%] top-[18%] h-1.5 w-1.5 rounded-full bg-indigo-300/70 [--particle-duration:11s]" />
        <span className="hero-float-particle absolute left-[63%] top-[68%] h-2 w-2 rounded-full bg-fuchsia-300/70 [--particle-duration:13s]" />
        <span className="hero-float-particle absolute left-[28%] top-[74%] h-1.5 w-1.5 rounded-full bg-violet-200/70 [--particle-duration:10s]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="reveal-on-scroll text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.1]">
            생각은 많은데,
            <span className="block bg-gradient-to-r from-violet-300 via-white to-indigo-200 bg-clip-text text-transparent">
              정리할 도구가 없었다
            </span>
          </h1>

          <p className="reveal-on-scroll mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg [--reveal-delay:80ms]">
            메모 앱으로는 부족하고, 협업 툴은 너무 무거운.
            <br className="hidden sm:block" />
            Mind Orbit은 그 사이를 채웁니다.
          </p>

          <div className="reveal-on-scroll mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 [--reveal-delay:140ms]">
            <CTAButton to="/dashboard">베타 버전 써보기 →</CTAButton>
            <CTAButton variant="secondary" href="#problem">둘러보기</CTAButton>
          </div>
        </div>

        {/* Mind map visualization */}
        <div className="reveal-on-scroll mx-auto mt-16 max-w-md [--reveal-delay:200ms]">
          <div className="rounded-2xl border border-white/[0.08] bg-orbit-surface/30 p-6 shadow-2xl shadow-violet-900/20 backdrop-blur-sm">
            <HeroMindMap />
          </div>
        </div>
      </div>
    </section>
  )
}
