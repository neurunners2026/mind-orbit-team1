import { LandingSection } from './LandingSection'

const audiences = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: '아이디어가 자꾸 흩어지는 분',
    description: '메모는 하는데 나중에 찾기 어렵고, 연결이 안 된다고 느끼는 분',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: '생각은 많은데 정리가 어려운 분',
    description: '아이디어는 넘치는데 막상 쓰려고 하면 머릿속이 복잡해지는 분',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: '복잡한 툴은 부담스러운 분',
    description: '메모 앱은 부족하고 무거운 협업 툴은 과한, 딱 중간이 필요한 분',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: '생각을 나누고 싶은 분',
    description: '내 생각을 다른 사람에게 쉽게 보여주고 함께 발전시키고 싶은 분',
  },
]

export function TargetSection() {
  return (
    <LandingSection
      id="target"
      title="이런 분들을 위해 만들었습니다"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {audiences.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-3 rounded-2xl border border-orbit-border bg-orbit-surface/50 p-6 md:p-7"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/80 text-white">
              {item.icon}
            </span>
            <h3 className="text-base font-semibold text-white">{item.title}</h3>
            <p className="text-sm leading-relaxed text-zinc-400">{item.description}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  )
}
