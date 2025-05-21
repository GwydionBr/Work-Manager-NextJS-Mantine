import classes from "./Account.module.css";

import { Grid } from "@mantine/core";
import Header from "@/components/Header/Header";
import Profile from "@/components/Account/Profile";
import FriendCard from "@/components/Account/FriendCard";

export default function AccountPage() {


  return (
    <div className={classes.accountMainContainer}>
      <Header headerTitle="Account" />
      <Grid w="100%" px="xl">
        <Grid.Col span={{ base: 12, lg: 4, md: 6 }}>
          <Profile />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 8, md: 6 }}>
          <FriendCard />
        </Grid.Col>
      </Grid>
    </div>
  );
}
