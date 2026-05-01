import React, { useState } from 'react';
import { Loader, Save, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../services/firebase';
import { parseSRT } from '../services/srtParser';

const parseLRC = (lrcString) => {
  const lines = lrcString.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

  lines.forEach((line) => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3] || 0, 10);
      const time = minutes * 60 + seconds + (milliseconds / 1000);
      const text = line.replace(timeRegex, '').trim();
      if (text) result.push({ time, text });
    } else if (line.trim()) {
      result.push(line.trim());
    }
  });

  return result;
};

const parseLyricsInput = (lyricsText, srtText) => {
  if (/-->/i.test(srtText || lyricsText)) return parseSRT(srtText || lyricsText);
  if (/\[\d{2}:\d{2}/.test(lyricsText)) return parseLRC(lyricsText);
  return lyricsText.split('\n').filter((line) => line.trim() !== "");
};

const lyricsToText = (lyrics) => {
  if (!Array.isArray(lyrics)) return "";
  return lyrics.map((line) => (typeof line === 'string' ? line : line?.text || "")).filter(Boolean).join('\n');
};

export default function TrackEditModal({ track, onClose, onSave }) {
  const [form, setForm] = useState({
    title: track.title || "",
    artist: track.artist || "",
    genre: track.genre || "",
    duration: track.duration || "",
    lyrics: lyricsToText(track.lyrics),
    lyricsSrt: track.lyricsSrt || ""
  });
  const [musicFile, setMusicFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!track || !storage) return;

    setIsSaving(true);
    try {
      const updates = {
        title: form.title.trim(),
        artist: form.artist.trim() || "Momo",
        genre: form.genre.trim() || "K-Pop",
        duration: form.duration.trim() || "AI Generated",
        lyrics: parseLyricsInput(form.lyrics, form.lyricsSrt),
        lyricsSrt: form.lyricsSrt
      };

      if (musicFile) {
        const musicRef = ref(storage, `music/${Date.now()}_${musicFile.name}`);
        await uploadBytes(musicRef, musicFile);
        updates.audioSrc = await getDownloadURL(musicRef);
      }

      if (coverFile) {
        const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
        await uploadBytes(coverRef, coverFile);
        updates.cover = await getDownloadURL(coverRef);
      }

      await onSave(track.id, updates);
      onClose();
      alert("Track updated.");
    } catch (error) {
      console.error("Track edit failed:", error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Edit Track</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Title</label>
            <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Artist</label>
            <input value={form.artist} onChange={(event) => updateField("artist", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Genre</label>
            <input value={form.genre} onChange={(event) => updateField("genre", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Duration</label>
            <input value={form.duration} onChange={(event) => updateField("duration", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Replace audio</label>
            <input type="file" accept="audio/*" onChange={(event) => setMusicFile(event.target.files[0] || null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-slate-200 hover:file:bg-white/20" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Replace cover</label>
            <input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files[0] || null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-slate-200 hover:file:bg-white/20" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-400">Lyrics</label>
            <textarea rows="4" value={form.lyrics} onChange={(event) => updateField("lyrics", event.target.value)} className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-400">SRT</label>
            <textarea rows="5" value={form.lyricsSrt} onChange={(event) => updateField("lyricsSrt", event.target.value)} className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-white outline-none focus:border-blue-400" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold text-slate-300 hover:border-white/30 hover:text-white">
            <X size={18} /> Cancel
          </button>
          <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-60">
            {isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
