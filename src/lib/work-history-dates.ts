import { birthdayDayOptions, birthdayMonthOptions } from "@/lib/birthday";
import { getYearJST } from "@/lib/datetime";

export function workHistoryYearOptions(startYear = 1970): string[] {
  const current = getYearJST();
  const years: string[] = [];
  for (let y = current; y >= startYear; y -= 1) {
    years.push(String(y));
  }
  return years;
}

export { birthdayMonthOptions as workHistoryMonthOptions, birthdayDayOptions as workHistoryDayOptions };
