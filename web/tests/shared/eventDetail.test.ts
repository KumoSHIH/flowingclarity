import { describe, expect, it } from 'vitest'
import { sanityEventDetail } from '../fixtures/eventDetailSanity'
import { parseEventDetail } from '../../shared/utils/eventDetail'

describe('event detail parser', () => {
  it('parses ordered semantic blocks and derives safe public actions', () => {
    const content = parseEventDetail(sanityEventDetail, 'body-awareness-day', '2027-11-01T00:00:00Z')

    expect(content).toMatchObject({
      slug: 'body-awareness-day',
      registration: {
        status: 'open',
        actionLabel: '前往報名',
        actionUrl: 'https://forms.example.com/event',
      },
    })
    expect(content?.facts.map(item => item.label)).toEqual(['日期', '時間', '地點', '費用'])
    expect(content?.body.map(block => block.type)).toEqual(['text', 'facilitator', 'agenda', 'testimonials'])
    expect(content?.hero.image?.objectPosition).toBe('50% 40%')
  })

  it('removes registration actions after the activity starts or without a safe URL', () => {
    expect(parseEventDetail(sanityEventDetail, undefined, '2027-11-07T03:00:00Z')?.registration).toMatchObject({
      status: 'closed',
      actionUrl: undefined,
    })

    const unsafe = structuredClone(sanityEventDetail)
    unsafe.registrationUrl = 'javascript:alert(1)'
    expect(parseEventDetail(unsafe, undefined, '2027-11-01T00:00:00Z')?.registration).toMatchObject({
      status: 'open',
      actionLabel: '報名資訊待確認',
      actionUrl: undefined,
    })
  })

  it('rejects unpublished, incomplete, mismatched and invalid content', () => {
    expect(parseEventDetail({ ...sanityEventDetail, isPublished: false })).toBeNull()
    expect(parseEventDetail({ ...sanityEventDetail, detail: undefined })).toBeNull()
    expect(parseEventDetail(sanityEventDetail, 'different-slug')).toBeNull()

    const invalidBody = structuredClone(sanityEventDetail)
    invalidBody.detail.body[2]!.items = []
    expect(parseEventDetail(invalidBody)).toBeNull()
  })

  it('omits optional fee and image without invalidating complete text content', () => {
    const minimal = structuredClone(sanityEventDetail)
    delete (minimal as { image?: unknown }).image
    delete (minimal.detail as { feeLabel?: string }).feeLabel
    const content = parseEventDetail(minimal, undefined, '2027-11-01T00:00:00Z')
    expect(content?.hero.image).toBeUndefined()
    expect(content?.facts.map(item => item.label)).toEqual(['日期', '時間', '地點'])
  })
})
