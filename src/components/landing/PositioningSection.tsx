import { LandingSection } from './LandingSection'

const tools = [
  { label: '메모앱\nKeep', position: 12, brand: false },
  { label: 'Mind Orbit', position: 42, brand: true },
  { label: 'Notion', position: 66, brand: false },
  { label: 'Miro / XMind\nObsidian', position: 86, brand: false },
]

export function PositioningSection() {
  return (
    <LandingSection
      id="positioning"
      title="생각정리 도구의 빈 자리"
      description="메모 앱과 전문 협업 툴 사이. Mind Orbit은 그 자리를 채웁니다."
    >
      <div className="mx-auto max-w-3xl">
        {/* Axis labels */}
        <div className="mb-4 flex justify-between text-xs text-zinc-500">
          <span>가벼움 · 평면적</span>
          <span>무거움 · 구조적</span>
        </div>

        {/* Spectrum bar + dots */}
        <div className="relative" style={{ height: '96px' }}>
          {/* Bar */}
          <div className="absolute left-0 right-0 top-[6px] h-[2px] rounded-full bg-gradient-to-r from-orbit-border via-violet-800/50 to-orbit-border" />

          {/* Tool dots + labels */}
          {tools.map((tool) => (
            <div
              key={tool.label}
              className="absolute flex flex-col items-center"
              style={{
                left: `${tool.position}%`,
                top: 0,
                transform: 'translateX(-50%)',
              }}
            >
              {tool.brand ? (
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7F77DD] opacity-60" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#7F77DD] shadow-lg shadow-violet-500/40" />
                </span>
              ) : (
                <span className="mt-[1px] h-2.5 w-2.5 rounded-full bg-zinc-600" />
              )}

              <span
                className={[
                  'mt-2 whitespace-pre-line text-center text-xs leading-snug',
                  tool.brand
                    ? 'font-semibold text-violet-300'
                    : 'text-zinc-500',
                ].join(' ')}
              >
                {tool.label}
              </span>
            </div>
          ))}
        </div>

        {/* Zone labels */}
        <div className="flex text-[11px]">
          <span className="text-zinc-600" style={{ width: '28%' }}>
            저관여 도구
          </span>
          <span
            className="text-center text-violet-400/60"
            style={{ width: '44%' }}
          >
            Mind Orbit 타깃
          </span>
          <span
            className="text-right text-zinc-600"
            style={{ width: '28%' }}
          >
            고관여 도구
          </span>
        </div>
      </div>
    </LandingSection>
  )
}
