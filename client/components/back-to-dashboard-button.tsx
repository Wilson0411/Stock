'use client';

import { useRouter } from 'next/navigation';

export default function BackToDashboardButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/', { scroll: false });
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:bg-white"
    >
      返回總覽
    </button>
  );
}