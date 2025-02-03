import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "../../styles/DetailDestinasi.module.css";
import PilihTujuanButton from "@/app/(components)/PilihTujuanButton";

export async function generateStaticParams() {
  const { data: wisata } = await supabase.from("Wisata").select("slug");

  return (
    wisata?.map((item) => ({
      slug: item.slug,
    })) || []
  );
}

async function getData(slug) {
  const { data, error } = await supabase
    .from("Wisata")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

export default async function DetailDestinasi({ params }) {
  const destinasi = await getData(params.slug);

  return (
    <div className={styles.container}>
      {/* Gambar Utama */}
      <div className={styles.imageContainer}>
        <Image
          src={`/images/${destinasi.foto}`}
          alt={destinasi.nama}
          className={styles.image}
          width={300}
          height={150}
        />
      </div>

      {/* Detail Konten */}
      <div className={styles.content}>
        <h1 className={styles.title}>{destinasi.nama}</h1>
        <div className={styles.location}>
          {/* <FiMapPin className={styles.icon} />
          <span>{destinasi.lokasi}</span> */}
        </div>
        <p className={styles.views}>Dilihat sebanyak {destinasi.views} kali</p>
        <p className={styles.description}>{destinasi.deskripsi}</p>

        <PilihTujuanButton slug={destinasi.slug} />
      </div>

      {/* Peta Google Maps */}
      {/* <div className={styles.mapContainer}>
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        >
          <GoogleMap
            mapContainerClassName={styles.map}
            center={{ lat: destinasi.lat, lng: destinasi.lng }}
            zoom={15}
          >
            <Marker position={{ lat: destinasi.lat, lng: destinasi.lng }} />
          </GoogleMap>
        </LoadScript>
      </div> */}
    </div>
  );
}
