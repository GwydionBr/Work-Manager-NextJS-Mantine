'use client';

import { logout } from '@/actions';
import { Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks';

export default function LogoutButton() {
  const [loading, { open, close }] = useDisclosure(false);

  async function handleLogout() {
    open();
    await logout();
    close();
  }

  return (
    <Button color="red" onClick={handleLogout} variant="filled" loading={loading} disabled={loading}>
      Logout
    </Button>
  )
}