import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SessionDetail from '../../app/components/SessionDetail.vue'
import {
  sessionDetailFixture,
  sessionDetailLongFixture,
  sessionDetailMinimalFixture,
} from '../../app/fixtures/sessionDetail'
import SessionDetailPage from '../../app/pages/session/[slug].vue'

const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

const SiteHeaderStub = {
  props: ['alwaysVisible'],
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" />',
}

describe('session detail component', () => {
  it('renders the selected C dossier with A-style experience rows', () => {
    const wrapper = mount(SessionDetail, {
      props: { content: sessionDetailFixture },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toBe(sessionDetailFixture.name)
    expect(wrapper.findAll('.session-detail__experience li')).toHaveLength(4)
    expect(wrapper.findAll('.session-detail__fact')).toHaveLength(2)
    expect(wrapper.findAll('.session-detail__contact li')).toHaveLength(4)
    expect(wrapper.get('.session-detail__booking').attributes()).toMatchObject({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
    expect(wrapper.get('a[href^="tel:"]').attributes('target')).toBeUndefined()
    expect(wrapper.get('.session-detail__contact-text').text()).toContain('@flowing-demo')
  })

  it('omits optional portrait, experience, English name, and booking action', () => {
    const wrapper = mount(SessionDetail, {
      props: { content: sessionDetailMinimalFixture },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.find('.session-detail__portrait-stage').exists()).toBe(false)
    expect(wrapper.get('.session-detail__hero').classes()).toContain('session-detail__hero--without-portrait')
    expect(wrapper.find('.session-detail__english-name').exists()).toBe(false)
    expect(wrapper.find('.session-detail__experience').exists()).toBe(false)
    expect(wrapper.find('.session-detail__booking').exists()).toBe(false)
    expect(wrapper.text()).toContain('台中市')
  })

  it('shows only the location detail allowed by each public visibility level', () => {
    const wrapper = mount(SessionDetail, {
      props: { content: sessionDetailFixture },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.text()).toContain('示意服務空間')
    expect(wrapper.text()).not.toContain('示意地址不代表正式服務地點')
  })

  it('keeps maximum supported collections in the semantic reading path', () => {
    const wrapper = mount(SessionDetail, {
      props: { content: sessionDetailLongFixture },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.findAll('.session-detail__locations li')).toHaveLength(6)
    expect(wrapper.findAll('.session-detail__methods li')).toHaveLength(20)
    expect(wrapper.findAll('.session-detail__experience li')).toHaveLength(12)
    expect(wrapper.findAll('.session-detail__contact li')).toHaveLength(6)
    expect(wrapper.findAll('.profile-section:first-child > p')).toHaveLength(6)
    expect(wrapper.find('.session-detail__booking').exists()).toBe(false)
  })

  it('provides loading, error, and not-found recovery states', async () => {
    const loading = mount(SessionDetail, {
      props: { status: 'loading' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    expect(loading.get('[role="status"]').text()).toContain('正在整理執行師資料')
    expect(loading.attributes('aria-busy')).toBe('true')

    const error = mount(SessionDetail, {
      props: { status: 'error' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await error.get('button').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)

    const notFound = mount(SessionDetail, {
      props: { status: 'not-found' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    expect(notFound.get('a').attributes('href')).toBe('/session')
  })
})

describe('session detail page', () => {
  const useHeadMock = vi.fn()

  beforeEach(() => {
    useHeadMock.mockClear()
    vi.stubGlobal('useHead', useHeadMock)
    vi.stubGlobal('useFetch', () => ({ data: ref({ state: 'empty', content: null }) }))
  })

  afterEach(() => vi.unstubAllGlobals())

  function mountPage(slug: string) {
    vi.stubGlobal('useRoute', () => ({ params: { slug }, path: `/session/${slug}` }))
    return mount(SessionDetailPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          SessionDetail: {
            props: ['content', 'status'],
            template: '<div data-detail :data-name="content?.name" :data-status="status" />',
          },
        },
      },
    })
  }

  it('renders the fixture matching the route slug', () => {
    const wrapper = mountPage('prototype-practitioner-01')
    expect(wrapper.get('[data-site-header]').attributes('data-always-visible')).toBeDefined()
    expect(wrapper.get('[data-detail]').attributes('data-name')).toBe('林若安')
    expect(wrapper.get('[data-detail]').attributes('data-status')).toBe('ready')
  })

  it('maps unknown fixture slugs to not-found and noindex', () => {
    const wrapper = mountPage('missing-practitioner')
    expect(wrapper.get('[data-detail]').attributes('data-status')).toBe('not-found')
    const headFactory = useHeadMock.mock.calls[0]?.[0] as () => { meta: Array<{ name: string, content: string }> }
    expect(headFactory().meta).toContainEqual({ name: 'robots', content: 'noindex' })
  })
})
