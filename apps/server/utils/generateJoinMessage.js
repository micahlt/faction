export default function generateJoinMessage(username) {
  const joinMessages = [
    "$u just landed!",
    "$u hopped into the faction!",
    "Welcome to the faction, $u!",
    "Ah, $u.  We've been expecting you",
  ];
  const i = Math.round(Math.random() * joinMessages.length - 1);

  return joinMessages[i].replaceAll("$u", `**${username}**`);
}
