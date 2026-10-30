import type { SchoolYear, Subject } from "./curriculum";

/**
 * A lesson is one node on the learning path. Each lesson holds one or more
 * levels; the child must clear a level before the next unlocks.
 *
 * Levels exist so a topic can be revisited with harder material instead of
 * being consumed once. That is what turns 19 topics into a much longer path
 * without inventing 19 more topics.
 */
export interface Lesson {
  id: string;
  /**
   * School year the lesson belongs to. This is the only grouping: Tahun 1
   * content is never mixed with Tahun 2.
   */
  year: SchoolYear;
  subject: Subject;
  title: string;
  /** Short parent-facing description of what the child practises. */
  objective: string;
  /** Curriculum reference, e.g. KSPK BM 3.2.1 or KSSR T1 Matematik 1.1 */
  standard?: string;
  levels: Level[];
}

export interface Level {
  /** 1-based. Level 1 is the easiest. */
  index: number;
  /** Shown on the path, e.g. "Kenal huruf" then "Baca suku kata". */
  title: string;
  questions: Question[];
}

export type Question =
  | ChoiceQuestion
  | MatchQuestion
  | ListenQuestion
  | DragDropQuestion
  | FillBlankQuestion
  | TraceQuestion
  | StoryQuestion
  | SortQuestion
  | MemoryQuestion;

interface QuestionBase {
  id: string;
  prompt: string;
  /** Spoken aloud for baby mode and for reading practice. */
  audioText?: string;
}

/** Pick the correct option from a set of tiles. */
export interface ChoiceQuestion extends QuestionBase {
  kind: "choice";
  options: string[];
  answer: string;
  /** Emoji shown large above the prompt, for pre-readers. */
  visual?: string;
}

/** Tap pairs that belong together (e.g. letter to picture). */
export interface MatchQuestion extends QuestionBase {
  kind: "match";
  pairs: { left: string; right: string }[];
}

/** Hear a sound, pick what it was. Used in baby mode. */
export interface ListenQuestion extends QuestionBase {
  kind: "listen";
  options: string[];
  answer: string;
  visual?: string;
}

/**
 * Drag each token into the matching slot. Used for word building, sentence
 * assembly, and grouping.
 */
export interface DragDropQuestion extends QuestionBase {
  kind: "dragdrop";
  /** The draggable tokens, in the order they are shown. */
  tokens: string[];
  /** Drop targets. `accepts` lists the tokens that belong in this slot. */
  slots: { id: string; label: string; accepts: string[] }[];
}

/** Complete a sentence or word by picking the missing piece. */
export interface FillBlankQuestion extends QuestionBase {
  kind: "fillblank";
  /** Sentence with a `___` marker where the blank sits. */
  sentence: string;
  options: string[];
  answer: string;
}

/**
 * Trace a letter, digit, or shape with a finger. Scored by coverage of the
 * guide path rather than exact stroke order, which is too strict for young
 * children and for a touch screen.
 */
export interface TraceQuestion extends QuestionBase {
  kind: "trace";
  /** The character or shape to trace. */
  glyph: string;
  /** Optional hint shown under the canvas. */
  hint?: string;
}

/**
 * A short illustrated story followed by comprehension questions. The story
 * is the prompt; `questions` are answered in sequence.
 */
export interface StoryQuestion extends QuestionBase {
  kind: "story";
  /** Story panels, shown one at a time. */
  panels: { text: string; visual?: string }[];
  questions: { prompt: string; options: string[]; answer: string }[];
}

/** Sort items into two or more buckets. */
export interface SortQuestion extends QuestionBase {
  kind: "sort";
  buckets: { id: string; label: string; emoji?: string }[];
  items: { label: string; bucket: string }[];
}

/** Remember a sequence, then reproduce it. */
export interface MemoryQuestion extends QuestionBase {
  kind: "memory";
  /** Items flashed to the child, in order. */
  sequence: string[];
  /** How long the sequence stays visible, in milliseconds. */
  revealMs?: number;
}

/** Narrowing helpers, so callers do not repeat `kind ===` checks. */
export function isChoice(q: Question): q is ChoiceQuestion {
  return q.kind === "choice";
}
export function isMatch(q: Question): q is MatchQuestion {
  return q.kind === "match";
}
export function isListen(q: Question): q is ListenQuestion {
  return q.kind === "listen";
}
export function isDragDrop(q: Question): q is DragDropQuestion {
  return q.kind === "dragdrop";
}
export function isFillBlank(q: Question): q is FillBlankQuestion {
  return q.kind === "fillblank";
}
export function isTrace(q: Question): q is TraceQuestion {
  return q.kind === "trace";
}
export function isStory(q: Question): q is StoryQuestion {
  return q.kind === "story";
}
export function isSort(q: Question): q is SortQuestion {
  return q.kind === "sort";
}
export function isMemory(q: Question): q is MemoryQuestion {
  return q.kind === "memory";
}

const CORE_LESSONS: Lesson[] = [
  // ------------------------------------------------------------ 1-3 baby
  {
    id: "baby-animals",
    year: "baby",
    subject: "diri",
    title: "Bunyi Haiwan",
    objective: "Kenal bunyi haiwan biasa",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "ba1",
            kind: "listen",
            prompt: "Haiwan apa ini?",
            audioText: "Moo! Moo!",
            options: ["🐄", "🐱", "🐦"],
            answer: "🐄",
            visual: "🐄",
          },
          {
            id: "ba2",
            kind: "listen",
            prompt: "Haiwan apa ini?",
            audioText: "Meow! Meow!",
            options: ["🐕", "🐱", "🐟"],
            answer: "🐱",
            visual: "🐱",
          },
          {
            id: "ba3",
            kind: "choice",
            prompt: "Mana kucing?",
            audioText: "Mana kucing?",
            options: ["🐶", "🐱", "🐰"],
            answer: "🐱",
            visual: "🐱",
          },
        ],
      },
      {
        index: 2,
        title: "Kenal haiwan",
        questions: [
          {
            id: "ba4",
            kind: "listen",
            prompt: "Haiwan apa ini?",
            audioText: "Woof! Woof!",
            options: ["🐕", "🐄", "🐑"],
            answer: "🐕",
            visual: "🐕",
          },
          {
            id: "ba5",
            kind: "listen",
            prompt: "Haiwan apa ini?",
            audioText: "Oink! Oink!",
            options: ["🐖", "🐔", "🐴"],
            answer: "🐖",
            visual: "🐖",
          },
          {
            id: "ba6",
            kind: "match",
            prompt: "Padankan haiwan",
            audioText: "Padankan haiwan dengan bunyinya",
            pairs: [
              { left: "🐄", right: "Moo" },
              { left: "🐱", right: "Meow" },
              { left: "🐕", right: "Woof" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baby-colours",
    year: "baby",
    subject: "seni",
    title: "Warna",
    objective: "Kenal warna asas",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "bc1",
            kind: "choice",
            prompt: "Mana warna merah?",
            audioText: "Mana warna merah?",
            options: ["🔴", "🔵", "🟢"],
            answer: "🔴",
            visual: "🔴",
          },
          {
            id: "bc2",
            kind: "choice",
            prompt: "Mana warna biru?",
            audioText: "Mana warna biru?",
            options: ["🟡", "🔵", "🟣"],
            answer: "🔵",
            visual: "🔵",
          },
          {
            id: "bc3",
            kind: "choice",
            prompt: "Mana warna kuning?",
            audioText: "Mana warna kuning?",
            options: ["🟡", "⚫", "🟤"],
            answer: "🟡",
            visual: "🟡",
          },
        ],
      },
      {
        index: 2,
        title: "Warna & benda",
        questions: [
          {
            id: "bc4",
            kind: "choice",
            prompt: "Mana warna hijau?",
            audioText: "Mana warna hijau?",
            options: ["🟢", "🔴", "🟠"],
            answer: "🟢",
            visual: "🟢",
          },
          {
            id: "bc5",
            kind: "choice",
            prompt: "Pisang warna apa?",
            audioText: "Pisang warna apa?",
            options: ["🟡", "🔵", "🟣"],
            answer: "🟡",
            visual: "🍌",
          },
          {
            id: "bc6",
            kind: "match",
            prompt: "Padankan warna",
            audioText: "Padankan warna dengan benda",
            pairs: [
              { left: "🍎", right: "🔴" },
              { left: "🍌", right: "🟡" },
              { left: "🌿", right: "🟢" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baby-count-3",
    year: "baby",
    subject: "math",
    title: "Kira 1-2-3",
    objective: "Kira objek hingga 3",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "bn1",
            kind: "choice",
            prompt: "Berapa banyak?",
            audioText: "Berapa banyak epal?",
            options: ["1", "2", "3"],
            answer: "2",
            visual: "🍎🍎",
          },
          {
            id: "bn2",
            kind: "choice",
            prompt: "Berapa banyak?",
            audioText: "Berapa banyak bintang?",
            options: ["1", "2", "3"],
            answer: "3",
            visual: "⭐⭐⭐",
          },
          {
            id: "bn3",
            kind: "choice",
            prompt: "Berapa banyak?",
            audioText: "Berapa banyak bola?",
            options: ["1", "2", "3"],
            answer: "1",
            visual: "⚽",
          },
        ],
      },
      {
        index: 2,
        title: "Kira & padan",
        questions: [
          {
            id: "bn4",
            kind: "choice",
            prompt: "Berapa banyak?",
            audioText: "Berapa banyak bintang?",
            options: ["2", "3", "4"],
            answer: "4",
            visual: "⭐⭐⭐⭐",
          },
          {
            id: "bn5",
            kind: "choice",
            prompt: "Berapa banyak?",
            audioText: "Berapa banyak bunga?",
            options: ["3", "4", "5"],
            answer: "5",
            visual: "🌺🌺🌺🌺🌺",
          },
          {
            id: "bn6",
            kind: "match",
            prompt: "Padankan nombor",
            audioText: "Padankan nombor dengan bilangan",
            pairs: [
              { left: "1", right: "🍎" },
              { left: "2", right: "🍎🍎" },
              { left: "3", right: "🍎🍎🍎" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baby-shapes",
    year: "baby",
    subject: "math",
    title: "Bentuk Besar & Kecil",
    objective: "Kenal bentuk dan saiz",
    levels: [
      {
        index: 1,
        title: "Kenal bentuk",
        questions: [
          {
            id: "bs1",
            kind: "choice",
            prompt: "Mana bulat?",
            audioText: "Mana bentuk bulat?",
            options: ["⚪", "⬛", "🔺"],
            answer: "⚪",
            visual: "⚪",
          },
          {
            id: "bs2",
            kind: "choice",
            prompt: "Mana segi empat?",
            audioText: "Mana segi empat?",
            options: ["🔺", "⬛", "⚪"],
            answer: "⬛",
            visual: "⬛",
          },
          {
            id: "bs3",
            kind: "choice",
            prompt: "Mana segi tiga?",
            audioText: "Mana segi tiga?",
            options: ["⚪", "⬛", "🔺"],
            answer: "🔺",
            visual: "🔺",
          },
        ],
      },
      {
        index: 2,
        title: "Besar & kecil",
        questions: [
          {
            id: "bs4",
            kind: "choice",
            prompt: "Mana lebih besar?",
            audioText: "Mana lebih besar?",
            options: ["🐘", "🐜", "🐝"],
            answer: "🐘",
            visual: "🐘",
          },
          {
            id: "bs5",
            kind: "choice",
            prompt: "Mana lebih kecil?",
            audioText: "Mana lebih kecil?",
            options: ["🐕", "🐜", "🐄"],
            answer: "🐜",
            visual: "🐜",
          },
          {
            id: "bs6",
            kind: "match",
            prompt: "Padankan bentuk",
            audioText: "Padankan bentuk dengan nama",
            pairs: [
              { left: "⚪", right: "Bulat" },
              { left: "⬛", right: "Segi empat" },
              { left: "🔺", right: "Segi tiga" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baby-body",
    year: "baby",
    subject: "diri",
    title: "Anggota Badan",
    objective: "Kenal anggota badan sendiri",
    levels: [
      {
        index: 1,
        title: "Kenal badan",
        questions: [
          {
            id: "bb1",
            kind: "choice",
            prompt: "Mana mata?",
            audioText: "Mana mata?",
            options: ["👁️", "👂", "👃"],
            answer: "👁️",
            visual: "👁️",
          },
          {
            id: "bb2",
            kind: "choice",
            prompt: "Mana tangan?",
            audioText: "Mana tangan?",
            options: ["🦶", "✋", "👂"],
            answer: "✋",
            visual: "✋",
          },
          {
            id: "bb3",
            kind: "choice",
            prompt: "Mana kaki?",
            audioText: "Mana kaki?",
            options: ["🦶", "✋", "👁️"],
            answer: "🦶",
            visual: "🦶",
          },
        ],
      },
      {
        index: 2,
        title: "Guna badan",
        questions: [
          {
            id: "bb4",
            kind: "choice",
            prompt: "Kita lihat dengan?",
            audioText: "Kita lihat dengan apa?",
            options: ["👁️", "👂", "👃"],
            answer: "👁️",
            visual: "👁️",
          },
          {
            id: "bb5",
            kind: "choice",
            prompt: "Kita dengar dengan?",
            audioText: "Kita dengar dengan apa?",
            options: ["👃", "👂", "✋"],
            answer: "👂",
            visual: "👂",
          },
          {
            id: "bb6",
            kind: "match",
            prompt: "Padankan badan",
            audioText: "Padankan anggota badan",
            pairs: [
              { left: "👁️", right: "Lihat" },
              { left: "👂", right: "Dengar" },
              { left: "👃", right: "Bau" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baby-food",
    year: "baby",
    subject: "diri",
    title: "Makanan & Minuman",
    objective: "Kenal makanan harian",
    levels: [
      {
        index: 1,
        title: "Kenal makanan",
        questions: [
          {
            id: "bf1",
            kind: "choice",
            prompt: "Mana buah?",
            audioText: "Mana buah?",
            options: ["🍎", "🍞", "🥛"],
            answer: "🍎",
            visual: "🍎",
          },
          {
            id: "bf2",
            kind: "choice",
            prompt: "Mana minuman?",
            audioText: "Mana minuman?",
            options: ["🍚", "🥛", "🍌"],
            answer: "🥛",
            visual: "🥛",
          },
          {
            id: "bf3",
            kind: "choice",
            prompt: "Mana nasi?",
            audioText: "Mana nasi?",
            options: ["🍚", "🍎", "🥛"],
            answer: "🍚",
            visual: "🍚",
          },
        ],
      },
      {
        index: 2,
        title: "Makan & minum",
        questions: [
          {
            id: "bf4",
            kind: "choice",
            prompt: "Mana pisang?",
            audioText: "Mana pisang?",
            options: ["🍌", "🍇", "🍉"],
            answer: "🍌",
            visual: "🍌",
          },
          {
            id: "bf5",
            kind: "choice",
            prompt: "Mana cawan?",
            audioText: "Mana cawan?",
            options: ["🥤", "🍽️", "🥄"],
            answer: "🥤",
            visual: "🥤",
          },
          {
            id: "bf6",
            kind: "match",
            prompt: "Padankan makanan",
            audioText: "Padankan makanan",
            pairs: [
              { left: "🍎", right: "Buah" },
              { left: "🥛", right: "Minuman" },
              { left: "🍚", right: "Nasi" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baby-transport",
    year: "baby",
    subject: "diri",
    title: "Kenderaan",
    objective: "Kenal kenderaan di jalan raya",
    levels: [
      {
        index: 1,
        title: "Kenal kenderaan",
        questions: [
          {
            id: "bt1",
            kind: "choice",
            prompt: "Mana kereta?",
            audioText: "Mana kereta?",
            options: ["🚗", "✈️", "🚢"],
            answer: "🚗",
            visual: "🚗",
          },
          {
            id: "bt2",
            kind: "choice",
            prompt: "Mana kapal terbang?",
            audioText: "Mana kapal terbang?",
            options: ["🚌", "✈️", "🚲"],
            answer: "✈️",
            visual: "✈️",
          },
          {
            id: "bt3",
            kind: "choice",
            prompt: "Mana bas?",
            audioText: "Mana bas?",
            options: ["🚌", "🚗", "🚢"],
            answer: "🚌",
            visual: "🚌",
          },
        ],
      },
      {
        index: 2,
        title: "Di mana?",
        questions: [
          {
            id: "bt4",
            kind: "choice",
            prompt: "Mana kapal?",
            audioText: "Mana kapal?",
            options: ["🚢", "✈️", "🚲"],
            answer: "🚢",
            visual: "🚢",
          },
          {
            id: "bt5",
            kind: "choice",
            prompt: "Mana basikal?",
            audioText: "Mana basikal?",
            options: ["🚗", "🚲", "🚌"],
            answer: "🚲",
            visual: "🚲",
          },
          {
            id: "bt6",
            kind: "match",
            prompt: "Padankan kenderaan",
            audioText: "Padankan kenderaan dengan tempatnya",
            pairs: [
              { left: "🚢", right: "Laut" },
              { left: "✈️", right: "Langit" },
              { left: "🚗", right: "Jalan" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baby-music",
    year: "baby",
    subject: "seni",
    title: "Bunyi & Muzik",
    objective: "Kenal bunyi dan alat muzik",
    levels: [
      {
        index: 1,
        title: "Dengar bunyi",
        questions: [
          {
            id: "bm1",
            kind: "listen",
            prompt: "Bunyi apa ini?",
            audioText: "Ting! Ting!",
            options: ["🔔", "🥁", "🎺"],
            answer: "🔔",
            visual: "🔔",
          },
          {
            id: "bm2",
            kind: "listen",
            prompt: "Bunyi apa ini?",
            audioText: "Boom! Boom!",
            options: ["🎸", "🥁", "🔔"],
            answer: "🥁",
            visual: "🥁",
          },
          {
            id: "bm3",
            kind: "choice",
            prompt: "Mana gitar?",
            audioText: "Mana gitar?",
            options: ["🎸", "🥁", "🎺"],
            answer: "🎸",
            visual: "🎸",
          },
        ],
      },
      {
        index: 2,
        title: "Ingat bunyi",
        questions: [
          {
            id: "bm4",
            kind: "choice",
            prompt: "Mana piano?",
            audioText: "Mana piano?",
            options: ["🎹", "🔔", "🥁"],
            answer: "🎹",
            visual: "🎹",
          },
          {
            id: "bm5",
            kind: "memory",
            prompt: "Ingat urutan bunyi",
            audioText: "Ingat urutan",
            sequence: ["🔔", "🥁", "🎺"],
            revealMs: 2500,
          },
          {
            id: "bm6",
            kind: "match",
            prompt: "Padankan alat muzik",
            audioText: "Padankan alat muzik",
            pairs: [
              { left: "🥁", right: "Gendang" },
              { left: "🎸", right: "Gitar" },
              { left: "🎹", right: "Piano" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baby-family",
    year: "baby",
    subject: "diri",
    title: "Keluarga Saya",
    objective: "Kenal ahli keluarga",
    levels: [
      {
        index: 1,
        title: "Kenal keluarga",
        questions: [
          {
            id: "by1",
            kind: "choice",
            prompt: "Mana ibu?",
            audioText: "Mana ibu?",
            options: ["👩", "👨", "👶"],
            answer: "👩",
            visual: "👩",
          },
          {
            id: "by2",
            kind: "choice",
            prompt: "Mana ayah?",
            audioText: "Mana ayah?",
            options: ["👶", "👨", "👵"],
            answer: "👨",
            visual: "👨",
          },
          {
            id: "by3",
            kind: "choice",
            prompt: "Mana adik?",
            audioText: "Mana adik?",
            options: ["👴", "👶", "👩"],
            answer: "👶",
            visual: "👶",
          },
        ],
      },
      {
        index: 2,
        title: "Sayang keluarga",
        questions: [
          {
            id: "by4",
            kind: "choice",
            prompt: "Mana nenek?",
            audioText: "Mana nenek?",
            options: ["👵", "👨", "👶"],
            answer: "👵",
            visual: "👵",
          },
          {
            id: "by5",
            kind: "choice",
            prompt: "Mana atuk?",
            audioText: "Mana atuk?",
            options: ["👩", "👴", "👶"],
            answer: "👴",
            visual: "👴",
          },
          {
            id: "by6",
            kind: "match",
            prompt: "Padankan keluarga",
            audioText: "Padankan ahli keluarga",
            pairs: [
              { left: "👩", right: "Ibu" },
              { left: "👨", right: "Ayah" },
              { left: "👶", right: "Adik" },
            ],
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ 4-6 KSPK
  {
    id: "kspk-vokal",
    year: "prasekolah",
    subject: "bm",
    title: "Huruf Vokal",
    objective: "Kenal dan sebut huruf vokal a e i o u",
    standard: "KSPK BM 2.1.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "kv1",
            kind: "choice",
            prompt: "Huruf vokal pertama?",
            audioText: "Huruf vokal pertama?",
            options: ["a", "b", "c"],
            answer: "a",
          },
          {
            id: "kv2",
            kind: "choice",
            prompt: "Mana huruf vokal?",
            audioText: "Mana huruf vokal?",
            options: ["a", "k", "m"],
            answer: "a",
          },
          {
            id: "kv3",
            kind: "match",
            prompt: "Padankan huruf dengan gambar",
            pairs: [
              { left: "a", right: "🍎 (apel)" },
              { left: "i", right: "🐟 (ikan)" },
              { left: "u", right: "🥔 (ubi)" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Vokal dalam perkataan",
        questions: [
          {
            id: "kv4",
            kind: "choice",
            prompt: "Huruf vokal dalam 'buku'?",
            audioText: "Huruf vokal dalam buku?",
            options: ["u", "b", "k"],
            answer: "u",
          },
          {
            id: "kv5",
            kind: "fillblank",
            prompt: "Lengkapkan perkataan",
            audioText: "Lengkapkan perkataan",
            sentence: "b___la",
            options: ["o", "a", "e"],
            answer: "o",
          },
          {
            id: "kv6",
            kind: "trace",
            prompt: "Tulis huruf a",
            audioText: "Tulis huruf a",
            glyph: "a",
            hint: "Ikut garisan kelabu",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-konsonan",
    year: "prasekolah",
    subject: "bm",
    title: "Huruf Konsonan",
    objective: "Kenal huruf konsonan b c d f g",
    standard: "KSPK BM 2.1.2",
    levels: [
      {
        index: 1,
        title: "Kenal konsonan",
        questions: [
          {
            id: "kk1",
            kind: "choice",
            prompt: "Mana huruf konsonan?",
            audioText: "Mana huruf konsonan?",
            options: ["b", "a", "i"],
            answer: "b",
          },
          {
            id: "kk2",
            kind: "choice",
            prompt: "Huruf pertama 'bola'?",
            audioText: "Huruf pertama bola?",
            options: ["b", "o", "l"],
            answer: "b",
          },
          {
            id: "kk3",
            kind: "match",
            prompt: "Padankan huruf dengan gambar",
            audioText: "Padankan huruf dengan gambar",
            pairs: [
              { left: "b", right: "⚽ (bola)" },
              { left: "c", right: "🍫 (coklat)" },
              { left: "d", right: "🍩 (donat)" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Bunyi konsonan",
        questions: [
          {
            id: "kk4",
            kind: "choice",
            prompt: "Huruf pertama 'gajah'?",
            audioText: "Huruf pertama gajah?",
            options: ["g", "j", "a"],
            answer: "g",
          },
          {
            id: "kk5",
            kind: "fillblank",
            prompt: "Lengkapkan perkataan",
            audioText: "Lengkapkan perkataan",
            sentence: "___ari",
            options: ["h", "a", "i"],
            answer: "h",
          },
          {
            id: "kk6",
            kind: "trace",
            prompt: "Tulis huruf b",
            audioText: "Tulis huruf b",
            glyph: "b",
            hint: "Ikut garisan kelabu",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-english-alphabet",
    year: "prasekolah",
    subject: "english",
    title: "ABC & Colours",
    objective: "Recognise letters and basic colours",
    standard: "KSPK BI 1.1",
    levels: [
      {
        index: 1,
        title: "Letters",
        questions: [
          {
            id: "ke1",
            kind: "choice",
            prompt: "Which letter comes after A?",
            audioText: "Which letter comes after A?",
            options: ["B", "C", "D"],
            answer: "B",
          },
          {
            id: "ke2",
            kind: "choice",
            prompt: "Which is a colour?",
            audioText: "Which is a colour?",
            options: ["red", "cat", "run"],
            answer: "red",
          },
          {
            id: "ke3",
            kind: "match",
            prompt: "Match the colour",
            audioText: "Match the colour",
            pairs: [
              { left: "red", right: "🔴" },
              { left: "blue", right: "🔵" },
              { left: "green", right: "🟢" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "First words",
        questions: [
          {
            id: "ke4",
            kind: "choice",
            prompt: "Which is an animal?",
            audioText: "Which is an animal?",
            options: ["dog", "table", "blue"],
            answer: "dog",
          },
          {
            id: "ke5",
            kind: "fillblank",
            prompt: "Complete the word",
            audioText: "Complete the word",
            sentence: "c___t",
            options: ["a", "o", "e"],
            answer: "a",
          },
          {
            id: "ke6",
            kind: "trace",
            prompt: "Trace the letter A",
            audioText: "Trace the letter A",
            glyph: "A",
            hint: "Follow the grey line",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-islam",
    year: "prasekolah",
    subject: "islam",
    title: "Asas Pendidikan Islam",
    objective: "Kenal rukun Islam dan adab harian",
    standard: "KSPK PI 1.1",
    levels: [
      {
        index: 1,
        title: "Rukun Islam",
        questions: [
          {
            id: "ki1",
            kind: "choice",
            prompt: "Berapa rukun Islam?",
            audioText: "Berapa rukun Islam?",
            options: ["5", "3", "7"],
            answer: "5",
          },
          {
            id: "ki2",
            kind: "choice",
            prompt: "Kita solat berapa kali sehari?",
            audioText: "Kita solat berapa kali sehari?",
            options: ["5", "3", "2"],
            answer: "5",
          },
          {
            id: "ki3",
            kind: "match",
            prompt: "Padankan ibadah",
            audioText: "Padankan ibadah",
            pairs: [
              { left: "🕌", right: "Solat" },
              { left: "🌙", right: "Puasa" },
              { left: "📖", right: "Baca Quran" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Adab harian",
        questions: [
          {
            id: "ki4",
            kind: "choice",
            prompt: "Sebelum makan kita?",
            audioText: "Sebelum makan kita buat apa?",
            options: ["Baca Bismillah", "Terus makan", "Main dulu"],
            answer: "Baca Bismillah",
          },
          {
            id: "ki5",
            kind: "choice",
            prompt: "Bila bersin kita ucap?",
            audioText: "Bila bersin kita ucap apa?",
            options: ["Alhamdulillah", "Astaghfirullah", "Subhanallah"],
            answer: "Alhamdulillah",
          },
          {
            id: "ki6",
            kind: "choice",
            prompt: "Mana arah kiblat solat?",
            audioText: "Mana arah kiblat solat?",
            options: ["🕋", "🌳", "🏠"],
            answer: "🕋",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-seni",
    year: "prasekolah",
    subject: "seni",
    title: "Warna & Bentuk Seni",
    objective: "Campur warna dan kenal bentuk seni",
    standard: "KSPK Seni 1.1",
    levels: [
      {
        index: 1,
        title: "Warna asas",
        questions: [
          {
            id: "ksn1",
            kind: "choice",
            prompt: "Merah + kuning = ?",
            audioText: "Merah campur kuning jadi warna apa?",
            options: ["Oren", "Hijau", "Ungu"],
            answer: "Oren",
          },
          {
            id: "ksn2",
            kind: "choice",
            prompt: "Biru + kuning = ?",
            audioText: "Biru campur kuning jadi warna apa?",
            options: ["Hijau", "Oren", "Merah"],
            answer: "Hijau",
          },
          {
            id: "ksn3",
            kind: "match",
            prompt: "Padankan warna",
            audioText: "Padankan warna",
            pairs: [
              { left: "🟠", right: "Oren" },
              { left: "🟣", right: "Ungu" },
              { left: "🟤", right: "Coklat" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Lukisan",
        questions: [
          {
            id: "ksn4",
            kind: "choice",
            prompt: "Kita lukis dengan?",
            audioText: "Kita lukis dengan apa?",
            options: ["🖌️ Berus", "🥄 Sudu", "🔨 Tukul"],
            answer: "🖌️ Berus",
          },
          {
            id: "ksn5",
            kind: "sort",
            prompt: "Asingkan warna",
            audioText: "Asingkan warna",
            buckets: [
              { id: "warm", label: "Warna panas", emoji: "🔥" },
              { id: "cool", label: "Warna sejuk", emoji: "❄️" },
            ],
            items: [
              { label: "🔴 Merah", bucket: "warm" },
              { label: "🟠 Oren", bucket: "warm" },
              { label: "🔵 Biru", bucket: "cool" },
              { label: "🟢 Hijau", bucket: "cool" },
            ],
          },
          {
            id: "ksn6",
            kind: "trace",
            prompt: "Lukis bulatan",
            audioText: "Lukis bulatan",
            glyph: "○",
            hint: "Ikut garisan kelabu",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-diri",
    year: "prasekolah",
    subject: "diri",
    title: "Diri & Keluarga",
    objective: "Kenal diri, keluarga dan rutin harian",
    standard: "KSPK Diri 1.1",
    levels: [
      {
        index: 1,
        title: "Tentang saya",
        questions: [
          {
            id: "kdr1",
            kind: "choice",
            prompt: "Siapa yang jaga kita di rumah?",
            audioText: "Siapa yang jaga kita di rumah?",
            options: ["Ibu bapa", "Orang asing", "Jiran jauh"],
            answer: "Ibu bapa",
          },
          {
            id: "kdr2",
            kind: "choice",
            prompt: "Bila bangun tidur, kita?",
            audioText: "Bila bangun tidur, kita buat apa?",
            options: ["Basuh muka", "Terus main", "Tengok TV"],
            answer: "Basuh muka",
          },
          {
            id: "kdr3",
            kind: "match",
            prompt: "Padankan rutin",
            audioText: "Padankan rutin harian",
            pairs: [
              { left: "🌅", right: "Bangun" },
              { left: "🍽️", right: "Makan" },
              { left: "🌙", right: "Tidur" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Keselamatan",
        questions: [
          {
            id: "kdr4",
            kind: "choice",
            prompt: "Sebelum makan kita?",
            audioText: "Sebelum makan kita buat apa?",
            options: ["Basuh tangan", "Lari", "Nyanyi"],
            answer: "Basuh tangan",
          },
          {
            id: "kdr5",
            kind: "sort",
            prompt: "Asingkan barang",
            audioText: "Asingkan barang",
            buckets: [
              { id: "safe", label: "Selamat", emoji: "✅" },
              { id: "danger", label: "Bahaya", emoji: "⚠️" },
            ],
            items: [
              { label: "🧸 Mainan", bucket: "safe" },
              { label: "📚 Buku", bucket: "safe" },
              { label: "🔪 Pisau", bucket: "danger" },
              { label: "🔥 Api", bucket: "danger" },
            ],
          },
          {
            id: "kdr6",
            kind: "choice",
            prompt: "Bila sesat, kita cari?",
            audioText: "Bila sesat, kita cari siapa?",
            options: ["Ibu bapa", "Orang asing", "Kawan baru"],
            answer: "Ibu bapa",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-sukukata",
    year: "prasekolah",
    subject: "bm",
    title: "Suku Kata KV",
    objective: "Baca suku kata konsonan-vokal",
    standard: "KSPK BM 2.2.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "ks1",
            kind: "choice",
            prompt: "ba + pa = ?",
            audioText: "ba pa",
            options: ["bapa", "baba", "papa"],
            answer: "bapa",
          },
          {
            id: "ks2",
            kind: "choice",
            prompt: "bu + ku = ?",
            audioText: "bu ku",
            options: ["buku", "kuku", "bubu"],
            answer: "buku",
          },
          {
            id: "ks3",
            kind: "match",
            prompt: "Padankan suku kata dengan gambar",
            pairs: [
              { left: "ma", right: "👩 (mama)" },
              { left: "ku", right: "🐈 (kucing)" },
              { left: "ci", right: "🐛 (cacing)" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Bina perkataan",
        questions: [
          {
            id: "ks4",
            kind: "choice",
            prompt: "ka + ki = ?",
            audioText: "ka ki",
            options: ["kaki", "kaku", "kaka"],
            answer: "kaki",
          },
          {
            id: "ks5",
            kind: "dragdrop",
            prompt: "Bina perkataan 'bola'",
            audioText: "Bina perkataan bola",
            tokens: ["bo", "la", "ma"],
            slots: [
              { id: "s1", label: "1", accepts: ["bo"] },
              { id: "s2", label: "2", accepts: ["la"] },
            ],
          },
          {
            id: "ks6",
            kind: "fillblank",
            prompt: "Lengkapkan perkataan",
            audioText: "Lengkapkan perkataan",
            sentence: "ma___",
            options: ["kan", "ta", "na"],
            answer: "kan",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-nombor-10",
    year: "prasekolah",
    subject: "math",
    title: "Nombor 1-10",
    objective: "Kenal dan bilang nombor 1 hingga 10",
    standard: "KSPK MA 1.1.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "kn1",
            kind: "choice",
            prompt: "Nombor selepas 4?",
            audioText: "Nombor selepas empat?",
            options: ["3", "5", "6"],
            answer: "5",
          },
          {
            id: "kn2",
            kind: "choice",
            prompt: "Nombor sebelum 8?",
            audioText: "Nombor sebelum lapan?",
            options: ["7", "9", "6"],
            answer: "7",
          },
          {
            id: "kn3",
            kind: "choice",
            prompt: "Berapa banyak?",
            audioText: "Berapa banyak ikan?",
            options: ["5", "6", "7"],
            answer: "6",
            visual: "🐟🐟🐟🐟🐟🐟",
          },
        ],
      },
      {
        index: 2,
        title: "Tambah & tolak",
        questions: [
          {
            id: "kn4",
            kind: "choice",
            prompt: "3 + 2 = ?",
            audioText: "Tiga tambah dua?",
            options: ["5", "4", "6"],
            answer: "5",
          },
          {
            id: "kn5",
            kind: "choice",
            prompt: "7 - 3 = ?",
            audioText: "Tujuh tolak tiga?",
            options: ["4", "5", "3"],
            answer: "4",
          },
          {
            id: "kn6",
            kind: "sort",
            prompt: "Asingkan nombor",
            audioText: "Asingkan nombor kecil dan besar",
            buckets: [
              { id: "small", label: "1-5", emoji: "🐣" },
              { id: "big", label: "6-10", emoji: "🦅" },
            ],
            items: [
              { label: "2", bucket: "small" },
              { label: "4", bucket: "small" },
              { label: "7", bucket: "big" },
              { label: "9", bucket: "big" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "kspk-bentuk",
    year: "prasekolah",
    subject: "math",
    title: "Bentuk Asas",
    objective: "Kenal bulat, segi empat dan segi tiga",
    standard: "KSPK MA 3.1.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "kb1",
            kind: "choice",
            prompt: "Mana bulat?",
            audioText: "Mana bentuk bulat?",
            options: ["⚪", "⬛", "🔺"],
            answer: "⚪",
          },
          {
            id: "kb2",
            kind: "choice",
            prompt: "Mana segi tiga?",
            audioText: "Mana segi tiga?",
            options: ["⬛", "🔺", "⚪"],
            answer: "🔺",
          },
          {
            id: "kb3",
            kind: "match",
            prompt: "Padankan bentuk",
            pairs: [
              { left: "⚪", right: "Bulat" },
              { left: "⬛", right: "Segi empat" },
              { left: "🔺", right: "Segi tiga" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Bentuk di sekeliling",
        questions: [
          {
            id: "kb4",
            kind: "choice",
            prompt: "Roda basikal bentuk apa?",
            audioText: "Roda basikal bentuk apa?",
            options: ["⚪ Bulat", "⬛ Segi empat", "🔺 Segi tiga"],
            answer: "⚪ Bulat",
          },
          {
            id: "kb5",
            kind: "sort",
            prompt: "Asingkan bentuk",
            audioText: "Asingkan bentuk",
            buckets: [
              { id: "round", label: "Bulat", emoji: "⚪" },
              { id: "corner", label: "Bersegi", emoji: "⬛" },
            ],
            items: [
              { label: "⚽ Bola", bucket: "round" },
              { label: "🌕 Bulan", bucket: "round" },
              { label: "📕 Buku", bucket: "corner" },
              { label: "🪟 Tingkap", bucket: "corner" },
            ],
          },
          {
            id: "kb6",
            kind: "trace",
            prompt: "Lukis segi tiga",
            audioText: "Lukis segi tiga",
            glyph: "△",
            hint: "Ikut garisan kelabu",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-deria",
    year: "prasekolah",
    subject: "science",
    title: "Lima Deria",
    objective: "Kenal deria dan fungsinya",
    standard: "KSPK ST 2.1.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "kd1",
            kind: "choice",
            prompt: "Kita lihat dengan apa?",
            audioText: "Kita lihat dengan apa?",
            options: ["👁️ Mata", "👂 Telinga", "👃 Hidung"],
            answer: "👁️ Mata",
          },
          {
            id: "kd2",
            kind: "choice",
            prompt: "Kita dengar dengan apa?",
            audioText: "Kita dengar dengan apa?",
            options: ["👂 Telinga", "👅 Lidah", "✋ Tangan"],
            answer: "👂 Telinga",
          },
          {
            id: "kd3",
            kind: "match",
            prompt: "Padankan deria",
            pairs: [
              { left: "👃", right: "Bau" },
              { left: "👅", right: "Rasa" },
              { left: "✋", right: "Sentuh" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Deria & benda",
        questions: [
          {
            id: "kd4",
            kind: "choice",
            prompt: "Kita rasa dengan?",
            audioText: "Kita rasa dengan apa?",
            options: ["👅 Lidah", "👁️ Mata", "👂 Telinga"],
            answer: "👅 Lidah",
          },
          {
            id: "kd5",
            kind: "sort",
            prompt: "Asingkan deria",
            audioText: "Asingkan deria",
            buckets: [
              { id: "see", label: "Lihat", emoji: "👁️" },
              { id: "hear", label: "Dengar", emoji: "👂" },
            ],
            items: [
              { label: "🌈 Pelangi", bucket: "see" },
              { label: "🎨 Warna", bucket: "see" },
              { label: "🥁 Gendang", bucket: "hear" },
              { label: "🐦 Burung", bucket: "hear" },
            ],
          },
          {
            id: "kd6",
            kind: "choice",
            prompt: "Bunga wangi. Kita guna?",
            audioText: "Bunga wangi. Kita guna apa?",
            options: ["👃 Hidung", "👅 Lidah", "✋ Tangan"],
            answer: "👃 Hidung",
          },
        ],
      },
    ],
  },
  {
    id: "kspk-adab",
    year: "prasekolah",
    subject: "moral",
    title: "Adab & Nilai Murni",
    objective: "Amalan sopan santun harian",
    standard: "KSPK Nilai 1.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "ka1",
            kind: "choice",
            prompt: "Bila jumpa cikgu, kita?",
            audioText: "Bila jumpa cikgu, kita buat apa?",
            options: ["Beri salam", "Jerit", "Lari"],
            answer: "Beri salam",
          },
          {
            id: "ka2",
            kind: "choice",
            prompt: "Minta sesuatu, kita cakap?",
            audioText: "Bila minta sesuatu, kita cakap apa?",
            options: ["Tolong", "Bagi la", "Cepat"],
            answer: "Tolong",
          },
          {
            id: "ka3",
            kind: "choice",
            prompt: "Selepas guna, kita?",
            audioText: "Selepas guna barang, kita buat apa?",
            options: ["Simpan balik", "Biar saja", "Buang"],
            answer: "Simpan balik",
          },
        ],
      },
      {
        index: 2,
        title: "Nilai murni",
        questions: [
          {
            id: "ka4",
            kind: "choice",
            prompt: "Kawan jatuh, kita?",
            audioText: "Kawan jatuh, kita buat apa?",
            options: ["Tolong", "Ketawa", "Lari"],
            answer: "Tolong",
          },
          {
            id: "ka5",
            kind: "sort",
            prompt: "Asingkan perbuatan",
            audioText: "Asingkan perbuatan baik dan buruk",
            buckets: [
              { id: "good", label: "Baik", emoji: "😊" },
              { id: "bad", label: "Buruk", emoji: "😠" },
            ],
            items: [
              { label: "🤝 Tolong", bucket: "good" },
              { label: "🙏 Minta maaf", bucket: "good" },
              { label: "😡 Jerit", bucket: "bad" },
              { label: "👊 Pukul", bucket: "bad" },
            ],
          },
          {
            id: "ka6",
            kind: "choice",
            prompt: "Bila buat salah, kita?",
            audioText: "Bila buat salah, kita buat apa?",
            options: ["Minta maaf", "Sorok", "Diam"],
            answer: "Minta maaf",
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ 7-9 KSSR T1
  {
    id: "t1-bm-ayat",
    year: "tahun1",
    subject: "bm",
    title: "Bina Ayat Mudah",
    objective: "Susun perkataan jadi ayat lengkap",
    standard: "KSSR T1 BM 3.2.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "tb1",
            kind: "choice",
            prompt: "Susun: [Ali] [bola] [main]",
            options: ["Ali main bola.", "Bola Ali main.", "Main Ali bola."],
            answer: "Ali main bola.",
          },
          {
            id: "tb2",
            kind: "choice",
            prompt: "Pilih kata nama",
            options: ["meja", "lari", "cantik"],
            answer: "meja",
          },
          {
            id: "tb3",
            kind: "choice",
            prompt: "Pilih kata kerja",
            options: ["buku", "makan", "besar"],
            answer: "makan",
          },
        ],
      },
      {
        index: 2,
        title: "Bina ayat",
        questions: [
          {
            id: "tb4",
            kind: "dragdrop",
            prompt: "Bina ayat: Siti makan nasi",
            tokens: ["Siti", "makan", "nasi", "bola"],
            slots: [
              { id: "s1", label: "Subjek", accepts: ["Siti"] },
              { id: "s2", label: "Kata kerja", accepts: ["makan"] },
              { id: "s3", label: "Objek", accepts: ["nasi"] },
            ],
          },
          {
            id: "tb5",
            kind: "fillblank",
            prompt: "Lengkapkan ayat",
            sentence: "Ayah ___ kereta ke pejabat.",
            options: ["memandu", "memakan", "membaca"],
            answer: "memandu",
          },
          {
            id: "tb6",
            kind: "choice",
            prompt: "Ayat yang betul?",
            options: ["Kucing itu tidur.", "Tidur itu kucing.", "Itu tidur kucing."],
            answer: "Kucing itu tidur.",
          },
        ],
      },
    ],
  },
  {
    id: "t1-math-100",
    year: "tahun1",
    subject: "math",
    title: "Nombor hingga 100",
    objective: "Banding dan susun nombor hingga 100",
    standard: "KSSR T1 MA 1.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "tm1",
            kind: "choice",
            prompt: "Mana lebih besar?",
            options: ["78", "87", "70"],
            answer: "87",
          },
          {
            id: "tm2",
            kind: "choice",
            prompt: "45 + 23 = ?",
            options: ["68", "67", "78"],
            answer: "68",
          },
          {
            id: "tm3",
            kind: "choice",
            prompt: "90 - 40 = ?",
            options: ["50", "40", "60"],
            answer: "50",
          },
        ],
      },
      {
        index: 2,
        title: "Susun & banding",
        questions: [
          {
            id: "tm4",
            kind: "choice",
            prompt: "Nombor terkecil?",
            options: ["34", "43", "29"],
            answer: "29",
          },
          {
            id: "tm5",
            kind: "sort",
            prompt: "Asingkan nombor",
            buckets: [
              { id: "kecil", label: "Kurang 50", emoji: "🔽" },
              { id: "besar", label: "50 ke atas", emoji: "🔼" },
            ],
            items: [
              { label: "23", bucket: "kecil" },
              { label: "47", bucket: "kecil" },
              { label: "68", bucket: "besar" },
              { label: "91", bucket: "besar" },
            ],
          },
          {
            id: "tm6",
            kind: "fillblank",
            prompt: "Lengkapkan urutan",
            sentence: "10, 20, 30, ___, 50",
            options: ["40", "35", "45"],
            answer: "40",
          },
        ],
      },
    ],
  },
  {
    id: "t1-math-wang",
    year: "tahun1",
    subject: "math",
    title: "Wang Malaysia",
    objective: "Kenal nilai wang dan kira jumlah",
    standard: "KSSR T1 MA 4.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "tw1",
            kind: "choice",
            prompt: "RM5 + RM2 = ?",
            options: ["RM7", "RM3", "RM52"],
            answer: "RM7",
          },
          {
            id: "tw2",
            kind: "choice",
            prompt: "50 sen + 50 sen = ?",
            options: ["RM1", "RM1.50", "100 sen sahaja"],
            answer: "RM1",
          },
          {
            id: "tw3",
            kind: "match",
            prompt: "Padankan wang",
            pairs: [
              { left: "RM1", right: "100 sen" },
              { left: "RM5", right: "500 sen" },
              { left: "50 sen", right: "RM0.50" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Beli & baki",
        questions: [
          {
            id: "tw4",
            kind: "choice",
            prompt: "Beli RM3, bayar RM5. Baki?",
            options: ["RM2", "RM3", "RM8"],
            answer: "RM2",
          },
          {
            id: "tw5",
            kind: "choice",
            prompt: "RM10 - RM4.50 = ?",
            options: ["RM5.50", "RM6.50", "RM5.00"],
            answer: "RM5.50",
          },
          {
            id: "tw6",
            kind: "fillblank",
            prompt: "Lengkapkan",
            sentence: "RM2 + RM3 = RM___",
            options: ["5", "6", "4"],
            answer: "5",
          },
        ],
      },
    ],
  },
  {
    id: "t1-english-phonics",
    year: "tahun1",
    subject: "english",
    title: "Phonics & Sight Words",
    objective: "Read simple CVC words",
    standard: "KSSR T1 BI 2.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "te1",
            kind: "choice",
            prompt: "Which word starts with /k/?",
            options: ["cat", "dog", "sun"],
            answer: "cat",
          },
          {
            id: "te2",
            kind: "choice",
            prompt: "Which is a colour?",
            options: ["blue", "run", "table"],
            answer: "blue",
          },
          {
            id: "te3",
            kind: "match",
            prompt: "Match the word to the picture",
            pairs: [
              { left: "apple", right: "🍎" },
              { left: "ball", right: "⚽" },
              { left: "fish", right: "🐟" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Sight words",
        questions: [
          {
            id: "te4",
            kind: "choice",
            prompt: "Which word rhymes with 'cat'?",
            options: ["hat", "dog", "sun"],
            answer: "hat",
          },
          {
            id: "te5",
            kind: "fillblank",
            prompt: "Complete the word",
            sentence: "s___n",
            options: ["u", "a", "o"],
            answer: "u",
          },
          {
            id: "te6",
            kind: "trace",
            prompt: "Trace the letter S",
            glyph: "S",
            hint: "Follow the grey line",
          },
        ],
      },
    ],
  },
  {
    id: "t1-science-deria",
    year: "tahun1",
    subject: "science",
    title: "Sains: Benda Hidup",
    objective: "Bezakan benda hidup dan bukan hidup",
    standard: "KSSR T1 Sains 1.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "ts1",
            kind: "choice",
            prompt: "Mana benda hidup?",
            options: ["Pokok", "Batu", "Kerusi"],
            answer: "Pokok",
          },
          {
            id: "ts2",
            kind: "choice",
            prompt: "Benda hidup perlu apa?",
            options: ["Air & makanan", "Bateri", "Cat"],
            answer: "Air & makanan",
          },
          {
            id: "ts3",
            kind: "choice",
            prompt: "Mana bukan hidup?",
            options: ["Kucing", "Meja", "Padi"],
            answer: "Meja",
          },
        ],
      },
      {
        index: 2,
        title: "Ciri benda hidup",
        questions: [
          {
            id: "ts4",
            kind: "choice",
            prompt: "Benda hidup membesar. Mana membesar?",
            options: ["Anak ayam", "Batu", "Buku"],
            answer: "Anak ayam",
          },
          {
            id: "ts5",
            kind: "sort",
            prompt: "Asingkan benda",
            buckets: [
              { id: "hidup", label: "Hidup", emoji: "🌱" },
              { id: "bukan", label: "Bukan hidup", emoji: "🪨" },
            ],
            items: [
              { label: "🐟 Ikan", bucket: "hidup" },
              { label: "🌳 Pokok", bucket: "hidup" },
              { label: "🚗 Kereta", bucket: "bukan" },
              { label: "🪑 Kerusi", bucket: "bukan" },
            ],
          },
          {
            id: "ts6",
            kind: "choice",
            prompt: "Benda hidup bernafas. Kita bernafas guna?",
            options: ["Hidung", "Telinga", "Mata"],
            answer: "Hidung",
          },
        ],
      },
    ],
  },

  {
    id: "t1-islam-rukun",
    year: "tahun1",
    subject: "islam",
    title: "Rukun Islam & Doa",
    objective: "Kenal rukun Islam dan doa harian",
    standard: "KSSR T1 PI 1.1",
    levels: [
      {
        index: 1,
        title: "Rukun Islam",
        questions: [
          {
            id: "t1i1",
            kind: "choice",
            prompt: "Rukun Islam pertama?",
            options: ["Mengucap syahadah", "Solat", "Puasa"],
            answer: "Mengucap syahadah",
          },
          {
            id: "t1i2",
            kind: "choice",
            prompt: "Berapa rukun Islam?",
            options: ["5", "6", "4"],
            answer: "5",
          },
          {
            id: "t1i3",
            kind: "match",
            prompt: "Padankan rukun Islam",
            pairs: [
              { left: "🕋", right: "Haji" },
              { left: "🌙", right: "Puasa" },
              { left: "🕌", right: "Solat" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Doa harian",
        questions: [
          {
            id: "t1i4",
            kind: "choice",
            prompt: "Doa sebelum makan?",
            options: ["Bismillah", "Alhamdulillah", "Subhanallah"],
            answer: "Bismillah",
          },
          {
            id: "t1i5",
            kind: "choice",
            prompt: "Doa selepas makan?",
            options: ["Alhamdulillah", "Bismillah", "Astaghfirullah"],
            answer: "Alhamdulillah",
          },
          {
            id: "t1i6",
            kind: "choice",
            prompt: "Kita berdoa kepada?",
            options: ["Allah", "Kawan", "Guru"],
            answer: "Allah",
          },
        ],
      },
    ],
  },
  {
    id: "t1-moral-sopan",
    year: "tahun1",
    subject: "moral",
    title: "Sopan & Kasih Sayang",
    objective: "Amalkan sikap sopan dan kasih sayang",
    standard: "KSSR T1 PM 1.1",
    levels: [
      {
        index: 1,
        title: "Sopan",
        questions: [
          {
            id: "t1p1",
            kind: "choice",
            prompt: "Bila masuk rumah, kita?",
            options: ["Beri salam", "Jerit", "Lari"],
            answer: "Beri salam",
          },
          {
            id: "t1p2",
            kind: "choice",
            prompt: "Bercakap dengan orang tua, kita?",
            options: ["Sopan", "Kasar", "Kuat"],
            answer: "Sopan",
          },
          {
            id: "t1p3",
            kind: "sort",
            prompt: "Asingkan perbuatan",
            buckets: [
              { id: "sopan", label: "Sopan", emoji: "😊" },
              { id: "kasar", label: "Kasar", emoji: "😠" },
            ],
            items: [
              { label: "Minta tolong", bucket: "sopan" },
              { label: "Ucap terima kasih", bucket: "sopan" },
              { label: "Rebut barang", bucket: "kasar" },
              { label: "Jerit nama kawan", bucket: "kasar" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Kasih sayang",
        questions: [
          {
            id: "t1p4",
            kind: "choice",
            prompt: "Kawan sakit, kita?",
            options: ["Lawat", "Ketawa", "Abaikan"],
            answer: "Lawat",
          },
          {
            id: "t1p5",
            kind: "choice",
            prompt: "Sayang haiwan bermaksud?",
            options: ["Jaga", "Pukul", "Buang"],
            answer: "Jaga",
          },
          {
            id: "t1p6",
            kind: "choice",
            prompt: "Bila kawan bercakap, kita?",
            options: ["Dengar", "Potong", "Lari"],
            answer: "Dengar",
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ Tahun 2
  {
    id: "t2y-bm-kata-nama",
    year: "tahun2",
    subject: "bm",
    title: "Kata Nama & Kata Ganti",
    objective: "Kenal kata nama am, khas dan ganti nama",
    standard: "KSSR T2 BM 5.1",
    levels: [
      {
        index: 1,
        title: "Kata nama",
        questions: [
          {
            id: "t2b1",
            kind: "choice",
            prompt: "Mana kata nama khas?",
            options: ["Ahmad", "budak", "sekolah"],
            answer: "Ahmad",
          },
          {
            id: "t2b2",
            kind: "choice",
            prompt: "Mana kata nama am?",
            options: ["Kuala Lumpur", "bandar", "Malaysia"],
            answer: "bandar",
          },
          {
            id: "t2b3",
            kind: "sort",
            prompt: "Asingkan kata nama",
            buckets: [
              { id: "khas", label: "Kata nama khas", emoji: "🏷️" },
              { id: "am", label: "Kata nama am", emoji: "📦" },
            ],
            items: [
              { label: "Siti", bucket: "khas" },
              { label: "Melaka", bucket: "khas" },
              { label: "buku", bucket: "am" },
              { label: "kucing", bucket: "am" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Kata ganti nama",
        questions: [
          {
            id: "t2b4",
            kind: "choice",
            prompt: "Ganti nama bagi 'Ali'?",
            options: ["dia", "saya", "mereka"],
            answer: "dia",
          },
          {
            id: "t2b5",
            kind: "fillblank",
            prompt: "Lengkapkan ayat",
            sentence: "___ pergi ke sekolah setiap hari.",
            options: ["Saya", "Dia", "Mereka"],
            answer: "Saya",
          },
          {
            id: "t2b6",
            kind: "choice",
            prompt: "Ganti nama bagi ramai orang?",
            options: ["mereka", "dia", "saya"],
            answer: "mereka",
          },
        ],
      },
    ],
  },
  {
    id: "t2y-math-tambah",
    year: "tahun2",
    subject: "math",
    title: "Tambah & Tolak hingga 1000",
    objective: "Kira tambah dan tolak dengan mengumpul semula",
    standard: "KSSR T2 MA 2.1",
    levels: [
      {
        index: 1,
        title: "Tambah",
        questions: [
          {
            id: "t2m1",
            kind: "choice",
            prompt: "245 + 132 = ?",
            options: ["377", "367", "387"],
            answer: "377",
          },
          {
            id: "t2m2",
            kind: "choice",
            prompt: "468 + 275 = ?",
            options: ["743", "733", "643"],
            answer: "743",
          },
          {
            id: "t2m3",
            kind: "choice",
            prompt: "500 + 400 = ?",
            options: ["900", "800", "1000"],
            answer: "900",
          },
        ],
      },
      {
        index: 2,
        title: "Tolak",
        questions: [
          {
            id: "t2m4",
            kind: "choice",
            prompt: "600 - 245 = ?",
            options: ["355", "365", "455"],
            answer: "355",
          },
          {
            id: "t2m5",
            kind: "choice",
            prompt: "812 - 396 = ?",
            options: ["416", "426", "516"],
            answer: "416",
          },
          {
            id: "t2m6",
            kind: "fillblank",
            prompt: "Lengkapkan",
            sentence: "750 - ___ = 400",
            options: ["350", "250", "450"],
            answer: "350",
          },
        ],
      },
    ],
  },
  {
    id: "t2y-english-nouns",
    year: "tahun2",
    subject: "english",
    title: "Nouns & Plurals",
    objective: "Use singular and plural nouns",
    standard: "KSSR T2 BI 3.1",
    levels: [
      {
        index: 1,
        title: "Singular & plural",
        questions: [
          {
            id: "t2e1",
            kind: "choice",
            prompt: "Plural of 'cat'?",
            options: ["cats", "cates", "cat"],
            answer: "cats",
          },
          {
            id: "t2e2",
            kind: "choice",
            prompt: "Plural of 'box'?",
            options: ["boxes", "boxs", "boxies"],
            answer: "boxes",
          },
          {
            id: "t2e3",
            kind: "match",
            prompt: "Match singular to plural",
            pairs: [
              { left: "child", right: "children" },
              { left: "man", right: "men" },
              { left: "foot", right: "feet" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "In a sentence",
        questions: [
          {
            id: "t2e4",
            kind: "fillblank",
            prompt: "Complete the sentence",
            sentence: "I have two ___.",
            options: ["books", "book", "bookes"],
            answer: "books",
          },
          {
            id: "t2e5",
            kind: "choice",
            prompt: "Which is correct?",
            options: ["three mice", "three mouses", "three mouse"],
            answer: "three mice",
          },
          {
            id: "t2e6",
            kind: "choice",
            prompt: "Plural of 'leaf'?",
            options: ["leaves", "leafs", "leafes"],
            answer: "leaves",
          },
        ],
      },
    ],
  },
  {
    id: "t2y-science-tumbuhan",
    year: "tahun2",
    subject: "science",
    title: "Sains: Tumbuhan",
    objective: "Kenal bahagian tumbuhan dan keperluannya",
    standard: "KSSR T2 Sains 2.1",
    levels: [
      {
        index: 1,
        title: "Bahagian tumbuhan",
        questions: [
          {
            id: "t2s1",
            kind: "choice",
            prompt: "Bahagian tumbuhan yang menyerap air?",
            options: ["Akar", "Daun", "Bunga"],
            answer: "Akar",
          },
          {
            id: "t2s2",
            kind: "choice",
            prompt: "Daun membuat apa?",
            options: ["Makanan", "Air", "Batu"],
            answer: "Makanan",
          },
          {
            id: "t2s3",
            kind: "match",
            prompt: "Padankan bahagian tumbuhan",
            pairs: [
              { left: "🌱", right: "Akar" },
              { left: "🍃", right: "Daun" },
              { left: "🌺", right: "Bunga" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Keperluan tumbuhan",
        questions: [
          {
            id: "t2s4",
            kind: "choice",
            prompt: "Tumbuhan perlu apa untuk hidup?",
            options: ["Air, cahaya, udara", "Bateri", "Gula"],
            answer: "Air, cahaya, udara",
          },
          {
            id: "t2s5",
            kind: "sort",
            prompt: "Asingkan benda",
            buckets: [
              { id: "hidup", label: "Hidup", emoji: "🌿" },
              { id: "bukan", label: "Bukan hidup", emoji: "🪨" },
            ],
            items: [
              { label: "🌳 Pokok", bucket: "hidup" },
              { label: "🌻 Bunga", bucket: "hidup" },
              { label: "🪨 Batu", bucket: "bukan" },
              { label: "🪑 Kerusi", bucket: "bukan" },
            ],
          },
          {
            id: "t2s6",
            kind: "choice",
            prompt: "Tumbuhan tanpa air akan?",
            options: ["Layu", "Membesar", "Bercahaya"],
            answer: "Layu",
          },
        ],
      },
    ],
  },
  {
    id: "t2y-islam-solat",
    year: "tahun2",
    subject: "islam",
    title: "Solat & Wuduk",
    objective: "Kenal waktu solat dan rukun wuduk",
    standard: "KSSR T2 PI 2.1",
    levels: [
      {
        index: 1,
        title: "Waktu solat",
        questions: [
          {
            id: "t2i1",
            kind: "choice",
            prompt: "Berapa waktu solat fardu?",
            options: ["5", "3", "7"],
            answer: "5",
          },
          {
            id: "t2i2",
            kind: "choice",
            prompt: "Solat selepas matahari terbit?",
            options: ["Subuh", "Zohor", "Maghrib"],
            answer: "Subuh",
          },
          {
            id: "t2i3",
            kind: "sort",
            prompt: "Susun waktu solat",
            buckets: [
              { id: "siang", label: "Siang", emoji: "☀️" },
              { id: "malam", label: "Malam", emoji: "🌙" },
            ],
            items: [
              { label: "Zohor", bucket: "siang" },
              { label: "Asar", bucket: "siang" },
              { label: "Maghrib", bucket: "malam" },
              { label: "Isyak", bucket: "malam" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Wuduk",
        questions: [
          {
            id: "t2i4",
            kind: "choice",
            prompt: "Sebelum solat kita ambil?",
            options: ["Wuduk", "Tidur", "Makan"],
            answer: "Wuduk",
          },
          {
            id: "t2i5",
            kind: "choice",
            prompt: "Anggota pertama dibasuh semasa wuduk?",
            options: ["Tangan", "Kaki", "Kepala"],
            answer: "Tangan",
          },
          {
            id: "t2i6",
            kind: "choice",
            prompt: "Solat menghadap?",
            options: ["Kiblat", "Pintu", "Tingkap"],
            answer: "Kiblat",
          },
        ],
      },
    ],
  },
  {
    id: "t2y-moral-jujur",
    year: "tahun2",
    subject: "moral",
    title: "Nilai Jujur & Amanah",
    objective: "Faham nilai jujur, amanah dan bertanggungjawab",
    standard: "KSSR T2 PM 1.1",
    levels: [
      {
        index: 1,
        title: "Jujur",
        questions: [
          {
            id: "t2p1",
            kind: "choice",
            prompt: "Jumpa dompet di jalan, kita?",
            options: ["Serah kepada polis", "Ambil duit", "Buang"],
            answer: "Serah kepada polis",
          },
          {
            id: "t2p2",
            kind: "choice",
            prompt: "Pecahkan cawan, kita?",
            options: ["Beritahu ibu", "Sorok", "Salahkan adik"],
            answer: "Beritahu ibu",
          },
          {
            id: "t2p3",
            kind: "sort",
            prompt: "Asingkan perbuatan",
            buckets: [
              { id: "jujur", label: "Jujur", emoji: "✅" },
              { id: "tidak", label: "Tidak jujur", emoji: "❌" },
            ],
            items: [
              { label: "Cakap benar", bucket: "jujur" },
              { label: "Pulangkan barang", bucket: "jujur" },
              { label: "Tipu guru", bucket: "tidak" },
              { label: "Ambil barang kawan", bucket: "tidak" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Amanah",
        questions: [
          {
            id: "t2p4",
            kind: "choice",
            prompt: "Diberi tugas oleh guru, kita?",
            options: ["Laksanakan", "Lupakan", "Beri kawan"],
            answer: "Laksanakan",
          },
          {
            id: "t2p5",
            kind: "choice",
            prompt: "Pinjam buku kawan, kita?",
            options: ["Pulangkan", "Simpan", "Koyakkan"],
            answer: "Pulangkan",
          },
          {
            id: "t2p6",
            kind: "choice",
            prompt: "Amanah bermaksud?",
            options: ["Boleh dipercayai", "Pandai", "Kuat"],
            answer: "Boleh dipercayai",
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ Tahun 3
  {
    id: "t3-bm-imbuhan",
    year: "tahun3",
    subject: "bm",
    title: "Imbuhan & Kata Kerja",
    objective: "Kenal imbuhan meN-, ber- dan kata kerja",
    standard: "KSSR T3 BM 5.2.1",
    levels: [
      {
        index: 1,
        title: "Imbuhan",
        questions: [
          {
            id: "t3b1",
            kind: "choice",
            prompt: "Imbuhan 'meN-' + 'tulis' = ?",
            options: ["menulis", "mentulis", "bertulis"],
            answer: "menulis",
          },
          {
            id: "t3b2",
            kind: "choice",
            prompt: "Imbuhan 'ber-' + 'lari' = ?",
            options: ["berlari", "melari", "terlari"],
            answer: "berlari",
          },
          {
            id: "t3b3",
            kind: "match",
            prompt: "Padankan kata dasar",
            pairs: [
              { left: "baca", right: "membaca" },
              { left: "main", right: "bermain" },
              { left: "masak", right: "memasak" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Kata kerja",
        questions: [
          {
            id: "t3b4",
            kind: "choice",
            prompt: "Mana kata kerja?",
            options: ["menyanyi", "merah", "rumah"],
            answer: "menyanyi",
          },
          {
            id: "t3b5",
            kind: "fillblank",
            prompt: "Lengkapkan ayat",
            sentence: "Aminah ___ buku di perpustakaan.",
            options: ["membaca", "berbaca", "terbaca"],
            answer: "membaca",
          },
          {
            id: "t3b6",
            kind: "choice",
            prompt: "Imbuhan 'meN-' + 'sapu' = ?",
            options: ["menyapu", "mensapu", "bersapu"],
            answer: "menyapu",
          },
        ],
      },
    ],
  },
  {
    id: "t3-math-darab",
    year: "tahun3",
    subject: "math",
    title: "Darab & Bahagi",
    objective: "Kira darab dan bahagi hingga 10",
    standard: "KSSR T3 MA 3.1",
    levels: [
      {
        index: 1,
        title: "Darab",
        questions: [
          {
            id: "t3m1",
            kind: "choice",
            prompt: "6 × 7 = ?",
            options: ["42", "36", "48"],
            answer: "42",
          },
          {
            id: "t3m2",
            kind: "choice",
            prompt: "8 × 9 = ?",
            options: ["72", "64", "81"],
            answer: "72",
          },
          {
            id: "t3m3",
            kind: "choice",
            prompt: "12 × 5 = ?",
            options: ["60", "50", "65"],
            answer: "60",
          },
        ],
      },
      {
        index: 2,
        title: "Bahagi",
        questions: [
          {
            id: "t3m4",
            kind: "choice",
            prompt: "56 ÷ 8 = ?",
            options: ["7", "6", "8"],
            answer: "7",
          },
          {
            id: "t3m5",
            kind: "choice",
            prompt: "81 ÷ 9 = ?",
            options: ["9", "8", "7"],
            answer: "9",
          },
          {
            id: "t3m6",
            kind: "fillblank",
            prompt: "Lengkapkan",
            sentence: "___ × 6 = 54",
            options: ["9", "8", "7"],
            answer: "9",
          },
        ],
      },
    ],
  },
  {
    id: "t3-english-verbs",
    year: "tahun3",
    subject: "english",
    title: "Verbs & Tenses",
    objective: "Use present and past tense verbs",
    standard: "KSSR T3 BI 3.2",
    levels: [
      {
        index: 1,
        title: "Present tense",
        questions: [
          {
            id: "t3e1",
            kind: "choice",
            prompt: "She ___ to school every day.",
            options: ["goes", "go", "going"],
            answer: "goes",
          },
          {
            id: "t3e2",
            kind: "choice",
            prompt: "They ___ football on Sunday.",
            options: ["play", "plays", "played"],
            answer: "play",
          },
          {
            id: "t3e3",
            kind: "match",
            prompt: "Match verb to past tense",
            pairs: [
              { left: "run", right: "ran" },
              { left: "eat", right: "ate" },
              { left: "go", right: "went" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Past tense",
        questions: [
          {
            id: "t3e4",
            kind: "fillblank",
            prompt: "Complete the sentence",
            sentence: "Yesterday I ___ a book.",
            options: ["read", "reads", "reading"],
            answer: "read",
          },
          {
            id: "t3e5",
            kind: "choice",
            prompt: "Past tense of 'see'?",
            options: ["saw", "seed", "seen"],
            answer: "saw",
          },
          {
            id: "t3e6",
            kind: "choice",
            prompt: "Past tense of 'buy'?",
            options: ["bought", "buyed", "buys"],
            answer: "bought",
          },
        ],
      },
    ],
  },
  {
    id: "t3-science-bahan",
    year: "tahun3",
    subject: "science",
    title: "Sains: Bahan & Sifatnya",
    objective: "Kenal bahan dan sifatnya",
    standard: "KSSR T3 Sains 3.1",
    levels: [
      {
        index: 1,
        title: "Jenis bahan",
        questions: [
          {
            id: "t3s1",
            kind: "choice",
            prompt: "Kayu diperbuat daripada?",
            options: ["Pokok", "Batu", "Air"],
            answer: "Pokok",
          },
          {
            id: "t3s2",
            kind: "choice",
            prompt: "Bahan yang lutsinar?",
            options: ["Kaca", "Kayu", "Besi"],
            answer: "Kaca",
          },
          {
            id: "t3s3",
            kind: "sort",
            prompt: "Asingkan bahan",
            buckets: [
              { id: "logam", label: "Logam", emoji: "🔩" },
              { id: "bukan", label: "Bukan logam", emoji: "🪵" },
            ],
            items: [
              { label: "Besi", bucket: "logam" },
              { label: "Tembaga", bucket: "logam" },
              { label: "Kayu", bucket: "bukan" },
              { label: "Getah", bucket: "bukan" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Sifat bahan",
        questions: [
          {
            id: "t3s4",
            kind: "choice",
            prompt: "Bahan yang menyerap air?",
            options: ["Kain", "Plastik", "Kaca"],
            answer: "Kain",
          },
          {
            id: "t3s5",
            kind: "choice",
            prompt: "Bahan terbaik untuk payung?",
            options: ["Plastik", "Kertas", "Kain kapas"],
            answer: "Plastik",
          },
          {
            id: "t3s6",
            kind: "choice",
            prompt: "Besi mudah?",
            options: ["Berkarat", "Cair", "Terbang"],
            answer: "Berkarat",
          },
        ],
      },
    ],
  },
  {
    id: "t3-islam-quran",
    year: "tahun3",
    subject: "islam",
    title: "Al-Quran & Adab",
    objective: "Kenal surah pendek dan adab membaca Quran",
    standard: "KSSR T3 PI 1.1",
    levels: [
      {
        index: 1,
        title: "Al-Quran",
        questions: [
          {
            id: "t3i1",
            kind: "choice",
            prompt: "Surah pertama dalam Al-Quran?",
            options: ["Al-Fatihah", "Al-Ikhlas", "An-Nas"],
            answer: "Al-Fatihah",
          },
          {
            id: "t3i2",
            kind: "choice",
            prompt: "Berapa surah dalam Al-Quran?",
            options: ["114", "100", "120"],
            answer: "114",
          },
          {
            id: "t3i3",
            kind: "choice",
            prompt: "Sebelum baca Quran kita?",
            options: ["Baca Auzubillah", "Tepuk tangan", "Duduk jauh"],
            answer: "Baca Auzubillah",
          },
        ],
      },
      {
        index: 2,
        title: "Adab",
        questions: [
          {
            id: "t3i4",
            kind: "choice",
            prompt: "Pegang Quran dengan?",
            options: ["Tangan kanan", "Tangan kiri", "Kaki"],
            answer: "Tangan kanan",
          },
          {
            id: "t3i5",
            kind: "choice",
            prompt: "Surah Al-Ikhlas bermaksud?",
            options: ["Keesaan Allah", "Pagi", "Manusia"],
            answer: "Keesaan Allah",
          },
          {
            id: "t3i6",
            kind: "choice",
            prompt: "Bila dengar azan kita?",
            options: ["Berhenti dan jawab", "Terus main", "Tidur"],
            answer: "Berhenti dan jawab",
          },
        ],
      },
    ],
  },
  {
    id: "t3-moral-hormat",
    year: "tahun3",
    subject: "moral",
    title: "Hormat & Toleransi",
    objective: "Hormati ibu bapa, guru dan rakan",
    standard: "KSSR T3 PM 2.1",
    levels: [
      {
        index: 1,
        title: "Hormat",
        questions: [
          {
            id: "t3p1",
            kind: "choice",
            prompt: "Bila guru mengajar, kita?",
            options: ["Dengar", "Bercakap", "Main"],
            answer: "Dengar",
          },
          {
            id: "t3p2",
            kind: "choice",
            prompt: "Kepada ibu bapa kita?",
            options: ["Hormat", "Lawak", "Marah"],
            answer: "Hormat",
          },
          {
            id: "t3p3",
            kind: "sort",
            prompt: "Asingkan perbuatan",
            buckets: [
              { id: "hormat", label: "Hormat", emoji: "🙏" },
              { id: "kurang", label: "Kurang hormat", emoji: "😠" },
            ],
            items: [
              { label: "Cium tangan", bucket: "hormat" },
              { label: "Dengar nasihat", bucket: "hormat" },
              { label: "Jerit pada guru", bucket: "kurang" },
              { label: "Ejek kawan", bucket: "kurang" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Toleransi",
        questions: [
          {
            id: "t3p4",
            kind: "choice",
            prompt: "Kawan berlainan agama, kita?",
            options: ["Hormati", "Jauhi", "Ejek"],
            answer: "Hormati",
          },
          {
            id: "t3p5",
            kind: "choice",
            prompt: "Toleransi bermaksud?",
            options: ["Bertolak ansur", "Bertengkar", "Bersaing"],
            answer: "Bertolak ansur",
          },
          {
            id: "t3p6",
            kind: "choice",
            prompt: "Kawan sedih, kita?",
            options: ["Hiburkan", "Ketawa", "Pergi"],
            answer: "Hiburkan",
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ 10-12 KSSR T2
  {
    id: "t2-bm-peribahasa",
    year: "tahun4",
    subject: "bm",
    title: "Peribahasa & Simpulan Bahasa",
    objective: "Faham maksud peribahasa biasa",
    standard: "KSSR T2 BM 5.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "pb1",
            kind: "choice",
            prompt: 'Maksud "besar kepala"?',
            options: ["Degil", "Pandai", "Tinggi"],
            answer: "Degil",
          },
          {
            id: "pb2",
            kind: "choice",
            prompt: 'Maksud "buah hati"?',
            options: ["Kekasih", "Epal", "Kawan"],
            answer: "Kekasih",
          },
          {
            id: "pb3",
            kind: "choice",
            prompt: '"Berat mata memandang, berat lagi ___"',
            options: ["bahu memikul", "hati menanggung", "kaki melangkah"],
            answer: "bahu memikul",
          },
        ],
      },
      {
        index: 2,
        title: "Guna dalam ayat",
        questions: [
          {
            id: "pb4",
            kind: "choice",
            prompt: 'Maksud "ringan tulang"?',
            options: ["Rajin bekerja", "Kurus", "Cepat letih"],
            answer: "Rajin bekerja",
          },
          {
            id: "pb5",
            kind: "fillblank",
            prompt: "Lengkapkan peribahasa",
            sentence: "Bagai kacang lupakan ___.",
            options: ["kulit", "daun", "akar"],
            answer: "kulit",
          },
          {
            id: "pb6",
            kind: "match",
            prompt: "Padankan peribahasa",
            pairs: [
              { left: "besar kepala", right: "Degil" },
              { left: "ringan tulang", right: "Rajin" },
              { left: "buah hati", right: "Kekasih" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t2-math-pecahan",
    year: "tahun4",
    subject: "math",
    title: "Pecahan & Peratus",
    objective: "Tukar pecahan kepada peratus",
    standard: "KSSR T2 MA 2.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "pm1",
            kind: "choice",
            prompt: "1/2 = ? %",
            options: ["50%", "25%", "20%"],
            answer: "50%",
          },
          {
            id: "pm2",
            kind: "choice",
            prompt: "1/4 = ? %",
            options: ["25%", "40%", "14%"],
            answer: "25%",
          },
          {
            id: "pm3",
            kind: "choice",
            prompt: "0.75 = ?",
            options: ["3/4", "1/4", "7/5"],
            answer: "3/4",
          },
        ],
      },
      {
        index: 2,
        title: "Kira peratus",
        questions: [
          {
            id: "pm4",
            kind: "choice",
            prompt: "3/5 = ? %",
            options: ["60%", "35%", "53%"],
            answer: "60%",
          },
          {
            id: "pm5",
            kind: "choice",
            prompt: "25% daripada 80 = ?",
            options: ["20", "25", "40"],
            answer: "20",
          },
          {
            id: "pm6",
            kind: "fillblank",
            prompt: "Lengkapkan",
            sentence: "1/10 = ___%",
            options: ["10", "1", "100"],
            answer: "10",
          },
        ],
      },
    ],
  },
  {
    id: "t2-math-nisbah",
    year: "tahun4",
    subject: "math",
    title: "Nisbah & Purata",
    objective: "Kira nisbah dan purata",
    standard: "KSSR T2 MA 8.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "pn1",
            kind: "choice",
            prompt: "Purata 4, 6, 8 = ?",
            options: ["6", "5", "7"],
            answer: "6",
          },
          {
            id: "pn2",
            kind: "choice",
            prompt: "Nisbah 2:3, jumlah 10. Bahagian kecil?",
            options: ["4", "6", "5"],
            answer: "4",
          },
          {
            id: "pn3",
            kind: "choice",
            prompt: "20% daripada 150 = ?",
            options: ["30", "20", "45"],
            answer: "30",
          },
        ],
      },
      {
        index: 2,
        title: "Purata & nisbah",
        questions: [
          {
            id: "pn4",
            kind: "choice",
            prompt: "Purata 10, 20, 30 = ?",
            options: ["20", "15", "25"],
            answer: "20",
          },
          {
            id: "pn5",
            kind: "choice",
            prompt: "Nisbah 1:4, jumlah 20. Bahagian besar?",
            options: ["16", "4", "5"],
            answer: "16",
          },
          {
            id: "pn6",
            kind: "fillblank",
            prompt: "Lengkapkan",
            sentence: "Purata 4 dan 8 = ___",
            options: ["6", "5", "12"],
            answer: "6",
          },
        ],
      },
    ],
  },
  {
    id: "t2-sejarah-merdeka",
    year: "tahun4",
    subject: "sejarah",
    title: "Kemerdekaan Malaysia",
    objective: "Peristiwa penting menuju kemerdekaan",
    standard: "KSSR T2 Sejarah 6.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "sm1",
            kind: "choice",
            prompt: "Malaysia merdeka pada?",
            options: ["31 Ogos 1957", "16 September 1963", "31 Ogos 1963"],
            answer: "31 Ogos 1957",
          },
          {
            id: "sm2",
            kind: "choice",
            prompt: "Siapa Bapa Kemerdekaan?",
            options: ["Tunku Abdul Rahman", "Tun Razak", "Tun Mahathir"],
            answer: "Tunku Abdul Rahman",
          },
          {
            id: "sm3",
            kind: "choice",
            prompt: "Malaysia dibentuk pada?",
            options: ["16 September 1963", "31 Ogos 1957", "31 Ogos 1963"],
            answer: "16 September 1963",
          },
        ],
      },
      {
        index: 2,
        title: "Peristiwa penting",
        questions: [
          {
            id: "sm4",
            kind: "choice",
            prompt: "Bendera Malaysia dipanggil?",
            options: ["Jalur Gemilang", "Sang Saka", "Jalur Merdeka"],
            answer: "Jalur Gemilang",
          },
          {
            id: "sm5",
            kind: "choice",
            prompt: "Lagu kebangsaan Malaysia?",
            options: ["Negaraku", "Malaysia Baru", "Merdeka"],
            answer: "Negaraku",
          },
          {
            id: "sm6",
            kind: "choice",
            prompt: "Ibu negara Malaysia?",
            options: ["Kuala Lumpur", "Putrajaya", "Johor Bahru"],
            answer: "Kuala Lumpur",
          },
        ],
      },
    ],
  },
  {
    id: "t2-science-tenaga",
    year: "tahun4",
    subject: "science",
    title: "Sains: Tenaga",
    objective: "Kenal bentuk dan sumber tenaga",
    standard: "KSSR T2 Sains 7.1",
    levels: [
      {
        index: 1,
        title: "Asas",
        questions: [
          {
            id: "st1",
            kind: "choice",
            prompt: "Sumber tenaga utama bumi?",
            options: ["Matahari", "Bulan", "Angin"],
            answer: "Matahari",
          },
          {
            id: "st2",
            kind: "choice",
            prompt: "Tenaga boleh diperbaharui?",
            options: ["Solar", "Arang batu", "Petroleum"],
            answer: "Solar",
          },
          {
            id: "st3",
            kind: "match",
            prompt: "Padankan tenaga",
            pairs: [
              { left: "🔋", right: "Kimia" },
              { left: "💡", right: "Cahaya" },
              { left: "🔊", right: "Bunyi" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Sumber tenaga",
        questions: [
          {
            id: "st4",
            kind: "choice",
            prompt: "Kincir angin menukar tenaga angin kepada?",
            options: ["Tenaga elektrik", "Tenaga bunyi", "Tenaga kimia"],
            answer: "Tenaga elektrik",
          },
          {
            id: "st5",
            kind: "sort",
            prompt: "Asingkan sumber tenaga",
            buckets: [
              { id: "boleh", label: "Boleh diperbaharui", emoji: "♻️" },
              { id: "tidak", label: "Tidak boleh", emoji: "⛔" },
            ],
            items: [
              { label: "Matahari", bucket: "boleh" },
              { label: "Angin", bucket: "boleh" },
              { label: "Arang batu", bucket: "tidak" },
              { label: "Petroleum", bucket: "tidak" },
            ],
          },
          {
            id: "st6",
            kind: "choice",
            prompt: "Lampu menyala kerana tenaga?",
            options: ["Elektrik", "Bunyi", "Kimia"],
            answer: "Elektrik",
          },
        ],
      },
    ],
  },
  {
    id: "t4-english-grammar",
    year: "tahun4",
    subject: "english",
    title: "Grammar & Prepositions",
    objective: "Use articles, prepositions and question words",
    standard: "KSSR T4 BI 3.1",
    levels: [
      {
        index: 1,
        title: "Articles",
        questions: [
          {
            id: "t4e1",
            kind: "choice",
            prompt: "I saw ___ elephant at the zoo.",
            options: ["an", "a", "the"],
            answer: "an",
          },
          {
            id: "t4e2",
            kind: "choice",
            prompt: "She is ___ honest girl.",
            options: ["an", "a", "the"],
            answer: "an",
          },
          {
            id: "t4e3",
            kind: "match",
            prompt: "Match question word to answer",
            pairs: [
              { left: "Where", right: "place" },
              { left: "When", right: "time" },
              { left: "Who", right: "person" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Prepositions",
        questions: [
          {
            id: "t4e4",
            kind: "fillblank",
            prompt: "Complete the sentence",
            sentence: "The book is ___ the table.",
            options: ["on", "in", "at"],
            answer: "on",
          },
          {
            id: "t4e5",
            kind: "choice",
            prompt: "We meet ___ Monday.",
            options: ["on", "in", "at"],
            answer: "on",
          },
          {
            id: "t4e6",
            kind: "choice",
            prompt: "Which is correct?",
            options: ["He is good at maths.", "He is good in maths.", "He is good on maths."],
            answer: "He is good at maths.",
          },
        ],
      },
    ],
  },
  {
    id: "t4-islam-puasa",
    year: "tahun4",
    subject: "islam",
    title: "Puasa & Zakat",
    objective: "Faham puasa Ramadan dan zakat",
    standard: "KSSR T4 PI 2.1",
    levels: [
      {
        index: 1,
        title: "Puasa",
        questions: [
          {
            id: "t4i1",
            kind: "choice",
            prompt: "Puasa wajib pada bulan?",
            options: ["Ramadan", "Syawal", "Rejab"],
            answer: "Ramadan",
          },
          {
            id: "t4i2",
            kind: "choice",
            prompt: "Puasa bermula dari?",
            options: ["Fajar hingga maghrib", "Pagi hingga malam", "Tengah hari"],
            answer: "Fajar hingga maghrib",
          },
          {
            id: "t4i3",
            kind: "choice",
            prompt: "Bulan selepas Ramadan?",
            options: ["Syawal", "Zulhijjah", "Muharram"],
            answer: "Syawal",
          },
        ],
      },
      {
        index: 2,
        title: "Zakat",
        questions: [
          {
            id: "t4i4",
            kind: "choice",
            prompt: "Zakat fitrah dibayar pada?",
            options: ["Bulan Ramadan", "Bulan Syawal", "Bulan Rejab"],
            answer: "Bulan Ramadan",
          },
          {
            id: "t4i5",
            kind: "choice",
            prompt: "Zakat bermaksud?",
            options: ["Menyucikan harta", "Menyimpan harta", "Membazir harta"],
            answer: "Menyucikan harta",
          },
          {
            id: "t4i6",
            kind: "choice",
            prompt: "Siapa menerima zakat?",
            options: ["Asnaf", "Orang kaya", "Raja"],
            answer: "Asnaf",
          },
        ],
      },
    ],
  },
  {
    id: "t4-moral-integriti",
    year: "tahun4",
    subject: "moral",
    title: "Integriti & Kerjasama",
    objective: "Amalkan integriti dan semangat kerjasama",
    standard: "KSSR T4 PM 2.1",
    levels: [
      {
        index: 1,
        title: "Integriti",
        questions: [
          {
            id: "t4p1",
            kind: "choice",
            prompt: "Semasa ujian, kita?",
            options: ["Tidak meniru", "Meniru", "Tanya kawan"],
            answer: "Tidak meniru",
          },
          {
            id: "t4p2",
            kind: "choice",
            prompt: "Integriti bermaksud?",
            options: ["Kejujuran", "Kepandaian", "Kekayaan"],
            answer: "Kejujuran",
          },
          {
            id: "t4p3",
            kind: "sort",
            prompt: "Asingkan perbuatan",
            buckets: [
              { id: "integriti", label: "Berintegriti", emoji: "✅" },
              { id: "tidak", label: "Tidak berintegriti", emoji: "❌" },
            ],
            items: [
              { label: "Cakap benar", bucket: "integriti" },
              { label: "Akui kesilapan", bucket: "integriti" },
              { label: "Meniru ujian", bucket: "tidak" },
              { label: "Rasuah", bucket: "tidak" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Kerjasama",
        questions: [
          {
            id: "t4p4",
            kind: "choice",
            prompt: "Kerja kumpulan, kita?",
            options: ["Bekerjasama", "Buat sendiri", "Duduk diam"],
            answer: "Bekerjasama",
          },
          {
            id: "t4p5",
            kind: "choice",
            prompt: "Kerjasama membawa?",
            options: ["Kejayaan", "Kekalahan", "Pertengkaran"],
            answer: "Kejayaan",
          },
          {
            id: "t4p6",
            kind: "choice",
            prompt: "Kawan buat salah, kita?",
            options: ["Tegur dengan baik", "Marah", "Buli"],
            answer: "Tegur dengan baik",
          },
        ],
      },
    ],
  },

];

/**
 * Lessons for one school year and subject. Pass `null` for the baby band,
 * which has no school year.
 */
  // ------------------------------------------------------------ Tahun 5
const TAHUN5_LESSONS: Lesson[] = [
  {
    id: "t5-bm-ayat-majmuk",
    year: "tahun5",
    subject: "bm",
    title: "Ayat Majmuk & Penanda Wacana",
    objective: "Gabung ayat tunggal jadi ayat majmuk",
    standard: "KSSR T5 BM 5.3.1",
    levels: [
      {
        index: 1,
        title: "Ayat majmuk",
        questions: [
          {
            id: "t5b1",
            kind: "choice",
            prompt: "Gabung: 'Ali rajin.' + 'Ali pandai.'",
            options: ["Ali rajin dan pandai.", "Ali rajin atau pandai.", "Ali rajin tetapi pandai."],
            answer: "Ali rajin dan pandai.",
          },
          {
            id: "t5b2",
            kind: "choice",
            prompt: "Kata hubung untuk pertentangan?",
            options: ["tetapi", "dan", "kerana"],
            answer: "tetapi",
          },
          {
            id: "t5b3",
            kind: "match",
            prompt: "Padankan kata hubung",
            pairs: [
              { left: "dan", right: "Gabung" },
              { left: "tetapi", right: "Pertentangan" },
              { left: "kerana", right: "Sebab" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Penanda wacana",
        questions: [
          {
            id: "t5b4",
            kind: "fillblank",
            prompt: "Lengkapkan ayat",
            sentence: "Dia rajin belajar ___ berjaya dalam peperiksaan.",
            options: ["kerana", "tetapi", "atau"],
            answer: "kerana",
          },
          {
            id: "t5b5",
            kind: "choice",
            prompt: "Penanda wacana untuk menambah idea?",
            options: ["Selain itu", "Walau bagaimanapun", "Sebaliknya"],
            answer: "Selain itu",
          },
          {
            id: "t5b6",
            kind: "choice",
            prompt: "Penanda wacana untuk kesimpulan?",
            options: ["Kesimpulannya", "Pertama", "Contohnya"],
            answer: "Kesimpulannya",
          },
        ],
      },
    ],
  },
  {
    id: "t5-math-perpuluhan",
    year: "tahun5",
    subject: "math",
    title: "Perpuluhan & Wang",
    objective: "Kira operasi perpuluhan dan wang",
    standard: "KSSR T5 MA 2.2",
    levels: [
      {
        index: 1,
        title: "Perpuluhan",
        questions: [
          {
            id: "t5m1",
            kind: "choice",
            prompt: "2.5 + 1.75 = ?",
            options: ["4.25", "3.25", "4.75"],
            answer: "4.25",
          },
          {
            id: "t5m2",
            kind: "choice",
            prompt: "10.5 - 3.25 = ?",
            options: ["7.25", "7.75", "6.25"],
            answer: "7.25",
          },
          {
            id: "t5m3",
            kind: "choice",
            prompt: "0.4 × 5 = ?",
            options: ["2.0", "0.2", "20"],
            answer: "2.0",
          },
        ],
      },
      {
        index: 2,
        title: "Wang",
        questions: [
          {
            id: "t5m4",
            kind: "choice",
            prompt: "RM12.50 + RM7.80 = ?",
            options: ["RM20.30", "RM19.30", "RM20.80"],
            answer: "RM20.30",
          },
          {
            id: "t5m5",
            kind: "choice",
            prompt: "Diskaun 20% pada RM50 = ?",
            options: ["RM10", "RM20", "RM5"],
            answer: "RM10",
          },
          {
            id: "t5m6",
            kind: "fillblank",
            prompt: "Lengkapkan",
            sentence: "RM100 - RM45.50 = RM___",
            options: ["54.50", "55.50", "44.50"],
            answer: "54.50",
          },
        ],
      },
    ],
  },
  {
    id: "t5-english-comprehension",
    year: "tahun5",
    subject: "english",
    title: "Reading Comprehension",
    objective: "Read a short text and answer questions",
    standard: "KSSR T5 BI 2.2",
    levels: [
      {
        index: 1,
        title: "Short story",
        questions: [
          {
            id: "t5e1",
            kind: "story",
            prompt: "Read the story",
            panels: [
              { text: "Aina lives in a small village near the sea.", visual: "🏘️" },
              { text: "Every morning she helps her father mend the fishing nets.", visual: "🎣" },
              { text: "One day, she found a small turtle trapped in a net.", visual: "🐢" },
              { text: "She freed the turtle and it swam happily back to the sea.", visual: "🌊" },
            ],
            questions: [
              {
                prompt: "Where does Aina live?",
                options: ["Near the sea", "In a city", "On a mountain"],
                answer: "Near the sea",
              },
              {
                prompt: "What did she find?",
                options: ["A turtle", "A fish", "A boat"],
                answer: "A turtle",
              },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Grammar",
        questions: [
          {
            id: "t5e2",
            kind: "choice",
            prompt: "Choose the correct sentence.",
            options: ["She doesn't like durian.", "She don't like durian.", "She not like durian."],
            answer: "She doesn't like durian.",
          },
          {
            id: "t5e3",
            kind: "choice",
            prompt: "Which is an adjective?",
            options: ["beautiful", "run", "quickly"],
            answer: "beautiful",
          },
          {
            id: "t5e4",
            kind: "fillblank",
            prompt: "Complete the sentence",
            sentence: "The cat is ___ the table.",
            options: ["under", "runs", "quick"],
            answer: "under",
          },
        ],
      },
      {
        index: 3,
        title: "Reading passage",
        questions: [
          {
            id: "t5e5",
            kind: "story",
            prompt: "Read the passage",
            panels: [
              {
                text: "Encik Rahman grows vegetables on a small farm in Cameron Highlands.",
                visual: "🥬",
              },
              {
                text: "The air there is cool, so cabbages and tomatoes grow well.",
                visual: "🍅",
              },
              {
                text: "Every Saturday, he sells his vegetables at the morning market.",
                visual: "🧺",
              },
            ],
            questions: [
              {
                prompt: "Where does Encik Rahman grow vegetables?",
                options: ["Cameron Highlands", "Kuala Lumpur", "Penang"],
                answer: "Cameron Highlands",
              },
              {
                prompt: "Why do the vegetables grow well?",
                options: ["The air is cool", "The air is hot", "It never rains"],
                answer: "The air is cool",
              },
              {
                prompt: "When does he sell his vegetables?",
                options: ["Every Saturday", "Every Monday", "Every night"],
                answer: "Every Saturday",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t5-science-cahaya",
    year: "tahun5",
    subject: "science",
    title: "Sains: Cahaya & Bunyi",
    objective: "Faham sifat cahaya dan bunyi",
    standard: "KSSR T5 Sains 6.1",
    levels: [
      {
        index: 1,
        title: "Cahaya",
        questions: [
          {
            id: "t5s1",
            kind: "choice",
            prompt: "Cahaya bergerak dalam?",
            options: ["Garis lurus", "Bulatan", "Zigzag"],
            answer: "Garis lurus",
          },
          {
            id: "t5s2",
            kind: "choice",
            prompt: "Bayang terbentuk kerana cahaya?",
            options: ["Terhalang", "Bertambah", "Hilang"],
            answer: "Terhalang",
          },
          {
            id: "t5s3",
            kind: "choice",
            prompt: "Cermin memantulkan cahaya. Ini dipanggil?",
            options: ["Pantulan", "Pembiasan", "Penyerapan"],
            answer: "Pantulan",
          },
        ],
      },
      {
        index: 2,
        title: "Bunyi",
        questions: [
          {
            id: "t5s4",
            kind: "choice",
            prompt: "Bunyi bergerak melalui?",
            options: ["Udara", "Vakum", "Cahaya"],
            answer: "Udara",
          },
          {
            id: "t5s5",
            kind: "choice",
            prompt: "Bunyi kuat bermaksud?",
            options: ["Amplitud besar", "Frekuensi tinggi", "Gelombang pendek"],
            answer: "Amplitud besar",
          },
          {
            id: "t5s6",
            kind: "sort",
            prompt: "Asingkan bunyi",
            buckets: [
              { id: "kuat", label: "Kuat", emoji: "🔊" },
              { id: "perlahan", label: "Perlahan", emoji: "🔈" },
            ],
            items: [
              { label: "Guruh", bucket: "kuat" },
              { label: "Loceng", bucket: "kuat" },
              { label: "Bisikan", bucket: "perlahan" },
              { label: "Kipas", bucket: "perlahan" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t5-sejarah-melaka",
    year: "tahun5",
    subject: "sejarah",
    title: "Sejarah: Kesultanan Melayu Melaka",
    objective: "Kenal pengasas dan kegemilangan Melaka",
    standard: "KSSR T5 Sejarah 5.1",
    levels: [
      {
        index: 1,
        title: "Pengasas",
        questions: [
          {
            id: "t5h1",
            kind: "choice",
            prompt: "Pengasas Melaka?",
            options: ["Parameswara", "Sultan Mahmud", "Tun Perak"],
            answer: "Parameswara",
          },
          {
            id: "t5h2",
            kind: "choice",
            prompt: "Melaka terletak di pantai?",
            options: ["Barat Semenanjung", "Timur Semenanjung", "Borneo"],
            answer: "Barat Semenanjung",
          },
          {
            id: "t5h3",
            kind: "choice",
            prompt: "Bendahara terkenal Melaka?",
            options: ["Tun Perak", "Tun Razak", "Tun Mahathir"],
            answer: "Tun Perak",
          },
        ],
      },
      {
        index: 2,
        title: "Kegemilangan",
        questions: [
          {
            id: "t5h4",
            kind: "choice",
            prompt: "Melaka terkenal sebagai pusat?",
            options: ["Perdagangan", "Pertanian", "Perlombongan"],
            answer: "Perdagangan",
          },
          {
            id: "t5h5",
            kind: "choice",
            prompt: "Melaka jatuh ke tangan Portugis pada?",
            options: ["1511", "1957", "1641"],
            answer: "1511",
          },
          {
            id: "t5h6",
            kind: "choice",
            prompt: "Selat di hadapan Melaka?",
            options: ["Selat Melaka", "Selat Sunda", "Selat Johor"],
            answer: "Selat Melaka",
          },
        ],
      },
    ],
  },
  {
    id: "t5-islam-akidah",
    year: "tahun5",
    subject: "islam",
    title: "Akidah & Rukun Iman",
    objective: "Faham rukun iman dan akhlak",
    standard: "KSSR T5 PI 3.1",
    levels: [
      {
        index: 1,
        title: "Rukun iman",
        questions: [
          {
            id: "t5i1",
            kind: "choice",
            prompt: "Berapa rukun iman?",
            options: ["6", "5", "7"],
            answer: "6",
          },
          {
            id: "t5i2",
            kind: "choice",
            prompt: "Percaya kepada Allah adalah rukun iman ke?",
            options: ["Pertama", "Kedua", "Ketiga"],
            answer: "Pertama",
          },
          {
            id: "t5i3",
            kind: "match",
            prompt: "Padankan rukun iman",
            pairs: [
              { left: "Allah", right: "Tuhan" },
              { left: "Malaikat", right: "Makhluk cahaya" },
              { left: "Quran", right: "Kitab" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Akhlak",
        questions: [
          {
            id: "t5i4",
            kind: "choice",
            prompt: "Sifat wajib bagi Allah?",
            options: ["Wujud", "Tidur", "Lupa"],
            answer: "Wujud",
          },
          {
            id: "t5i5",
            kind: "choice",
            prompt: "Berbuat baik kepada jiran adalah?",
            options: ["Sunat", "Haram", "Makruh"],
            answer: "Sunat",
          },
          {
            id: "t5i6",
            kind: "choice",
            prompt: "Malaikat yang menyampaikan wahyu?",
            options: ["Jibril", "Mikail", "Izrail"],
            answer: "Jibril",
          },
        ],
      },
    ],
  },
  {
    id: "t5-moral-tanggungjawab",
    year: "tahun5",
    subject: "moral",
    title: "Tanggungjawab & Patriotisme",
    objective: "Faham tanggungjawab diri dan negara",
    standard: "KSSR T5 PM 3.1",
    levels: [
      {
        index: 1,
        title: "Tanggungjawab",
        questions: [
          {
            id: "t5p1",
            kind: "choice",
            prompt: "Sebagai murid, tanggungjawab kita?",
            options: ["Belajar bersungguh", "Ponteng", "Buli"],
            answer: "Belajar bersungguh",
          },
          {
            id: "t5p2",
            kind: "choice",
            prompt: "Buang sampah di?",
            options: ["Tong sampah", "Longkang", "Jalan"],
            answer: "Tong sampah",
          },
          {
            id: "t5p3",
            kind: "sort",
            prompt: "Asingkan perbuatan",
            buckets: [
              { id: "baik", label: "Bertanggungjawab", emoji: "✅" },
              { id: "buruk", label: "Tidak bertanggungjawab", emoji: "❌" },
            ],
            items: [
              { label: "Siapkan kerja sekolah", bucket: "baik" },
              { label: "Jaga kebersihan", bucket: "baik" },
              { label: "Rosakkan harta sekolah", bucket: "buruk" },
              { label: "Buli rakan", bucket: "buruk" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Patriotisme",
        questions: [
          {
            id: "t5p4",
            kind: "choice",
            prompt: "Lagu kebangsaan Malaysia?",
            options: ["Negaraku", "Indonesia Raya", "Majulah Singapura"],
            answer: "Negaraku",
          },
          {
            id: "t5p5",
            kind: "choice",
            prompt: "Bila lagu Negaraku dimainkan, kita?",
            options: ["Berdiri tegak", "Duduk", "Bercakap"],
            answer: "Berdiri tegak",
          },
          {
            id: "t5p6",
            kind: "choice",
            prompt: "Patriotisme bermaksud?",
            options: ["Cinta akan negara", "Cinta akan diri", "Cinta akan wang"],
            answer: "Cinta akan negara",
          },
        ],
      },
    ],
  },
]

// ------------------------------------------------------------ Tahun 6
const TAHUN6_LESSONS: Lesson[] = [
  {
    id: "t6-bm-karangan",
    year: "tahun6",
    subject: "bm",
    title: "Karangan & Peribahasa",
    objective: "Tulis karangan berstruktur dan guna peribahasa",
    standard: "KSSR T6 BM 6.1",
    levels: [
      {
        index: 1,
        title: "Struktur karangan",
        questions: [
          {
            id: "t6b1",
            kind: "choice",
            prompt: "Bahagian pertama karangan?",
            options: ["Pendahuluan", "Penutup", "Isi"],
            answer: "Pendahuluan",
          },
          {
            id: "t6b2",
            kind: "choice",
            prompt: "Bahagian terakhir karangan?",
            options: ["Penutup", "Pendahuluan", "Isi"],
            answer: "Penutup",
          },
          {
            id: "t6b3",
            kind: "sort",
            prompt: "Susun struktur karangan",
            buckets: [
              { id: "awal", label: "Awal", emoji: "🟢" },
              { id: "akhir", label: "Akhir", emoji: "🔴" },
            ],
            items: [
              { label: "Pendahuluan", bucket: "awal" },
              { label: "Isi 1", bucket: "awal" },
              { label: "Isi 3", bucket: "akhir" },
              { label: "Penutup", bucket: "akhir" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Peribahasa",
        questions: [
          {
            id: "t6b4",
            kind: "choice",
            prompt: 'Maksud "sedikit-sedikit, lama-lama jadi bukit"?',
            options: ["Usaha berterusan berjaya", "Cepat kaya", "Malas"],
            answer: "Usaha berterusan berjaya",
          },
          {
            id: "t6b5",
            kind: "choice",
            prompt: '"Bagai aur dengan ___"',
            options: ["tebing", "buluh", "batu"],
            answer: "tebing",
          },
          {
            id: "t6b6",
            kind: "fillblank",
            prompt: "Lengkapkan peribahasa",
            sentence: "___ di mana bumi dipijak, di situ langit dijunjung.",
            options: ["Hidup", "Makan", "Tidur"],
            answer: "Hidup",
          },
        ],
      },
    ],
  },
  {
    id: "t6-math-ukuran",
    year: "tahun6",
    subject: "math",
    title: "Ukuran & Isipadu",
    objective: "Tukar unit dan kira isipadu",
    standard: "KSSR T6 MA 5.1",
    levels: [
      {
        index: 1,
        title: "Tukar unit",
        questions: [
          {
            id: "t6m1",
            kind: "choice",
            prompt: "1 km = ? m",
            options: ["1000", "100", "10000"],
            answer: "1000",
          },
          {
            id: "t6m2",
            kind: "choice",
            prompt: "2.5 kg = ? g",
            options: ["2500", "250", "25000"],
            answer: "2500",
          },
          {
            id: "t6m3",
            kind: "match",
            prompt: "Padankan unit",
            pairs: [
              { left: "Panjang", right: "meter" },
              { left: "Jisim", right: "kilogram" },
              { left: "Isipadu", right: "liter" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Isipadu",
        questions: [
          {
            id: "t6m4",
            kind: "choice",
            prompt: "Isipadu kubus 3 cm × 3 cm × 3 cm?",
            options: ["27 cm³", "9 cm³", "18 cm³"],
            answer: "27 cm³",
          },
          {
            id: "t6m5",
            kind: "choice",
            prompt: "1 liter = ? ml",
            options: ["1000", "100", "10"],
            answer: "1000",
          },
          {
            id: "t6m6",
            kind: "fillblank",
            prompt: "Lengkapkan",
            sentence: "3 km = ___ m",
            options: ["3000", "300", "30"],
            answer: "3000",
          },
        ],
      },
    ],
  },
  {
    id: "t6-english-writing",
    year: "tahun6",
    subject: "english",
    title: "Writing & Connectors",
    objective: "Write sentences with connectors",
    standard: "KSSR T6 BI 4.1",
    levels: [
      {
        index: 1,
        title: "Connectors",
        questions: [
          {
            id: "t6e1",
            kind: "choice",
            prompt: "Choose the best connector: 'It was raining, ___ we stayed home.'",
            options: ["so", "but", "or"],
            answer: "so",
          },
          {
            id: "t6e2",
            kind: "choice",
            prompt: "Connector for contrast?",
            options: ["however", "and", "because"],
            answer: "however",
          },
          {
            id: "t6e3",
            kind: "match",
            prompt: "Match connector to meaning",
            pairs: [
              { left: "because", right: "reason" },
              { left: "although", right: "contrast" },
              { left: "finally", right: "ending" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Writing",
        questions: [
          {
            id: "t6e4",
            kind: "fillblank",
            prompt: "Complete the sentence",
            sentence: "___ it was late, she kept studying.",
            options: ["Although", "Because", "So"],
            answer: "Although",
          },
          {
            id: "t6e5",
            kind: "choice",
            prompt: "Which sentence is correct?",
            options: [
              "He went to the shop to buy milk.",
              "He went to the shop for buy milk.",
              "He went shop buy milk.",
            ],
            answer: "He went to the shop to buy milk.",
          },
          {
            id: "t6e6",
            kind: "choice",
            prompt: "Best opening for a letter?",
            options: ["Dear Sir,", "Hello you,", "Bye,"],
            answer: "Dear Sir,",
          },
        ],
      },
    ],
  },
  {
    id: "t6-science-tenaga",
    year: "tahun6",
    subject: "science",
    title: "Sains: Tenaga & Mesin",
    objective: "Kenal bentuk tenaga dan mesin ringkas",
    standard: "KSSR T6 Sains 7.2",
    levels: [
      {
        index: 1,
        title: "Bentuk tenaga",
        questions: [
          {
            id: "t6s1",
            kind: "choice",
            prompt: "Tenaga daripada makanan?",
            options: ["Kimia", "Bunyi", "Cahaya"],
            answer: "Kimia",
          },
          {
            id: "t6s2",
            kind: "choice",
            prompt: "Tenaga boleh berubah bentuk. Ini dipanggil?",
            options: ["Perubahan tenaga", "Pembaziran", "Pemindahan haba"],
            answer: "Perubahan tenaga",
          },
          {
            id: "t6s3",
            kind: "sort",
            prompt: "Asingkan tenaga",
            buckets: [
              { id: "boleh", label: "Boleh diperbaharui", emoji: "♻️" },
              { id: "tidak", label: "Tidak boleh", emoji: "⛔" },
            ],
            items: [
              { label: "Solar", bucket: "boleh" },
              { label: "Angin", bucket: "boleh" },
              { label: "Arang batu", bucket: "tidak" },
              { label: "Petroleum", bucket: "tidak" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Mesin ringkas",
        questions: [
          {
            id: "t6s4",
            kind: "choice",
            prompt: "Gunting menggunakan mesin ringkas?",
            options: ["Tuas", "Takal", "Satah condong"],
            answer: "Tuas",
          },
          {
            id: "t6s5",
            kind: "choice",
            prompt: "Tangga adalah contoh?",
            options: ["Satah condong", "Tuas", "Roda"],
            answer: "Satah condong",
          },
          {
            id: "t6s6",
            kind: "choice",
            prompt: "Mesin ringkas memudahkan?",
            options: ["Kerja", "Tidur", "Makan"],
            answer: "Kerja",
          },
        ],
      },
    ],
  },
  {
    id: "t6-sejarah-malaysia",
    year: "tahun6",
    subject: "sejarah",
    title: "Sejarah: Pembentukan Malaysia",
    objective: "Kenal peristiwa pembentukan Malaysia",
    standard: "KSSR T6 Sejarah 7.1",
    levels: [
      {
        index: 1,
        title: "Pembentukan",
        questions: [
          {
            id: "t6h1",
            kind: "choice",
            prompt: "Malaysia dibentuk pada?",
            options: ["16 September 1963", "31 Ogos 1957", "16 September 1957"],
            answer: "16 September 1963",
          },
          {
            id: "t6h2",
            kind: "choice",
            prompt: "Berapa negeri dalam Malaysia?",
            options: ["13", "14", "11"],
            answer: "13",
          },
          {
            id: "t6h3",
            kind: "choice",
            prompt: "Sabah dan Sarawak terletak di?",
            options: ["Borneo", "Semenanjung", "Sumatera"],
            answer: "Borneo",
          },
        ],
      },
      {
        index: 2,
        title: "Peristiwa",
        questions: [
          {
            id: "t6h4",
            kind: "choice",
            prompt: "Singapura keluar dari Malaysia pada?",
            options: ["1965", "1963", "1957"],
            answer: "1965",
          },
          {
            id: "t6h5",
            kind: "choice",
            prompt: "Perdana Menteri pertama Malaysia?",
            options: ["Tunku Abdul Rahman", "Tun Razak", "Tun Hussein"],
            answer: "Tunku Abdul Rahman",
          },
          {
            id: "t6h6",
            kind: "choice",
            prompt: "Rukun Negara diperkenalkan pada?",
            options: ["1970", "1957", "1963"],
            answer: "1970",
          },
        ],
      },
    ],
  },
  {
    id: "t6-islam-sirah",
    year: "tahun6",
    subject: "islam",
    title: "Sirah & Akhlak Nabi",
    objective: "Kenal sirah Nabi Muhammad SAW",
    standard: "KSSR T6 PI 4.1",
    levels: [
      {
        index: 1,
        title: "Sirah",
        questions: [
          {
            id: "t6i1",
            kind: "choice",
            prompt: "Nabi Muhammad SAW dilahirkan di?",
            options: ["Mekah", "Madinah", "Taif"],
            answer: "Mekah",
          },
          {
            id: "t6i2",
            kind: "choice",
            prompt: "Tahun kelahiran Nabi dikenali sebagai?",
            options: ["Tahun Gajah", "Tahun Hijrah", "Tahun Kambing"],
            answer: "Tahun Gajah",
          },
          {
            id: "t6i3",
            kind: "choice",
            prompt: "Nabi berhijrah ke?",
            options: ["Madinah", "Mekah", "Syria"],
            answer: "Madinah",
          },
        ],
      },
      {
        index: 2,
        title: "Akhlak",
        questions: [
          {
            id: "t6i4",
            kind: "choice",
            prompt: "Nabi dikenali sebagai?",
            options: ["Al-Amin", "Al-Karim", "Al-Hakim"],
            answer: "Al-Amin",
          },
          {
            id: "t6i5",
            kind: "choice",
            prompt: "Sifat Nabi yang jujur?",
            options: ["Siddiq", "Amanah", "Tabligh"],
            answer: "Siddiq",
          },
          {
            id: "t6i6",
            kind: "choice",
            prompt: "Nabi menyampaikan wahyu. Sifat ini?",
            options: ["Tabligh", "Fatanah", "Siddiq"],
            answer: "Tabligh",
          },
        ],
      },
    ],
  },
  {
    id: "t6-moral-global",
    year: "tahun6",
    subject: "moral",
    title: "Nilai Global & Alam Sekitar",
    objective: "Faham tanggungjawab terhadap alam",
    standard: "KSSR T6 PM 4.1",
    levels: [
      {
        index: 1,
        title: "Alam sekitar",
        questions: [
          {
            id: "t6p1",
            kind: "choice",
            prompt: "Cara jimat air?",
            options: ["Tutup paip", "Biarkan terbuka", "Main air"],
            answer: "Tutup paip",
          },
          {
            id: "t6p2",
            kind: "choice",
            prompt: "Kitar semula bermaksud?",
            options: ["Guna semula bahan", "Buang sampah", "Bakar sampah"],
            answer: "Guna semula bahan",
          },
          {
            id: "t6p3",
            kind: "sort",
            prompt: "Asingkan sampah",
            buckets: [
              { id: "kitar", label: "Boleh dikitar", emoji: "♻️" },
              { id: "tidak", label: "Tidak boleh", emoji: "🗑️" },
            ],
            items: [
              { label: "Plastik", bucket: "kitar" },
              { label: "Kertas", bucket: "kitar" },
              { label: "Sisa makanan", bucket: "tidak" },
              { label: "Lampu rosak", bucket: "tidak" },
            ],
          },
        ],
      },
      {
        index: 2,
        title: "Nilai global",
        questions: [
          {
            id: "t6p4",
            kind: "choice",
            prompt: "Bencana alam di negara lain, kita?",
            options: ["Bantu", "Ketawa", "Abaikan"],
            answer: "Bantu",
          },
          {
            id: "t6p5",
            kind: "choice",
            prompt: "Hak kanak-kanak termasuk?",
            options: ["Pendidikan", "Kerja berat", "Buli"],
            answer: "Pendidikan",
          },
          {
            id: "t6p6",
            kind: "choice",
            prompt: "Kempen alam sekitar bertujuan?",
            options: ["Jaga bumi", "Rosak bumi", "Buang masa"],
            answer: "Jaga bumi",
          },
        ],
      },
    ],
  },
]

export const LESSONS: Lesson[] = [...CORE_LESSONS, ...TAHUN5_LESSONS, ...TAHUN6_LESSONS]

/** Lessons for one school year and subject. */
export function lessonsForYear(year: SchoolYear, subject: Subject): Lesson[] {
  return LESSONS.filter((l) => l.year === year && l.subject === subject);
}

/** Every lesson in a school year, across all subjects. */
export function lessonsInYear(year: SchoolYear): Lesson[] {
  return LESSONS.filter((l) => l.year === year);
}

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
