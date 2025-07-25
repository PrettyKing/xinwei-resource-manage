'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SpinnerIcon } from '@/components/icons';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到登录页面
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <SpinnerIcon size={48} className="text-blue-500 mx-auto mb-4" />
        <div className="text-gray-600 font-medium">正在跳转到登录页面...</div>
      </div>
    </div>
  );
}
