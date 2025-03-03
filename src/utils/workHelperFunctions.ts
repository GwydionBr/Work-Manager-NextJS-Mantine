export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
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