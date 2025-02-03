"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import DatePicker from "react-datepicker";
import { useRouter, useParams } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/Checkout.module.css";

export default function Checkout() {
  const router = useRouter();
  const params = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [jumlahPenumpang, setJumlahPenumpang] = useState(1);
  const [selectedPaket, setSelectedPaket] = useState("");
  const [titikPenjemputan, setTitikPenjemputan] = useState("");
  const [totalHarga, setTotalHarga] = useState(0);
  const [destinasi, setDestinasi] = useState();
  const [loading, setLoading] = useState(false);

  const paketWisata = [
    {
      id: 1,
      nama: "Paket Basic",
      harga: 150000,
      includes: ["Transportasi", "Pemandu"],
    },
    {
      id: 2,
      nama: "Paket Premium",
      harga: 250000,
      includes: ["Transportasi", "Pemandu", "Makan Siang"],
    },
    {
      id: 3,
      nama: "Paket VIP",
      harga: 350000,
      includes: [
        "Transportasi AC",
        "Pemandu Profesional",
        "Makan Siang",
        "Snack",
      ],
    },
  ];

  // Kalkulasi total harga
  useEffect(() => {
    const paket = paketWisata.find((p) => p.nama === selectedPaket);
    if (paket) {
      setTotalHarga(paket.harga * jumlahPenumpang);
    }
  }, [selectedPaket, jumlahPenumpang]);

  useEffect(() => {
    const fetchDestinasi = async () => {
      try {
        const { data, error } = await supabase
          .from("Wisata")
          .select("nama, lokasi, harga")
          .eq("slug", params.slug)
          .single();

        if (error) throw error;
        setDestinasi(data);
      } catch (error) {
        console.error("Error:", error);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchDestinasi();
  }, [params.slug, router]);

  // Dummy data paket wisata

  // Dummy titik penjemputan
  const titikPenjemputanList = [
    "Hotel Malioboro",
    "Bandara YIA",
    "Stasiun Tugu",
    "Terminal Giwangan",
  ];

  const handleSubmit = async (e) => {
    setLoading(true);
    console.log(destinasi);
    if (!destinasi) return;

    try {
      // Format pesan WhatsApp
      const message = `Halo, saya ingin memesan paket wisata dengan detail berikut:
      
  📆 Tanggal: ${selectedDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}
  👥 Jumlah Penumpang: ${jumlahPenumpang} orang
  📦 Paket: ${selectedPaket}
  📍 Titik Penjemputan: ${titikPenjemputan}
  🏞️ Destinasi: ${destinasi.nama} (${destinasi.lokasi})
  💰 Total Harga: Rp ${totalHarga.toLocaleString()}
  
  Konfirmasi pembayaran lebih lanjut. Terima kasih!`;

      // Encode message untuk URL
      const encodedMessage = encodeURIComponent(message);

      // Ganti nomor WhatsApp dengan nomor bisnis Anda
      const phoneNumber = "6289606883082"; // Format: 62812xxxxxxx

      // Redirect ke WhatsApp
      window.open(
        `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
        "_blank"
      );

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggal: selectedDate,
          jumlahPenumpang,
          paket: selectedPaket,
          titikPenjemputan,
          totalHarga,
          destinasi: {
            nama: destinasi.nama,
            lokasi: destinasi.lokasi,
            harga: destinasi.harga,
          },
        }),
      });

      // Ini aslinya checkout GAGAL wkwkwk
      // if (!response.ok) throw new Error("Checkout Berhasil");

      // Redirect ke halaman sukses
      router.push("/checkout/sukses");
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="text-center py-12">Memuat data...</div>;
  if (!destinasi) return <div>Memuat data destinasi...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout</h1>
      <p className={styles.description}>Lengkapi data pemesanan Anda</p>
      <p className={styles.tujuan}>
        <b>Tujuan Wisata: {destinasi.nama}</b>
      </p>

      <div className={styles.form}>
        {/* Tanggal & Waktu */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Tanggal & Waktu Pergi</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            minDate={new Date()}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Waktu"
            dateFormat="dd MMMM yyyy, HH:mm"
            className={styles.datePicker}
          />
        </div>

        {/* Jumlah Penumpang */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Jumlah Penumpang</label>
          <select
            value={jumlahPenumpang}
            onChange={(e) => setJumlahPenumpang(parseInt(e.target.value))}
            className={styles.select}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Orang
              </option>
            ))}
          </select>
        </div>

        {/* Pilih Paket Wisata */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Pilih Paket Wisata</label>
          <div className={styles.paketContainer}>
            {paketWisata.map((paket) => (
              <div
                key={paket.id}
                className={`${styles.paketCard} ${
                  selectedPaket === paket.nama ? styles.selected : ""
                }`}
                onClick={() => setSelectedPaket(paket.nama)}
              >
                <h3 className={styles.paketTitle}>{paket.nama}</h3>
                <p className={styles.paketHarga}>
                  Rp {paket.harga.toLocaleString()}/orang
                </p>
                <ul className={styles.paketIncludes}>
                  {paket.includes.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Titik Penjemputan */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Titik Penjemputan</label>
          <select
            value={titikPenjemputan}
            onChange={(e) => setTitikPenjemputan(e.target.value)}
            className={styles.select}
          >
            <option value="">Pilih Titik Penjemputan</option>
            {titikPenjemputanList.map((titik, index) => (
              <option key={index} value={titik}>
                {titik}
              </option>
            ))}
          </select>
        </div>

        {/* Total Harga */}
        <div className={styles.totalHarga}>
          <span>Total Harga:</span>
          <span className={styles.harga}>Rp {totalHarga.toLocaleString()}</span>
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={!selectedPaket || !titikPenjemputan}
          onClick={() => handleSubmit()}
        >
          {loading ? "Tunggu Sebentar" : "Lanjutkan Pembayaran"}
        </button>
      </div>
    </div>
  );
}
