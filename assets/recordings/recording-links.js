// Shared-link and byline helpers. Dates are recording dates, never upload dates.
export function recordingDate(value) {
  const text = String(value || '').trim();
  const full = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/);
  if (full) return `${full[3]}/${full[2]}/${full[1]}`;
  const month = text.match(/^(\d{4})-(\d{2})$/);
  if (month) return `${month[2]}/${month[1]}`;
  return text;
}

export function recordingByline(recording) {
  return [recordingDate(recording.recorded_at), String(recording.author || '').trim()]
    .filter(Boolean).join(' | ');
}

export function recordingId(value) {
  // Recover links copied with a caption appended, but never match partial IDs.
  const match = String(value || '').trim().match(/^([a-f0-9]{32})(?:\s.*)?$/i);
  return match ? match[1].toLowerCase() : '';
}

export function recordingShareData(recording, currentUrl) {
  const url = new URL(currentUrl);
  url.search = '';
  url.hash = '';
  url.searchParams.set('audio', recording.id);
  // Share sheets may append `text` to copied URLs: deliberately send URL only.
  return {url: url.toString()};
}

export function playlistShareData(name, currentUrl) {
  const url = new URL(currentUrl);
  url.search = '';
  url.hash = '';
  url.searchParams.set('playlist', name);
  return {url: url.toString()};
}

export function linkedPlaylist(currentUrl, recordings) {
  const params = new URL(currentUrl).searchParams;
  if (recordingId(params.get('audio'))) return '';
  const name = params.get('playlist');
  return name && recordings.some(item => (item.playlist || 'Các bản ghi khác') === name) ? name : '';
}
