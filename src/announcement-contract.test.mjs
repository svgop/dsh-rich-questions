import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ANNOUNCEMENT } from './host.js'

test('the announcement names the record surfaces (discovery contract)', () => {
  assert.ok(ANNOUNCEMENT.includes('.dsh/survey-drafts/'), 'announcement must point at the draft lane')
  assert.ok(ANNOUNCEMENT.includes('.dsh/surveys/'), 'announcement must point at the settled-record lane')
  assert.ok(ANNOUNCEMENT.includes('survey_records'), 'announcement must point at the machine store reader')
})
