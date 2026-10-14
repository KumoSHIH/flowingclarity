import assert from 'node:assert/strict'
import { test } from 'node:test'
import { practitioner, validatePractitionerPublication } from '../schemaTypes/practitioner.ts'
import { sessionContactItem, sessionServiceLocation, validateSessionBio, validateSessionServiceLocation } from '../schemaTypes/sessionDetail.ts'
import { sessionPage, sessionPageId, validateSessionPageTitle } from '../schemaTypes/sessionPage.ts'
import { sessionCity, sessionMethod, sessionRegion } from '../schemaTypes/sessionTaxonomy.ts'

test('session schemas expose semantic fields and a public-safe singleton id', () => {
  assert.equal(sessionPageId, 'session-page')
  assert.equal(sessionPageId.includes('.'), false)
  assert.deepEqual(sessionPage.fields.map(({ name }) => name), [
    'pageTitle',
    'intro',
    'resultsHeading',
    'emptyMessage',
    'noMatchesMessage',
  ])
  assert.deepEqual(sessionRegion.fields.map(({ name }) => name), ['key', 'label', 'order'])
  assert.deepEqual(sessionCity.fields.map(({ name }) => name), ['key', 'label', 'order'])
  assert.deepEqual(sessionMethod.fields.map(({ name }) => name), ['key', 'label', 'order'])
  assert.deepEqual(practitioner.fields.map(({ name }) => name), [
    'name',
    'englishName',
    'slug',
    'regions',
    'methods',
    'summary',
    'portrait',
    'bio',
    'experienceItems',
    'serviceLocations',
    'contactIntro',
    'contactItems',
    'bookingAction',
    'seo',
    'order',
    'isPublished',
  ])
  assert.equal(practitioner.fields.some(({ name }) => /consent/i.test(name)), false)
  assert.deepEqual(sessionContactItem.fields.find(({ name }) => name === 'type').options.list.map(({ value }) => value), [
    'phone', 'lineId', 'facebook', 'lineUrl', 'bookingUrl',
  ])
})

test('session page title allows one authored line break and rejects HTML', () => {
  assert.equal(validateSessionPageTitle('尋找\n執行師'), true)
  assert.match(validateSessionPageTitle('尋找\n適合的\n執行師'), /一個換行/)
  assert.match(validateSessionPageTitle('尋找\n\n執行師'), /一個換行/)
  assert.match(validateSessionPageTitle('<br>尋找執行師'), /HTML/)
})

test('published practitioners require public-safe ids and taxonomy references', () => {
  assert.equal(validatePractitionerPublication({
    _id: 'practitioner-lin',
    isPublished: true,
    summary: '這是一段足夠長而且準備公開的服務摘要內容。',
    bio: ['介紹'],
    contactItems: [{}],
  }), true)
  assert.match(validatePractitionerPublication({
    _id: 'practitioner.lin',
    isPublished: true,
  }), /不得包含句點/)
  assert.equal(validatePractitionerPublication({
    _id: 'practitioner.lin',
    isPublished: false,
  }), true)
  assert.equal(practitioner.fields.find(({ name }) => name === 'regions').of[0].to[0].type, 'sessionRegion')
  assert.equal(practitioner.fields.find(({ name }) => name === 'methods').of[0].to[0].type, 'sessionMethod')
  assert.equal(practitioner.fields.find(({ name }) => name === 'serviceLocations').of[0].type, 'sessionServiceLocation')
  const portraitField = practitioner.fields.find(({ name }) => name === 'portrait')
  const portraitDisplayMode = portraitField.fields.find(({ name }) => name === 'displayMode')
  assert.deepEqual(portraitDisplayMode.options.list.map(({ value }) => value), ['contained', 'cover'])
  const cityField = sessionServiceLocation.fields.find(({ name }) => name === 'cities')
  assert.equal(cityField.type, 'array')
  assert.equal(cityField.of[0].to[0].type, 'sessionCity')
  assert.deepEqual(validateSessionServiceLocation({ publicDetail: 'venue' }), { message: '公開場地名稱時，請填寫場地名稱。', path: ['venueName'] })
  assert.equal(validateSessionServiceLocation({ publicDetail: 'cityOnly' }), true)
  assert.match(validateSessionBio(['太短']), /60–1,200/)
  assert.equal(validateSessionBio(['這是一段用於驗證公開內容長度的執行師介紹文字，會清楚說明服務觀點、工作方式，以及來訪者在聯繫和預約以前可以理解的重要資訊與選擇。']), true)
})
