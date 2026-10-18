import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AboutOverview from '../../app/components/AboutOverview.vue'
import AboutPage from '../../app/pages/about.vue'
import {
  aboutPageEmptyMomentsFixture,
  aboutPageFixture,
  aboutPageLongFixture,
  aboutPageMissingOptionalFixture,
} from '../../app/fixtures/about'

describe('about overview', () => {
  it('renders the approved section order, headings, contact details, and map fallback link', () => {
    const wrapper = mount(AboutOverview, { props: { content: aboutPageFixture } })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toBe('關於我們')
    expect(wrapper.findAll('section h2').map(item => item.text())).toEqual([
      '讓理解自己，從一段停留開始。',
      '一個讓經驗被好好承接的地方。',
      '一些發生過的靠近。',
      '從一段對話，找到適合的入口。',
    ])
    expect(wrapper.text()).toContain('營業時間')
    expect(wrapper.text()).toContain('週二至週日　10:00–18:00')
    expect(wrapper.text()).toContain('實際時間待核准')
    expect(wrapper.get('iframe').attributes('title')).toContain('高雄市示意地點')
    expect(wrapper.get('iframe').attributes('loading')).toBe('lazy')
    expect(wrapper.get('.about-map a').attributes()).toMatchObject({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
    expect(wrapper.text()).toContain('前端原型示意')
  })

  it('moves between moments without looping and updates image, caption, and count', async () => {
    const wrapper = mount(AboutOverview, { props: { content: aboutPageFixture } })
    const controls = wrapper.findAll('.about-carousel__controls button')

    expect(controls[0]!.attributes('disabled')).toBeDefined()
    expect(controls[1]!.attributes('disabled')).toBeUndefined()
    expect(wrapper.get('.about-carousel__controls span').text()).toBe('01 / 03')
    expect(wrapper.get('.about-carousel__stage img').attributes('src')).toContain('mandala')

    await controls[1]!.trigger('click')
    expect(wrapper.get('.about-carousel__controls span').text()).toBe('02 / 03')
    expect(wrapper.get('.about-carousel__stage img').attributes('src')).toContain('circle')
    expect(wrapper.get('figcaption').text()).toContain('圍坐、傾聽與回應')

    await controls[1]!.trigger('click')
    expect(wrapper.get('.about-carousel__controls span').text()).toBe('03 / 03')
    expect(controls[1]!.attributes('disabled')).toBeDefined()
  })

  it('supports horizontal touch gestures without intercepting short movement', async () => {
    const wrapper = mount(AboutOverview, { props: { content: aboutPageFixture } })
    const figure = wrapper.get('.about-carousel__figure')

    await figure.trigger('touchstart', { changedTouches: [{ clientX: 240 }] })
    await figure.trigger('touchend', { changedTouches: [{ clientX: 120 }] })
    expect(wrapper.get('.about-carousel__controls span').text()).toBe('02 / 03')

    await figure.trigger('touchstart', { changedTouches: [{ clientX: 120 }] })
    await figure.trigger('touchend', { changedTouches: [{ clientX: 140 }] })
    expect(wrapper.get('.about-carousel__controls span').text()).toBe('02 / 03')

    await figure.trigger('touchstart', { changedTouches: [{ clientX: 100 }] })
    await figure.trigger('touchend', { changedTouches: [{ clientX: 220 }] })
    expect(wrapper.get('.about-carousel__controls span').text()).toBe('01 / 03')
  })

  it('keeps optional content absent without empty wrappers and supports the longest fixture', () => {
    const missing = mount(AboutOverview, { props: { content: aboutPageMissingOptionalFixture } })
    expect(missing.find('.about-lead').exists()).toBe(false)
    expect(missing.find('.about-brand__media').exists()).toBe(false)
    expect(missing.find('figcaption').exists()).toBe(false)

    const longest = mount(AboutOverview, { props: { content: aboutPageLongFixture } })
    expect(longest.text()).toContain('較長品牌理念內容')
    expect(longest.text()).toContain('01 / 10')
  })

  it('renders empty moments, missing contact, image failures, and recoverable page errors', async () => {
    const empty = mount(AboutOverview, { props: { content: aboutPageEmptyMomentsFixture } })
    expect(empty.text()).toContain('精選片段仍在整理中')
    expect(empty.find('.about-carousel__controls').exists()).toBe(false)

    const withoutContact = mount(AboutOverview, {
      props: { content: { ...aboutPageFixture, contact: undefined } },
    })
    expect(withoutContact.text()).toContain('聯絡資訊暫時無法顯示')
    expect(withoutContact.find('iframe').exists()).toBe(false)

    const imageFailure = mount(AboutOverview, { props: { content: aboutPageFixture } })
    await imageFailure.get('.about-carousel__stage img').trigger('error')
    expect(imageFailure.get('.about-carousel__stage .about-image-fallback').text()).toContain('曼陀羅')

    const error = mount(AboutOverview, { props: { content: aboutPageFixture, status: 'error' } })
    await error.get('button').trigger('click')
    expect(error.text()).toContain('頁面內容暫時無法顯示')
    expect(error.emitted('retry')).toHaveLength(1)
  })

  it('renders a non-shifting loading state', () => {
    const wrapper = mount(AboutOverview, { props: { content: aboutPageFixture, status: 'loading' } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('正在整理關於我們的內容')
  })
})

describe('about page', () => {
  const SiteHeaderStub = defineComponent({
    props: { alwaysVisible: Boolean, currentPath: String },
    template: '<header data-site-header :data-path="currentPath" :data-always-visible="String(alwaysVisible)" />',
  })

  beforeEach(() => {
    vi.stubGlobal('useFetch', () => ({ data: ref({ state: 'empty', content: null }) }))
    vi.stubGlobal('useSeoMeta', vi.fn())
  })

  afterEach(() => vi.unstubAllGlobals())

  it('uses the shared shell and marks About as the current route', () => {
    const wrapper = mount(AboutPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          AboutOverview,
        },
      },
    })

    expect(wrapper.get('[data-site-header]').attributes()).toMatchObject({
      'data-path': '/about',
      'data-always-visible': 'true',
    })
    expect(wrapper.get('main h1').text()).toBe('關於我們')
  })
})
