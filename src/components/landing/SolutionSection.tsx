import { LandingSection } from './LandingSection'

/* ── 카드별 SVG 일러스트 ─────────────────── */

function IllustDevice() {
  return (
    <svg viewBox="0 0 240 110" className="w-full" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mobile */}
      <rect x="16" y="18" width="48" height="74" rx="8" stroke="#7F77DD" strokeOpacity="0.5" strokeWidth="1.5" fill="#7F77DD" fillOpacity="0.06" />
      <rect x="28" y="14" width="24" height="4" rx="2" fill="#7F77DD" fillOpacity="0.3" />
      <rect x="24" y="80" width="32" height="4" rx="2" fill="#7F77DD" fillOpacity="0.2" />
      {/* Screen lines */}
      <rect x="22" y="28" width="36" height="3" rx="1.5" fill="#7F77DD" fillOpacity="0.3" />
      <rect x="22" y="36" width="28" height="2" rx="1" fill="#7F77DD" fillOpacity="0.2" />
      <rect x="22" y="42" width="32" height="2" rx="1" fill="#7F77DD" fillOpacity="0.2" />

      {/* Tablet */}
      <rect x="80" y="10" width="80" height="90" rx="8" stroke="#7F77DD" strokeOpacity="0.45" strokeWidth="1.5" fill="#7F77DD" fillOpacity="0.06" />
      <circle cx="120" cy="95" r="4" fill="#7F77DD" fillOpacity="0.3" />
      {/* Screen content */}
      <rect x="90" y="22" width="60" height="3" rx="1.5" fill="#7F77DD" fillOpacity="0.3" />
      <rect x="90" y="32" width="44" height="2" rx="1" fill="#7F77DD" fillOpacity="0.2" />
      <rect x="90" y="40" width="52" height="2" rx="1" fill="#7F77DD" fillOpacity="0.2" />
      {/* Mini node graph */}
      <circle cx="100" cy="62" r="5" fill="#7F77DD" fillOpacity="0.25" stroke="#7F77DD" strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="120" cy="55" r="4" fill="#7F77DD" fillOpacity="0.2" stroke="#7F77DD" strokeOpacity="0.4" strokeWidth="1" />
      <circle cx="138" cy="64" r="4" fill="#7F77DD" fillOpacity="0.2" stroke="#7F77DD" strokeOpacity="0.4" strokeWidth="1" />
      <line x1="105" y1="62" x2="116" y2="57" stroke="#7F77DD" strokeOpacity="0.35" strokeWidth="1" />
      <line x1="124" y1="56" x2="134" y2="62" stroke="#7F77DD" strokeOpacity="0.35" strokeWidth="1" />

      {/* Desktop */}
      <rect x="176" y="22" width="52" height="38" rx="4" stroke="#7F77DD" strokeOpacity="0.4" strokeWidth="1.5" fill="#7F77DD" fillOpacity="0.06" />
      <rect x="196" y="62" width="12" height="14" rx="1" fill="#7F77DD" fillOpacity="0.15" />
      <rect x="186" y="76" width="32" height="3" rx="1.5" fill="#7F77DD" fillOpacity="0.2" />
      {/* Screen lines */}
      <rect x="182" y="30" width="36" height="2" rx="1" fill="#7F77DD" fillOpacity="0.3" />
      <rect x="182" y="36" width="26" height="2" rx="1" fill="#7F77DD" fillOpacity="0.2" />
      <rect x="182" y="42" width="30" height="2" rx="1" fill="#7F77DD" fillOpacity="0.2" />
    </svg>
  )
}

function IllustMap() {
  return (
    <svg viewBox="0 0 240 110" className="w-full" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Center node */}
      <circle cx="120" cy="55" r="18" fill="#7F77DD" fillOpacity="0.18" stroke="#7F77DD" strokeOpacity="0.65" strokeWidth="1.5" />
      <circle cx="120" cy="55" r="8" fill="#7F77DD" fillOpacity="0.35" />

      {/* Branch nodes */}
      <circle cx="52" cy="28" r="13" fill="#7F77DD" fillOpacity="0.12" stroke="#7F77DD" strokeOpacity="0.45" strokeWidth="1" />
      <circle cx="188" cy="28" r="13" fill="#7F77DD" fillOpacity="0.12" stroke="#7F77DD" strokeOpacity="0.45" strokeWidth="1" />
      <circle cx="44" cy="82" r="11" fill="#7F77DD" fillOpacity="0.10" stroke="#7F77DD" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="196" cy="82" r="11" fill="#7F77DD" fillOpacity="0.10" stroke="#7F77DD" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="120" cy="12" r="10" fill="#7F77DD" fillOpacity="0.08" stroke="#7F77DD" strokeOpacity="0.30" strokeWidth="1" />

      {/* Lines */}
      <g stroke="#7F77DD" strokeOpacity="0.30" strokeWidth="1.2">
        <line x1="107" y1="44" x2="63" y2="33" />
        <line x1="133" y1="44" x2="177" y2="33" />
        <line x1="106" y1="66" x2="54" y2="74" />
        <line x1="134" y1="66" x2="186" y2="74" />
        <line x1="120" y1="37" x2="120" y2="22" />
      </g>

      {/* Leaf nodes */}
      <g fill="#7F77DD" fillOpacity="0.07" stroke="#7F77DD" strokeOpacity="0.22" strokeWidth="1">
        <circle cx="26" cy="20" r="7" /><circle cx="68" cy="14" r="6" />
        <circle cx="204" cy="20" r="7" /><circle cx="172" cy="14" r="6" />
        <circle cx="22" cy="90" r="6" /><circle cx="56" cy="100" r="6" />
        <circle cx="218" cy="90" r="6" /><circle cx="184" cy="100" r="6" />
      </g>
    </svg>
  )
}

function IllustShare() {
  return (
    <svg viewBox="0 0 240 110" className="w-full" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* URL bar */}
      <rect x="20" y="18" width="200" height="28" rx="14" stroke="#7F77DD" strokeOpacity="0.4" strokeWidth="1.5" fill="#7F77DD" fillOpacity="0.06" />
      <circle cx="38" cy="32" r="5" fill="#7F77DD" fillOpacity="0.3" />
      <rect x="52" y="29" width="88" height="5" rx="2.5" fill="#7F77DD" fillOpacity="0.25" />
      <rect x="148" y="29" width="30" height="5" rx="2.5" fill="#7F77DD" fillOpacity="0.15" />
      {/* Copy button */}
      <rect x="186" y="24" width="28" height="16" rx="6" fill="#7F77DD" fillOpacity="0.2" stroke="#7F77DD" strokeOpacity="0.5" strokeWidth="1" />

      {/* Arrows / share lines */}
      <g stroke="#7F77DD" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round">
        <line x1="80" y1="60" x2="50" y2="90" />
        <line x1="120" y1="60" x2="120" y2="92" />
        <line x1="160" y1="60" x2="190" y2="90" />
      </g>

      {/* Recipient nodes */}
      <circle cx="50" cy="95" r="10" fill="#7F77DD" fillOpacity="0.12" stroke="#7F77DD" strokeOpacity="0.40" strokeWidth="1" />
      <circle cx="120" cy="97" r="10" fill="#7F77DD" fillOpacity="0.12" stroke="#7F77DD" strokeOpacity="0.40" strokeWidth="1" />
      <circle cx="190" cy="95" r="10" fill="#7F77DD" fillOpacity="0.12" stroke="#7F77DD" strokeOpacity="0.40" strokeWidth="1" />

      {/* Person icons inside circles */}
      <g fill="#7F77DD" fillOpacity="0.45">
        <circle cx="50" cy="92" r="3" /><path d="M44 101 a6 4 0 0 1 12 0" />
        <circle cx="120" cy="94" r="3" /><path d="M114 103 a6 4 0 0 1 12 0" />
        <circle cx="190" cy="92" r="3" /><path d="M184 101 a6 4 0 0 1 12 0" />
      </g>
    </svg>
  )
}

const promises = [
  {
    num: '01',
    title: '어디서든 바로 열립니다',
    body: '모바일, 태블릿, 데스크탑. 생각이 떠오른 그 자리에서 바로.',
    Illust: IllustDevice,
  },
  {
    num: '02',
    title: '보기 좋게 정리됩니다',
    body: '군더더기 없는 UI. 완성한 맵은 다시 열고 싶어집니다.',
    Illust: IllustMap,
  },
  {
    num: '03',
    title: '링크 하나로 공유됩니다',
    body: '완성한 마인드맵을 웹 링크로 즉시. 설치 없이 누구나 볼 수 있습니다.',
    Illust: IllustShare,
  },
]

export function SolutionSection() {
  return (
    <LandingSection
      id="solution"
      title="Mind Orbit의 세 가지 약속"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {promises.map((p, i) => (
          <div
            key={p.num}
            className="reveal-on-scroll neon-hover-card group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-orbit-surface to-orbit-bg p-[1px]"
            style={{ ['--reveal-delay' as string]: `${120 + i * 90}ms` }}
          >
            <div className="flex h-full flex-col rounded-2xl bg-orbit-surface/95 p-6 md:p-7">
              <span className="text-xs font-semibold text-violet-300/80">
                약속 {p.num}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-zinc-50">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{p.body}</p>
              <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.05] bg-orbit-bg/50 p-4">
                <p.Illust />
              </div>
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}
