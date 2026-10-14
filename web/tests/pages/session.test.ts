import { mount } from '@vue/test-utils'
import { defineComponent, reactive, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SessionOverview from '../../app/components/SessionOverview.vue'
import SessionPage from '../../app/pages/session/index.vue'
import {
  emptySessionOverviewFixture,
  sessionOverviewFixture,
} from '../../app/fixtures/session'

const SiteHeaderStub = defineComponent({
  props: { alwaysVisible: Boolean },
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" />',
})

describe('session overview', () => {
  it('renders the selected A directory with authored title line breaks and pagination', () => {
    const wrapper = mount(SessionOverview, {
      props: { content: sessionOverviewFixture },
    })

    expect(wrapper.get('h1').text()).toBe('尋找\n執行師')
    expect(wrapper.findAll('.practitioner-row')).toHaveLength(8)
    expect(wrapper.findAll('.practitioner-row img')).toHaveLength(0)
    expect(wrapper.get('.session-results__count').text()).toContain('符合條件 12 位')
    expect(wrapper.findAll('.session-pagination [aria-current="page"]')).toHaveLength(1)
    expect(wrapper.get('.session-pagination a[aria-label="執行師名錄第 2 頁"]').attributes('href')).toBe('/session?page=2')
    expect(wrapper.get('.practitioner-row a').attributes('href')).toBe('/session/prototype-practitioner-01')
    expect(wrapper.text()).toContain(sessionOverviewFixture.prototypeNotice)
    expect(wrapper.findAll('.session-filters fieldset').at(1)!.text()).toContain('人類圖')
    expect(sessionOverviewFixture.practitioners.some(item => item.methodKeys.length > 1)).toBe(true)
  })

  it('emits URL-controlled filters and applies OR within groups and AND across groups', async () => {
    const wrapper = mount(SessionOverview, {
      props: { content: sessionOverviewFixture },
    })
    const north = wrapper.findAll('.session-filters__options button').find(button => button.text() === '北部')!
    await north.trigger('click')
    expect(wrapper.emitted('navigate')).toContainEqual([{
      regions: ['north'],
      methods: [],
    }, 1])

    await wrapper.setProps({
      regions: ['north', 'central'],
      methods: ['biodynamic-craniosacral'],
    })
    expect(wrapper.findAll('.practitioner-row')).toHaveLength(5)
    expect(wrapper.text()).toContain('林若安')
    expect(wrapper.text()).toContain('周以澄')
    expect(wrapper.text()).toContain('許靜之')
    expect(wrapper.text()).toContain('葉知行')
    expect(wrapper.text()).toContain('方予真')
    expect(wrapper.find('.session-pagination').exists()).toBe(false)
  })

  it('treats methods as an extensible taxonomy and supports multiple services per practitioner', async () => {
    const wrapper = mount(SessionOverview, {
      props: { content: sessionOverviewFixture },
    })
    const humanDesign = wrapper.findAll('.session-filters__options button')
      .find(button => button.text() === '人類圖')!

    await humanDesign.trigger('click')
    expect(wrapper.emitted('navigate')).toContainEqual([{
      regions: [],
      methods: ['human-design'],
    }, 1])

    await wrapper.setProps({ methods: ['human-design'] })
    expect(wrapper.findAll('.practitioner-row')).toHaveLength(5)
    expect(wrapper.text()).toContain('陳映禾')
    expect(wrapper.text()).toContain('人類圖')
  })

  it('normalizes an out-of-range page and focuses results after controlled navigation', async () => {
    const wrapper = mount(SessionOverview, {
      attachTo: document.body,
      props: { content: sessionOverviewFixture, page: 99 },
    })
    expect(wrapper.emitted('normalize')).toEqual([[{
      regions: [],
      methods: [],
    }, 2]])

    await wrapper.setProps({ page: 2 })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.get('#session-results-heading').element)
    wrapper.unmount()
  })

  it('supports no-match, empty, loading, and error recovery states', async () => {
    const noMatch = mount(SessionOverview, {
      props: {
        content: sessionOverviewFixture,
        methods: ['missing-method'],
      },
    })
    expect(noMatch.text()).toContain(sessionOverviewFixture.noMatchesMessage)
    await noMatch.get('.session-state button').trigger('click')
    expect(noMatch.emitted('navigate')).toContainEqual([{
      regions: [],
      methods: [],
    }, 1])

    const empty = mount(SessionOverview, {
      props: { content: emptySessionOverviewFixture },
    })
    expect(empty.text()).toContain(sessionOverviewFixture.emptyMessage)
    expect(empty.find('.session-filters').exists()).toBe(false)

    const loading = mount(SessionOverview, {
      props: { content: sessionOverviewFixture, status: 'loading' },
    })
    expect(loading.get('.session-results').attributes('aria-busy')).toBe('true')
    expect(loading.text()).toContain('正在整理執行師資料')

    const error = mount(SessionOverview, {
      props: { content: sessionOverviewFixture, status: 'error' },
    })
    await error.get('.session-state button').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)
  })
})

describe('session page', () => {
  const route = reactive({
    query: { region: undefined, method: undefined, page: '1' } as Record<string, unknown>,
    fullPath: '/session?page=1',
  })
  const push = vi.fn()
  const replace = vi.fn()

  beforeEach(() => {
    push.mockReset()
    replace.mockReset()
    route.query = { region: undefined, method: undefined, page: '1' }
    route.fullPath = '/session?page=1'
    vi.stubGlobal('useRoute', () => route)
    vi.stubGlobal('useRouter', () => ({ push, replace }))
    vi.stubGlobal('useHead', vi.fn())
    vi.stubGlobal('useFetch', () => ({ data: ref(undefined), status: ref('success') }))
  })

  afterEach(() => vi.unstubAllGlobals())

  it('uses the shared shell and routes filter changes through query state', async () => {
    const wrapper = mount(SessionPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          SessionOverview,
        },
      },
    })

    expect(wrapper.get('[data-site-header]').attributes('data-always-visible')).toBe('true')
    expect(wrapper.get('main h1').text()).toBe('尋找\n執行師')
    const north = wrapper.findAll('.session-filters__options button').find(button => button.text() === '北部')!
    await north.trigger('click')
    expect(push).toHaveBeenCalledWith({
      path: '/session',
      query: { region: ['north'], method: undefined, page: '1' },
    })
  })

  it('replaces unknown filters and invalid pages with a canonical URL', () => {
    route.query = { region: ['north', 'unknown'], method: 'unknown', page: '-2' }
    route.fullPath = '/session?region=north&region=unknown&method=unknown&page=-2'

    mount(SessionPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          SessionOverview,
        },
      },
    })

    expect(replace).toHaveBeenCalledWith({
      path: '/session',
      query: { region: ['north'], method: undefined, page: '1' },
    })
  })
})
