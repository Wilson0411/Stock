import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import LoginForm from '@/components/login-form';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  if (isAuthenticated(cookies())) {
    redirect('/');
  }

  return (
    <main className="bg-grid min-h-screen overflow-x-clip">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-10 md:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="rounded-[36px] border border-white/55 bg-[linear-gradient(135deg,rgba(8,19,27,0.98),rgba(18,53,74,0.94),rgba(224,122,45,0.82))] px-6 py-8 text-white shadow-[0_32px_80px_rgba(11,23,32,0.16)] md:px-8 md:py-10">
            <p className="text-sm uppercase tracking-[0.34em] text-white/62">Taiwan Listed Stock Radar</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight md:text-5xl">先登入，再看事件交易模式與個股交易計畫。</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/78">登入後即可查看首頁候選池、個股頁、積極版與保守版交易計畫切換，以及各價位的展開說明。</p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-white/80">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">事件交易模式</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">保守 / 積極 交易計畫</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">價位展開說明</span>
            </div>
          </section>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}