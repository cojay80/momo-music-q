import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Disc, Music, Heart, Menu, X, Mic2, Upload, Lock, Trash2, Loader, User, Star, LogOut, LogIn, ChevronRight } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// ------------------------------------------------------------------
// [중요!] 여기에 아까 복사한 너의 Firebase 키를 붙여넣으세요!
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyChLvuNKfte-6fPJxXX1Ch0czwF20AUnHA",
  authDomain: "momo-music-db.firebaseapp.com",
  projectId: "momo-music-db",
  storageBucket: "momo-music-db.firebasestorage.app",
  messagingSenderId: "523987636658",
  appId: "1:523987636658:web:7c503b3066571bb10494ab"
};

// Firebase 초기화
let db, storage, auth;
try {
  if (firebaseConfig.apiKey !== "여기에_apiKey_붙여넣기") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  }
} catch (e) {
  console.error("Firebase 초기화 에러:", e);
}

export default function MomoMusicQ() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // 로그인 관련 상태
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 업로드 관련 상태
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("모모 (Momo)");
  const [uploadGenre, setUploadGenre] = useState("K-Pop");
  const [uploadLyrics, setUploadLyrics] = useState("");
  const [musicFile, setMusicFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setIsInitialLoading(true);
    if (!db) {
      setTracks(SAMPLE_TRACKS);
      setCurrentTrack(SAMPLE_TRACKS[0]);
      setIsInitialLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "tracks"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const loadedTracks = [];
      querySnapshot.forEach((doc) => {
        loadedTracks.push({ id: doc.id, ...doc.data() });
      });

      if (loadedTracks.length > 0) {
        setTracks(loadedTracks);
        if (!currentTrack) setCurrentTrack(loadedTracks[0]);
      } else {
        setTracks([]);
        setCurrentTrack(null);
      }
    } catch (error) {
      console.error("데이터 에러:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoginModal(false);
      setEmail("");
      setPassword("");
      // alert("관리자 접속 완료"); // 알림창 제거 (고급스럽게)
    } catch (error) {
      setLoginError("아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
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
      fetchTracks();
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("업로드 에러:", error);
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (trackId) => {
    if (!user || !db) return;
    if (window.confirm("정말 삭제하시겠습니까? (복구 불가)")) {
      try {
        await deleteDoc(doc(db, "tracks", trackId));
        fetchTracks();
      } catch (error) {
        console.error("삭제 실패:", error);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioSrc;
      if (isPlaying) audioRef.current.play().catch(() => { });
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play().catch(() => { }) : audioRef.current.pause();
    }
  }, [isPlaying]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percent || 0);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin text-purple-500 mb-4" size={40} />
          <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24 selection:bg-purple-500 selection:text-white overflow-x-hidden">
      <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onEnded={() => setIsPlaying(false)} />

      {/* --- [배경 애니메이션 효과] --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-pink-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* --- [네비게이션 바] --- */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* 로고 */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity blur-[2px]"></div>
                <div className="relative w-full h-full bg-slate-900/50 rounded-xl flex items-center justify-center border border-white/10">
                  <Music size={20} className="text-white" />
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-purple-200 transition-colors">
                모모뮤직<span className="text-purple-500">Q</span>
              </span>
            </div>

            {/* PC 메뉴 */}
            <div className="hidden md:flex items-center gap-1">
              {['HOME', 'FEATURED', 'TRACKS', 'ABOUT'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                  {item}
                </button>
              ))}

              <div className="w-px h-6 bg-white/10 mx-4"></div>

              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-purple-400 px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20 tracking-wider">ADMIN</span>
                  <button onClick={handleLogout} className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="로그아웃"><LogOut size={18} /></button>
                </div>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Lock size={18} /></button>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden flex items-center gap-2">
              {user ? (
                <button onClick={handleLogout} className="p-2 text-purple-400 bg-purple-500/10 rounded-full"><LogOut size={20} /></button>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="p-2 text-slate-400 hover:text-white"><Lock size={20} /></button>
              )}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 animate-fade-in">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {['HOME', 'FEATURED', 'TRACKS', 'ABOUT'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left px-4 py-3 text-lg font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="pt-20 min-h-screen relative z-10">

        {/* --- [로그인 모달] --- */}
        {showLoginModal && !user && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><LogIn className="text-purple-400" size={24} /> Admin Login</h3>
                <button onClick={() => setShowLoginModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
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
        )}

        {/* --- [업로드 폼 (관리자 전용)] --- */}
        {user && (
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
        )}

        {/* --- [HOME: 히어로 섹션] --- */}
        <div id="home" className="relative pt-16 pb-20 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-bold mb-8 backdrop-blur-md animate-fade-in-up">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span></span>
            AI GENERATED MUSIC STUDIO
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight animate-fade-in-up delay-100 drop-shadow-2xl">
            <span className="block text-white mb-2">Imagination to</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Melody.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            AI와 감성의 만남, <strong className="text-white">모모뮤직Q</strong>에 오신 것을 환영합니다.<br className="hidden sm:block" />
            일상의 모든 순간을 위한 플레이리스트가 여기 있습니다.
          </p>
          <div className="flex justify-center gap-4 animate-fade-in-up delay-300">
            <button onClick={() => tracks.length > 0 ? (setCurrentTrack(tracks[0]), setIsPlaying(true)) : alert("곡이 없습니다.")} className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold shadow-xl shadow-purple-500/20 flex items-center gap-2 hover:scale-105 transition-transform">
              <Play size={20} fill="currentColor" /> 전체 재생
            </button>
            <button onClick={() => scrollToSection('tracks')} className="px-8 py-4 bg-slate-800/50 border border-white/10 backdrop-blur-md text-white rounded-full font-bold hover:bg-white/10 transition-all">
              트랙 보기
            </button>
          </div>
        </div>

        {/* --- [FEATURED 섹션] --- */}
        <div id="featured" className="py-20 bg-black/20 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-yellow-500/20 rounded-lg"><Star className="text-yellow-400" size={24} /></div>
              <h2 className="text-2xl font-bold text-white">Featured Track</h2>
            </div>

            {tracks.length > 0 ? (
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-3xl p-6 sm:p-10 border border-white/10 overflow-hidden flex flex-col md:flex-row gap-10 items-center shadow-2xl group">
                {/* 배경 효과 */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] -mr-20 -mt-20 transition-opacity group-hover:opacity-70"></div>

                <div className="w-full md:w-80 aspect-square relative flex-shrink-0 cursor-pointer transform transition-transform duration-500 hover:scale-[1.02]" onClick={() => { setCurrentTrack(tracks[0]); setIsPlaying(true); }}>
                  <img src={tracks[0].cover} alt="featured" className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/5" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                      <Play size={32} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left relative z-10">
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30 tracking-wider">NEW RELEASE</div>
                  <h3 className="text-3xl sm:text-5xl font-bold mb-4 text-white leading-tight">{tracks[0].title}</h3>
                  <p className="text-xl text-slate-400 mb-8 font-medium flex items-center justify-center md:justify-start gap-2">
                    <User size={20} /> {tracks[0].artist}
                  </p>
                  <button onClick={() => { setCurrentTrack(tracks[0]); setIsPlaying(true); }} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 mx-auto md:mx-0">
                    <Play size={20} fill="currentColor" /> 지금 듣기
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500">등록된 곡이 없습니다.</div>
            )}
          </div>
        </div>

        {/* --- [TRACKS 리스트] --- */}
        <div id="tracks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg"><Disc className="text-purple-400" size={24} /></div>
                All Tracks <span className="text-slate-500 text-lg font-normal ml-2">{tracks.length} songs</span>
              </h2>
            </div>

            <div className="space-y-3">
              {tracks.length > 0 ? tracks.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                  className={`group flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${currentTrack?.id === track.id ? 'bg-white/10 border-purple-500/50 shadow-lg' : 'bg-slate-900/40 border-transparent hover:bg-white/5 hover:border-white/10'}`}
                >
                  <div className="w-8 text-center text-slate-500 font-bold text-sm mr-4 group-hover:text-purple-400">
                    {currentTrack?.id === track.id && isPlaying ? <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse mx-auto"></div> : index + 1}
                  </div>

                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={track.cover} className="w-full h-full object-cover" alt="cover" />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${currentTrack?.id === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <Play size={20} fill="currentColor" className="text-white" />
                    </div>
                  </div>

                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className={`font-bold text-lg truncate ${currentTrack?.id === track.id ? 'text-purple-400' : 'text-white group-hover:text-purple-200'}`}>{track.title}</h3>
                    <p className="text-sm text-slate-400 truncate">{track.artist}</p>
                  </div>

                  <div className="hidden sm:block text-sm text-slate-500 font-medium px-4">{track.genre}</div>

                  {user && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(track.id); }}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="ml-2 text-slate-600 group-hover:text-white"><ChevronRight size={20} /></div>
                </div>
              )) : (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500">
                  <Music size={40} className="mx-auto mb-4 opacity-20" />
                  <p>아직 등록된 곡이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- [ABOUT 섹션] --- */}
        <div id="about" className="relative py-24 border-t border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/50"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-purple-600/20 p-1">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-transparent">
                <User size={40} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-white">Created by Momo</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
              "상상하는 모든 것이 음악이 되는 곳"<br />
              AI 기술을 활용해 일상에 특별한 BGM을 선물합니다.
            </p>
            <div className="flex justify-center gap-4 sm:gap-8">
              <div className="px-8 py-6 rounded-2xl bg-slate-800/50 border border-white/5 backdrop-blur-sm w-40">
                <div className="text-3xl font-bold text-white mb-1">{tracks.length}</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tracks</div>
              </div>
              <div className="px-8 py-6 rounded-2xl bg-slate-800/50 border border-white/5 backdrop-blur-sm w-40">
                <div className="text-3xl font-bold text-white mb-1">∞</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Listeners</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- [하단 고정 플레이어] --- */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 p-3 pb-safe z-50 transition-transform duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-1/3 min-w-[120px] cursor-pointer group" onClick={() => setShowLyrics(true)}>
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-lg">
                <img src={currentTrack.cover} className="w-full h-full object-cover" alt="cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <ChevronRight size={16} className="text-white opacity-0 group-hover:opacity-100 transform -rotate-90" />
                </div>
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm sm:text-base truncate text-white group-hover:text-purple-400 transition-colors">{currentTrack.title}</h4>
                <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="flex flex-col items-center w-1/3">
              <div className="flex items-center gap-6">
                <button className="text-slate-400 hover:text-white transition-colors hidden sm:block"><SkipBack size={20} /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-lg shadow-white/20">
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                <button className="text-slate-400 hover:text-white transition-colors hidden sm:block"><SkipForward size={20} /></button>
              </div>
            </div>

            <div className="flex justify-end w-1/3 gap-4">
              <button onClick={() => setShowLyrics(!showLyrics)} className={`p-2 rounded-full transition-colors ${showLyrics ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 hover:text-white'}`}><Mic2 size={20} /></button>
              <div className="hidden sm:block w-24 h-1 bg-slate-800 rounded-full self-center overflow-hidden">
                <div className="h-full bg-slate-500 w-2/3"></div>
              </div>
            </div>
          </div>
          {/* 진행 바 */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-slate-800 group cursor-pointer">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform scale-150"></div>
            </div>
          </div>
        </div>
      )}

      {/* --- [가사 전체화면 오버레이] --- */}
      {showLyrics && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[60] flex flex-col animate-fade-in">
          <div className="p-6 flex justify-end">
            <button onClick={() => setShowLyrics(false)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24} /></button>
          </div>
          <div className="flex-1 flex flex-col items-center px-6 pb-32 overflow-y-auto text-center">
            <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl mb-8 flex-shrink-0 border border-white/10">
              <img src={currentTrack?.cover} className="w-full h-full object-cover" alt="cover" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{currentTrack?.title}</h2>
            <p className="text-lg text-purple-400 mb-10">{currentTrack?.artist}</p>

            <div className="space-y-6">
              {currentTrack?.lyrics ? currentTrack.lyrics.map((l, i) => (
                <p key={i} className="text-xl sm:text-2xl font-medium text-slate-400 hover:text-white transition-colors cursor-default leading-relaxed">{l}</p>
              )) : <p className="text-slate-500">등록된 가사가 없습니다.</p>}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; opacity: 0; transform: translateY(30px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}

const SAMPLE_TRACKS = [{ id: '1', title: "샘플", artist: "모모", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400", audioSrc: "", lyrics: ["가사"] }];