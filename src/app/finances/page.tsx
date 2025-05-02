import Header from "@/components/Header/Header";
import { Text } from "@mantine/core";
import classes from "./Finances.module.css";

export default function FinancesPage() {
  return (
    <div className={classes.financesMainContainer}>
      <Header headerTitle="Finances" />
    </div>
  );
}
