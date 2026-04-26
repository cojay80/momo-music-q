import React, { useState } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from '../services/firebase';
import { useMusic } from '../context/MusicContext';
import { LogIn, Upload, Music, Disc, Loader, Edit3, Save, X, Trash2 } from 'lucide-react';
import { parseSRT } from '../services/srtParser';

const parseLRC = (lrcString) => {
    const lines = lrcString.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

    lines.forEach(line => {
        const match = timeRegex.exec(line);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3] || 0);
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
    const lyricsIsSrt = /-->/i.test(srtText || lyricsText);
    const lyricsIsLRC = /\[\d{2}:\d{2}/.test(lyricsText);
    if (lyricsIsSrt) return parseSRT(srtText || lyricsText);
    if (lyricsIsLRC) return parseLRC(lyricsText);
    return lyricsText.split('\n').filter(line => line.trim() !== "");
};

const lyricsToText = (lyrics) => {
    if (!Array.isArray(lyrics)) return "";
    return lyrics.map((line) => {
        if (typeof line === 'string') return line;
        return line?.text || "";
    }).filter(Boolean).join('\n');
};

export default function Admin() {
    const { user, tracks, fetchTracks, updateTrack, handleDeleteTrack } = useMusic();

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    // Upload State
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadArtist] = useState("Momo");
    const [uploadGenre] = useState("K-Pop");
    const [uploadLyrics, setUploadLyrics] = useState("");
    const [uploadSrt, setUploadSrt] = useState("");
    const [musicFile, setMusicFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [editingTrackId, setEditingTrackId] = useState("");
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        if (!auth) return;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setEmail("");
            setPassword("");
        } catch (error) {
            setLoginError("Invalid email or password.");
        }
    };

    const handlePasswordReset = async () => {
        setLoginError("");
        if (!auth) return;
        if (!email) {
            setLoginError("비밀번호를 재설정할 이메일을 먼저 입력하세요.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setLoginError("비밀번호 재설정 메일을 보냈습니다. 받은 편지함을 확인하세요.");
        } catch (error) {
            setLoginError(`재설정 메일 전송 실패: ${error.message}`);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!musicFile || !coverFile || !db) {
            alert("Please select both audio and cover files.");
            return;
        }

        setIsUploading(true);
        try {
            const musicRef = ref(storage, `music/${Date.now()}_${musicFile.name}`);
            await uploadBytes(musicRef, musicFile);
            const musicUrl = await getDownloadURL(musicRef);

            const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
            await uploadBytes(coverRef, coverFile);
            const coverUrl = await getDownloadURL(coverRef);

            const lyricsData = parseLyricsInput(uploadLyrics, uploadSrt);

            await addDoc(collection(db, "tracks"), {
                title: uploadTitle,
                artist: uploadArtist,
                genre: uploadGenre,
                duration: "AI Generated",
                cover: coverUrl,
                audioSrc: musicUrl,
                lyrics: lyricsData,
                lyricsSrt: uploadSrt || (/-->/i.test(uploadLyrics) ? uploadLyrics : ""),
                color: "from-purple-500 to-blue-500",
                createdAt: new Date()
            });

            alert("Upload complete!");
            setUploadTitle("");
            setUploadLyrics("");
            setUploadSrt("");
            setMusicFile(null);
            setCoverFile(null);
            fetchTracks();

        } catch (error) {
            console.error("Upload error:", error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const startEdit = (track) => {
        setEditingTrackId(track.id);
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

    const cancelEdit = () => {
        setEditingTrackId("");
        setEditForm({
            title: "",
            artist: "",
            genre: "",
            duration: "",
            lyrics: "",
            lyricsSrt: ""
        });
        setEditMusicFile(null);
        setEditCoverFile(null);
    };

    const handleEditChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user || !editingTrackId || !db || !storage) return;

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

            await updateTrack(editingTrackId, updates);
            alert("Track updated.");
            cancelEdit();
        } catch (error) {
            console.error("Update error:", error);
            alert(`Update failed: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] px-4">
                <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><LogIn className="text-purple-400" size={24} /> Admin Login</h3>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" placeholder="admin@momo.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" placeholder="Password" />
                        </div>
                        {loginError && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">{loginError}</p>}
                        <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/50 transition-all transform hover:scale-[1.02]">Log in</button>
                        <button type="button" onClick={handlePasswordReset} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-slate-300 transition-all">비밀번호 재설정 메일 보내기</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-8 px-4 max-w-4xl mx-auto animate-fade-in mb-12 space-y-8">
            <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white relative z-10">
                    <div className="p-2 bg-purple-500/20 rounded-lg"><Upload size={24} className="text-purple-400" /></div>
                    Upload Track
                </h2>

                <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">Title</label>
                        <input type="text" required value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors" placeholder="Track title" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group relative">
                            <label className="text-sm font-medium text-slate-400 mb-2 block group-hover:text-purple-400 transition-colors">Audio file (MP3/WAV)</label>
                            <div className="relative overflow-hidden rounded-xl bg-slate-950/50 border border-slate-700 group-hover:border-purple-500/50 transition-colors">
                                <input type="file" accept="audio/*" required onChange={(e) => setMusicFile(e.target.files[0])} className="relative z-10 w-full h-full opacity-0 cursor-pointer py-8" />
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
                                    {musicFile ? <span className="text-purple-400 font-bold">{musicFile.name}</span> : <span className="flex items-center gap-2"><Music size={16} /> Select audio</span>}
                                </div>
                            </div>
                        </div>
                        <div className="group relative">
                            <label className="text-sm font-medium text-slate-400 mb-2 block group-hover:text-purple-400 transition-colors">Cover image</label>
                            <div className="relative overflow-hidden rounded-xl bg-slate-950/50 border border-slate-700 group-hover:border-purple-500/50 transition-colors">
                                <input type="file" accept="image/*" required onChange={(e) => setCoverFile(e.target.files[0])} className="relative z-10 w-full h-full opacity-0 cursor-pointer py-8" />
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
                                    {coverFile ? <span className="text-purple-400 font-bold">{coverFile.name}</span> : <span className="flex items-center gap-2"><Disc size={16} /> Select cover</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">Lyrics</label>
                        <textarea
                            rows="4"
                            value={uploadLyrics}
                            onChange={(e) => setUploadLyrics(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors resize-none"
                            placeholder={"Paste lyrics here (one line per row)\nExample:\n[00:10.50]First line\n[00:20.00]Second line"}
                        ></textarea>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">SRT 자막</label>
                        <textarea
                            rows="6"
                            value={uploadSrt}
                            onChange={(e) => setUploadSrt(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors resize-none font-mono text-sm"
                            placeholder={"Studio에서 만든 SRT를 붙여넣으면 홈페이지와 가라오케에 싱크 자막으로 적용됩니다."}
                        ></textarea>
                    </div>

                    <button type="submit" disabled={isUploading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 text-white transition-all transform hover:scale-[1.01]">
                        {isUploading ? <Loader className="animate-spin" /> : <Upload size={20} />}
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                    <div className="p-2 bg-blue-500/20 rounded-lg"><Edit3 size={24} className="text-blue-300" /></div>
                    Edit Uploaded Tracks
                </h2>

                <div className="space-y-3">
                    {tracks.length > 0 ? tracks.map((track) => (
                        <div key={track.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                            <div className="flex items-center gap-4">
                                <img src={track.cover} alt={track.title} className="h-14 w-14 rounded-xl object-cover bg-slate-800" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-bold text-white">{track.title}</p>
                                    <p className="truncate text-sm text-slate-400">{track.artist} - {track.genre || 'Unknown'}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => startEdit(track)}
                                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                    title="Edit"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteTrack(track.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {editingTrackId === track.id && (
                                <form onSubmit={handleUpdate} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-5">
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-2 block">Title</label>
                                        <input type="text" required value={editForm.title} onChange={(e) => handleEditChange("title", e.target.value)} className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-2 block">Artist</label>
                                        <input type="text" value={editForm.artist} onChange={(e) => handleEditChange("artist", e.target.value)} className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-2 block">Genre</label>
                                        <input type="text" value={editForm.genre} onChange={(e) => handleEditChange("genre", e.target.value)} className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-2 block">Duration</label>
                                        <input type="text" value={editForm.duration} onChange={(e) => handleEditChange("duration", e.target.value)} className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-2 block">Replace audio</label>
                                        <input type="file" accept="audio/*" onChange={(e) => setEditMusicFile(e.target.files[0] || null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-slate-200 hover:file:bg-white/20" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-400 mb-2 block">Replace cover</label>
                                        <input type="file" accept="image/*" onChange={(e) => setEditCoverFile(e.target.files[0] || null)} className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-slate-200 hover:file:bg-white/20" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-sm font-medium text-slate-400 mb-2 block">Lyrics</label>
                                        <textarea rows="4" value={editForm.lyrics} onChange={(e) => handleEditChange("lyrics", e.target.value)} className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-400 outline-none resize-none" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-sm font-medium text-slate-400 mb-2 block">SRT</label>
                                        <textarea rows="5" value={editForm.lyricsSrt} onChange={(e) => handleEditChange("lyricsSrt", e.target.value)} className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-400 outline-none resize-none font-mono text-sm" />
                                    </div>
                                    <div className="sm:col-span-2 flex flex-wrap justify-end gap-3">
                                        <button type="button" onClick={cancelEdit} className="px-4 py-3 border border-white/10 rounded-xl font-bold text-slate-300 hover:text-white hover:border-white/30 flex items-center gap-2">
                                            <X size={18} /> Cancel
                                        </button>
                                        <button type="submit" disabled={isSaving} className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl font-bold text-white flex items-center gap-2">
                                            {isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                            {isSaving ? 'Saving...' : 'Save changes'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )) : (
                        <p className="rounded-2xl border border-dashed border-slate-700 py-10 text-center text-slate-500">No uploaded tracks yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
