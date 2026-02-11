import { setShowLogoutModal } from "@/redux/slices/modalSlice";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const pathname = usePathname();

  const handleLogoutClick = () => {
    dispatch(setShowLogoutModal(true)); // buka modal
    setOpen(false); // tutup dropdown user
  };

  return (
    <aside className="w-80 bg-cyber text-white p-5 hidden md:block border-r-2 border-[#1F1F1F]">
      {/* <h2 className="text-lg font-bold mb-6">Menu</h2> */}
      <div className="flex justify-end mb-5">
        <div className="ml-auto hidden md:flex items-center gap-2">
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
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

              {open && (
                <div
                  ref={menuRef}
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-2 z-50 mt-14 w-44 overflow-hidden rounded-lg border bg-white shadow-lg"
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

      <nav className="space-y-3">
        <Link
          href="/"
          // className="block hover:text-gray-300"
          className={`block px-6 py-4 text-lg font-medium rounded-2xl transition-all duration-300
      ${
        pathname === "/"
          ? "bg-[#0f1117] border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          : "hover:bg-white/5 text-white/70"
      }`}
        >
          Hasil Pencarian
        </Link>
        {/* <Link href="/dashboard" className="block hover:text-gray-300">
          Dashboard
        </Link> */}
      </nav>
    </aside>
  );
}
