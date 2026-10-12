import { mount } from '@vue/test-utils'
import { defineComponent, reactive, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EventOverview from '../../app/components/EventOverview.vue'
import EventsPage from '../../app/pages/events/index.vue'
import { eventOverviewFixture } from '../../app/fixtures/events'

const SiteHeaderStub = defineComponent({
  props: { alwaysVisible: Boolean },
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" />',
})

describe('event overview', () => {
  it('renders the selected view, counts, status rules, and compact pagination', () => {
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
    expect(wrapper.find('.event-pagination').text()).toContain('1 / 2')
    expect(wrapper.text()).toContain('名額已滿')
    expect(wrapper.text()).toContain('報名已截止')
    expect(wrapper.findAll('a[rel="noopener noreferrer"]')).toHaveLength(5)
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
    expect(wrapper.get('main h1').text()).toBe('近期活動')
    await wrapper.findAll('aside nav a')[1]!.trigger('click')
    expect(push).toHaveBeenCalledWith({
      path: '/events',
      query: { view: 'past', page: '1' },
    })
  })
})
