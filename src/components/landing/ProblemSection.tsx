import { LandingSection } from './LandingSection'

const pains = [
  {
    title: '정보는 많은데 초점이 없다',
    body: '문서와 슬랙, 화이트보드가 갈라져 있어 논의의 중심이 매번 흐려집니다.',
  },
  {
    title: '회의가 끝나면 맥락이 사라진다',
    body: '결정의 이유와 연결 고리가 남지 않아, 다음 주에 같은 질문이 반복됩니다.',
  },
  {
    title: '도구 전환이 피로를 만든다',
    body: '형식을 맞추느라 창의적인 부분까지 속도가 떨어지는 경험을 줄이고 싶습니다.',
  },
]

export function ProblemSection() {
  return (
    <LandingSection
      id="problem"
      eyebrow="Problem"
      title="왜 생각을 ‘지도’로 옮겨야 할까요?"
      description="아이디어는 네트워크인데, 대부분의 업무 도구는 여전히 선형 문서에 가깝습니다."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {pains.map((card, index) => (
          <article
            key={card.title}
            className="reveal-on-scroll neon-hover-card rounded-2xl border border-orbit-border bg-orbit-surface/80 p-6 shadow-md shadow-black/25"
            style={{ ['--reveal-delay' as string]: `${120 + index * 90}ms` }}
          >
            <h3 className="text-lg font-medium text-zinc-100">{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-orbit-muted">
              {card.body}
            </p>
          </article>
        ))}
      </div>
    </LandingSection>
  )
}
