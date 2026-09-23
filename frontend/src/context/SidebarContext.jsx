import React, { createContext, useContext, useState, useEffect } from 'react';

export const SidebarContext = createContext({
  collapsed: false,
  mobileOpen: false,
  toggleSidebar: () => {},
  setCollapsed: () => {},
  openMobileSidebar: () => {},
  closeMobileSidebar: () => {}
});

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem('dentuz_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dentuz_sidebar_collapsed', String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  // Prevent background scrolling when mobile sidebar drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Global hotkey Ctrl+B / Cmd+B to toggle sidebar on desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
        e.preventDefault();
        if (window.innerWidth < 1024) {
          setMobileOpen((prev) => !prev);
        } else {
          setCollapsedState((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsedState((prev) => !prev);
    }
  };

  const setCollapsed = (val) => setCollapsedState(Boolean(val));
  const openMobileSidebar = () => setMobileOpen(true);
  const closeMobileSidebar = () => setMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        mobileOpen,
        toggleSidebar,
        setCollapsed,
        openMobileSidebar,
        closeMobileSidebar
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
