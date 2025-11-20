import { createContext, useContext, useState, ReactNode } from "react";

// Define what state SidebarContext should handle
interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  selectedMenu: string | null;
  setSelectedMenu: (menu: string) => void;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

// Context instance
const SidebarContext = createContext<SidebarContextType | null>(null);

// Provider implementation
export function SidebarProvider({ children }: { children: ReactNode }) {
  if (window.innerWidth >= 1024) {
  }

  const [isOpen, setOpen] = useState();
  const [isCollapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  const toggle = () => setOpen((open) => !open);
  const open = () => setOpen(true);
  const close = () => setOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle,
        open,
        close,
        selectedMenu,
        setSelectedMenu,
        isCollapsed,
        setCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// Hook for accessing sidebar context in any child component
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
