import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Loader, Play, Save, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useMusic } from '../context/MusicContext';
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

export default function Home() {
  const { tracks, playTrack, user, updateTrack } = useMusic();
  const navigate = useNavigate();
  const [editingTrack, setEditingTrack] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    genre: "",
    duration: "",
    lyrics: "",
    lyricsSrt: ""
  });
  const [editMusicFile, setEditMusicFile] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const openEditor = (track) => {
    setEditingTrack(track);
    setEditForm({
      title: track.title || "",
      artist: track.artist || "",
      genre: track.genre || "",
      duration: track.duration || "",
      lyrics: lyricsToText(track.lyrics),
      lyricsSrt: track.lyricsSrt || ""
    });
    setEditMusicFile(null);
    setEditCoverFile(null);
  };

  const closeEditor = () => {
    setEditingTrack(null);
    setEditMusicFile(null);
    setEditCoverFile(null);
  };

  const updateField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveTrack = async (event) => {
    event.preventDefault();
    if (!editingTrack || !storage) return;

    setIsSaving(true);
    try {
      const updates = {
        title: editForm.title.trim(),
        artist: editForm.artist.trim() || "Momo",
        genre: editForm.genre.trim() || "K-Pop",
        duration: editForm.duration.trim() || "AI Generated",
        lyrics: parseLyricsInput(editForm.lyrics, editForm.lyricsSrt),
        lyricsSrt: editForm.lyricsSrt
      };

      if (editMusicFile) {
        const musicRef = ref(storage, `music/${Date.now()}_${editMusicFile.name}`);
        await uploadBytes(musicRef, editMusicFile);
        updates.audioSrc = await getDownloadURL(musicRef);
      }

      if (editCoverFile) {
        const coverRef = ref(storage, `covers/${Date.now()}_${editCoverFile.name}`);
        await uploadBytes(coverRef, editCoverFile);
        updates.cover = await getDownloadURL(coverRef);
      }

      await updateTrack(editingTrack.id, updates);
      closeEditor();
      alert("Track updated.");
    } catch (error) {
      console.error("Home edit failed:", error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTrackCard = (track) => (
    <div
      key={track.id}
      onClick={() => playTrack(track, tracks)}
      className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors group cursor-pointer"
    >
      <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-lg">
        <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
        {user && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openEditor(track);
            }}
            className="absolute left-2 top-2 w-9 h-9 bg-black/70 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-blue-600 transition-all"
            title="Edit track"
          >
            <Edit3 size={17} />
          </button>
        )}
        <div className="absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Play size={24} fill="currentColor" className="ml-1" />
        </div>
      </div>
      <h3 className="font-bold text-white truncate mb-1">{track.title}</h3>
      <p className="text-sm text-slate-400 truncate">{track.artist}</p>
    </div>
  );

  return (
    <div className="pb-10 px-6 pt-4">
      <div className="relative bg-gradient-to-b from-purple-900/80 to-[#121212] rounded-t-3xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-left mb-10 transition-all hover:bg-purple-900/90 group">
        <div className="flex-1">
          <p className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Welcome to</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">MomoMusicQ</h1>
          <p className="text-white/70 text-lg font-bold mb-8 max-w-2xl mx-auto md:mx-0">
            AI-created music studio for quick inspiration and discovery.
            <br />
            Explore tracks, build playlists, and enjoy fresh releases.
          </p>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Popular Tracks</h2>
          <span className="text-sm font-bold text-slate-400 hover:underline cursor-pointer" onClick={() => navigate('/tracks')}>View all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tracks.slice(0, 5).map(renderTrackCard)}
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">New Releases</h2>
          <span className="text-sm font-bold text-slate-400 hover:underline cursor-pointer" onClick={() => navigate('/tracks')}>View all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tracks.slice(0, 5).reverse().map(renderTrackCard)}
        </div>
      </div>

      {editingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <form onSubmit={saveTrack} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Edit Track</h2>
              <button type="button" onClick={closeEditor} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Title</label>
                <input required value={editForm.title} onChange={(event) => updateField("title", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Artist</label>
                <input value={editForm.artist} onChange={(event) => updateField("artist", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Genre</label>
                <input value={editForm.genre} onChange={(event) => updateField("genre", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Duration</label>
                <input value={editForm.duration} onChange={(event) => updateField("duration", event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Replace audio</label>
                <input type="file" accept="audio/*" onChange={(event) => setEditMusicFile(event.target.files[0] || null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-slate-200 hover:file:bg-white/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Replace cover</label>
                <input type="file" accept="image/*" onChange={(event) => setEditCoverFile(event.target.files[0] || null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-slate-200 hover:file:bg-white/20" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-400">Lyrics</label>
                <textarea rows="4" value={editForm.lyrics} onChange={(event) => updateField("lyrics", event.target.value)} className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-400">SRT</label>
                <textarea rows="5" value={editForm.lyricsSrt} onChange={(event) => updateField("lyricsSrt", event.target.value)} className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-white outline-none focus:border-blue-400" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={closeEditor} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold text-slate-300 hover:border-white/30 hover:text-white">
                <X size={18} /> Cancel
              </button>
              <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-60">
                {isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
