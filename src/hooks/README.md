# useProcessRecurringCashflows Hook

Dieser Hook verarbeitet automatisch wiederkehrende Cashflows und erstellt die entsprechenden Single Cashflows.

## Funktionalität

- **Tägliche Verarbeitung**: Prüft bei jedem App-Start, ob heute bereits verarbeitet wurde
- **Intelligente Erkennung**: Verhindert Duplikate durch Vergleich mit existierenden Single Cashflows
- **React Query Integration**: Nutzt React Query für optimale Performance und Caching
- **Benachrichtigungen**: Zeigt Erfolgs- und Fehlermeldungen an

## Verwendung

```tsx
import { useProcessRecurringCashflows } from "@/hooks/useProcessRecurringCashflows";

function MyComponent() {
  const { isProcessing, triggerProcessing, lastProcessed, error } =
    useProcessRecurringCashflows();

  return (
    <div>
      {isProcessing && <p>Verarbeite wiederkehrende Cashflows...</p>}
      {error && <p>Fehler: {error.message}</p>}
      <button onClick={triggerProcessing}>Manuell verarbeiten</button>
    </div>
  );
}
```

## API

### Return Values

- `isProcessing: boolean` - Ob gerade verarbeitet wird
- `triggerProcessing: () => void` - Manueller Trigger für die Verarbeitung
- `lastProcessed: string | null` - Zeitstempel der letzten Verarbeitung
- `error: Error | null` - Eventuelle Fehler

## Technische Details

- **Prüfung**: Täglich basierend auf Datum (nicht 24h Intervall)
- **Speicherung**: localStorage für letzte Verarbeitung mit Datum
- **Datenquelle**: Verwendet `useRecurringCashflowQuery` und `useSingleCashflowQuery`
- **Verarbeitung**: Nutzt `processRecurringCashFlows` Helper-Funktion
