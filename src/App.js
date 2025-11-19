import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Disc, Music, Heart, Share2, Menu, X, Mic2 } from 'lucide-react';

/**
 * [친구야, 여기를 잘 봐!]
 * 실제로 네가 만든 Suno AI 음악을 넣으려면 아래 순서를 따르면 돼.
 * * 1. 프로젝트 폴더 안에 'public'이라는 폴더가 있는지 확인해 (없으면 만들어).
 * 2. 'public' 폴더 안에 'music' 폴더를 만들고, 거기에 mp3 파일들을 넣어.
 * 예: public/music/neon_night.mp3
 * 3. 아래 INITIAL_TRACKS 데이터에서 audioSrc 부분을 파일 경로로 바꿔주면 돼.
 * 예: audioSrc: "/music/neon_night.mp3"
 */

const INITIAL_TRACKS = [
  {
    id: 1,
    title: "네온 사인의 밤 (Neon Night)",
    artist: "모모 (Momo)",
    genre: "City Pop / K-Pop",
    duration: "3:24",
    cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&auto=format&fit=crop",
    color: "from-pink-500 to-purple-600",
    // [중요] 여기에 실제 mp3 파일 경로를 넣는 거야! 지금은 예시 파일이야.
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
    lyrics: [
      "차가운 도시의 불빛이 켜지고",
      "네온 사인 아래 춤추는 그림자",
      "오늘도 난 너를 찾아 헤매이네",
      "Just waiting for the night...",
      "(간주)",
      "스쳐가는 사람들 속에",
      "너의 향기가 남아있어",
      "다시 돌아올 수 없는 그 밤처럼",
      "We keep dancing in the dark"
    ]
  },
  {
    id: 2,
    title: "새벽 감성 (Dawn Vibes)",
    artist: "모모 (Momo)",
    genre: "R&B / Soul",
    duration: "2:45",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop",
    color: "from-blue-500 to-cyan-400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    lyrics: [
      "모두가 잠든 이 새벽에",
      "홀로 깨어 커피를 내려",
      "창밖은 아직 푸르스름해",
      "너와 걷던 그 길 위로",
      "별빛만 소리 없이 쏟아지네",
      "I miss you every dawn",
      "기억은 시간을 넘어",
      "다시 나를 찾아와"
    ]
  },
  {
    id: 3,
    title: "달리고 싶어 (Run away)",
    artist: "모모 (Momo)",
    genre: "Synthwave",
    duration: "3:10",
    cover: "https://images.unsplash.com/photo-1514525253440-b39345208668?q=80&w=400&auto=format&fit=crop",
    color: "from-emerald-400 to-teal-600",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    lyrics: [
      "엔진 소리가 심장을 울려",
      "끝없는 도로 위를 달려가",
      "뒤돌아보지 마, 후회는 없어",
      "Run away, run away now!",
      "미래는 우리 손안에 있어",
      "속도를 더 높여봐",
      "저 지평선 너머까지"
    ]
  },
  {
    id: 4,
    title: "커피 한 잔 (Coffee Break)",
    artist: "모모 (Momo)",
    genre: "Acoustic / Jazz",
    duration: "2:15",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=400&auto=format&fit=crop",
    color: "from-orange-400 to-amber-600",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    lyrics: [
      "나른한 오후 햇살 아래",
      "따뜻한 라떼 한 잔 어때요",
      "복잡한 생각은 잠시 접어두고",
      "그냥 멍하니 있어도 좋아",
      "Life is simpler than you think",
      "Just take a break with me"
    ]
  }
];

export default function MomoMusicQ() {
  const [currentTrack, setCurrentTrack] = useState(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [volume, setVolume] = useState(0.5); // 볼륨 상태 추가 (0.0 ~ 1.0)
  
  // 실제 오디오 태그를 제어하기 위한 Ref
  const audioRef = useRef(null);

  // 트랙이 바뀌면 오디오 소스를 바꾸고 재생할지 결정
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.audioSrc;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("재생 오류:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack]);

  // 재생/일시정지 상태가 바뀌면 오디오 제어
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("재생 오류:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // 오디오 이벤트 리스너 (시간 업데이트, 곡 끝남 등)
  const onTimeUpdate = () => {
    if (audioRef.current) {
      const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percent || 0);

      // 가사 싱크 (단순히 진행률에 따라 n분의 1로 매칭)
      if (currentTrack.lyrics) {
        const totalLines = currentTrack.lyrics.length;
        const lineIndex = Math.floor((percent / 100) * totalLines);
        setActiveLyricIndex(Math.min(lineIndex, totalLines - 1));
      }
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const playTrack = (track) => {
    // 같은 곡을 누르면 일시정지/재생 토글
    if (currentTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      // 다른 곡을 누르면 바로 재생
      setCurrentTrack(track);
      setIsPlaying(true);
      setShowLyrics(true);
    }
  };

  // 진행 바 클릭 시 이동 (Seeking)
  const handleProgressBarClick = (e) => {
    if (!audioRef.current) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500 selection:text-white pb-24">
      {/* 숨겨진 오디오 태그 (핵심!) */}
      <audio 
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onError={() => console.log("오디오 로드 실패")}
      />

      {/* 네비게이션 바 */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Music size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                모모뮤직<span className="text-purple-400">Q</span>
              </span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <a href="#" className="hover:text-purple-400 text-sm font-bold transition-colors">HOME</a>
                <a href="#all-tracks" className="hover:text-purple-400 text-sm font-bold transition-colors">TRACKS</a>
                <a href="#about" className="hover:text-purple-400 text-sm font-bold transition-colors">CREATOR</a>
              </div>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">Home</a>
              <a href="#all-tracks" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">Tracks</a>
              <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">About</a>
            </div>
          </div>
        )}
      </nav>

      {/* 메인 콘텐츠 영역 (가사창이 열리면 레이아웃 조정) */}
      <div className="flex max-w-7xl mx-auto pt-16">
        
        {/* 왼쪽 메인 콘텐츠 */}
        <div className={`flex-1 transition-all duration-500 ${showLyrics ? 'lg:mr-80' : ''}`}>
          
          {/* 히어로 섹션 */}
          <div className="relative pt-20 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
            <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
              <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
              <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse animation-delay-2000"></div>
            </div>

            <div className="relative z-10 px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                Now Playing Live
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                <span className="block text-white">일상의 BGM,</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  모모뮤직Q
                </span>
              </h1>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto mb-8">
                취미로 시작했지만 진심을 담았습니다.<br />
                AI와 함께 빚어낸 세상에 하나뿐인 멜로디를 즐겨보세요.
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => playTrack(INITIAL_TRACKS[0])}
                  className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <Play size={20} fill="currentColor" /> 전체 재생
                </button>
              </div>
            </div>
          </div>

          {/* 트랙 리스트 섹션 */}
          <div id="all-tracks" className="px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Disc className="text-purple-400" /> Tracks
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INITIAL_TRACKS.map((track) => (
                <div 
                  key={track.id}
                  className={`group relative bg-slate-900/50 rounded-xl p-4 border border-slate-800 hover:border-purple-500/50 transition-all hover:-translate-y-1 cursor-pointer ${currentTrack.id === track.id ? 'bg-slate-800 border-purple-500/30' : ''}`}
                  onClick={() => playTrack(track)}
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${currentTrack.id === track.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {currentTrack.id === track.id && isPlaying ? <div className="animate-bounce"><div className="w-1 h-4 bg-white mx-0.5 inline-block"></div><div className="w-1 h-6 bg-white mx-0.5 inline-block"></div><div className="w-1 h-3 bg-white mx-0.5 inline-block"></div></div> : <Play size={24} className="text-white" fill="currentColor" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg truncate ${currentTrack.id === track.id ? 'text-purple-400' : 'text-white group-hover:text-purple-300'}`}>{track.title}</h3>
                      <p className="text-slate-400 text-sm truncate">{track.artist}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{track.genre}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {track.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About 섹션 */}
          <div id="about" className="px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800 mt-10">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-center border border-slate-800 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-6 border-2 border-purple-500/30">
                  <Music size={32} className="text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold mb-4">취미로 하는 AI 작곡가 <span className="text-purple-400">모모</span></h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                  "모모뮤직Q"는 AI 기술인 Suno를 활용해 상상 속의 멜로디를 현실로 만드는 공간입니다.<br />
                  전문가는 아니지만, 제가 느끼는 감정과 이야기를 음악에 담아내고 있어요.<br />
                  편안하게 들으시고 마음에 드는 곡이 있다면 언제든 즐겨주세요!
                </p>
               </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 가사 패널 (PC 버전) */}
        <div className={`fixed right-0 top-16 bottom-24 w-80 bg-slate-900/95 border-l border-slate-800 backdrop-blur-xl transform transition-transform duration-300 z-30 ${showLyrics ? 'translate-x-0' : 'translate-x-full'} hidden lg:block`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-purple-400">
                <Mic2 size={18} /> 가사 (Lyrics)
              </h3>
              <button onClick={() => setShowLyrics(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            {/* 가사 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 text-center py-4">
              {currentTrack.lyrics ? (
                currentTrack.lyrics.map((line, index) => (
                  <p 
                    key={index} 
                    className={`transition-all duration-300 leading-relaxed ${
                      index === activeLyricIndex 
                        ? 'text-white font-bold text-lg scale-105 drop-shadow-md' 
                        : 'text-slate-600 text-sm'
                    }`}
                  >
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-slate-600 mt-10">등록된 가사가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 모바일용 가사 오버레이 */}
      {showLyrics && (
        <div className="fixed inset-0 top-16 z-40 bg-slate-950/95 backdrop-blur-lg lg:hidden flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src={currentTrack.cover} className="w-10 h-10 rounded-md" alt="mini-cover"/>
              <div>
                <h3 className="font-bold">{currentTrack.title}</h3>
                <p className="text-xs text-slate-400">{currentTrack.artist}</p>
              </div>
            </div>
            <button onClick={() => setShowLyrics(false)} className="p-2 bg-slate-800 rounded-full">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto text-center space-y-6 py-4">
             {currentTrack.lyrics ? (
                currentTrack.lyrics.map((line, index) => (
                  <p 
                    key={index} 
                    className={`transition-all duration-300 ${
                      index === activeLyricIndex 
                        ? 'text-purple-400 font-bold text-xl' 
                        : 'text-slate-600'
                    }`}
                  >
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-slate-500">가사가 없습니다.</p>
              )}
          </div>
          <div className="h-32"></div> {/* 하단 여백 */}
        </div>
      )}

      {/* 하단 고정 플레이어 */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-3 sm:p-4 z-50 pb-safe">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* 현재 곡 정보 */}
          <div className="flex items-center gap-3 w-1/3 min-w-[120px]">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden relative hidden sm:block ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <img src={currentTrack.cover} alt="cover" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden cursor-pointer" onClick={() => setShowLyrics(!showLyrics)}>
              <h4 className="font-bold text-sm sm:text-base truncate text-white hover:text-purple-400 transition-colors">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* 플레이어 컨트롤 */}
          <div className="flex flex-col items-center w-1/3">
            <div className="flex items-center gap-4 sm:gap-6 mb-1">
              <button className="text-slate-400 hover:text-white transition-colors"><SkipBack size={20} /></button>
              <button 
                onClick={handlePlayPause}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>
              <button className="text-slate-400 hover:text-white transition-colors"><SkipForward size={20} /></button>
            </div>
            {/* 진행 바 */}
            <div 
              className="w-full max-w-md h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer group hover:h-2 transition-all"
              onClick={handleProgressBarClick}
            >
              <div 
                className={`h-full bg-gradient-to-r ${currentTrack.color} relative`} 
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"></div>
              </div>
            </div>
          </div>

          {/* 볼륨 및 가사 버튼 */}
          <div className="flex items-center justify-end gap-3 w-1/3">
            <button 
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-2 rounded-full transition-all ${showLyrics ? 'text-purple-400 bg-purple-400/10' : 'text-slate-400 hover:text-white'}`}
              title="가사 보기"
            >
              <Mic2 size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 size={18} className="text-slate-400" />
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-slate-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}