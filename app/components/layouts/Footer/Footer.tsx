import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link href="/" className="footer-brand">
          <Image
            src="/logo/tool.png"
            alt=""
            width={40}
            height={40}
            className="footer-logo"
          />
          <span>NHC Tools</span>
        </Link>
        <small>© {new Date().getFullYear()} NHC Tools</small>
      </div>
    </footer>
  );
}
