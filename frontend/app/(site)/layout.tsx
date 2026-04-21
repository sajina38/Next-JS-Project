import { Suspense } from "react";
import LayoutWrapper from "@/component/LayoutWrapper";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <LayoutWrapper>{children}</LayoutWrapper>
    </Suspense>
  );
}
