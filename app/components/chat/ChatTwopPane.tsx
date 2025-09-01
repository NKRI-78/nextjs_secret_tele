"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  /** Page title for the mobile top bar */
  title?: string;
  /** Accessible label for the left pane toggle */
  leftLabel?: string;
  /** Optional Tailwind classes on the outer wrapper */
  className?: string;
  /** Tailwind width classes for left pane on md+ screens */
  leftWidthMd?: string;
  /** Content slots */
  children: {
    left: React.ReactNode;
    right: React.ReactNode;
  };
};

/**
 * Responsive two-pane layout:
 * - Mobile: left pane (sidebar) is off-canvas with overlay and a toggle button.
 * - Desktop (md+): left pane is fixed/docked; both panes visible.
 */
export default function ResponsiveTwoPane({
  title = "Page",
  leftLabel = "Sidebar",
  className = "",
  leftWidthMd = "md:w-[320px]",
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  // Close the drawer when pressing Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Ensure drawer state is reset appropriately on resize to md+
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={`flex h-[100dvh] flex-col md:flex-row ${className}`}>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-3 h-12 border-b bg-white">
        <button
          type="button"
          aria-label={`Open ${leftLabel}`}
          aria-controls="mobile-sidebar"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2"
        >
          <Menu className="h-5 w-5" />
          <span className="text-sm font-medium">{leftLabel}</span>
        </button>
        <span className="text-sm font-semibold">{title}</span>
        <span className="w-5" aria-hidden />
      </div>

      {/* Desktop left pane (docked) */}
      <aside
        className={`hidden md:flex ${leftWidthMd} md:flex-shrink-0 md:flex-col md:border-r md:bg-white`}
        aria-label={leftLabel}
      >
        {children.left}
      </aside>

      {/* Mobile left pane (off-canvas) */}
      {/* Overlay */}
      {open && (
        <button
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}
      {/* Drawer */}
      <div
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-[360px] transform bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-12 px-3 border-b">
          <span className="text-sm font-medium">{leftLabel}</span>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100dvh-3rem)] overflow-y-auto">
          {children.left}
        </div>
      </div>

      {/* Right/content pane */}
      <section className="flex-1 min-h-0 md:h-[100dvh] overflow-y-auto">
        {children.right}
      </section>
    </div>
  );
}
