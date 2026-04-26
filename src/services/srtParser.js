
export function parseSrtTime(value) {
  const match = String(value || "")
    .trim()
    .match(/(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})(?:[,.](\d{1,3}))?/);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const milliseconds = Number(String(match[4] || "0").padEnd(3, "0").slice(0, 3));
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export function parseSRT(srtContent) {
  if (!srtContent) return [];

  return String(srtContent)
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((block) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const timeLineIndex = lines.findIndex((line) => line.includes("-->"));
      if (timeLineIndex === -1) return null;

      const [startRaw, endRaw] = lines[timeLineIndex].split("-->");
      const text = lines.slice(timeLineIndex + 1).join("\n").trim();
      if (!text) return null;

      return {
        start: parseSrtTime(startRaw),
        end: parseSrtTime(endRaw),
        time: parseSrtTime(startRaw),
        text,
      };
    })
    .filter(Boolean);
}

export function normalizeLyrics(lyrics) {
  if (!lyrics) return [];
  if (typeof lyrics === "string") {
    if (lyrics.includes("-->")) return parseSRT(lyrics);
    return lyrics
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(lyrics)) return [];
  return lyrics
    .map((line) => {
      if (typeof line === "string") return line.trim();
      if (!line || !line.text) return null;
      if (typeof line.start === "number") return line;
      if (typeof line.time === "number") {
        return { ...line, start: line.time, end: Number.POSITIVE_INFINITY };
      }
      return { text: String(line.text) };
    })
    .filter(Boolean);
}

export async function resolveSyncedLyrics(track) {
  if (!track) return [];
  if (track.lyricsSrt) return parseSRT(track.lyricsSrt);
  if (track.srt) return parseSRT(track.srt);
  if (track.srtUrl) {
    const response = await fetch(track.srtUrl);
    if (!response.ok) throw new Error(`SRT load failed: ${response.status}`);
    return parseSRT(await response.text());
  }
  return normalizeLyrics(track.lyrics);
}
