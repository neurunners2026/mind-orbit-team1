import { LandingSection } from './LandingSection'

const audiences = [
  '메모앱으로는 부족하고, Notion 열기엔 너무 작은 생각이 있는 분',
  '아이디어가 모바일에서 자주 떠오르는 분',
  '결과물이 보기 좋아야 다시 열게 되는 분',
  '내 생각을 링크 하나로 바로 나누고 싶은 분',
]

export function TargetSection() {
  return (
    <LandingSection
      id="target"
      title="이런 상황이라면, Mind Orbit이 맞습니다"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {audiences.map((text, index) => (
          <div
            key={text}
            className="reveal-on-scroll neon-hover-card flex items-start gap-4 rounded-2xl border border-orbit-border bg-orbit-surface/50 px-6 py-5"
            style={{ ['--reveal-delay' as string]: `${120 + index * 80}ms` }}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600/80 text-xs font-bold text-white">
              {index + 1}
            </span>
            <p className="text-sm leading-relaxed text-zinc-200">{text}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}
