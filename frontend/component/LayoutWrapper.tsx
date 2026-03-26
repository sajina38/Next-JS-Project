"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname ? (pathname === "/login" || pathname === "/register") : false;
  const isProfilePage = pathname === "/profile";
  const isAdminPage = pathname ? pathname.startsWith("/admin") : false;

  return (
    <>
      {!isAuthPage && !isProfilePage && !isAdminPage && <Navbar />}
      {children}
      {!isAuthPage && !isProfilePage && !isAdminPage && <Footer />}
    </>
  );
}





