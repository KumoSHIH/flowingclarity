import { mount } from '@vue/test-utils'
import { defineComponent, reactive, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EventOverview from '../../app/components/EventOverview.vue'
import EventsPage from '../../app/pages/events/index.vue'
import { eventOverviewFixture } from '../../app/fixtures/events'

const SiteHeaderStub = defineComponent({
  props: { alwaysVisible: Boolean, currentPath: String },
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" :data-current-path="currentPath" />',
})

describe('event overview', () => {
  afterEach(() => vi.useRealTimers())

  it('renders the selected view, counts, status rules, and page links', () => {
    const wrapper = mount(EventOverview, {
      props: {
        content: eventOverviewFixture,
        now: '2026-10-12T09:00:00+08:00',
        view: 'upcoming',
        page: 1,
      },
    })

    expect(wrapper.get('h1').text()).toBe('近期活動')
    expect(wrapper.get('#upcoming-events-title').text()).toBe('近期活動')
    expect(wrapper.findAll('.event-row')).toHaveLength(8)
    expect(wrapper.get('aside nav a[aria-current="page"]').text()).toContain('近期活動')
    expect(wrapper.findAll('.event-pagination__page').map(item => item.text())).toEqual(['1', '2'])
    expect(wrapper.get('.event-pagination__page[aria-current="page"]').text()).toBe('1')
    expect(wrapper.get('.event-pagination__pages a').attributes('href')).toBe('/events?view=upcoming&page=2')
    expect(wrapper.text()).not.toContain('近期活動第 1 頁，共 10 筆。')
    expect(wrapper.text()).toContain('名額已滿')
    expect(wrapper.text()).toContain('報名已截止')
    expect(wrapper.findAll('a[rel="noopener noreferrer"]')).toHaveLength(5)
    expect(wrapper.get('.event-row__copy').element.tagName).toBe('A')
    expect(wrapper.get('.event-row__copy').attributes('href')).toBe('/events/prototype-event-01')
    expect(wrapper.get('.event-row__copy').attributes('target')).toBeUndefined()
    expect(wrapper.get('.event-row__action a').attributes('href')).toBe('https://example.com/register/01')
    expect(wrapper.get('.event-row__action a').attributes('target')).toBe('_blank')
    expect(wrapper.get('.event-row__action a').classes()).toContain('button-primary')
    expect(wrapper.get('.event-row__action svg').classes()).toContain('button-primary__icon')
    expect(wrapper.get('.event-row__date-item').findAll('span')).toHaveLength(2)
    expect(wrapper.get('.event-row__weekday').text()).toBe('(週六)')
    expect(wrapper.get('.event-row').find('.event-row__date-separator').exists()).toBe(false)

    const multiDayRow = wrapper.findAll('.event-row').find(row => (
      row.text().includes('兩日靜心練習')
    ))
    expect(multiDayRow?.classes()).toContain('event-row--multi-day')
    expect(multiDayRow?.findAll('.event-row__date-item')).toHaveLength(2)
    expect(multiDayRow?.findAll('.event-row__date-separator')).toHaveLength(1)
    expect(multiDayRow?.get('.event-row__date-separator').text()).toBe('-')
    expect(multiDayRow?.get('.event-row__date-list').text()).toBe('11/07(週六)-11/08(週日)')
    expect(multiDayRow?.get('.event-row__day').text()).toBe('07–08')
    expect(multiDayRow?.text()).toContain('11/07')
    expect(multiDayRow?.text()).toContain('11/08')
  })

  it('switches to past through a shareable view URL', async () => {
    const wrapper = mount(EventOverview, {
      props: {
        content: eventOverviewFixture,
        now: '2026-10-12T09:00:00+08:00',
        view: 'upcoming',
      },
    })
    const pastLink = wrapper.findAll('aside nav a')[1]!
    expect(pastLink.attributes('href')).toBe('/events?view=past&page=1')
    await pastLink.trigger('click')
    expect(wrapper.emitted('navigate')).toEqual([['past', 1]])
  })

  it('updates compact page links around the controlled current page', async () => {
    const source = eventOverviewFixture.events[0]!
    const content = {
      ...eventOverviewFixture,
      events: Array.from({ length: 48 }, (_, index) => ({
        ...source,
        id: `pagination-${index + 1}`,
        slug: `pagination-${index + 1}`,
        order: index + 1,
      })),
    }
    const wrapper = mount(EventOverview, {
      props: {
        content,
        now: '2026-10-12T09:00:00+08:00',
        view: 'upcoming',
        page: 1,
      },
    })

    expect(wrapper.get('.event-pagination__pages').text()).toBe('123…6')
    await wrapper.get('.event-pagination__page[aria-label="近期活動第 3 頁"]').trigger('click')
    expect(wrapper.emitted('navigate')).toContainEqual(['upcoming', 3])

    await wrapper.setProps({ page: 4 })
    expect(wrapper.get('.event-pagination__pages').text()).toBe('1…456')
    expect(wrapper.get('.event-pagination__page[aria-current="page"]').text()).toBe('4')
  })

  it('normalizes an out-of-range page and focuses the collection after paging', async () => {
    const wrapper = mount(EventOverview, {
      attachTo: document.body,
      props: {
        content: eventOverviewFixture,
        now: '2026-10-12T09:00:00+08:00',
        view: 'upcoming',
        page: 99,
      },
    })

    expect(wrapper.emitted('normalize')).toEqual([['upcoming', 2]])

    await wrapper.setProps({ page: 2 })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.get('#upcoming-events-title').element)

    wrapper.unmount()
  })

  it('updates registration and collection state across live time boundaries', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-12T09:00:00+08:00'))
    const source = eventOverviewFixture.events[0]!
    const content = {
      ...eventOverviewFixture,
      events: [{
        ...source,
        startAt: '2026-10-12T09:00:01+08:00',
        endAt: '2026-10-12T09:00:02+08:00',
      }],
    }
    const wrapper = mount(EventOverview, { props: { content } })

    expect(wrapper.get('.event-row__status').text()).toBe('名額尚餘')
    expect(wrapper.find('.event-row__action > a').exists()).toBe(true)

    await vi.advanceTimersByTimeAsync(1_050)
    expect(wrapper.get('.event-row__status').text()).toBe('報名已截止')
    expect(wrapper.find('.event-row__action > a').exists()).toBe(false)

    await vi.advanceTimersByTimeAsync(1_000)
    expect(wrapper.find('.event-row').exists()).toBe(false)
    expect(wrapper.text()).toContain(eventOverviewFixture.emptyMessage)

    wrapper.unmount()
  })

  it('keeps past-only and long valid content available without false actions', () => {
    const source = eventOverviewFixture.events[0]!
    const longTitle = '長標題活動'.repeat(8).slice(0, 40)
    const longSummary = '這是用來驗證長摘要仍可完整閱讀的內容。'.repeat(6).slice(0, 100)
    const longVenue = '可公開顯示的活動場地資訊'.repeat(7).slice(0, 80)
    const content = {
      ...eventOverviewFixture,
      events: [{
        ...source,
        title: longTitle,
        summary: longSummary,
        venue: longVenue,
        registrationStatus: 'closed' as const,
        registrationUrl: undefined,
        startAt: '2026-10-10T10:00:00+08:00',
        endAt: '2026-10-10T17:00:00+08:00',
      }],
    }

    const upcoming = mount(EventOverview, {
      props: {
        content,
        now: '2026-10-12T09:00:00+08:00',
        view: 'upcoming',
      },
    })
    expect(upcoming.find('.event-row').exists()).toBe(false)
    expect(upcoming.get('a[href="/events?view=past&page=1"]').text()).toContain('1')

    const past = mount(EventOverview, {
      props: {
        content,
        now: '2026-10-12T09:00:00+08:00',
        view: 'past',
      },
    })
    expect(past.text()).toContain(longTitle)
    expect(past.text()).toContain(longSummary)
    expect(past.text()).toContain(longVenue)
    expect(past.find('.event-row__action').exists()).toBe(false)
  })

  it('shows only archived rows in the past view and paginates them newest first', () => {
    const wrapper = mount(EventOverview, {
      props: {
        content: eventOverviewFixture,
        now: '2026-10-12T09:00:00+08:00',
        view: 'past',
        page: 1,
      },
    })
    expect(wrapper.get('#past-events-title').text()).toBe('過去活動')
    expect(wrapper.get('.event-row h4').text()).toBe('日常中的身體覺察')
    expect(wrapper.findAll('.event-row__action')).toHaveLength(0)
    expect(wrapper.get('aside nav a[aria-current="page"]').text()).toContain('過去活動')
  })

  it('renders loading, empty, and error recovery states', async () => {
    const loading = mount(EventOverview, {
      props: { content: eventOverviewFixture, status: 'loading' },
    })
    expect(loading.text()).toContain('正在整理活動資料')
    expect(loading.attributes('aria-busy')).toBe('true')

    const empty = mount(EventOverview, {
      props: {
        content: { ...eventOverviewFixture, events: [] },
        now: '2026-10-12T09:00:00+08:00',
      },
    })
    expect(empty.text()).toContain(eventOverviewFixture.emptyMessage)
    expect(empty.find('.event-directory__count').exists()).toBe(false)

    const error = mount(EventOverview, {
      props: { content: eventOverviewFixture, status: 'error' },
    })
    await error.get('button').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)
  })
})

describe('events page', () => {
  const route = reactive({ query: { view: 'upcoming', page: '1' } })
  const push = vi.fn()
  const replace = vi.fn()

  beforeEach(() => {
    push.mockReset()
    replace.mockReset()
    route.query = { view: 'upcoming', page: '1' }
    vi.stubGlobal('useRoute', () => route)
    vi.stubGlobal('useRouter', () => ({ push, replace }))
    vi.stubGlobal('useHead', vi.fn())
    vi.stubGlobal('useFetch', () => ({ data: ref(undefined), status: ref('success') }))
  })

  afterEach(() => vi.unstubAllGlobals())

  it('uses the shared shell and routes view changes through query state', async () => {
    const wrapper = mount(EventsPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          EventOverview,
        },
      },
    })

    expect(wrapper.get('[data-site-header]').attributes('data-always-visible')).toBe('true')
    expect(wrapper.get('[data-site-header]').attributes('data-current-path')).toBe('/events')
    expect(wrapper.get('main h1').text()).toBe('近期活動')
    await wrapper.findAll('aside nav a')[1]!.trigger('click')
    expect(push).toHaveBeenCalledWith({
      path: '/events',
      query: { view: 'past', page: '1' },
    })
  })

  it('replaces invalid query values with the canonical default URL', async () => {
    route.query = { view: 'unknown', page: '-4' }

    mount(EventsPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          EventOverview,
        },
      },
    })

    expect(replace).toHaveBeenCalledWith({
      path: '/events',
      query: { view: 'upcoming', page: '1' },
    })
  })
})
