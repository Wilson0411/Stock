'use client';

import type { Route } from 'next';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextPath = searchParams.get('next') || '/';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setErrorMessage(payload?.message ?? '登入失敗，請確認帳號密碼。');
      return;
    }

    startTransition(() => {
      router.replace(nextPath as Route);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mx-auto w-full max-w-md rounded-[32px] px-6 py-7 shadow-[0_28px_70px_rgba(11,23,32,0.12)] md:px-7 md:py-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-tide/60">Login</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">登入台股處置風險雷達</h1>
        <p className="mt-3 text-sm leading-7 text-ink/68">目前先用示範帳號登入。帳號與密碼皆為 admin。</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-ink/70">
          <span className="mb-2 block">帳號</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="w-full rounded-2xl border border-ink/10 bg-white/92 px-4 py-3 text-base text-ink outline-none transition focus:border-tide focus:ring-4 focus:ring-tide/10"
          />
        </label>

        <label className="block text-sm text-ink/70">
          <span className="mb-2 block">密碼</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="w-full rounded-2xl border border-ink/10 bg-white/92 px-4 py-3 text-base text-ink outline-none transition focus:border-tide focus:ring-4 focus:ring-tide/10"
          />
        </label>
      </div>

      {errorMessage ? <p className="mt-4 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">{errorMessage}</p> : null}

      <button type="submit" disabled={isPending} className="solid-ink mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70">
        {isPending ? '登入中...' : '登入'}
      </button>

      <div className="mt-5 rounded-[24px] border border-ink/8 bg-white/72 px-4 py-4 text-sm text-ink/68">
        <p className="font-medium text-ink">示範帳密</p>
        <p className="mt-2">帳號：admin</p>
        <p>密碼：admin</p>
      </div>
    </form>
  );
}