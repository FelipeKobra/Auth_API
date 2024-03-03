export function checkIfPreviousDate(date: Date) {
  if (date < new Date()) return true
  return false
}
