import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Disc, Music, Heart, Share2, Menu, X, Mic2, Upload, Lock, Trash2, Loader, User, Star, LogOut, LogIn } from 'lucide-react';
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
    auth = getAuth(app); // 인증 기능 추가
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
  
  // [보안 업데이트] 로그인 관련 상태
  const [user, setUser] = useState(null); // 현재 로그인한 사용자
  const [showLoginModal, setShowLoginModal] = useState(false); // 로그인 창 보여줄지 여부
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

  // 로그인 상태 감지 (새로고침해도 로그인 유지)
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

  // [보안] 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!auth) {
      alert("Firebase 설정이 필요합니다.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoginModal(false); // 로그인 성공하면 모달 닫기
      setEmail("");
      setPassword("");
      alert("관리자님 환영합니다! 😎");
    } catch (error) {
      console.error("로그인 실패:", error);
      setLoginError("아이디 또는 비밀번호가 틀렸습니다.");
    }
  };

  // [보안] 로그아웃 처리 함수
  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    alert("로그아웃 되었습니다.");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    // [보안] 로그인 안 했으면 업로드 막기
    if (!user) {
      alert("관리자만 업로드할 수 있습니다!");
      return;
    }

    if (!musicFile || !coverFile || !db) {
      alert("파일이 없거나 Firebase 연결이 안 됐어요!");
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

      alert("업로드 성공! 🎉");
      setUploadTitle("");
      setUploadLyrics("");
      setMusicFile(null);
      setCoverFile(null);
      fetchTracks();

    } catch (error) {
      console.error("업로드 에러:", error);
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (trackId) => {
    // [보안] 로그인 안 했으면 삭제 막기
    if (!user) {
      alert("관리자만 삭제할 수 있습니다.");
      return;
    }

    if (!db) return;
    if (window.confirm("정말 삭제할까요?")) {
      try {
        await deleteDoc(doc(db, "tracks", trackId));
        alert("삭제되었습니다.");
        fetchTracks();
      } catch (error) {
        console.error("삭제 실패:", error);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioSrc;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
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
        <div className="text-center animate-pulse">
          <Loader className="animate-spin mx-auto mb-4 text-purple-500" size={40} />
          <p className="text-lg font-bold">모모뮤직Q 연결 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24 selection:bg-purple-500 selection:text-white">
      <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onEnded={() => setIsPlaying(false)} />

      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 animate-pulse">
                <Music size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                모모뮤직<span className="text-purple-400">Q</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-sm font-bold hover:text-purple-400 transition-colors">HOME</button>
              <button onClick={() => scrollToSection('featured')} className="text-sm font-bold hover:text-purple-400 transition-colors">FEATURED</button>
              <button onClick={() => scrollToSection('tracks')} className="text-sm font-bold hover:text-purple-400 transition-colors">TRACKS</button>
              <button onClick={() => scrollToSection('about')} className="text-sm font-bold hover:text-purple-400 transition-colors">ABOUT</button>
              
              {/* 로그인/로그아웃 버튼 */}
              {user ? (
                <div className="flex items-center gap-3">
                   <span className="text-xs text-purple-400 font-bold px-2 py-1 bg-purple-900/30 rounded border border-purple-500/30">ADMIN MODE</span>
                   <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="로그아웃"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)} 
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="관리자 로그인"
                >
                  <Lock size={18} />
                </button>
              )}
            </div>

            <div className="md:hidden">
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                {isMenuOpen ? <X /> : <Menu />}
               </button>
            </div>
          </div>
        </div>
        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-slate-800 rounded-md">Home</button>
              <button onClick={() => scrollToSection('featured')} className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-slate-800 rounded-md">Featured</button>
              <button onClick={() => scrollToSection('tracks')} className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-slate-800 rounded-md">Tracks</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-slate-800 rounded-md">About</button>
              {user ? (
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-slate-800 rounded-md">Logout (Admin)</button>
              ) : (
                <button onClick={() => {setIsMenuOpen(false); setShowLoginModal(true);}} className="block w-full text-left px-3 py-2 text-base font-medium text-purple-400 hover:bg-slate-800 rounded-md">Admin Login</button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="pt-16 min-h-screen">
        
        {/* [로그인 모달] - 로그인이 필요할 때만 뜸 */}
        {showLoginModal && !user && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LogIn className="text-purple-400"/> 관리자 로그인
                </h3>
                <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">이메일</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">비밀번호</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="비밀번호 입력"
                  />
                </div>
                {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
                <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors">
                  로그인
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 로그인 상태면 업로드 폼 보여주기 */}
        {user && (
          <div className="pt-10 px-4 max-w-2xl mx-auto animate-fade-in mb-12">
            <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-400 relative z-10">
                <Upload /> 새 음악 업로드 (관리자 모드)
              </h2>
              <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">곡 제목</label>
                  <input type="text" required value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="예: 네온 사인의 밤" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">음악 (MP3, WAV)</label>
                    <input type="file" accept="audio/*" required onChange={(e) => setMusicFile(e.target.files[0])} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">커버 (이미지)</label>
                    <input type="file" accept="image/*" required onChange={(e) => setCoverFile(e.target.files[0])} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">가사</label>
                  <textarea rows="4" value={uploadLyrics} onChange={(e) => setUploadLyrics(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="가사를 입력하세요. 줄바꿈으로 구분됩니다."></textarea>
                </div>
                <button type="submit" disabled={isUploading} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${isUploading ? 'bg-slate-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-[1.02] transition-all'}`}>
                  {isUploading ? <Loader className="animate-spin" /> : <Upload />}
                  {isUploading ? '업로드 중...' : '음악 등록하기'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 일반 컨텐츠 (히어로 -> Featured -> Tracks -> About) */}
        <div id="home" className="relative pt-20 pb-12 sm:pt-32 sm:pb-16 overflow-hidden px-4 border-b border-slate-800/50">
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
            <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse animation-delay-2000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6 backdrop-blur-sm animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              New Release Available
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
              <span className="block text-white">일상의 BGM,</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                모모뮤직Q
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up delay-200">
              취미로 시작했지만 진심을 담았습니다.<br className="hidden sm:block" />
              AI와 함께 빚어낸 세상에 하나뿐인 멜로디를 즐겨보세요.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in-up delay-300">
              <button 
                onClick={() => {
                  if (tracks.length > 0) {
                    setCurrentTrack(tracks[0]);
                    setIsPlaying(true);
                  } else {
                    alert("재생할 곡이 없어요! 먼저 업로드해주세요.");
                  }
                }}
                className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                <Play size={20} fill="currentColor" /> 전체 재생
              </button>
              <button onClick={() => scrollToSection('about')} className="px-8 py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-full font-bold transition-all border border-slate-700">
                더 알아보기
              </button>
            </div>
          </div>
        </div>

        {/* Featured 섹션 */}
        <div id="featured" className="py-16 bg-slate-900/30 border-b border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <Star className="text-yellow-400" /> Featured Track
              </h2>
            </div>
            {tracks.length > 0 ? (
              <div className="relative bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-800 overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                <div className="w-full md:w-1/3 aspect-square max-w-[300px] relative group cursor-pointer" onClick={() => { setCurrentTrack(tracks[0]); setIsPlaying(true); }}>
                  <img src={tracks[0].cover} alt="featured" className="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Play size={32} fill="currentColor" className="ml-1" />
                      </div>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left z-10">
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30">LATEST RELEASE</div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-2 text-white">{tracks[0].title}</h3>
                  <p className="text-xl text-slate-400 mb-6">{tracks[0].artist}</p>
                  <p className="text-slate-500 leading-relaxed mb-8 max-w-lg">
                    {tracks[0].lyrics && tracks[0].lyrics.length > 0 ? tracks[0].lyrics[0] + "..." : "가사가 등록되지 않았습니다."}
                  </p>
                  <button 
                      onClick={() => { setCurrentTrack(tracks[0]); setIsPlaying(true); }}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-white transition-colors inline-flex items-center gap-2"
                  >
                    <Play size={18} fill="currentColor" /> 지금 듣기
                  </button>
                </div>
              </div>
            ) : (
                <div className="text-center py-10 text-slate-500">아직 등록된 곡이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Tracks 리스트 */}
        <div id="tracks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Disc className="text-purple-400" /> All Tracks
              </h2>
              <span className="text-sm text-slate-500">{tracks.length} songs</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tracks.length > 0 ? (
                tracks.map((track) => (
                  <div 
                    key={track.id}
                    onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                    className={`group flex items-center p-4 rounded-xl cursor-pointer transition-all border ${currentTrack?.id === track.id ? 'bg-slate-800 border-purple-500/50 shadow-lg shadow-purple-500/10' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={track.cover} alt="cover" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${currentTrack?.id === track.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {currentTrack?.id === track.id && isPlaying ? <div className="w-4 h-4 flex gap-1 justify-center items-end pb-1"><div className="w-1 h-3 bg-white animate-bounce"></div><div className="w-1 h-4 bg-white animate-bounce animation-delay-200"></div></div> : <Play size={20} className="text-white" fill="currentColor" />}
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className={`font-bold text-lg truncate ${currentTrack?.id === track.id ? 'text-purple-400' : 'text-white group-hover:text-purple-300 transition-colors'}`}>{track.title}</h3>
                      <p className="text-sm text-slate-400 truncate">{track.artist}</p>
                    </div>
                    <div className="text-xs text-slate-600 px-2 py-1 border border-slate-800 rounded hidden sm:block">{track.genre}</div>
                    {/* [보안] 관리자만 삭제 버튼 보임 */}
                    {user && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(track.id); }}
                        className="ml-2 p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                  <p className="text-xl font-bold text-slate-400 mb-2">등록된 곡이 없어요</p>
                  <p className="text-slate-500 mb-4">관리자 로그인을 통해<br/>첫 번째 곡을 업로드해보세요!</p>
                </div>
              )}
            </div>
          </div>

          {/* 가사창 */}
          <div className="hidden lg:block w-80 relative">
            <div className="sticky top-24 h-[calc(100vh-150px)] bg-slate-900/50 rounded-2xl border border-slate-800 p-6 overflow-y-auto custom-scrollbar">
              <h3 className="font-bold text-purple-400 mb-6 flex justify-center items-center gap-2 sticky top-0 bg-slate-900/95 py-2 -mt-2 backdrop-blur-sm z-10">
                <Mic2 size={16}/> Lyrics
              </h3>
              <div className="text-center space-y-4 pb-4">
                {currentTrack?.lyrics ? (
                  currentTrack.lyrics.map((line, i) => (
                    <p key={i} className="text-slate-300 text-sm leading-relaxed hover:text-white transition-colors">{line}</p>
                  ))
                ) : (
                  <div className="text-slate-600 text-sm flex flex-col items-center justify-center h-40">
                    <Music size={24} className="mb-2 opacity-20"/>
                    <p>가사가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About 섹션 */}
        <div id="about" className="bg-slate-900/50 py-20 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20">
                <User size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-6">About Creator</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              안녕하세요! 저는 AI 기술과 음악적 상상력을 결합하여 새로운 사운드를 만드는 <span className="text-purple-400 font-bold">모모</span>입니다.<br />
              Suno AI를 활용해 K-Pop부터 Lo-Fi, Synthwave까지 다양한 장르를 실험하고 있습니다.<br />
              제 음악이 여러분의 일상에 작은 영감이 되기를 바랍니다.
            </p>
            <div className="flex justify-center gap-6">
              <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 text-center w-40 hover:-translate-y-1 transition-transform duration-300">
                <div className="text-3xl font-bold text-purple-400 mb-1">{tracks.length}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Tracks Created</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 text-center w-40 hover:-translate-y-1 transition-transform duration-300">
                <div className="text-3xl font-bold text-cyan-400 mb-1">∞</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Listeners</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 플레이어 */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-3 sm:p-4 z-50 pb-safe">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-1/3 min-w-[120px]">
              <img src={currentTrack.cover} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover hidden sm:block shadow-md" alt="cover" />
              <div className="overflow-hidden cursor-pointer" onClick={() => setShowLyrics(true)}>
                <h4 className="font-bold text-sm sm:text-base truncate text-white hover:text-purple-400 transition-colors">{currentTrack.title}</h4>
                <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <div className="flex items-center gap-4 sm:gap-6 mb-1">
                <button className="text-slate-400 hover:text-white transition-colors"><SkipBack size={20}/></button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1"/>}
                </button>
                <button className="text-slate-400 hover:text-white transition-colors"><SkipForward size={20}/></button>
              </div>
              <div className="w-full max-w-md h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer group">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 relative" style={{width: `${progress}%`}}>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end w-1/3 gap-3">
              <button onClick={() => setShowLyrics(!showLyrics)} className="lg:hidden text-slate-400 hover:text-purple-400 p-2"><Mic2 size={20}/></button>
              <button className="hidden sm:block text-slate-400 hover:text-pink-400 p-2"><Heart size={20}/></button>
            </div>
          </div>
        </div>
      )}
      
      {/* 모바일 가사 오버레이 */}
      {showLyrics && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg z-50 flex flex-col p-6 lg:hidden animate-fade-in">
          <div className="flex justify-end mb-6">
            <button onClick={() => setShowLyrics(false)} className="p-2 bg-slate-800 rounded-full text-white"><X size={24}/></button>
          </div>
          <div className="text-center mb-6">
             <h3 className="text-xl font-bold text-white mb-1">{currentTrack?.title}</h3>
             <p className="text-slate-400">{currentTrack?.artist}</p>
          </div>
          <div className="flex-1 overflow-y-auto text-center space-y-6 pb-10">
             {currentTrack?.lyrics ? (
               currentTrack.lyrics.map((line, i) => <p key={i} className="text-lg text-slate-300 font-medium leading-relaxed">{line}</p>)
             ) : <p className="text-slate-500">가사가 없습니다.</p>}
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
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; transform: translateY(20px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { bg: #334155; border-radius: 4px; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}

// 샘플 데이터
const SAMPLE_TRACKS = [
  { 
    id: '1', 
    title: "샘플: 네온 사인의 밤", 
    artist: "모모 (Momo)", 
    cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400", 
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
    lyrics: ["키를 입력하면", "진짜 노래를", "올릴 수 있어요!"] 
  }
];