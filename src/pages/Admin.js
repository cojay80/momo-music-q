import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from '../services/firebase';
import { useMusic } from '../context/MusicContext';
import { LogIn, Upload, Music, Disc, Loader } from 'lucide-react';

export default function Admin() {
    const { user, fetchTracks } = useMusic();

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    // Upload State
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadArtist, setUploadArtist] = useState("모모 (Momo)");
    const [uploadGenre, setUploadGenre] = useState("K-Pop");
    const [uploadLyrics, setUploadLyrics] = useState("");
    const [musicFile, setMusicFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        if (!auth) return;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setEmail("");
            setPassword("");
        } catch (error) {
            setLoginError("아이디 또는 비밀번호를 확인해주세요.");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!musicFile || !coverFile || !db) {
            alert("파일이 선택되지 않았습니다.");
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

            const lyricsArray = uploadLyrics.split('\n').filter(line => line.trim() !== "");

            await addDoc(collection(db, "tracks"), {
                title: uploadTitle,
                artist: uploadArtist,
                genre: uploadGenre,
                duration: "AI Generated",
                cover: coverUrl,
                audioSrc: musicUrl,
                lyrics: lyricsArray,
                color: "from-purple-500 to-blue-500",
                createdAt: new Date()
            });

            alert("업로드 완료! 🎉");
            setUploadTitle("");
            setUploadLyrics("");
            setMusicFile(null);
            setCoverFile(null);
            fetchTracks(); // Refresh list

        } catch (error) {
            console.error("업로드 에러:", error);
            alert(`업로드 실패: ${error.message}`);
        } finally {
            setIsUploading(false);
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
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" placeholder="••••••••" />
                        </div>
                        {loginError && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">{loginError}</p>}
                        <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/50 transition-all transform hover:scale-[1.02]">로그인</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-8 px-4 max-w-2xl mx-auto animate-fade-in mb-12">
            <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white relative z-10">
                    <div className="p-2 bg-purple-500/20 rounded-lg"><Upload size={24} className="text-purple-400" /></div>
                    새 음악 등록
                </h2>

                <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">곡 제목</label>
                        <input type="text" required value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors" placeholder="제목을 입력하세요" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group relative">
                            <label className="text-sm font-medium text-slate-400 mb-2 block group-hover:text-purple-400 transition-colors">음악 파일 (MP3/WAV)</label>
                            <div className="relative overflow-hidden rounded-xl bg-slate-950/50 border border-slate-700 group-hover:border-purple-500/50 transition-colors">
                                <input type="file" accept="audio/*" required onChange={(e) => setMusicFile(e.target.files[0])} className="relative z-10 w-full h-full opacity-0 cursor-pointer py-8" />
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
                                    {musicFile ? <span className="text-purple-400 font-bold">{musicFile.name}</span> : <span className="flex items-center gap-2"><Music size={16} /> 파일 선택</span>}
                                </div>
                            </div>
                        </div>
                        <div className="group relative">
                            <label className="text-sm font-medium text-slate-400 mb-2 block group-hover:text-purple-400 transition-colors">커버 이미지</label>
                            <div className="relative overflow-hidden rounded-xl bg-slate-950/50 border border-slate-700 group-hover:border-purple-500/50 transition-colors">
                                <input type="file" accept="image/*" required onChange={(e) => setCoverFile(e.target.files[0])} className="relative z-10 w-full h-full opacity-0 cursor-pointer py-8" />
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
                                    {coverFile ? <span className="text-purple-400 font-bold">{coverFile.name}</span> : <span className="flex items-center gap-2"><Disc size={16} /> 이미지 선택</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">가사</label>
                        <textarea rows="4" value={uploadLyrics} onChange={(e) => setUploadLyrics(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors resize-none" placeholder="가사를 입력하면 싱크에 맞춰 보여줄 수 있어요."></textarea>
                    </div>

                    <button type="submit" disabled={isUploading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 text-white transition-all transform hover:scale-[1.01]">
                        {isUploading ? <Loader className="animate-spin" /> : <Upload size={20} />}
                        {isUploading ? '업로드 진행중...' : '등록 완료'}
                    </button>
                </form>
            </div>
        </div>
    );
}
