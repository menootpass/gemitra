import { NextResponse } from 'next/server';

const TRANSACTIONS_URL = process.env.GEMITRA_TRANSACTIONS_URL!;
const DESTINATIONS_URL = process.env.GEMITRA_DESTINATIONS_URL!;

interface CommentRequest {
  invoiceCode: string;
  komentar: string;
  destinationId: number;
}

interface Transaction {
  kode: string;
  nama: string;
  destinasi: string;
  status: string;
}

interface Destination {
  id: number;
  nama: string;
  komentar: string;
}

export async function POST(request: Request) {
  try {
    const body: CommentRequest = await request.json();

    // Validasi input
    if (!body.invoiceCode || !body.komentar || !body.destinationId) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' }, 
        { status: 400 }
      );
    }

    // Ambil data transaksi untuk validasi invoice code
    let transactions: Transaction[] = [];
    try {
      const transactionsResponse = await fetch(TRANSACTIONS_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        transactions = transactionsData.data || transactionsData || [];
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { message: 'Gagal memvalidasi kode invoice' }, 
        { status: 500 }
      );
    }

    // Validasi kode invoice
    const validTransaction = transactions.find(
      (transaction: Transaction) => 
        transaction.kode === body.invoiceCode && 
        transaction.status === 'success'
    );

    if (!validTransaction) {
      return NextResponse.json(
        { message: 'Kode invoice tidak valid atau tidak ditemukan' }, 
        { status: 400 }
      );
    }

    // Gunakan nama dari database transaksi, bukan dari input user
    const namaFromDatabase = validTransaction.nama;

    // Ambil data destinasi untuk update komentar
    let destinations: Destination[] = [];
    try {
      const destinationsResponse = await fetch(DESTINATIONS_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (destinationsResponse.ok) {
        const destinationsData = await destinationsResponse.json();
        destinations = destinationsData.data || destinationsData || [];
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return NextResponse.json(
        { message: 'Gagal mengambil data destinasi' }, 
        { status: 500 }
      );
    }

    // Cari destinasi yang sesuai
    const destination = destinations.find((dest: Destination) => dest.id === body.destinationId);
    if (!destination) {
      return NextResponse.json(
        { message: 'Destinasi tidak ditemukan' }, 
        { status: 404 }
      );
    }

    // Parse komentar yang ada
    let existingComments = [];
    try {
      existingComments = destination.komentar ? JSON.parse(destination.komentar) : [];
    } catch (error) {
      console.error('Error parsing existing comments:', error);
      existingComments = [];
    }

    // Tambahkan komentar baru dengan nama dari database
    const newComment = {
      nama: namaFromDatabase,
      komentar: body.komentar,
      tanggal: new Date().toISOString(),
    };

    existingComments.push(newComment);

    // Update destinasi dengan komentar baru
    // const updatedDestination = {
    //   ...destination,
    //   komentar: JSON.stringify(existingComments),
    // };

    // Kirim update ke Google Apps Script dengan format yang benar
    try {
      const updatePayload = {
        action: 'updateComment',
        destinationId: body.destinationId,
        komentar: JSON.stringify(existingComments),
        // Tambahkan data untuk debugging
        debug: {
          originalComments: destination.komentar,
          newCommentsCount: existingComments.length,
          timestamp: new Date().toISOString()
        }
      };

      console.log('Sending update payload:', updatePayload);

      const updateResponse = await fetch(DESTINATIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const updateResult = await updateResponse.text();
      console.log('Update response:', updateResult);

      if (!updateResponse.ok) {
        throw new Error(`Gagal mengupdate komentar: ${updateResult}`);
      }

      return NextResponse.json({
        message: 'Komentar berhasil ditambahkan',
        comment: newComment,
        debug: {
          totalComments: existingComments.length,
          updateResponse: updateResult,
          namaFromDatabase: namaFromDatabase
        }
      });

    } catch (error) {
      console.error('Error updating destination:', error);
      return NextResponse.json(
        { message: 'Gagal menyimpan komentar', error: error instanceof Error ? error.message : 'Unknown error' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in comments API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: errorMessage },
      { status: 500 }
    );
  }
} 