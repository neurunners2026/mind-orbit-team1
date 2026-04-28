import { LandingSection } from './LandingSection'

const features = [
  {
    name: '오비트 캔버스',
    desc: '노드를 자유롭게 배치하고, 관계를 곡선으로 연결해 흐름을 시각화합니다.',
  },
  {
    name: '계층과 맥락',
    desc: '큰 그림에서 세부까지 확장·축소하며, 각 가지에 메모와 링크를 붙입니다.',
  },
  {
    name: '팀 스냅샷',
    desc: '특정 시점의 보드를 저장해, 회고와 온보딩에 그대로 활용할 수 있습니다.',
  },
  {
    name: '가벼운 공유',
    desc: '읽기 전용 링크로 이해관계자에게 맥락만 전달하고 피드백을 모읍니다.',
  },
]

export function FeatureSection() {
  return (
    <LandingSection
      id="features"
      eyebrow="Features"
      title="맵을 중심으로 워크플로를 다시 설계했습니다"
      description="복잡함을 숨기지 않되, 한 화면에서 방향을 잃지 않도록 배치와 대비를 정리했습니다."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {features.map((f, i) => (
          <div
            key={f.name}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-orbit-surface to-orbit-bg p-[1px]"
          >
            <div className="h-full rounded-2xl bg-orbit-surface/95 p-6 md:p-7">
              <span className="text-xs font-semibold text-violet-300/80">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-zinc-50">{f.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}
