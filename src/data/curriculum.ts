/**
 * Curriculum model for Anak Pandai.
 *
 * Content is organised by school year, following the Malaysian national
 * curriculum:
 *  - prasekolah : KSPK (Kurikulum Standard Prasekolah Kebangsaan), 6 tunjang.
 *  - tahun1-3   : KSSR Tahap 1.
 *  - tahun4-6   : KSSR Tahap 2, adds Sejarah.
 *  - baby       : pre-formal play for ages 1-3. No KPM framework exists at
 *                 this age, so it is not a school year.
 */

export type SchoolYear =
  | 'baby'
  | 'prasekolah'
  | 'tahun1'
  | 'tahun2'
  | 'tahun3'
  | 'tahun4'
  | 'tahun5'
  | 'tahun6'

export type Subject =
  | 'bm'
  | 'english'
  | 'math'
  | 'science'
  | 'sejarah'
  | 'islam'
  | 'moral'
  | 'seni'
  | 'diri'

export interface SubjectMeta {
  id: Subject
  name: string
  nameEn: string
  emoji: string
  color: string
}

export const SUBJECTS: Record<Subject, SubjectMeta> = {
  bm: { id: 'bm', name: 'Bahasa Melayu', nameEn: 'Malay', emoji: '📖', color: '#ef4444' },
  english: { id: 'english', name: 'English', nameEn: 'English', emoji: '🔤', color: '#3b82f6' },
  math: { id: 'math', name: 'Matematik', nameEn: 'Maths', emoji: '🔢', color: '#f59e0b' },
  science: { id: 'science', name: 'Sains', nameEn: 'Science', emoji: '🔬', color: '#10b981' },
  sejarah: { id: 'sejarah', name: 'Sejarah', nameEn: 'History', emoji: '🏛️', color: '#8b5cf6' },
  islam: { id: 'islam', name: 'Pendidikan Islam', nameEn: 'Islamic Studies', emoji: '🕌', color: '#14b8a6' },
  moral: { id: 'moral', name: 'Pendidikan Moral', nameEn: 'Moral', emoji: '💛', color: '#eab308' },
  seni: { id: 'seni', name: 'Seni & Muzik', nameEn: 'Arts', emoji: '🎨', color: '#ec4899' },
  diri: { id: 'diri', name: 'Diri & Keluarga', nameEn: 'Self & Family', emoji: '👨‍👩‍👧', color: '#06b6d4' },
}

export interface SchoolYearMeta {
  id: SchoolYear
  label: string
  framework: string
  /** Baby mode has no reading, no hearts, no streaks. */
  isBabyMode: boolean
  /** Hearts + streak pressure only for reading-age kids. */
  hasHearts: boolean
  hasStreaks: boolean
  subjects: Subject[]
}

export const SCHOOL_YEARS: Record<SchoolYear, SchoolYearMeta> = {
  baby: {
    id: 'baby',
    label: '1-3 tahun',
    framework: 'Pembelajaran awal (bukan formal)',
    isBabyMode: true,
    hasHearts: false,
    hasStreaks: false,
    subjects: ['diri', 'seni', 'math'],
  },
  prasekolah: {
    id: 'prasekolah',
    label: 'Prasekolah',
    framework: 'KSPK Prasekolah',
    isBabyMode: false,
    hasHearts: false,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'islam', 'moral', 'diri', 'seni'],
  },
  tahun1: {
    id: 'tahun1',
    label: 'Tahun 1',
    framework: 'KSSR Tahap 1',
    isBabyMode: false,
    hasHearts: true,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'islam', 'moral'],
  },
  tahun2: {
    id: 'tahun2',
    label: 'Tahun 2',
    framework: 'KSSR Tahap 1',
    isBabyMode: false,
    hasHearts: true,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'islam', 'moral'],
  },
  tahun3: {
    id: 'tahun3',
    label: 'Tahun 3',
    framework: 'KSSR Tahap 1',
    isBabyMode: false,
    hasHearts: true,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'islam', 'moral'],
  },
  tahun4: {
    id: 'tahun4',
    label: 'Tahun 4',
    framework: 'KSSR Tahap 2',
    isBabyMode: false,
    hasHearts: true,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'sejarah', 'islam', 'moral'],
  },
  tahun5: {
    id: 'tahun5',
    label: 'Tahun 5',
    framework: 'KSSR Tahap 2',
    isBabyMode: false,
    hasHearts: true,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'sejarah', 'islam', 'moral'],
  },
  tahun6: {
    id: 'tahun6',
    label: 'Tahun 6',
    framework: 'KSSR Tahap 2',
    isBabyMode: false,
    hasHearts: true,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'sejarah', 'islam', 'moral'],
  },
}

/** Every school year, in school order. */
export const SCHOOL_YEAR_ORDER: SchoolYear[] = [
  'baby',
  'prasekolah',
  'tahun1',
  'tahun2',
  'tahun3',
  'tahun4',
  'tahun5',
  'tahun6',
]

/**
 * A tahap groups the school years that share a curriculum framework. The
 * path page shows these as the top level, with the individual years nested
 * inside, so Tahun 1 is never mixed with Tahun 2.
 */
export type Tahap = 'awal' | 'prasekolah' | 'tahap1' | 'tahap2'

export interface TahapMeta {
  id: Tahap
  label: string
  framework: string
  years: SchoolYear[]
}

export const TAHAP: Record<Tahap, TahapMeta> = {
  awal: {
    id: 'awal',
    label: '1-3 tahun',
    framework: 'Pembelajaran awal (bukan formal)',
    years: ['baby'],
  },
  prasekolah: {
    id: 'prasekolah',
    label: 'Prasekolah',
    framework: 'KSPK Prasekolah',
    years: ['prasekolah'],
  },
  tahap1: {
    id: 'tahap1',
    label: 'KSSR Tahap 1',
    framework: 'Tahun 1 hingga Tahun 3',
    years: ['tahun1', 'tahun2', 'tahun3'],
  },
  tahap2: {
    id: 'tahap2',
    label: 'KSSR Tahap 2',
    framework: 'Tahun 4 hingga Tahun 6',
    years: ['tahun4', 'tahun5', 'tahun6'],
  },
}

export const TAHAP_ORDER: Tahap[] = ['awal', 'prasekolah', 'tahap1', 'tahap2']

/** The tahap a school year belongs to. */
export function tahapForYear(year: SchoolYear): Tahap {
  return TAHAP_ORDER.find((t) => TAHAP[t].years.includes(year)) ?? 'tahap1'
}

/** Derive the school year from a birth year, using the current calendar year. */
export function schoolYearForBirthYear(birthYear: number, now = new Date()): SchoolYear {
  const age = now.getFullYear() - birthYear
  if (age <= 3) return 'baby'
  if (age <= 6) return 'prasekolah'
  if (age <= 9) return `tahun${age - 6}` as SchoolYear
  return `tahun${Math.min(6, age - 6)}` as SchoolYear
}
