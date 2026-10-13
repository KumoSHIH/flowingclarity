import assert from 'node:assert/strict'
import { test } from 'node:test'
import { event, validateEventPublication } from '../schemaTypes/event.ts'
import { eventDetailContent, validatePublishedTestimonials } from '../schemaTypes/eventDetail.ts'
import { validateEventDetailBody } from '../schemaTypes/eventDetail.ts'
import { eventsPage, eventsPageId } from '../schemaTypes/eventsPage.ts'

test('event schemas expose semantic content fields and public-safe singleton id', () => {
  assert.equal(eventsPageId, 'events-page')
  assert.equal(eventsPageId.includes('.'), false)
  assert.deepEqual(eventsPage.fields.map(({ name }) => name), [
    'pageTitle',
    'intro',
    'upcomingHeading',
    'pastHeading',
    'emptyMessage',
  ])
  assert.deepEqual(event.fields.map(({ name }) => name), [
    'title',
    'slug',
    'eventType',
    'summary',
    'startAt',
    'endAt',
    'scheduleNote',
    'deliveryMode',
    'city',
    'venue',
    'image',
    'detailIsPublished',
    'detail',
    'registrationStatus',
    'registrationUrl',
    'relatedCourse',
    'archiveVisible',
    'order',
    'isPublished',
  ])
  assert.equal(event.fields.find(({ name }) => name === 'relatedCourse').options.filter,
    'isPublished == true && detailIsPublished == true')
})

test('event detail supports ordered semantic blocks and consent-gated testimonials', () => {
  assert.deepEqual(eventDetailContent.fields.map(({ name }) => name), [
    'intro', 'body', 'feeLabel', 'registrationNote', 'seoTitle', 'seoDescription',
  ])
  assert.deepEqual(
    eventDetailContent.fields.find(({ name }) => name === 'body').of.map(({ type }) => type),
    ['eventDetailText', 'eventDetailFacilitator', 'eventDetailAgenda', 'sharedTestimonialBlock', 'eventDetailList', 'eventDetailQuote', 'eventDetailMedia'],
  )
  assert.equal(validateEventDetailBody([{ _type: 'eventDetailFacilitator' }, { _type: 'eventDetailAgenda' }]), true)
  assert.match(validateEventDetailBody([{ _type: 'eventDetailAgenda' }]), /帶領者/)
  assert.equal(validatePublishedTestimonials({ items: [{ consentConfirmed: true }] }), true)
  assert.match(validatePublishedTestimonials({ items: [{ consentConfirmed: false }] }), /同意/)
})

test('published events require safe ids, ordered dates, location and HTTPS registration URLs', () => {
  const valid = {
    _id: 'event-body-awareness',
    startAt: '2026-11-07T02:00:00Z',
    endAt: '2026-11-07T09:00:00Z',
    deliveryMode: 'inPerson',
    city: '高雄',
    registrationUrl: 'https://forms.example.com/event',
    isPublished: true,
  }
  assert.equal(validateEventPublication(valid), true)
  assert.equal(validateEventPublication({ ...valid, detailIsPublished: true, detail: {} }), true)
  assert.match(validateEventPublication({ ...valid, detailIsPublished: true }), /詳情內容/)
  assert.match(validateEventPublication({
    ...valid,
    detailIsPublished: true,
    detail: { body: [{ _type: 'sharedTestimonialBlock', items: [{ consentConfirmed: false }] }] },
  }), /同意/)
  assert.match(validateEventPublication({ ...valid, _id: 'event.body' }), /不得包含句點/)
  assert.match(validateEventPublication({ ...valid, endAt: valid.startAt }), /晚於開始時間/)
  assert.match(validateEventPublication({
    isPublished: false,
    startAt: valid.startAt,
    endAt: valid.startAt,
  }), /晚於開始時間/)
  assert.match(validateEventPublication({ ...valid, city: '' }), /必須設定城市/)
  assert.match(validateEventPublication({ ...valid, registrationUrl: 'http://example.com' }), /HTTPS/)
  assert.equal(validateEventPublication({ isPublished: false }), true)
})
