import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ANNOUNCEMENT } from './host.js'

test('the announcement names the record surfaces (discovery contract)', () => {
  assert.ok(ANNOUNCEMENT.includes('.dsh/survey-drafts/'), 'announcement must point at the draft lane')
  assert.ok(ANNOUNCEMENT.includes('.dsh/surveys/'), 'announcement must point at the settled-record lane')
  assert.ok(ANNOUNCEMENT.includes('survey_records'), 'announcement must point at the machine store reader')
})

test('the writing standard is present with zero-context exemplars (readability contract)', () => {
  assert.ok(ANNOUNCEMENT.includes('WRITING STANDARD'), 'the standard is the always-on home for prose rules')
  assert.ok(ANNOUNCEMENT.includes('reader with zero context'), 'the reader model is named')
  assert.ok(ANNOUNCEMENT.includes('complete short sentences'), 'sentence shape is specified')
  assert.ok(ANNOUNCEMENT.includes('one fact per sentence'), 'density is bounded')
  for (const exemplar of ['How long should it be?', 'schedules automatic token rotation monthly', 'reported fewer token-theft incidents']) {
    assert.ok(ANNOUNCEMENT.includes(exemplar), `exemplar carried: ${excerpt(exemplar)}`)
  }
  const skill = readFileSync(new URL('../skills/rich-questions-authoring/SKILL.md', import.meta.url), 'utf8')
  assert.ok(skill.includes('zero context'), 'the skill carries the standard at depth')
})

function excerpt(text) {
  return text.slice(0, 40)
}

