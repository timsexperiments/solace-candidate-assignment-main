export function formatPhoneNumber(phoneNumber: string) {
  if (phoneNumber.length != 10) {
    return phoneNumber;
  }
  return `(${phoneNumber.slice(0, 3)})${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
}
