// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy loaded components
const Layout = lazy(() => import('./layout/Layout.jsx'));
const Dashboard = lazy(() => import('./Pages/Dashboard.jsx'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            {/* You can add more nested routes here */}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
