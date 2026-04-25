const https = require("https");
const fs = require("fs");

const url = "https://raw.githubusercontent.com/duyvuleo/VNTC/master/Data/dictionary.txt";
// Or another raw URL if this one is down. Let's just use it.

https.get(url, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    // Some lines might be in format "địa_chấn"
    const lines = data.split("\n");
    const twoSyllableWords = [];

    const regex = /^[a-z_àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹ]+\s[a-z_àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹ]+$/;
    
    for (const line of lines) {
      let word = line.trim().toLowerCase();
      // the dictionary uses underscore for space: "địa_chấn"
      if (word.includes("_")) {
        word = word.replace(/_/g, " ");
      }
      
      if (word.split(" ").length === 2) {
        // filter out words with numbers or weird characters
        if (/^[a-zàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹ\s]+$/.test(word)) {
          twoSyllableWords.push(word);
        }
      }
    }

    // fallback if download fails or format is weird
    if (twoSyllableWords.length < 1000) {
      console.log("Failed to parse dictionary. Using fallback.");
      return;
    }

    const uniqueWords = Array.from(new Set(twoSyllableWords)).sort();
    
    // Make sure we have our new word!
    if (!uniqueWords.includes("địa chấn")) uniqueWords.push("địa chấn");

    console.log(`Found ${uniqueWords.length} words.`);

    const content = `/* ═══════════════════════════════════════════
   Bộ từ điển từ ghép 2 âm tiết tiếng Việt
   Dùng cho game Nối Từ (Word Chain)
   ═══════════════════════════════════════════ */

// Từ ghép được lưu dưới dạng "âm_tiết_1 âm_tiết_2"
// Mỗi phần tử là 1 từ ghép hợp lệ
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
`;

    fs.writeFileSync("./src/lib/vietnameseWords.ts", content, "utf8");
    console.log("Successfully updated vietnameseWords.ts");
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
