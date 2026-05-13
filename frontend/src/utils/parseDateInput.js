export const parseDateInput = (dateString) => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? null : date;
};