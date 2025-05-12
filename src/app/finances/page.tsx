import FinancesTab from "@/components/Finances/FinancesTab";
import classes from "./Finances.module.css";

export default function FinancesPage() {
  return (
    <div className={classes.financesMainContainer}>
      <FinancesTab />
    </div>
  );
}
