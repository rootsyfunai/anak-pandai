/**
 * Curriculum model for Anak Pandai.
 *
 * Age bands follow the Malaysian national curriculum:
 *  - 1-3   : pre-formal. No KPM framework exists; developmental play only.
 *  - 4-6   : KSPK (Kurikulum Standard Prasekolah Kebangsaan), 6 tunjang.
 *  - 7-9   : KSSR Tahap 1 (Tahun 1-3).
 *  - 10-12 : KSSR Tahap 2 (Tahun 4-6), adds Sejarah.
 */

export type AgeBand = '1-3' | '4-6' | '7-9' | '10-12'

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

export interface AgeBandMeta {
  id: AgeBand
  label: string
  framework: string
  /** Baby band has no reading, no hearts, no streaks. */
  isBabyMode: boolean
  /** Hearts + streak pressure only for reading-age kids. */
  hasHearts: boolean
  hasStreaks: boolean
  subjects: Subject[]
}

export const AGE_BANDS: Record<AgeBand, AgeBandMeta> = {
  '1-3': {
    id: '1-3',
    label: '1-3 tahun',
    framework: 'Pembelajaran awal (bukan formal)',
    isBabyMode: true,
    hasHearts: false,
    hasStreaks: false,
    subjects: ['diri', 'seni', 'math'],
  },
  '4-6': {
    id: '4-6',
    label: '4-6 tahun',
    framework: 'KSPK Prasekolah',
    isBabyMode: false,
    hasHearts: false,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'islam', 'moral', 'diri', 'seni'],
  },
  '7-9': {
    id: '7-9',
    label: '7-9 tahun',
    framework: 'KSSR Tahap 1 (Tahun 1-3)',
    isBabyMode: false,
    hasHearts: true,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'islam', 'moral'],
  },
  '10-12': {
    id: '10-12',
    label: '10-12 tahun',
    framework: 'KSSR Tahap 2 (Tahun 4-6)',
    isBabyMode: false,
    hasHearts: true,
    hasStreaks: true,
    subjects: ['bm', 'english', 'math', 'science', 'sejarah', 'islam', 'moral'],
  },
}

export const AGE_BAND_ORDER: AgeBand[] = ['1-3', '4-6', '7-9', '10-12']

/** Derive the band from a birth year, using the current calendar year. */
export function ageBandForBirthYear(birthYear: number, now = new Date()): AgeBand {
  const age = now.getFullYear() - birthYear
  if (age <= 3) return '1-3'
  if (age <= 6) return '4-6'
  if (age <= 9) return '7-9'
  return '10-12'
}
