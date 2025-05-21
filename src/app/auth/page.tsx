'use client';

import { useSearchParams } from 'next/navigation';

import classes from './Auth.module.css';

import { Suspense } from 'react';
import { Box, Center } from '@mantine/core';
import AuthenticationForm from '@/components/Auth/AuthForm';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get('defaultType') as 'login' | 'register') || 'login';

  return (
    <Box className={classes.authPageContainer}>
      <AuthenticationForm defaultType={defaultType} withBorder />
    </Box>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<Center>Loading...</Center>}>
      <AuthPageContent />
    </Suspense>
  );
}
