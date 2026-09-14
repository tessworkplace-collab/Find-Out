const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/communityDiscoveries.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function setup(respond, storage = new Map()) {
  const calls = [];
  const exports = {};
  const context = { exports, URLSearchParams, AbortController, setTimeout, clearTimeout,
    fetch: async (url, init) => { calls.push({ url, init }); return respond(url, init, calls.length); },
    require: name => name.includes('async-storage') ? { default: {
      getItem: async key => storage.get(key) ?? null, setItem: async (key, value) => storage.set(key, value),
    } } : { loadUserPreferences: async () => ({ displayName: 'Tess' }) },
  };
  vm.runInNewContext(source, context);
  return { api: exports, calls, storage };
}
const item = { id: 'local-mission-123', missionTitle: 'One Job', observation: 'A boot holds flowers.', location: '' };
const response = (status, rows = []) => ({ status, ok: status >= 200 && status < 300, json: async () => rows });

test('concurrent submit and later retry publish once', async () => {
  const { api, calls } = setup(() => response(201));
  await Promise.all([api.publishDiscovery(item), api.publishDiscovery(item)]);
  await api.publishDiscovery(item);
  assert.equal(calls.length, 1);
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.author_name, 'Tess');
  assert.match(body.id, /^[a-f0-9-]{36}$/);
  assert.equal(calls[0].init.headers.Authorization, undefined);
});
test('failure survives reload and retry reuses remote identity', async () => {
  const first = setup(() => { throw new Error('Offline'); });
  await assert.rejects(first.api.publishDiscovery(item));
  const id = JSON.parse(first.calls[0].init.body).id;
  const second = setup(() => response(201), first.storage);
  await second.api.publishDiscovery(item);
  assert.equal(JSON.parse(second.calls[0].init.body).id, id);
});
test('lost success response is confirmed instead of duplicating', async () => {
  const { api, calls } = setup((url, init) => init.method === 'POST' ? response(409) :
    response(200, [{ id: new URL(url).searchParams.get('id').slice(3), mission_title: item.missionTitle, observation: item.observation }]));
  await api.publishDiscovery(item);
  assert.equal(calls.length, 2);
  assert.equal(await api.isPublished(item.id), true);
});
test('unrelated conflict does not report success', async () => {
  const { api } = setup((url, init) => response(init.method === 'POST' ? 409 : 200));
  await assert.rejects(api.publishDiscovery(item));
  assert.equal(await api.isPublished(item.id), false);
});
test('feed filters by mission and excludes own publication IDs', async () => {
  const { api, calls } = setup(() => response(201));
  await api.publishDiscovery(item);
  await api.loadCommunityDiscoveries('A title & question?');
  const params = new URL(calls[1].url).searchParams;
  assert.equal(params.get('mission_title'), 'eq.A title & question?');
  assert.ok(params.get('id').includes(JSON.parse(calls[0].init.body).id));
});
test('overlong observation cannot be silently published', async () => {
  const { api, calls } = setup(() => response(201));
  await assert.rejects(api.publishDiscovery({ ...item, observation: 'x'.repeat(601) }));
  assert.equal(calls.length, 0);
});
