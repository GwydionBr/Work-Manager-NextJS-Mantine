import LogoutButton from "@/components/Auth/LogoutButton";
import Header from "@/components/Header/Header";
import classes from "./Account.module.css";

export default function AccountPage() {
  return (
    <div className={classes.accountMainContainer}>
      <Header headerTitle="Account Page" />
      <LogoutButton />
    </div>
  );
}