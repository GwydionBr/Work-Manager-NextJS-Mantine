import { logout } from '@/actions';
import { Button } from '@mantine/core'

export default function LogoutButton() {
  return (
    <Button onClick={logout} variant="light">
      Logout
    </Button>
  )
}