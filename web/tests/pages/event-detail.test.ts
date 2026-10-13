import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EventDetail from '../../app/components/EventDetail.vue'
import SharedTestimonials from '../../app/components/SharedTestimonials.vue'
import { getEventDetailFixture } from '../../app/fixtures/eventDetail'
import EventDetailPage from '../../app/pages/events/[slug].vue'

const content = getEventDetailFixture('prototype-event-01')!
const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}
const SiteHeaderStub = {
  props: ['alwaysVisible'],
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" />',
}

describe('shared testimonials', () => {
  it('renders every long-form item in full without media or controls', () => {
    const longText = '這是一段需要完整保留、不可截斷的心得內容。'.repeat(30)
    const wrapper = mount(SharedTestimonials, {
      attrs: { id: 'student-stories' },
      props: {
        items: [
          { text: longText, sharerName: '分享者一' },
          { text: '第二則心得', sharerName: '分享者二' },
        ],
      },
    })

    expect(wrapper.get('h2').text()).toBe('學員心得分享')
    expect(wrapper.get('h2').attributes('id')).toBe('student-stories-title')
    expect(wrapper.findAll('blockquote')).toHaveLength(2)
    expect(wrapper.find('blockquote p').text()).toBe(longText)
    expect(wrapper.findAll('cite').map(item => item.text())).toEqual(['分享者一', '分享者二'])
    expect(wrapper.findAll('img, button, [role="tab"], [aria-expanded]')).toHaveLength(0)
  })

  it('omits the entire section when no valid items are provided', () => {
    const wrapper = mount(SharedTestimonials, { props: { items: [] } })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})

describe('event detail component', () => {
  it('keeps facts, reading sections, agenda, and testimonials in one semantic path', () => {
    const wrapper = mount(EventDetail, {
      props: { content, status: 'ready' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toBe(content.hero.title)
    expect(wrapper.findAll('.event-detail__fact')).toHaveLength(4)
    expect(wrapper.findAll('.event-detail__agenda li')).toHaveLength(3)
    expect(wrapper.findAll('h2').map(item => item.text())).toEqual([
      '活動介紹',
      '課程介紹',
      '帶領者介紹',
      '這一天，會怎麼進行',
      '學員心得分享',
    ])
    expect(wrapper.findAll('blockquote')).toHaveLength(2)
    expect(wrapper.findAll('cite')).toHaveLength(2)
    expect(wrapper.findAll('.event-detail__facilitator-name img')).toHaveLength(0)
    expect(wrapper.findAll('.event-detail__action-wrap a')).toHaveLength(0)
    expect(wrapper.get('.event-detail__action--disabled').text()).toContain('資料待確認')
  })

  it('provides distinct loading, error, and not-found states', async () => {
    const loading = mount(EventDetail, {
      props: { status: 'loading' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    expect(loading.get('[role="status"]').text()).toContain('正在整理活動內容')
    expect(loading.attributes('aria-busy')).toBe('true')

    const error = mount(EventDetail, {
      props: { status: 'error' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    expect(error.get('h1').text()).toBe('活動內容暫時無法載入')
    await error.get('button').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)

    const notFound = mount(EventDetail, {
      props: { status: 'not-found' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    expect(notFound.get('h1').text()).toBe('找不到這個活動')
    expect(notFound.get('a').attributes('href')).toBe('/events')
  })
})

describe('event detail page', () => {
  const useHeadMock = vi.fn()
  let apiResponse = ref({ state: 'ready', content } as const)

  beforeEach(() => {
    useHeadMock.mockClear()
    vi.stubGlobal('useHead', useHeadMock)
    apiResponse = ref({ state: 'ready', content } as const)
    vi.stubGlobal('useFetch', () => ({ data: apiResponse, status: ref('success'), refresh: vi.fn() }))
  })

  afterEach(() => vi.unstubAllGlobals())

  function mountPage(slug: string) {
    vi.stubGlobal('useRoute', () => ({ params: { slug }, path: `/events/${slug}` }))
    return mount(EventDetailPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          EventDetail: {
            props: ['content', 'status'],
            template: '<div data-detail :data-title="content?.hero.title" :data-status="status" />',
          },
        },
      },
    })
  }

  it('renders published API content and uses its SEO metadata', () => {
    const wrapper = mountPage('prototype-event-01')
    expect(wrapper.get('[data-site-header]').attributes('data-always-visible')).toBeDefined()
    expect(wrapper.get('[data-detail]').attributes('data-status')).toBe('ready')
    expect(wrapper.get('[data-detail]').attributes('data-title')).toBe('身體覺察一日工作坊')

    const headFactory = useHeadMock.mock.calls[0]?.[0] as () => { meta: Array<{ name: string, content: string }> }
    expect(headFactory().meta).toContainEqual({ name: 'description', content: content.hero.summary })
  })

  it('maps an empty API response to not-found without fixture fallback', () => {
    apiResponse.value = { state: 'empty', content: null }
    const wrapper = mountPage('missing-event')
    expect(wrapper.get('[data-detail]').attributes('data-status')).toBe('not-found')
    const headFactory = useHeadMock.mock.calls[0]?.[0] as () => { meta: Array<{ name: string, content: string }> }
    expect(headFactory().meta).toContainEqual({ name: 'robots', content: 'noindex' })
  })
})
