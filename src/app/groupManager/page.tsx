import { Container } from "@mantine/core";
import classes from "./GroupManager.module.css";
import Header from "@/components/Header/Header";
import GroupManagerTabs from "@/components/GroupManager/GroupManagerTabs";

export default function GroupManagerPage() {
  return (
    <Container className={classes.groupManagerMainContainer}>
      <Header headerTitle="Group Manager" />
      <GroupManagerTabs />
    </Container>
  );
}
