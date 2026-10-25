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

  it('keeps a single recent course within one desktop grid column', () => {
    const content = {
      ...homeSectionsContent.courses,
      items: homeSectionsContent.courses.items.slice(0, 1),
    }
    const courses = mount(HomeCourses, { props: { content }, global })

    expect(courses.get('.home-courses__list').classes()).toContain('md:grid-cols-2')
    expect(courses.findAll('.home-course-item')).toHaveLength(1)
  })

  it('links each compact more action to its matching event or course detail', () => {
    const events = mount(HomeEvents, { props: { content: homeSectionsContent.events }, global })
    const courses = mount(HomeCourses, { props: { content: homeSectionsContent.courses }, global })

    expect(events.get('.home-event-link').attributes('href')).toBe(homeSectionsContent.events.items[0]?.href)
    expect(courses.get('article > a').attributes('href')).toBe(homeSectionsContent.courses.items[0]?.href)

    const eventActions = events.findAll('.home-section-more')
    expect(eventActions).toHaveLength(homeSectionsContent.events.items.length)
    eventActions.forEach((action, index) => {
      const event = homeSectionsContent.events.items[index]!
      expect(action.classes()).toContain('button-primary--small')
      expect(action.attributes('href')).toBe(event.href)
      expect(action.attributes('aria-label')).toBe(`查看更多活動：${event.title}`)
      expect(action.get('svg').attributes('aria-hidden')).toBe('true')
    })

    const courseActions = courses.findAll('.home-section-more')
    expect(courseActions).toHaveLength(homeSectionsContent.courses.items.length)
    courseActions.forEach((action, index) => {
      const course = homeSectionsContent.courses.items[index]!
      expect(action.classes()).toContain('button-primary--small')
      expect(action.attributes('href')).toBe(course.href)
      expect(action.attributes('aria-label')).toBe(`查看更多課程：${course.title}`)
      expect(action.get('svg').attributes('aria-hidden')).toBe('true')
    })

    expect(events.find('.home-event-link > svg').exists()).toBe(false)
    expect(courses.find('.home-course-link > svg').exists()).toBe(false)
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
