import { createClient } from '@sanity/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('useRuntimeConfig', () => ({
  sanityProjectId: 'test-project-id',
  sanityDataset: 'production',
}))
const { eventsQuery, default: getEvents } = await import('../../server/api/events.get')

const overview = {
  page: {
    pageTitle: '近期活動',
    intro: '從短期工作坊與說明會開始，依自己的時間與需要，找到適合參與的練習。',
    upcomingHeading: '近期活動',
    pastHeading: '過去活動',
    emptyMessage: '目前沒有已發布的近期活動；可以切換至過去活動查看歷史紀錄。',
  },
  events: [{
    id: 'event-body-awareness',
    title: '身體覺察一日工作坊',
    slug: 'body-awareness',
    eventType: '一日工作坊',
    summary: '透過一天的練習，感受呼吸、動作與身體界線之間的細微變化。',
    startAt: '2026-11-07T02:00:00Z',
    endAt: '2026-11-07T09:00:00Z',
    deliveryMode: 'inPerson',
    city: '高雄',
    venue: '普那生活空間',
    registrationStatus: 'open',
    registrationUrl: 'https://forms.example.com/event',
    relatedCourseSlug: 'body-awareness-course',
    archiveVisible: true,
    order: 1,
    isPublished: true,
  }],
}

describe('events API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.mocked(createClient).mockClear()
  })

  it('queries published events and returns frontend content', async () => {
    fetchMock.mockResolvedValue(overview)

    expect(await getEvents({} as never)).toEqual({
      state: 'ready',
      content: expect.objectContaining({
        pageTitle: '近期活動',
        events: [expect.objectContaining({
          id: 'event-body-awareness',
          timezone: 'Asia/Taipei',
          relatedCourseHref: '/course/body-awareness-course',
        })],
      }),
    })
    expect(eventsQuery).toContain('_type == "event" && isPublished == true')
    expect(eventsQuery).toContain('relatedCourse->isPublished == true')
    expect(eventsQuery).not.toContain('detailIsPublished')
    expect(eventsQuery).not.toContain('pastIntro')
    expect(eventsQuery).not.toContain('prototypeNotice')
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({
      perspective: 'published',
      useCdn: false,
    })
  })

  it('drops invalid event documents without replacing them with fixtures', async () => {
    fetchMock.mockResolvedValue({
      ...overview,
      events: [{ ...overview.events[0], endAt: overview.events[0].startAt }],
    })
    expect(await getEvents({} as never)).toEqual({
      state: 'ready',
      content: expect.objectContaining({ events: [] }),
    })
  })

  it('returns explicit empty and error responses', async () => {
    fetchMock.mockResolvedValue({ ...overview, page: null })
    expect(await getEvents({} as never)).toEqual({ state: 'empty', content: null })

    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResolvedValue({ ...overview, page: { pageTitle: '' } })
    expect(await getEvents({} as never)).toEqual({ state: 'error', content: null })

    fetchMock.mockRejectedValue(new Error('unavailable'))
    expect(await getEvents({} as never)).toEqual({ state: 'error', content: null })
  })
})
