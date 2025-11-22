import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './context/MusicContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Tracks from './pages/Tracks';
import About from './pages/About';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LikedSongs from './pages/LikedSongs';
import LibraryPage from './pages/Library';
import Charts from './pages/Charts';
import NewReleases from './pages/NewReleases';
import Genres from './pages/Genres';
import Artists from './pages/Artists';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <MusicProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="tracks" element={<Tracks />} />
            <Route path="about" element={<About />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="charts" element={<Charts />} />
            <Route path="new-releases" element={<NewReleases />} />
            <Route path="genres" element={<Genres />} />
            <Route path="artists" element={<Artists />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="admin" element={<Admin />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="liked" element={<LikedSongs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MusicProvider>
  );
}