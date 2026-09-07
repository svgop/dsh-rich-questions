/**
 * Bundle↔primitives contract: every `@deepseek-ai/dsh-client-ui-primitives`
 * member the client bundle references must be a REAL export of the package.
 *
 * Why this exists (2026-09-07): the tracking plugin's v0.4.5 referenced `IconCloseOutline14`, which
 * does not exist — `jsx(undefined)` throws the moment that subtree renders,
 * the slot renderer drops the crashed entry, and the whole slot entry vanishes at render time. A reference
 * to a missing export is invisible to every other test because the crash is
 * render-time, not load-time. This test fails at commit time instead.
 *
 * Export-set resolution: the sibling harness checkout (this workspace layout)
 * is the source of truth; the profile-installed package is the fallback.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

/** Collect the package's export names from the harness checkout's sources. */
function exportsFromHarnessSource() {
  const root = join('..', '..', 'deepseek-harness', 'packages', 'client', 'ui-primitives', 'src')
  const index = join(root, 'index.ts')
  if (existsSync(index) === false) return null
  const names = new Set()
  const indexSource = readFileSync(index, 'utf8')
  for (const match of indexSource.matchAll(/export \{([^}]+)\}/g)) {
    for (const piece of match[1].split(',')) {
      const name = piece.trim().split(' ')[0]
      if (name !== '' && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) === true) names.add(name)
    }
  }
  const iconsPath = join(root, 'icons', 'index.tsx')
  if (existsSync(iconsPath) === true) {
    for (const match of readFileSync(iconsPath, 'utf8').matchAll(/export const ([A-Za-z0-9_$]+)/g)) {
      names.add(match[1])
    }
  }
  return names.size > 0 ? names : null
}

test('every primitives reference in the client bundle is a real export', async () => {
  let exports = exportsFromHarnessSource()
  if (exports === null) {
    // Fallback: import the profile-installed package (the artifact the web
    // app actually serves). Skip loudly when neither source is present.
    const installed = join(homedir(), '.dsh', 'profiles', 'web', 'node_modules', '@deepseek-ai', 'dsh-client-ui-primitives')
    if (existsSync(installed) === false) {
      console.warn('[bundle-contract] no harness checkout and no installed primitives — skipping (run inside the dsh-plugins workspace)')
      return
    }
    const mod = await import(`file:///${installed.replaceAll('\\', '/')}/package.json`, { with: { type: 'json' } })
    const entry = mod.default.exports?.['.'] ?? mod.default.main
    const real = await import(`file:///${join(installed, entry).replaceAll('\\', '/')}`)
    exports = new Set(Object.keys(real))
  }
  const bundle = readFileSync(new URL('./client.bundle.js', import.meta.url), 'utf8')
  const referenced = [...new Set([...bundle.matchAll(/_deepseek_ai_dsh_client_ui_primitives\.([A-Za-z0-9_$]+)/g)].map((m) => m[1]))]
  assert.ok(referenced.length > 0, 'the bundle should reference at least one primitive (scanner sanity)')
  const missing = referenced.filter((name) => exports.has(name) === false)
  assert.deepEqual(
    missing,
    [],
    `client.bundle.js references primitives the package does not export: ${missing.join(', ')} — ` +
    'an undefined component throws at render time and the slot renderer drops the whole entry (class guard shared across the rich-* plugins)',
  )
})
