import assert from 'node:assert/strict'
import { test } from 'node:test'
import { siteSettings, siteSettingsId } from '../schemaTypes/siteSettings.ts'
import { isGoogleMapsEmbedUrl, isGoogleMapsExternalUrl, isNavigation, isPhoneUri, isHttpsUrl, siteNavigationItems } from '../../web/shared/utils/siteSettingsContract.ts'

test('site settings is one public singleton with semantic groups', () => {
  assert.equal(siteSettingsId, 'site-settings')
  assert.equal(siteSettingsId.includes('.'), false)
  assert.deepEqual(siteSettings.groups.map(group => group.name), ['brand', 'navigation', 'messages', 'contact', 'legal'])
  assert.equal(siteSettings.fields.some(field => ['header', 'footer', 'headerSettings', 'footerSettings'].includes(field.name)), false)
  assert.equal(siteSettings.fields.find(field => field.name === 'brandLogo').type, 'image')
  assert.equal(siteSettings.fields.find(field => field.name === 'footerLogo').type, 'image')
  const contact = siteSettings.fields.find(field => field.name === 'contact')
  assert.ok(contact.fields.find(field => field.name === 'businessHours'))
  assert.ok(contact.fields.find(field => field.name === 'map'))
  let validate
  siteSettings.validation({ custom(fn) { validate = fn; return this } })
  assert.equal(validate({}, { document: { _id: siteSettingsId } }), true)
  assert.equal(validate({}, { document: { _id: `drafts.${siteSettingsId}` } }), true)
  assert.notEqual(validate({}, { document: { _id: 'duplicate' } }), true)
})
test('navigation validation preserves the five confirmed names and destinations', () => {
  const value = siteNavigationItems.map(item => ({ label: item.label, destination: item.href }))
  assert.equal(isNavigation(value), true)
  assert.equal(isNavigation(value.slice(0, 4)), false)
  assert.equal(isNavigation([...value].reverse()), false)
  let validate
  const rule = { required() { return this }, length(n) { assert.equal(n, 5); return this }, custom(fn) { validate = fn; return this } }
  siteSettings.fields.find(field => field.name === 'navigationItems').validation(rule)
  assert.equal(validate(value), true)
  assert.notEqual(validate([]), true)
})
test('contact validators reject placeholder or executable links', () => {
  assert.equal(isPhoneUri('tel:+886934031389'), true)
  assert.equal(isPhoneUri('tel:123'), false)
  for (const url of ['#', '//example.com', 'javascript:alert(1)', 'https://user:pass@example.com']) assert.equal(isHttpsUrl(url), false)
  assert.equal(isHttpsUrl('https://example.com/line'), true)
  assert.equal(isGoogleMapsEmbedUrl('https://www.google.com/maps?q=Kaohsiung&output=embed'), true)
  assert.equal(isGoogleMapsEmbedUrl('https://example.com/maps?output=embed'), false)
  assert.equal(isGoogleMapsExternalUrl('https://www.google.com/maps/search/?api=1&query=Kaohsiung'), true)
  assert.equal(isGoogleMapsExternalUrl('https://example.com/maps'), false)
})
