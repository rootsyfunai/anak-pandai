import type { AgeBand, Subject } from './curriculum'

/**
 * A lesson is one Duolingo-style node on the path: a short round of
 * questions on a single topic.
 */
export interface Lesson {
  id: string
  band: AgeBand
  subject: Subject
  title: string
  /** Short parent-facing description of what the child practises. */
  objective: string
  /** Curriculum reference, e.g. KSPK BM 3.2.1 or KSSR T1 Matematik 1.1 */
  standard?: string
  questions: Question[]
}

export type Question =
  | ChoiceQuestion
  | MatchQuestion
  | ListenQuestion

interface QuestionBase {
  id: string
  prompt: string
  /** Spoken aloud for baby mode and for reading practice. */
  audioText?: string
}

/** Pick the correct option from a set of tiles. */
export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice'
  options: string[]
  answer: string
  /** Emoji shown large above the prompt, for pre-readers. */
  visual?: string
}

/** Tap pairs that belong together (e.g. letter to picture). */
export interface MatchQuestion extends QuestionBase {
  kind: 'match'
  pairs: { left: string; right: string }[]
}

/** Hear a sound, pick what it was. Used in baby mode. */
export interface ListenQuestion extends QuestionBase {
  kind: 'listen'
  options: string[]
  answer: string
  visual?: string
}

export const LESSONS: Lesson[] = [
  // ------------------------------------------------------------ 1-3 baby
  {
    id: 'baby-animals',
    band: '1-3',
    subject: 'diri',
    title: 'Bunyi Haiwan',
    objective: 'Kenal bunyi haiwan biasa',
    questions: [
      {
        id: 'ba1',
        kind: 'listen',
        prompt: 'Haiwan apa ini?',
        audioText: 'Moo! Moo!',
        options: ['🐄', '🐱', '🐦'],
        answer: '🐄',
        visual: '🐄',
      },
      {
        id: 'ba2',
        kind: 'listen',
        prompt: 'Haiwan apa ini?',
        audioText: 'Meow! Meow!',
        options: ['🐕', '🐱', '🐟'],
        answer: '🐱',
        visual: '🐱',
      },
      {
        id: 'ba3',
        kind: 'choice',
        prompt: 'Mana kucing?',
        audioText: 'Mana kucing?',
        options: ['🐶', '🐱', '🐰'],
        answer: '🐱',
        visual: '🐱',
      },
    ],
  },
  {
    id: 'baby-colours',
    band: '1-3',
    subject: 'seni',
    title: 'Warna',
    objective: 'Kenal warna asas',
    questions: [
      {
        id: 'bc1',
        kind: 'choice',
        prompt: 'Mana warna merah?',
        audioText: 'Mana warna merah?',
        options: ['🔴', '🔵', '🟢'],
        answer: '🔴',
        visual: '🔴',
      },
      {
        id: 'bc2',
        kind: 'choice',
        prompt: 'Mana warna biru?',
        audioText: 'Mana warna biru?',
        options: ['🟡', '🔵', '🟣'],
        answer: '🔵',
        visual: '🔵',
      },
      {
        id: 'bc3',
        kind: 'choice',
        prompt: 'Mana warna kuning?',
        audioText: 'Mana warna kuning?',
        options: ['🟡', '⚫', '🟤'],
        answer: '🟡',
        visual: '🟡',
      },
    ],
  },
  {
    id: 'baby-count-3',
    band: '1-3',
    subject: 'math',
    title: 'Kira 1-2-3',
    objective: 'Kira objek hingga 3',
    questions: [
      {
        id: 'bn1',
        kind: 'choice',
        prompt: 'Berapa banyak?',
        audioText: 'Berapa banyak epal?',
        options: ['1', '2', '3'],
        answer: '2',
        visual: '🍎🍎',
      },
      {
        id: 'bn2',
        kind: 'choice',
        prompt: 'Berapa banyak?',
        audioText: 'Berapa banyak bintang?',
        options: ['1', '2', '3'],
        answer: '3',
        visual: '⭐⭐⭐',
      },
      {
        id: 'bn3',
        kind: 'choice',
        prompt: 'Berapa banyak?',
        audioText: 'Berapa banyak bola?',
        options: ['1', '2', '3'],
        answer: '1',
        visual: '⚽',
      },
    ],
  },

  // ------------------------------------------------------------ 4-6 KSPK
  {
    id: 'kspk-vokal',
    band: '4-6',
    subject: 'bm',
    title: 'Huruf Vokal',
    objective: 'Kenal dan sebut huruf vokal a e i o u',
    standard: 'KSPK BM 2.1.1',
    questions: [
      {
        id: 'kv1',
        kind: 'choice',
        prompt: 'Huruf vokal pertama?',
        audioText: 'Huruf vokal pertama?',
        options: ['a', 'b', 'c'],
        answer: 'a',
      },
      {
        id: 'kv2',
        kind: 'choice',
        prompt: 'Pilih semua huruf vokal',
        audioText: 'Pilih huruf vokal',
        options: ['a', 'k', 'm'],
        answer: 'a',
      },
      {
        id: 'kv3',
        kind: 'match',
        prompt: 'Padankan huruf dengan gambar',
        pairs: [
          { left: 'a', right: '🍎 (apel)' },
          { left: 'i', right: '🐟 (ikan)' },
          { left: 'u', right: '🦴 (ubi)' },
        ],
      },
    ],
  },
  {
    id: 'kspk-sukukata',
    band: '4-6',
    subject: 'bm',
    title: 'Suku Kata KV',
    objective: 'Baca suku kata konsonan-vokal',
    standard: 'KSPK BM 2.2.1',
    questions: [
      {
        id: 'ks1',
        kind: 'choice',
        prompt: 'ba + pa = ?',
        audioText: 'ba pa',
        options: ['bapa', 'baba', 'papa'],
        answer: 'bapa',
      },
      {
        id: 'ks2',
        kind: 'choice',
        prompt: 'bu + ku = ?',
        audioText: 'bu ku',
        options: ['buku', 'kuku', 'bubu'],
        answer: 'buku',
      },
      {
        id: 'ks3',
        kind: 'match',
        prompt: 'Padankan suku kata',
        pairs: [
          { left: 'ma', right: 'ma' },
          { left: 'ku', right: 'ku' },
          { left: 'ci', right: 'ci' },
        ],
      },
    ],
  },
  {
    id: 'kspk-nombor-10',
    band: '4-6',
    subject: 'math',
    title: 'Nombor 1-10',
    objective: 'Kenal dan bilang nombor 1 hingga 10',
    standard: 'KSPK MA 1.1.1',
    questions: [
      {
        id: 'kn1',
        kind: 'choice',
        prompt: 'Nombor selepas 4?',
        audioText: 'Nombor selepas empat?',
        options: ['3', '5', '6'],
        answer: '5',
      },
      {
        id: 'kn2',
        kind: 'choice',
        prompt: 'Nombor sebelum 8?',
        audioText: 'Nombor sebelum lapan?',
        options: ['7', '9', '6'],
        answer: '7',
      },
      {
        id: 'kn3',
        kind: 'choice',
        prompt: 'Berapa banyak?',
        audioText: 'Berapa banyak ikan?',
        options: ['5', '6', '7'],
        answer: '6',
        visual: '🐟🐟🐟🐟🐟🐟',
      },
    ],
  },
  {
    id: 'kspk-bentuk',
    band: '4-6',
    subject: 'math',
    title: 'Bentuk Asas',
    objective: 'Kenal bulat, segi empat dan segi tiga',
    standard: 'KSPK MA 3.1.1',
    questions: [
      {
        id: 'kb1',
        kind: 'choice',
        prompt: 'Mana bulat?',
        audioText: 'Mana bentuk bulat?',
        options: ['⚪', '⬛', '🔺'],
        answer: '⚪',
      },
      {
        id: 'kb2',
        kind: 'choice',
        prompt: 'Mana segi tiga?',
        audioText: 'Mana segi tiga?',
        options: ['⬛', '🔺', '⚪'],
        answer: '🔺',
      },
      {
        id: 'kb3',
        kind: 'match',
        prompt: 'Padankan bentuk',
        pairs: [
          { left: '⚪', right: 'Bulat' },
          { left: '⬛', right: 'Segi empat' },
          { left: '🔺', right: 'Segi tiga' },
        ],
      },
    ],
  },
  {
    id: 'kspk-deria',
    band: '4-6',
    subject: 'science',
    title: 'Lima Deria',
    objective: 'Kenal deria dan fungsinya',
    standard: 'KSPK ST 2.1.1',
    questions: [
      {
        id: 'kd1',
        kind: 'choice',
        prompt: 'Kita lihat dengan apa?',
        audioText: 'Kita lihat dengan apa?',
        options: ['👁️ Mata', '👂 Telinga', '👃 Hidung'],
        answer: '👁️ Mata',
      },
      {
        id: 'kd2',
        kind: 'choice',
        prompt: 'Kita dengar dengan apa?',
        audioText: 'Kita dengar dengan apa?',
        options: ['👂 Telinga', '👅 Lidah', '✋ Tangan'],
        answer: '👂 Telinga',
      },
      {
        id: 'kd3',
        kind: 'match',
        prompt: 'Padankan deria',
        pairs: [
          { left: '👃', right: 'Bau' },
          { left: '👅', right: 'Rasa' },
          { left: '✋', right: 'Sentuh' },
        ],
      },
    ],
  },
  {
    id: 'kspk-adab',
    band: '4-6',
    subject: 'moral',
    title: 'Adab & Nilai Murni',
    objective: 'Amalan sopan santun harian',
    standard: 'KSPK Nilai 1.1',
    questions: [
      {
        id: 'ka1',
        kind: 'choice',
        prompt: 'Bila jumpa cikgu, kita?',
        audioText: 'Bila jumpa cikgu, kita buat apa?',
        options: ['Beri salam', 'Jerit', 'Lari'],
        answer: 'Beri salam',
      },
      {
        id: 'ka2',
        kind: 'choice',
        prompt: 'Minta sesuatu, kita cakap?',
        audioText: 'Bila minta sesuatu, kita cakap apa?',
        options: ['Tolong', 'Bagi la', 'Cepat'],
        answer: 'Tolong',
      },
      {
        id: 'ka3',
        kind: 'choice',
        prompt: 'Selepas guna, kita?',
        audioText: 'Selepas guna barang, kita buat apa?',
        options: ['Simpan balik', 'Biar saja', 'Buang'],
        answer: 'Simpan balik',
      },
    ],
  },

  // ------------------------------------------------------------ 7-9 KSSR T1
  {
    id: 't1-bm-ayat',
    band: '7-9',
    subject: 'bm',
    title: 'Bina Ayat Mudah',
    objective: 'Susun perkataan jadi ayat lengkap',
    standard: 'KSSR T1 BM 3.2.1',
    questions: [
      {
        id: 'tb1',
        kind: 'choice',
        prompt: 'Susun: [Ali] [bola] [main]',
        options: ['Ali main bola.', 'Bola Ali main.', 'Main Ali bola.'],
        answer: 'Ali main bola.',
      },
      {
        id: 'tb2',
        kind: 'choice',
        prompt: 'Pilih kata nama',
        options: ['meja', 'lari', 'cantik'],
        answer: 'meja',
      },
      {
        id: 'tb3',
        kind: 'choice',
        prompt: 'Pilih kata kerja',
        options: ['buku', 'makan', 'besar'],
        answer: 'makan',
      },
    ],
  },
  {
    id: 't1-math-100',
    band: '7-9',
    subject: 'math',
    title: 'Nombor hingga 100',
    objective: 'Banding dan susun nombor hingga 100',
    standard: 'KSSR T1 MA 1.1',
    questions: [
      {
        id: 'tm1',
        kind: 'choice',
        prompt: 'Mana lebih besar?',
        options: ['78', '87', '70'],
        answer: '87',
      },
      {
        id: 'tm2',
        kind: 'choice',
        prompt: '45 + 23 = ?',
        options: ['68', '67', '78'],
        answer: '68',
      },
      {
        id: 'tm3',
        kind: 'choice',
        prompt: '90 - 40 = ?',
        options: ['50', '40', '60'],
        answer: '50',
      },
    ],
  },
  {
    id: 't1-math-wang',
    band: '7-9',
    subject: 'math',
    title: 'Wang Malaysia',
    objective: 'Kenal nilai wang dan kira jumlah',
    standard: 'KSSR T1 MA 4.1',
    questions: [
      {
        id: 'tw1',
        kind: 'choice',
        prompt: 'RM5 + RM2 = ?',
        options: ['RM7', 'RM3', 'RM52'],
        answer: 'RM7',
      },
      {
        id: 'tw2',
        kind: 'choice',
        prompt: '50 sen + 50 sen = ?',
        options: ['RM1', 'RM1.50', '100 sen sahaja'],
        answer: 'RM1',
      },
      {
        id: 'tw3',
        kind: 'match',
        prompt: 'Padankan wang',
        pairs: [
          { left: 'RM1', right: '100 sen' },
          { left: 'RM5', right: '500 sen' },
          { left: '50 sen', right: 'RM0.50' },
        ],
      },
    ],
  },
  {
    id: 't1-english-phonics',
    band: '7-9',
    subject: 'english',
    title: 'Phonics & Sight Words',
    objective: 'Read simple CVC words',
    standard: 'KSSR T1 BI 2.1',
    questions: [
      {
        id: 'te1',
        kind: 'choice',
        prompt: 'Which word starts with /k/?',
        options: ['cat', 'dog', 'sun'],
        answer: 'cat',
      },
      {
        id: 'te2',
        kind: 'choice',
        prompt: 'Which is a colour?',
        options: ['blue', 'run', 'table'],
        answer: 'blue',
      },
      {
        id: 'te3',
        kind: 'match',
        prompt: 'Match the word to the picture',
        pairs: [
          { left: 'apple', right: '🍎' },
          { left: 'ball', right: '⚽' },
          { left: 'fish', right: '🐟' },
        ],
      },
    ],
  },
  {
    id: 't1-science-deria',
    band: '7-9',
    subject: 'science',
    title: 'Sains: Benda Hidup',
    objective: 'Bezakan benda hidup dan bukan hidup',
    standard: 'KSSR T1 Sains 1.1',
    questions: [
      {
        id: 'ts1',
        kind: 'choice',
        prompt: 'Mana benda hidup?',
        options: ['Pokok', 'Batu', 'Kerusi'],
        answer: 'Pokok',
      },
      {
        id: 'ts2',
        kind: 'choice',
        prompt: 'Benda hidup perlu apa?',
        options: ['Air & makanan', 'Bateri', 'Cat'],
        answer: 'Air & makanan',
      },
      {
        id: 'ts3',
        kind: 'choice',
        prompt: 'Mana bukan hidup?',
        options: ['Kucing', 'Meja', 'Padi'],
        answer: 'Meja',
      },
    ],
  },

  // ------------------------------------------------------------ 10-12 KSSR T2
  {
    id: 't2-bm-peribahasa',
    band: '10-12',
    subject: 'bm',
    title: 'Peribahasa & Simpulan Bahasa',
    objective: 'Faham maksud peribahasa biasa',
    standard: 'KSSR T2 BM 5.1',
    questions: [
      {
        id: 'pb1',
        kind: 'choice',
        prompt: 'Maksud "besar kepala"?',
        options: ['Degil', 'Pandai', 'Tinggi'],
        answer: 'Degil',
      },
      {
        id: 'pb2',
        kind: 'choice',
        prompt: 'Maksud "buah hati"?',
        options: ['Kekasih', 'Epal', 'Kawan'],
        answer: 'Kekasih',
      },
      {
        id: 'pb3',
        kind: 'choice',
        prompt: '"Berat mata memandang, berat lagi ___"',
        options: ['bahu memikul', 'hati menanggung', 'kaki melangkah'],
        answer: 'bahu memikul',
      },
    ],
  },
  {
    id: 't2-math-pecahan',
    band: '10-12',
    subject: 'math',
    title: 'Pecahan & Peratus',
    objective: 'Tukar pecahan kepada peratus',
    standard: 'KSSR T2 MA 2.1',
    questions: [
      {
        id: 'pm1',
        kind: 'choice',
        prompt: '1/2 = ? %',
        options: ['50%', '25%', '20%'],
        answer: '50%',
      },
      {
        id: 'pm2',
        kind: 'choice',
        prompt: '1/4 = ? %',
        options: ['25%', '40%', '14%'],
        answer: '25%',
      },
      {
        id: 'pm3',
        kind: 'choice',
        prompt: '0.75 = ?',
        options: ['3/4', '1/4', '7/5'],
        answer: '3/4',
      },
    ],
  },
  {
    id: 't2-math-nisbah',
    band: '10-12',
    subject: 'math',
    title: 'Nisbah & Purata',
    objective: 'Kira nisbah dan purata',
    standard: 'KSSR T2 MA 8.1',
    questions: [
      {
        id: 'pn1',
        kind: 'choice',
        prompt: 'Purata 4, 6, 8 = ?',
        options: ['6', '5', '7'],
        answer: '6',
      },
      {
        id: 'pn2',
        kind: 'choice',
        prompt: 'Nisbah 2:3, jumlah 10. Bahagian kecil?',
        options: ['4', '6', '5'],
        answer: '4',
      },
      {
        id: 'pn3',
        kind: 'choice',
        prompt: '20% daripada 150 = ?',
        options: ['30', '20', '45'],
        answer: '30',
      },
    ],
  },
  {
    id: 't2-sejarah-merdeka',
    band: '10-12',
    subject: 'sejarah',
    title: 'Kemerdekaan Malaysia',
    objective: 'Peristiwa penting menuju kemerdekaan',
    standard: 'KSSR T2 Sejarah 6.1',
    questions: [
      {
        id: 'sm1',
        kind: 'choice',
        prompt: 'Malaysia merdeka pada?',
        options: ['31 Ogos 1957', '16 September 1963', '31 Ogos 1963'],
        answer: '31 Ogos 1957',
      },
      {
        id: 'sm2',
        kind: 'choice',
        prompt: 'Siapa Bapa Kemerdekaan?',
        options: ['Tunku Abdul Rahman', 'Tun Razak', 'Tun Mahathir'],
        answer: 'Tunku Abdul Rahman',
      },
      {
        id: 'sm3',
        kind: 'choice',
        prompt: 'Malaysia dibentuk pada?',
        options: ['16 September 1963', '31 Ogos 1957', '1 Januari 1960'],
        answer: '16 September 1963',
      },
    ],
  },
  {
    id: 't2-science-tenaga',
    band: '10-12',
    subject: 'science',
    title: 'Sains: Tenaga',
    objective: 'Kenal bentuk dan sumber tenaga',
    standard: 'KSSR T2 Sains 7.1',
    questions: [
      {
        id: 'st1',
        kind: 'choice',
        prompt: 'Sumber tenaga utama bumi?',
        options: ['Matahari', 'Bulan', 'Angin'],
        answer: 'Matahari',
      },
      {
        id: 'st2',
        kind: 'choice',
        prompt: 'Tenaga boleh diperbaharui?',
        options: ['Solar', 'Arang batu', 'Petroleum'],
        answer: 'Solar',
      },
      {
        id: 'st3',
        kind: 'match',
        prompt: 'Padankan tenaga',
        pairs: [
          { left: '🔋', right: 'Kimia' },
          { left: '💡', right: 'Cahaya' },
          { left: '🔊', right: 'Bunyi' },
        ],
      },
    ],
  },
]

export function lessonsFor(band: AgeBand, subject: Subject): Lesson[] {
  return LESSONS.filter((l) => l.band === band && l.subject === subject)
}

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}
