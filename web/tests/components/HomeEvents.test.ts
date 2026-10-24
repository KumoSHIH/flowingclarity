import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import HomeEvents from '../../app/components/HomeEvents.vue'
import { homeSectionsContent } from '../fixtures/homeSections'

describe('HomeEvents', () => {
  const NuxtLink = defineComponent({
    props: { to: { type: String, required: true } },
    template: '<a :href="to"><slot /></a>',
  })

  it('shows event months as numeric year and month values', () => {
    const wrapper = mount(HomeEvents, { props: { content: homeSectionsContent.events }, global: { stubs: { NuxtLink } } })
    const periods = wrapper.findAll('.home-event-link__period').map(period => period.text())

    expect(periods).toEqual(['2026/10', '2026/10', '2026/11'])
    expect(wrapper.text()).not.toContain('OCT')
    expect(wrapper.text()).not.toContain('NOV')
  })

  it('uses the event overview hierarchy for dates and event copy', () => {
    const wrapper = mount(HomeEvents, { props: { content: homeSectionsContent.events }, global: { stubs: { NuxtLink } } })
    const firstEvent = wrapper.get('ol > li')

    expect(firstEvent.findAll('time > span').map(part => part.text())).toEqual(['2026/10', '12、13'])
    expect(firstEvent.get('.home-event-link__category').text()).toBe('兩日工作坊')
    expect(firstEvent.get('h3').text()).toBe('秋日靜心練習')
    expect(firstEvent.findAll('.home-event-link__meta > span').map(part => part.text())).toEqual([
      '週一、週二',
      '兩日皆為 14:00—16:00',
    ])
  })

  it('links each complete event row to its detail page', () => {
    const wrapper = mount(HomeEvents, { props: { content: homeSectionsContent.events }, global: { stubs: { NuxtLink } } })

    expect(wrapper.findAll('ol > li > a').map(link => link.attributes('href'))).toEqual([
      '/events/autumn-meditation',
      '/events/body-writing-night',
      '/events/slow-tea-time',
    ])
  })
})
