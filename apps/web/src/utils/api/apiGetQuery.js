export default async function apiGetQuery(path) {
  const req = await fetch(path);
  if (req.ok) {
    return req.json();
  } else {
    throw new Error("Failed to fetch current user");
  }
}
