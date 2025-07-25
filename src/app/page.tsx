'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoading } from '@/components/Loading';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到登录页面
    router.push('/login');
  }, [router]);

  return (
    <PageLoading
      visible={true}
      tip="正在跳转到登录页面..."
      type="spinner"
      size="lg"
      color="primary"
    />
  );
}
