"use client";

import "./globals.css";

import { store } from "@redux/store";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";

import localFont from "next/font/local";

import ModalLogout from "@components/modal/logout/Logout";
import Sidebar from "./components/v2/sidebar/Sidebar";
import Header from "./components/v2/header/Header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Provider store={store}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-[#232b2b] antialiased`}
        >
          {pathname === "/auth/login" ? (
            <div className="flex items-center justify-center h-screen">
              {children}
            </div>
          ) : (
            // <div>{children}</div> //v1
            <div className="flex h-screen overflow-hidden">
              <Sidebar />

              <div className="flex flex-col flex-1">
                <Header />

                <main>{children}</main>
              </div>
            </div>
          )}
          <ModalLogout />
        </body>
      </html>
    </Provider>
  );
}
