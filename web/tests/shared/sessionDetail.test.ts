import { describe, expect, it } from 'vitest'
import { parseSessionDetail } from '../../shared/utils/sessionDetail'
import { sanitySessionDetail } from '../fixtures/sessionDetailSanity'

describe('session detail content parser', () => {
  it('transforms published Sanity content and contact actions', () => {
    const content = parseSessionDetail(structuredClone(sanitySessionDetail), 'lin-ruo-an')
    expect(content).toMatchObject({
      slug: 'lin-ruo-an',
      portrait: { displayMode: 'cover', objectPosition: '60% 42%' },
      serviceLocations: [{ cities: ['高雄市', '台南市'], publicDetail: 'venue', venueName: '安靜工作室' }],
      bookingAction: { label: '前往預約表單' },
    })
    expect(content?.contactItems[0]?.href).toBe('tel:070000000')
    expect(content?.contactItems[1]?.href).toBeUndefined()
    expect(content?.contactItems[2]?.href).toBe('https://example.com/facebook')
  })

  it('supports optional portrait, experience, booking action, and service locations', () => {
    const value = structuredClone(sanitySessionDetail)
    delete value.portrait
    delete value.bookingAction
    value.experienceItems = []
    value.serviceLocations = []
    const content = parseSessionDetail(value)
    expect(content).toMatchObject({ experienceItems: [], serviceLocations: [] })
    expect(content?.portrait).toBeUndefined()
    expect(content?.bookingAction).toBeUndefined()
  })

  it('defaults legacy portraits to contained and rejects unknown display modes', () => {
    const legacy = structuredClone(sanitySessionDetail)
    delete (legacy.portrait as { displayMode?: string }).displayMode
    expect(parseSessionDetail(legacy)?.portrait?.displayMode).toBe('contained')
    expect(parseSessionDetail({
      ...sanitySessionDetail,
      portrait: { ...sanitySessionDetail.portrait, displayMode: 'oversized' },
    })).toBeNull()
  })

  it('rejects drafts, slug mismatches, private-field leaks, and invalid published content', () => {
    expect(parseSessionDetail({ ...sanitySessionDetail, isPublished: false })).toBeNull()
    expect(parseSessionDetail(sanitySessionDetail, 'another-slug')).toBeNull()
    expect(parseSessionDetail({ ...sanitySessionDetail, id: 'drafts.practitioner' })).toBeNull()
    expect(parseSessionDetail({ ...sanitySessionDetail, contactItems: [] })).toBeNull()
    expect(parseSessionDetail({ ...sanitySessionDetail, portrait: { ...sanitySessionDetail.portrait, src: 'https://example.com/photo.jpg' } })).toBeNull()
    expect(parseSessionDetail({
      ...sanitySessionDetail,
      serviceLocations: [{ key: 'duplicate', cities: ['高雄市', '高雄市'], publicDetail: 'cityOnly' }],
    })).toBeNull()
    expect(parseSessionDetail({
      ...sanitySessionDetail,
      serviceLocations: [{ key: 'private', cities: ['台北市'], publicDetail: 'fullAddress', venueName: '工作室' }],
    })).toBeNull()
  })
})
