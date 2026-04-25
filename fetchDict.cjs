const https = require("https");
const fs = require("fs");

const url = "https://raw.githubusercontent.com/duyvuleo/VNTC/master/Data/dictionary.txt";

https.get(url, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    const lines = data.split("\n");
    const validWords = new Set();
    
    // Regex allowing spaces and valid vietnamese characters
    const viRegex = /^[a-zàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹ\s]+$/;

    for (let line of lines) {
      let word = line.trim().toLowerCase();
      if (!word) continue;
      
      // replace underscores with spaces
      word = word.replace(/_/g, " ");
      
      // We only want words with exactly 2 syllables
      const parts = word.split(/\s+/);
      if (parts.length === 2) {
        if (viRegex.test(word)) {
          validWords.add(word);
        }
      }
    }

    // fallback if download fails
    if (validWords.size < 1000) {
      console.log("Not enough words parsed. Count: " + validWords.size);
      // Let's add some basic words anyway
      validWords.add("động thái");
      validWords.add("lao động");
    } else {
      validWords.add("động thái");
      validWords.add("địa chấn");
    }

    const uniqueWords = Array.from(validWords).sort();
    console.log(`Found ${uniqueWords.length} 2-syllable words.`);

    const content = `/* ═══════════════════════════════════════════
   Bộ từ điển từ ghép 2 âm tiết tiếng Việt
   Dùng cho game Nối Từ (Word Chain)
   ═══════════════════════════════════════════ */

const WORD_LIST: string[] = ${JSON.stringify(uniqueWords, null, 2)};

// ── Xây dựng index để tra cứu nhanh ──
const wordSet = new Set(WORD_LIST);

const firstSyllableIndex = new Map<string, string[]>();
const lastSyllableIndex = new Map<string, string[]>();

WORD_LIST.forEach((word) => {
  const parts = word.split(" ");
  if (parts.length === 2) {
    const [first, last] = parts;

    if (!firstSyllableIndex.has(first)) {
      firstSyllableIndex.set(first, []);
    }
    firstSyllableIndex.get(first)!.push(word);

    if (!lastSyllableIndex.has(last)) {
      lastSyllableIndex.set(last, []);
    }
    lastSyllableIndex.get(last)!.push(word);
  }
});

export function isValidWord(word: string): boolean {
  return wordSet.has(word.toLowerCase().trim());
}

export function getFirstSyllable(word: string): string {
  return word.trim().split(" ")[0] || "";
}

export function getLastSyllable(word: string): string {
  const parts = word.trim().split(" ");
  return parts[parts.length - 1] || "";
}

export function isValidChain(previousWord: string, newWord: string): boolean {
  const lastSyl = getLastSyllable(previousWord.toLowerCase().trim());
  const firstSyl = getFirstSyllable(newWord.toLowerCase().trim());
  return lastSyl === firstSyl;
}

export function findWordsStartingWith(syllable: string): string[] {
  return firstSyllableIndex.get(syllable.toLowerCase().trim()) || [];
}

export function getRandomStartWord(): string {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

export function hasNextWord(currentWord: string, usedWords: Set<string>): boolean {
  const lastSyl = getLastSyllable(currentWord.toLowerCase().trim());
  const candidates = findWordsStartingWith(lastSyl);
  return candidates.some((w) => !usedWords.has(w));
}

export function getDictionarySize(): number {
  return WORD_LIST.length;
}

// Fallback hint for UI compatibility
export function getHints(currentWord: string, usedWords: Set<string>): string[] {
  return [];
}
`;

    fs.writeFileSync("./src/lib/vietnameseWords.ts", content, "utf8");
    console.log("Successfully updated vietnameseWords.ts");
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
