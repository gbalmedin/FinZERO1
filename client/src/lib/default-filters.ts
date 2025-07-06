import { startOfMonth, endOfMonth } from "date-fns";

export interface DefaultDateFilter {
  from: Date;
  to: Date;
}

export function getCurrentMonthFilter(): DefaultDateFilter {
  const now = new Date();
  return {
    from: startOfMonth(now),
    to: endOfMonth(now)
  };
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getCurrentMonthAPIFilter() {
  const filter = getCurrentMonthFilter();
  return {
    startDate: formatDateForAPI(filter.from),
    endDate: formatDateForAPI(filter.to)
  };
}

// Default filter state - only current month period applied
export function getDefaultFilters() {
  return {
    dateRange: getCurrentMonthAPIFilter()
    // No other filters applied by default
  };
}