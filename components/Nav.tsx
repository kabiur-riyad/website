"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  instagramUrl?: string;
};

export default function Nav({ instagramUrl }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCollections = pathname === "/collections" || pathname.startsWith("/collections/");
  const isAbout = pathname === "/about";

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        Kabiur Rahman Riyad
      </Link>
      <div className="nav-links">
        <Link href="/" className={isHome ? "active" : undefined}>
          Home
        </Link>
        <Link href="/collections" className={isCollections ? "active" : undefined}>
          Collections
        </Link>
        <Link href="/about" className={isAbout ? "active" : undefined}>
          About
        </Link>
        {instagramUrl ? (
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            Instagram
          </a>
        ) : null}
      </div>
    </nav>
  );
}
