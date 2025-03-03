export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h - ${minutes}min`;
}

export function formatTimeSpan(start: Date, end: Date): string {
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
}

export function formatDateTime(date: Date) {
  return date.toLocaleString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, 
  });
}

export function formatMoney(amount: number, currency: string): string {
  if (currency === '$') {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatEarningsAmount(amount: number, currency: string) {
  if (currency === '$') {
    return ` ${currency}${amount.toFixed(2)}`;
  }

  return `${amount.toFixed(2)}${currency}`;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatMonth(month: number) {
  return new Date(2023, month - 1, 1).toLocaleString(undefined, { month: 'long' });
}

export function getWeekNumber(date: Date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - firstJan.getTime();
  return Math.ceil((diff / (1000 * 60 * 60 * 24) + firstJan.getDay() + 1) / 7);
}


export function formatSecondsToTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}