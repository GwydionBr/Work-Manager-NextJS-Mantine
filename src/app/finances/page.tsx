import FinancesTab from "@/components/Finances/FinancesTab";
import classes from "./Finances.module.css";
import Header from "@/components/Header/Header";

export default function FinancesPage() {
  return (
    <div className={classes.financesMainContainer}>
      <Header headerTitle="Finances" />
      <FinancesTab />
    </div>
  );
}
