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
  const isAuthPage = pathname
    ? pathname === "/register" ||
      pathname.startsWith("/login") ||
      pathname === "/reset-password"
    : false;
  const isProfilePage = pathname === "/profile";
  const isAdminPage = pathname ? pathname.startsWith("/admin") : false;
  const isManagerPage = pathname ? pathname.startsWith("/manager") : false;

  return (
    <>
      {!isAuthPage && !isProfilePage && !isAdminPage && !isManagerPage && <Navbar />}
      {children}
      {!isAuthPage && !isProfilePage && !isAdminPage && !isManagerPage && <Footer />}
    </>
  );
}





