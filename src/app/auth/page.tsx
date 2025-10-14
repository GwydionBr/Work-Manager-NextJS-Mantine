"use client";

import { useSearchParams } from "next/navigation";

import { Suspense } from "react";
import { Center, Stack } from "@mantine/core";
import AuthenticationForm from "@/components/Auth/AuthForm";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const defaultType =
    (searchParams.get("defaultType") as "login" | "register") || "login";

  return (
    <Stack align="center" justify="center" h="100vh">
      <AuthenticationForm defaultType={defaultType} withBorder />
    </Stack>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<Center>Loading...</Center>}>
      <AuthPageContent />
    </Suspense>
  );
}
