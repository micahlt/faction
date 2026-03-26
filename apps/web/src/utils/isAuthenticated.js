export default async function isAuthenticated() {
  const authRequest = await fetch("/api/users/me");
  if (authRequest.ok) {
    return true;
  } else {
    return false;
  }
}
