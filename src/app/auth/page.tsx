'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Center } from '@mantine/core';
import AuthenticationForm from '@/components/Auth/AuthForm';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get('defaultType') as 'login' | 'register') || 'login';

  return (
    <Center>
      <AuthenticationForm defaultType={defaultType} withBorder />
    </Center>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<Center>Loading...</Center>}>
      <AuthPageContent />
    </Suspense>
  );
}
