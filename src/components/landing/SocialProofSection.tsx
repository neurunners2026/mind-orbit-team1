export function SocialProofSection() {
  return (
    <section
      id="proof"
      className="scroll-mt-24 border-t border-white/[0.04] py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-on-scroll flex flex-col items-center gap-8 text-center sm:flex-row sm:justify-center sm:gap-0">

          {/* Stat 1 — 베타 신청 */}
          <div className="flex flex-col items-center sm:px-12">
            <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              100<span className="text-violet-300">명</span>
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-500">베타 신청</p>
          </div>

          <div className="h-px w-20 bg-orbit-border sm:h-16 sm:w-px" aria-hidden />

          {/* Stat 2 — 48시간 강조 */}
          <div className="flex flex-col items-center sm:px-12">
            <p className="text-5xl font-bold tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-violet-300 to-indigo-200 bg-clip-text text-transparent">
                48시간
              </span>
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-500">만에</p>
          </div>

          <div className="h-px w-20 bg-orbit-border sm:h-16 sm:w-px" aria-hidden />

          {/* Description */}
          <p className="max-w-xs text-sm leading-relaxed text-zinc-400 sm:px-12 sm:text-left">
            서비스 한 줄도 공개하기 전.
            <br />
            문제에 공감한 사람들이
            <br />
            먼저 손을 들었습니다.
          </p>

        </div>
      </div>
    </section>
  )
}
