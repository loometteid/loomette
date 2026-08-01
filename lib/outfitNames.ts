// Placeholder outfit-naming, not AI -- a small curated word list picked
// at random, same spirit as Shuffle. Purely a starting point: the name
// is editable on the result screen (3.4.2's pencil icon).
const ADJECTIVES = [
  "Chic Kinda",
  "Effortless",
  "Golden Hour",
  "Soft Focus",
  "Main Character",
  "Easy Breezy",
  "Quietly Bold",
  "Sunday Best",
];

const NOUNS = ["Day", "Look", "Moment", "Mood", "Vibes", "Fit"];

export function generateOutfitName() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}
