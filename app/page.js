"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CardDestinasi from "./(components)/CardDestinasi";

export default function Home() {
  const [wisataData, setWisataData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWisata = async () => {
      try {
        const { data, error } = await supabase
          .from("Wisata") // Pastikan nama tabel sama persis dengan di Supabase
          .select("*");

        if (error) throw error;
        setWisataData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWisata();
  }, []);
  if (loading)
    return (
      <div>
        <center>Memuat data...</center>
      </div>
    );

  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        justifyContent: "center",
      }}
    >
      {wisataData.map((destinasi) => (
        <CardDestinasi key={destinasi.id} destinasi={destinasi} />
      ))}
    </div>
  );
}
