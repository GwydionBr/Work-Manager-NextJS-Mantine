import LogoutButton from "@/components/Auth/LogoutButton";
import { Title } from "@mantine/core";
import classes from "./Account.module.css";
export default function AccountPage() {
  return (
    <div className={classes.accountMainContainer}>
      <Title order={1} pb="xl">Account Page</Title>
      <LogoutButton />
    </div>
  );
}