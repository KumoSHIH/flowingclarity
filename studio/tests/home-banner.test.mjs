import assert from 'node:assert/strict'
import { test } from 'node:test'
import { homeBanner } from '../schemaTypes/homeBanner.ts'

test('Banner exposes only the four required content fields', () => {
  assert.deepEqual(homeBanner.fields.map(({ name }) => name), ['title', 'summary', 'buttonText', 'buttonLink'])
  for (const field of homeBanner.fields) {
    let required = false
    const rule = {
      required() { required = true; return this },
      uri() { return this },
      custom() { return this },
    }
    field.validation(rule)
    assert.equal(required, true, `${field.name} is required`)
  }
})

test('Banner link validation allows site paths and anchors but blocks executable and protocol-relative links', () => {
  let validate
  const rule = {
    required() { return this },
    uri(options) { assert.deepEqual(options, { scheme: ['http', 'https'], allowRelative: true }); return this },
    custom(callback) { validate = callback; return this },
  }
  homeBanner.fields.find(({ name }) => name === 'buttonLink').validation(rule)
  for (const link of ['https://example.com', '/course', '#courses']) assert.equal(validate(link), true)
  for (const link of ['javascript:alert(1)', '//example.com', '/\\example.com', '#', 'courses']) assert.notEqual(validate(link), true)
})
