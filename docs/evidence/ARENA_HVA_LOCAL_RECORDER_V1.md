# Arena HVA Local Recorder v1

Status: `PROVISIONAL_HVA_TOOL`

## Purpose

Provide a temporary, local-only voice recorder for human acceptance sessions without turning recording into an Arena product capability.

The recorder supports the evidence chain:

`published release SHA → route timeline → human spoken observation → exported audio + manifest`

It does not issue a human verdict and does not change product authority.

## Activation

The recorder is absent from normal Arena use.

- enable for the current browser tab/session with `?hvaRecorder=1`;
- disable with `?hvaRecorder=0`;
- activation is kept in `sessionStorage`, not as a persistent product preference.

No new Arena route or navigation item is introduced.

## Privacy and storage

- microphone access starts only after explicit user action;
- audio is recorded with the browser `MediaRecorder` API;
- completed sessions are stored only in local IndexedDB (`curmanlight-hva-recorder`);
- there is no automatic upload and no recording backend;
- the only network read performed by the recorder is `GET beta-release.json` to bind evidence to the published release SHA;
- the user can listen locally, export the audio, export the JSON manifest, and delete the local session.

## Automatic context evidence

While recording, route changes are timestamped automatically. The manifest includes:

- session id;
- published release SHA when available;
- start/stop timestamps;
- audio MIME type;
- user agent and viewport dimensions;
- timestamped route timeline;
- explicit `LOCAL_INDEXEDDB` / `automaticUpload=false` declaration.

## Assurance rule

> AUTOMATION MUST OBSERVE, NEVER ALTER, THE USER EXPERIENCE.

The recorder is mounted outside the Arena product views and is enabled only for an explicit HVA session. It must not create alternate product states, authority, routing behavior, data mutations or task completion shortcuts.

Its small persistent recording indicator is required to make microphone activity visible to the human reviewer; it is not evidence that a task passed.

## Non-claims

- Audio capture is not transcription.
- Recorder availability is not G5 acceptance.
- Recorder output is supporting evidence; the human reviewer remains the only source of the HVA verdict.
- No institutional membership or authority may be simulated to complete a review.
