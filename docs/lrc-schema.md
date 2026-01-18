# LRC Lyrics Schema

This project supports LRC-style, time-coded lyric input in the Admin upload.

## Accepted Input (Admin)

```
[mm:ss.xx]Lyric text
[mm:ss.xxx]Lyric text
```

Examples:

```
[00:10.50]First line
[00:20.00]Second line
```

## Stored Format (Firestore)

Lyrics are stored as an array. Each entry is either:

- a plain string, or
- an object with seconds-based timestamps:

```
{ time: 12.5, text: "First line" }
```

## Notes

- `time` is seconds as a float.
- If no timestamps are detected, lyrics are stored as string lines.
