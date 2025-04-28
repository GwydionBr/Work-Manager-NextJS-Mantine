'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Center } from '@mantine/core';
import AuthenticationForm from '@/components/Auth/AuthForm';
import classes from './Auth.module.css';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get('defaultType') as 'login' | 'register') || 'login';

  return (
    <div className={classes.authPageContainer}>
      <AuthenticationForm defaultType={defaultType} withBorder />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<Center>Loading...</Center>}>
      <AuthPageContent />
    </Suspense>
  );
}
