// Import PrismaClient
import { PrismaClient } from "@prisma/client";

// Inisialisasi PrismaClient
const prisma = new PrismaClient();

/**
 * CREATE: Menambahkan data wisata baru
 * @param {Object} data - Data wisata yang akan ditambahkan
 * @returns {Object} - Data wisata yang baru dibuat
 */
export async function createWisata(data) {
  try {
    const wisata = await prisma.wisata.create({
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi,
        harga: data.harga,
        lokasi: data.lokasi,
        foto: data.foto,
      },
    });
    return wisata;
  } catch (error) {
    console.error("Error creating wisata:", error);
    throw error;
  }
}

/**
 * READ: Mendapatkan semua data wisata
 * @returns {Array} - Daftar semua wisata
 */
export async function getAllWisata() {
  try {
    const wisataList = await prisma.wisata.findMany();
    return wisataList;
  } catch (error) {
    console.error("Error fetching wisata:", error);
    throw error;
  }
}

/**
 * READ: Mendapatkan data wisata berdasarkan ID
 * @param {String} id - ID wisata
 * @returns {Object} - Data wisata
 */
export async function getWisataById(id) {
  try {
    const wisata = await prisma.wisata.findUnique({
      where: {
        id: id,
      },
    });
    return wisata;
  } catch (error) {
    console.error("Error fetching wisata by ID:", error);
    throw error;
  }
}

/**
 * UPDATE: Memperbarui data wisata berdasarkan ID
 * @param {String} id - ID wisata
 * @param {Object} data - Data baru untuk wisata
 * @returns {Object} - Data wisata yang diperbarui
 */
export async function updateWisata(id, data) {
  try {
    const updatedWisata = await prisma.wisata.update({
      where: {
        id: id,
      },
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi,
        harga: data.harga,
        lokasi: data.lokasi,
        foto: data.foto,
      },
    });
    return updatedWisata;
  } catch (error) {
    console.error("Error updating wisata:", error);
    throw error;
  }
}

/**
 * DELETE: Menghapus data wisata berdasarkan ID
 * @param {String} id - ID wisata
 * @returns {Object} - Data wisata yang dihapus
 */
export async function deleteWisata(id) {
  try {
    const deletedWisata = await prisma.wisata.delete({
      where: {
        id: id,
      },
    });
    return deletedWisata;
  } catch (error) {
    console.error("Error deleting wisata:", error);
    throw error;
  }
}

/**
 * Menutup koneksi Prisma Client
 */
export async function closePrisma() {
  await prisma.$disconnect();
}
