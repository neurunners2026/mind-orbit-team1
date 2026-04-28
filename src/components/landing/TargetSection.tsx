import { LandingSection } from './LandingSection'

const audiences = [
  {
    title: '프로덕트 팀',
    points: ['로드맵 논의', '우선순위 합의', '이해관계자 브리핑'],
  },
  {
    title: '리서치·기획',
    points: ['인사이트 클러스터링', '가설 맵', '인터뷰 노트 정리'],
  },
  {
    title: '스튜디오·에이전시',
    points: ['크리에이티브 방향', '클라이언트 리뷰', '버전별 스토리보드'],
  },
]

export function TargetSection() {
  return (
    <LandingSection
      id="target"
      eyebrow="Who it’s for"
      title="먼저 이런 팀에게 어울립니다"
      description="문서만으로는 부족하고, 화이트보드만으로는 기록이 부족한 중간 지점을 목표로 합니다."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {audiences.map((block) => (
          <div
            key={block.title}
            className="flex flex-col rounded-2xl border border-orbit-border bg-orbit-bg/60 p-6 md:p-7"
          >
            <h3 className="text-lg font-semibold text-white">{block.title}</h3>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              {block.points.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-orbit-accent"
                    aria-hidden
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}
