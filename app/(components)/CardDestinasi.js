import Link from "next/link";
import styles from "../styles/CardDestinasi.module.css";
import Image from "next/image";

export default function CardDestinasi({ destinasi }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={`/images/${destinasi.foto}`}
          alt={destinasi.nama}
          className={styles.image}
          width={300}
          height={150}
        />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>{destinasi.nama}</h2>
        <p className={styles.location}>{destinasi.lokasi}</p>
        <p className={styles.description}>{destinasi.deskripsi}</p>
        <Link href={`destinasi/${destinasi.slug}`} className={styles.button}>
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
