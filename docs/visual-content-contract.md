# Gnosis visual-book content contract

The Gnosis listener renders content; Audiobook Studio remains the source of truth and publisher. Visual-book data is additive and must not replace a book's existing `id` or audio `chapters`, because those values preserve routes and listening progress.

Add a `visual.chapters` array to a book in the exported catalog:

```json
{
  "visual": {
    "chapters": [
      {
        "id": "ch-001",
        "title": "Chương 1 – Cấp độ Tâm linh",
        "duration": 455.37,
        "poster": "assets/visual/tam-ly-hoc/ch-001.jpg",
        "src": "https://published-cdn.example/ch-001.mp4",
        "localSrc": "../outputs/videos/local-preview.mp4",
        "externalUrl": "https://www.youtube.com/watch?v=example",
        "order": 1
      }
    ]
  }
}
```

- `src`: public MP4 or streaming URL used on the live site. Studio should write this when publishing.
- `localSrc`: optional local preview path. The listener only uses it on `file:`, `localhost`, or `127.0.0.1`; it is never used by the live domain.
- `poster`: lightweight 16:9 preview image that can be committed with the listener export.
- `externalUrl`: optional YouTube or external-video link.
- `id`: should match the related audio chapter when the formats represent the same chapter.

If `visual.chapters` exists but `src` is empty, the Library still identifies the book as having Sách hình and the live detail page shows a safe publishing placeholder. This lets the listener design be prepared before Studio uploads the final video.
