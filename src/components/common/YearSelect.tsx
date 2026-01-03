import { useAnalytics } from '../../services/analytics/provider';
import { AnalyticsEventName } from '../../services/analytics/constants';

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

interface YearSelectProps {
  selectedYear: number;
  onChange: (year: number) => void;
  className?: string;
  includeAllYears?: boolean;
  analyticsEvent?: AnalyticsEventName;
}

export const YearSelect = ({
  selectedYear,
  onChange,
  className = '',
  includeAllYears = false,
  analyticsEvent
}: YearSelectProps) => {
  const analytics = useAnalytics();

  const handleChange = (year: number) => {
    // Ensure year is a number and log the value
    const numericYear = Number(year);
    console.log('YearSelect change:', {
      rawValue: year,
      numericValue: numericYear,
      type: typeof numericYear
    });
    
    if (analyticsEvent) {
      analytics.trackEvent(analyticsEvent, {
        filter_type: 'year',
        value: numericYear,
        previous_value: selectedYear
      });
    }
    onChange(numericYear);
  };

  return (
    <select
      value={selectedYear}
      onChange={(e) => handleChange(Number(e.target.value))}
      className={`block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${className}`}
      aria-label="Select year"
    >
      {includeAllYears && (
        <option value={new Date().getFullYear()}>All Years</option>
      )}
      {AVAILABLE_YEARS.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
};