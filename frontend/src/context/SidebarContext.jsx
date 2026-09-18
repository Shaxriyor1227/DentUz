import React, { createContext, useContext, useState, useEffect } from 'react';

export const SidebarContext = createContext({
  collapsed: false,
  toggleSidebar: () => {},
  setCollapsed: () => {}
});

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem('dentuz_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dentuz_sidebar_collapsed', String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  // Global hotkey Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
        e.preventDefault();
        setCollapsedState((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => setCollapsedState((prev) => !prev);
  const setCollapsed = (val) => setCollapsedState(Boolean(val));

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
