import Link from "next/link";

type Props = {
  instagramUrl?: string;
};

export default function Nav({ instagramUrl }: Props) {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        Kabiur Rahman Riyad
      </Link>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/about">About</Link>
        {instagramUrl ? (
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            Instagram
          </a>
        ) : null}
      </div>
    </nav>
  );
}
