import Link from "next/link";
import styles from "../styles/CardDestinasi.module.css";
import Image from "next/image";

export default function CardDestinasi({ destinasi }) {
  const truncateDescription = (text, maxWords) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  };

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
        <p className={styles.description}>
          {truncateDescription(destinasi.deskripsi, 10)}
        </p>
        <Link href={`destinasi/${destinasi.slug}`} className={styles.button}>
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
