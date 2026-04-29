import { LandingSection } from './LandingSection'

const features = [
  {
    name: '생각나는 대로 놓기만 해도 정리가 됩니다',
    desc: '노드를 자유롭게 배치하면 흩어진 생각이 자연스럽게 연결됩니다.',
  },
  {
    name: '큰 생각부터 작은 디테일까지 한 번에 이어집니다',
    desc: '큰 그림에서 세부까지 확장·축소하며, 각 가지에 메모와 링크를 붙입니다.',
  },
  {
    name: '정리한 흐름을 그대로 저장해 둘 수 있습니다',
    desc: '특정 시점의 보드를 저장해, 언제든 다시 꺼내 이어갈 수 있습니다.',
  },
  {
    name: '링크 하나로 생각을 쉽게 공유할 수 있습니다',
    desc: '읽기 전용 링크로 내 생각의 흐름을 그대로 다른 사람에게 전달합니다.',
  },
]

export function FeatureSection() {
  return (
    <LandingSection
      id="features"
      eyebrow="Features"
      title="생각이 길을 잃지 않도록 만들었습니다"
      description="복잡한 생각도 한 화면에서 자연스럽게 정리됩니다"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {features.map((f, i) => (
          <div
            key={f.name}
            className="reveal-on-scroll neon-hover-card group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-orbit-surface to-orbit-bg p-[1px]"
            style={{ ['--reveal-delay' as string]: `${120 + i * 90}ms` }}
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
