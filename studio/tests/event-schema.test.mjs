import assert from 'node:assert/strict'
import { test } from 'node:test'
import { event, validateEventPublication } from '../schemaTypes/event.ts'
import { eventsPage, eventsPageId } from '../schemaTypes/eventsPage.ts'

test('event schemas expose semantic content fields and public-safe singleton id', () => {
  assert.equal(eventsPageId, 'events-page')
  assert.equal(eventsPageId.includes('.'), false)
  assert.deepEqual(eventsPage.fields.map(({ name }) => name), [
    'pageTitle',
    'intro',
    'upcomingHeading',
    'pastHeading',
    'pastIntro',
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
