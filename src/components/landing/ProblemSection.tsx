import { LandingSection } from './LandingSection'

const pains = [
  {
    title: '메모앱에 적었는데, 나중에 찾을 수가 없다',
    body: '선형 구조로는 생각의 연결이 보이지 않습니다',
  },
  {
    title: 'Miro를 켰다가, 기능에 치여 생각을 잃었다',
    body: '생각정리보다 도구 사용이 먼저가 되는 역설',
  },
  {
    title: '아이디어는 모바일에서 떠오르는데, 도구는 PC에 있다',
    body: '맥락이 끊기면 생각도 사라집니다',
  },
  {
    title: '정리했는데 결과물이 보기 싫어서 다시 안 열었다',
    body: '투박한 결과물은 활용되지 않습니다',
  },
]

export function ProblemSection() {
  return (
    <LandingSection
      id="problem"
      title="익숙한 도구들, 하지만 이런 적 없었나요?"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pains.map((card, index) => (
          <article
            key={card.title}
            className="reveal-on-scroll neon-hover-card rounded-2xl border border-orbit-border bg-orbit-surface/80 p-6 shadow-md shadow-black/25"
            style={{ ['--reveal-delay' as string]: `${120 + index * 90}ms` }}
          >
            <h3 className="text-base font-semibold leading-snug text-zinc-50">
              {card.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {card.body}
            </p>
          </article>
        ))}
      </div>
    </LandingSection>
  )
}
