export default function generateJoinMessage(username) {
  const joinMessages = [
    "$u just landed!",
    "$u hopped into the faction!",
    "Welcome to the faction, $u!",
    "Ah, $u.  We've been expecting you",
    "Hello, hello, hello $u."
    "The name's $u... $u, $u.",
    "My name $u!",
    "Greetings, $u.",
    "Welcome to the party, $u!",
    "Fancy seeing you here, $u."
  ];
  const i = Math.round(Math.random() * joinMessages.length - 1);

  return joinMessages[i].replaceAll("$u", `**${username}**`);
}
