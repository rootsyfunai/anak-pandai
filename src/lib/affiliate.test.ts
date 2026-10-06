import { describe, expect, it } from 'vitest'
import { buildAffiliateLink, normaliseCode } from './affiliate'

describe('normaliseCode', () => {
  it('uppercases and trims', () => {
    expect(normaliseCode('  ali2026 ')).toBe('ALI2026')
  })

  it('accepts dashes and underscores', () => {
    expect(normaliseCode('ali-2026_x')).toBe('ALI-2026_X')
  })

  it('rejects codes that are too short', () => {
    expect(normaliseCode('ab')).toBeNull()
  })

  it('rejects codes with invalid characters', () => {
    expect(normaliseCode('ali 2026')).toBeNull()
    expect(normaliseCode('ali@2026')).toBeNull()
  })

  it('rejects empty input', () => {
    expect(normaliseCode(null)).toBeNull()
    expect(normaliseCode('')).toBeNull()
  })
})

describe('buildAffiliateLink', () => {
  it('builds a link with the ref parameter', () => {
    expect(buildAffiliateLink('ALI2026', 'https://anakpandai.my')).toBe(
      'https://anakpandai.my/?ref=ALI2026',
    )
  })

  it('encodes the code', () => {
    expect(buildAffiliateLink('A B', 'https://x.my')).toBe('https://x.my/?ref=A%20B')
  })
})
