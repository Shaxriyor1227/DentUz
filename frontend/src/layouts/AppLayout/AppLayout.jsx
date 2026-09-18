import React, { useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import TopBar from '../../components/TopBar/TopBar';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { useSidebar } from '../../context/SidebarContext';
import styles from './AppLayout.module.css';

// Dynamically inject Material Symbols font only for authenticated app routes.
// This prevents the 321KB font from being downloaded on the public homepage.
function useMaterialSymbols() {
  useEffect(() => {
    const FONT_ID = 'material-symbols-stylesheet';
    if (document.getElementById(FONT_ID)) return; // already loaded

    const link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block';
    document.head.appendChild(link);
  }, []);
}

function InnerPageFallback() {
  return (
    <div style={{ padding: '8px 0', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <SkeletonLoader type="card" height="90px" />
      <SkeletonLoader type="table" count={6} />
    </div>
  );
}

export default function AppLayout() {
  useMaterialSymbols();
  const { collapsed } = useSidebar();

  return (
    <div className={`${styles.appContainer} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <TopBar />
        <main className={styles.mainContent}>
          <Suspense fallback={<InnerPageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

