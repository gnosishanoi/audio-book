# Shared listener website

All public listener interfaces are hosted in this repository at audio.gnosishanoi.org:

- `/`: existing audiobook home and player; keep the book catalog and media workflow unchanged.
- `/talks-meditation/`: standalone public recordings.
- `/private-audios/`: public recording listings with password-protected playback.

The two recording pages load the bundled React client in `assets/recordings/`.
The client calls the R2/D1 service at `https://gnosis-audio.cristalngo.chatgpt.site/api/library/`.
That service is a backend, not a separate listener website. Old listener URLs redirect here.
No recording MP3s, passwords, publishing credentials, or access-request records belong in this repository.

Client source: `/Users/cristal/Documents/Dubbing/stillword-r2/listener-client.tsx`,
shared UI: `app/library.tsx`, build configuration: `vite.listener.config.ts`.
Build that configuration with the project's installed Vite and copy the generated
`outputs/listener-client/recordings.js` and `.css` into `assets/recordings/`.
Keep the HTML asset version query synchronized when replacing the bundle.

Private access is verified by the backend. It returns a recording-scoped playback
URL valid for two hours, held only in the current player state (not browser storage).
The pages use no-referrer and the private stream uses no-store. Re-enter the password
when access expires. Requests are stored in the Media Studio inbox; the email action
opens the listener's email application addressed to gnosishanoi@gmail.com.

Preserve all three relative navigation links when publishing or redesigning audiobooks.

All three HTML entrypoints load `shared-library.css` after their section styles.
This file owns shared header, logo, navigation, and typography metrics; update it
instead of styling the recording and audiobook headers independently.

Publishing note: keep Audiobooks as the default home for the shared three-section library.
