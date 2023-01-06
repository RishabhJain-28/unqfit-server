// return gap of a date from now in millisecods
export const durationFromNow = (date: Date) => {
  return date.valueOf() - Date.now();
};
