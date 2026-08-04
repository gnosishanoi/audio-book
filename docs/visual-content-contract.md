# Gnosis visual-book content contract

The Gnosis listener renders content; Audiobook Studio remains the source of truth and publisher. Visual-book data is additive and must not replace a book's existing `id` or audio `chapters`, because those values preserve routes and listening progress.

Audiobook Studio should attach video data to the matching audio chapter. The Gnosis listener automatically derives its Sách hình list from `chapters[].video`:

```json
{
  "chapters": [
    {
      "id": "ch-001",
      "title": "Chương 1 – Cấp độ Tâm linh",
      "src": "audio/tam-ly-hoc/ch-001.mp3",
      "order": 1,
      "video": {
        "src": "https://published-cdn.example/ch-001.mp4",
        "duration": 455.37,
        "title": "Chương 1 – Cấp độ Tâm linh",
        "poster": "assets/visual/tam-ly-hoc/ch-001.jpg",
        "youtubeUrl": "https://www.youtube.com/watch?v=example"
      }
    }
  ]
}
```

- `video.src`: public MP4 or streaming URL used on the live site. Do not put a file larger than GitHub's normal blob limit into the listener repository.
- `video.poster`: lightweight 16:9 preview image that can be included in the content export.
- `video.youtubeUrl`: optional YouTube link. The listener exposes it as an external link when present.
- The video belongs to the audio chapter with the same `id`; Studio must not create a second, unrelated chapter identifier.

The listener still accepts `visual.chapters` as a temporary design/preview fallback. If a visual entry exists but has no public source, the live detail page shows a safe publishing placeholder. Studio should publish content into the existing destination without replacing the Gnosis shell, catalog, branding, CNAME, or unrelated books.
