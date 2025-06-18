// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy loaded components
const Layout = lazy(() => import('./layout/Layout.jsx'));
const Dashboard = lazy(() => import('./Pages/Dashboard.jsx'));
const MyIssues = lazy(() => import('./Pages/MyIssues.jsx'));
const Inbox = lazy(() => import('./Pages/Inbox.jsx'));
const Projects = lazy(() => import('./Pages/Projects.jsx'));
const ProjectDetails = lazy(() => import('./Pages/ProjectDetails.jsx'));
const Initiatives = lazy(() => import('./Pages/Initiatives.jsx'));
const Cycles = lazy(() => import('./Pages/Cycle.jsx'));
const Timeline = lazy(() => import('./Pages/Timeline.jsx'));
const Pulse = lazy(() => import('./Pages/Pulse.jsx'));
const Team = lazy(() => import('./Pages/Team.jsx'));
const MemberProfile = lazy(() => import('./Pages/MemberProfile.jsx'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/my-issues" element={<MyIssues />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/detail" element={<ProjectDetails />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/cycles" element={<Cycles />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/pulse" element={<Pulse />} />
            <Route path="/team" element={<Team />} />
            <Route path="/member-profile" element={<MemberProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
