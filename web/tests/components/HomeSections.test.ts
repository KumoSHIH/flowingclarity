import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import HomeContact from '../../app/components/HomeContact.vue'
import HomeCourses from '../../app/components/HomeCourses.vue'
import HomeEvents from '../../app/components/HomeEvents.vue'
import HomeIntroduction from '../../app/components/HomeIntroduction.vue'
import { homeSectionsContent } from '../fixtures/homeSections'

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  template: '<a :href="to"><slot /></a>',
})

const global = { stubs: { NuxtLink } }

describe('home content sections', () => {
  it.each([
    [HomeIntroduction, homeSectionsContent.introduction, 'about', '讓身體被好好聽見'],
    [HomeEvents, homeSectionsContent.events, 'events', '近期活動'],
    [HomeCourses, homeSectionsContent.courses, 'courses', '近期課程'],
    [HomeContact, homeSectionsContent.contact!, 'contact', '留一段時間'],
  ])('provides a labelled %s section', (component, content, id, heading) => {
    const wrapper = mount(component, { props: { content }, global })
    const section = wrapper.get('section')
    const title = wrapper.get('h2')

    expect(section.attributes('id')).toBe(id)
    expect(section.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(title.text()).toContain(heading)
  })

  it('keeps the home event and course collections within their content limits', () => {
    const events = mount(HomeEvents, { props: { content: homeSectionsContent.events }, global })
    const courses = mount(HomeCourses, { props: { content: homeSectionsContent.courses }, global })

    expect(events.findAll('ol > li')).toHaveLength(3)
    expect(courses.findAll('article').length).toBeLessThanOrEqual(3)
  })

  it('links event rows and course cards to their detail routes', () => {
    const events = mount(HomeEvents, { props: { content: homeSectionsContent.events }, global })
    const courses = mount(HomeCourses, { props: { content: homeSectionsContent.courses }, global })

    expect(events.get('ol > li > a').attributes('href')).toBe(homeSectionsContent.events.items[0]?.href)
    expect(courses.get('article > a').attributes('href')).toBe(homeSectionsContent.courses.items[0]?.href)
    expect(events.find('svg').exists()).toBe(false)
    expect(courses.find('svg').exists()).toBe(false)
  })

  it('lazy-loads content imagery and provides alternative text', () => {
    const introduction = mount(HomeIntroduction, { props: { content: homeSectionsContent.introduction } })
    const courses = mount(HomeCourses, { props: { content: homeSectionsContent.courses }, global })
    const images = [
      ...introduction.findAll('img'),
      ...courses.findAll('img'),
    ]

    expect(images.length).toBeGreaterThan(0)
    for (const image of images) {
      expect(image.attributes('loading')).toBe('lazy')
      expect(image.attributes('alt')).toBeTruthy()
    }
  })

  it('shows authored empty-state copy instead of fixture cards', () => {
    const events = mount(HomeEvents, { props: { content: { ...homeSectionsContent.events, items: [] } }, global })
    const courses = mount(HomeCourses, { props: { content: { ...homeSectionsContent.courses, items: [] } }, global })

    expect(events.findAll('ol > li')).toHaveLength(0)
    expect(events.text()).toContain(homeSectionsContent.events.emptyMessage)
    expect(courses.findAll('article')).toHaveLength(0)
    expect(courses.text()).toContain(homeSectionsContent.courses.emptyMessage)
  })
})
