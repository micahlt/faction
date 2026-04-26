export default function randomString(length, includeNumbers = false) {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let numbers = "0123456789";
  if (includeNumbers) {
    chars += numbers;
  }
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
