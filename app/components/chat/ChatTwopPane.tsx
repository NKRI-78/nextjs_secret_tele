"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
// import Cookies from "js-cookie";
// import { useRouter } from "next/navigation";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@redux/store";
import { setShowLogoutModal } from "@redux/slices/modalSlice";

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
    // right: React.ReactNode;
    right: React.ReactNode;
    rightHeader?: (props: {
      open: boolean;
      toggle: () => void;
    }) => React.ReactNode;
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
  // const router = useRouter();

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [openLogout, setOpenLogout] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Close the drawer when pressing Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Ensure drawer state is reset appropriately on resize to md+
  // useEffect(() => {
  //   function onResize() {
  //     if (window.innerWidth >= 768) {
  //       setOpen(false);
  //     }
  //   }
  //   window.addEventListener("resize", onResize);
  //   return () => window.removeEventListener("resize", onResize);
  // }, []);
  useEffect(() => {
    function onResize() {
      if (window.innerWidth < 768) {
        setOpen(false); // mobile default close
      } else {
        setOpen(true); // desktop default open
      }
    }

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // const handleLogout = () => {
  //   Cookies.remove("token");
  //   Cookies.remove("user_id");
  //   router.push("/auth/login");
  //   setOpenLogout(false);
  // };

  const handleLogoutClick = () => {
    dispatch(setShowLogoutModal(true)); // buka modal global
    setOpenLogout(false); // tutup dropdown avatar
    setOpen(false); // tutup drawer mobile
  };

  return (
    <div className={`flex h-[100dvh] flex-col md:flex-row ${className}`}>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-3 h-12 border-b bg-cyber text-white">
        <button
          type="button"
          aria-label={`Open ${leftLabel}`}
          aria-controls="mobile-sidebar"
          aria-expanded={open}
          onClick={() => {
            setOpen(true);
            setOpenLogout(false);
          }}
          className="inline-flex items-center gap-2"
        >
          <Menu className="h-5 w-5" />
          {/* <span className="text-sm font-medium">{leftLabel}</span> */}
        </button>
        <span className="text-sm font-semibold">{title}</span>
        <span className="w-5" aria-hidden />
      </div>

      {/* Desktop left pane (docked) */}
      <aside
        // className={`hidden md:flex ${leftWidthMd} md:flex-shrink-0 md:flex-col border-right-cyber`}
        className={`
          hidden md:flex md:flex-col
          transition-all duration-300
          border-right-cyber
          ${open ? leftWidthMd : "md:w-0"}
          overflow-hidden
        `}
        aria-label={leftLabel}
      >
        {open && children.left}
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
        className={`fixed inset-y-0 left-0 z-50 w-[70%] max-w-[360px] transform bg-cyber text-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-12 px-3 border-b">
          <div className="flex items-center gap-0 p-0">
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <button
                  ref={btnRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={openLogout}
                  onClick={() => setOpenLogout((o) => !o)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Account"
                >
                  <span className="sr-only">Open user menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-white"
                  >
                    <path
                      fill="currentColor"
                      d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                    />
                  </svg>

                  {openLogout && (
                    <div
                      // ref={menuRef}
                      role="menu"
                      aria-label="User menu"
                      className="absolute left-8 z-50 mt-16 w-44 overflow-hidden rounded-lg border bg-white shadow-lg"
                    >
                      <button
                        role="menuitem"
                        tabIndex={0}
                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 focus:bg-red-50"
                        onClick={handleLogoutClick}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* <span className="text-sm font-medium">{leftLabel}</span> */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => {
              setOpen(false);
              setOpenLogout(false);
            }}
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
