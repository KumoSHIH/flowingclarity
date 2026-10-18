import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildAboutDraft } from '../lib/aboutDraft.ts'

const reference = name => ({ _type: 'reference', _ref: `image-${name}-png` })

test('builds the current prototype as an unpublished about singleton draft', () => {
  const draft = buildAboutDraft({
    team: reference('team'),
    mandala: reference('mandala'),
    circle: reference('circle'),
    bodywork: reference('bodywork'),
  })
  assert.equal(draft._id, 'drafts.about-page')
  assert.equal(draft._type, 'aboutPage')
  assert.equal(draft.title, '關於我們')
  assert.equal(draft.heroImage.asset._ref, 'image-team-png')
  assert.equal(draft.placeAndTeam.image.asset._ref, 'image-team-png')
  assert.equal(draft.featuredMoments.items.length, 3)
  assert.deepEqual(draft.featuredMoments.items.map(item => item._key), ['mandala', 'circle', 'bodywork'])
  assert.match(draft.brandStory.body[1].children[0].text, /正式品牌理念仍須由內容負責人核准/)
})
