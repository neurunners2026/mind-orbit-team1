import { LandingSection } from './LandingSection'

const promises = [
  {
    num: '01',
    title: '어디서든 바로 열립니다',
    body: '모바일, 태블릿, 데스크탑. 생각이 떠오른 그 자리에서 바로.',
    alt: 'Mind Orbit 모바일 앱 화면',
  },
  {
    num: '02',
    title: '보기 좋게 정리됩니다',
    body: '군더더기 없는 UI. 완성한 맵은 다시 열고 싶어집니다.',
    alt: 'Mind Orbit 마인드맵 편집 화면',
  },
  {
    num: '03',
    title: '링크 하나로 공유됩니다',
    body: '완성한 마인드맵을 웹 링크로 즉시. 설치 없이 누구나 볼 수 있습니다.',
    alt: 'Mind Orbit 공유 링크 화면',
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
              <div
                role="img"
                aria-label={p.alt}
                className="mockup-img mt-6 w-full overflow-hidden rounded-xl border border-white/[0.06] bg-orbit-bg/60"
                style={{ minHeight: '140px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}
