'use client';

import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { KeyRound, ArrowRight, CheckCircle, Zap, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: '링크 하나로 입주 안내',
    desc: '입주자에게 고유 링크를 보내세요. 앱 설치 없이 모바일 브라우저에서 바로 확인합니다.',
  },
  {
    icon: CheckCircle,
    title: '체크리스트 & 서명',
    desc: '필수 확인 사항을 체크리스트로 전달하고, 전자 서명으로 완료를 기록합니다.',
  },
  {
    icon: Smartphone,
    title: '실시간 대시보드',
    desc: '입주자 진행 상태를 실시간으로 확인하고, 만료·미완료 세션을 한눈에 관리합니다.',
  },
];

export default function LandingPage() {
  const { openSignIn } = useClerk();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <KeyRound className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">OnKey</span>
          </Link>
          <button
            type="button"
            onClick={() => openSignIn()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 cursor-pointer"
          >
            로그인
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
            <KeyRound className="h-3 w-3" />
            원룸·오피스텔 입주 온보딩 플랫폼
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            입주 안내,
            <br />
            <span className="text-primary">이제 링크 하나로 끝</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            운영자가 안내 세션을 만들면, 입주자가 링크로 셀프 온보딩을 완료합니다.
            <br />
            종이 서류도 반복 안내도 이제 그만.
          </p>

          <div className="mt-10">
            <button
              type="button"
              onClick={() => openSignIn()}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 cursor-pointer"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/60 bg-card/50">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="text-center md:text-left">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} OnKey</span>
          <span>입주 온보딩을 더 쉽게</span>
        </div>
      </footer>
    </div>
  );
}
