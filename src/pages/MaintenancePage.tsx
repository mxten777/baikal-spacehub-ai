export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-10 text-center max-w-narrow">
        <img
          src="/images/thelitlogo_black_trans.png"
          alt="THE LIT"
          className="h-10 w-auto object-contain"
        />

        <div className="flex flex-col items-center gap-4">
          <p className="font-sans text-xs tracking-label uppercase text-brand-muted">
            Coming Soon
          </p>
          <h1 className="font-display text-headline text-brand-black">
            더 나은 모습으로 준비하고 있습니다.
          </h1>
          <p className="font-sans text-sm text-brand-muted leading-relaxed">
            THE LIT 홈페이지는 현재 리뉴얼 중입니다.
            <br />
            곧 새로운 모습으로 찾아뵙겠습니다.
          </p>
        </div>

        <div className="w-px h-12 bg-brand-accent opacity-60" />
      </div>
    </div>
  );
}
