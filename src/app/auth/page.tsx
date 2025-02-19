'use client';

import { useSearchParams } from 'next/navigation';
import { Center } from '@mantine/core';
import AuthenticationForm from '@/components/Auth/AuthForm';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get('defaultType') as 'login' | 'register') || 'login';

  return (
    <Center>
      <AuthenticationForm defaultType={defaultType} withBorder />
    </Center>
  );
}
