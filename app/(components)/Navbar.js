"use client";
import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`${styles.navbar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.logo}>
        <Link href="/">Gemitra Jogja</Link>
      </div>

      {/* Menu untuk desktop */}
      <ul className={styles.menu}>
        <li>
          <Link href="/">Beranda</Link>
        </li>
        <li>
          <Link href="/destinasi">Destinasi</Link>
        </li>
        <li>
          <Link href="/tentang-kami">Tentang Kami</Link>
        </li>
        <li>
          <Link href="/kontak">Kontak</Link>
        </li>
      </ul>

      {/* Tombol hamburger untuk mobile */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>

      {/* Menu untuk mobile */}
      <ul className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}>
        <li>
          <Link href="/" onClick={toggleMenu}>
            Beranda
          </Link>
        </li>
        <li>
          <Link href="/destinasi" onClick={toggleMenu}>
            Destinasi
          </Link>
        </li>
        <li>
          <Link href="/tentang-kami" onClick={toggleMenu}>
            Tentang Kami
          </Link>
        </li>
        <li>
          <Link href="/kontak" onClick={toggleMenu}>
            Kontak
          </Link>
        </li>
      </ul>
    </nav>
  );
}
