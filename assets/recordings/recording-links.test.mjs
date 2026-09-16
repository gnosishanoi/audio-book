import assert from 'node:assert/strict';
import {recordingByline, recordingId, recordingShareData, playlistShareData, linkedPlaylist} from './recording-links.js';
const id = 'e47fdb74446546c88cfc3780cb87e1dd';
assert.equal(recordingByline({recorded_at:'2026-09-15T12:30',author:'Gnosis HN'}), '15/09/2026 | Gnosis HN');
assert.equal(recordingByline({recorded_at:'2026-08',author:'Gnosis HN'}), '08/2026 | Gnosis HN');
assert.equal(recordingByline({author:'Gnosis HN'}), 'Gnosis HN');
assert.equal(recordingByline({recorded_at:'2026-09-15'}), '15/09/2026');
assert.equal(recordingByline({}), '');
assert.equal(recordingId(id), id);
assert.equal(recordingId(id+' Thực hành thần chú 7 luân xa — Gnosis HN'), id);
assert.equal(recordingId(id+'f'), '');
assert.equal(recordingId('../bad'), '');
for (const section of ['private-audios', 'talks-meditation']) {
  const result = recordingShareData({id, title:'Title', author:'Author'}, `https://audio.gnosishanoi.org/${section}/?old=1#ignored`);
  assert.deepEqual(result, {url:`https://audio.gnosishanoi.org/${section}/?audio=${id}`});
  assert.equal(recordingId(new URL(result.url).searchParams.get('audio')), id);
}
console.log('PASS: date bylines, missing/partial dates, clean share payloads, pasted-caption links');
for (const section of ['private-audios', 'talks-meditation']) {
  for (const name of ['Thực hành - Học viện thiền', 'Rafael Arape Retreat', 'A & B / #1? 100%', 'Các bản ghi khác']) {
    const records = [{playlist: name === 'Các bản ghi khác' ? '' : name}];
    const data = playlistShareData(name, `https://audio.gnosishanoi.org/${section}/?audio=${id}&old=1#ignored`);
    assert.deepEqual(Object.keys(data), ['url']);
    const url = new URL(data.url);
    assert.equal(url.pathname, `/${section}/`);
    assert.deepEqual([...url.searchParams], [['playlist', name]]);
    assert.equal(url.hash, '');
    assert.equal(linkedPlaylist(data.url, records), name);
    assert.equal(linkedPlaylist(data.url, []), '');
    url.searchParams.set('audio', id);
    assert.equal(linkedPlaylist(url, records), '');
  }
}
console.log('PASS: playlist share round trips, Unicode and reserved characters, section isolation, unknown playlists, audio precedence');
