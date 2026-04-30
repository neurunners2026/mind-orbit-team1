export function SocialProofSection() {
  return (
    <section
      id="proof"
      className="scroll-mt-24 border-t border-white/[0.04] py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-on-scroll flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-12 sm:text-left">
          <div className="shrink-0">
            <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              100<span className="text-violet-300">명</span>
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-400">
              베타 신청, 48시간 만에
            </p>
          </div>
          <div className="h-px w-16 bg-orbit-border sm:h-12 sm:w-px" aria-hidden />
          <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
            서비스 한 줄도 공개하기 전.<br className="hidden sm:block" />
            문제에 공감한 사람들이 먼저 손을 들었습니다.
          </p>
        </div>
      </div>
    </section>
  )
}
