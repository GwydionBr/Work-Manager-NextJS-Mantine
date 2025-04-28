import { Text, Title } from "@mantine/core";
import classes from "./Header.module.css";

interface HeaderProps {
  headerTitle?  : string;
  description?: string;
  actions?: React.ReactNode;
}

export default function Header({ headerTitle, description, actions }: HeaderProps) {
  return (
    <div className={classes.headerContainer}>
      <Title order={1}>{headerTitle}</Title>
      {description && <Text>{description}</Text>}
      {actions && actions}
    </div>
  );
}
