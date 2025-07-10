export function createCustomWordPattern(word: string, length: number): string {
  if (!word) return "";
  if (length < 0) throw new Error("Length must be a positive number");
  if (length >= word.length) return word;
  if (length === 1) return word[0];

  let consonants: number[] = [];
  let vowels: number[] = [];

  const vowelsLookup = new Set(["a", "e", "i", "o", "u"]);
  const letters = Array.from({ length: word.length }, () => "");
  const words = word.split("");

  words.forEach((char, index) => {
    if (vowelsLookup.has(char)) vowels.push(index);
    else consonants.push(index);
  });

  letters[0] = words[0];

  let iterator = 0;
  let index = iterator;

  while (consonants.length) {
    if (letters.filter(Boolean).length === length) break;
    const character = words[index];

    if (vowelsLookup.has(character)) {
      if (index + 1 < word.length) index++;
      else index = ++iterator;
      continue;
    }

    letters[index] = character;
    consonants = consonants.filter((idx) => idx !== index);
    const factor = 2 - (iterator % 2);

    if (index + factor === word.length) index++;
    else if (index + factor < word.length) index += factor;
    else index = ++iterator;
  }

  iterator = words.length - 1;
  index = iterator;

  while (vowels.length) {
    if (letters.filter(Boolean).length === length) break;
    const character = words[index];

    letters[index] = character;
    vowels = vowels.filter((idx) => idx !== index);
    const factor = 2 + (iterator % 2);

    if (index - factor === 0) index--;
    else if (index - factor > 0) index -= factor;
    else index = --iterator;
  }

  return letters.filter(Boolean).join("");
}
