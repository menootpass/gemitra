import { NextResponse } from 'next/server';

const TRANSACTIONS_URL = process.env.GEMITRA_TRANSACTIONS_URL || "https://script.google.com/macros/s/AKfycbxpr2JiKv4exY0UrBrXrArLYTTi8Qxh3DrugG_anIjUReS0Y38zE3bqS9R0mb35brfUEA/exec";
const DESTINATIONS_URL = process.env.GEMITRA_DESTINATIONS_URL || "https://script.google.com/macros/s/AKfycbxpr2JiKv4exY0UrBrXrArLYTTi8Qxh3DrugG_anIjUReS0Y38zE3bqS9R0mb35brfUEA/exec";

interface CommentRequest {
  invoiceCode: string;
  komentar: string;
  rating: number;
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
    console.log('Received comment data:', body);

    // Validasi input
    if (!body.invoiceCode || !body.komentar || !body.destinationId || !body.rating) {
      console.log('Missing required fields:', { 
        invoiceCode: !!body.invoiceCode, 
        komentar: !!body.komentar, 
        destinationId: !!body.destinationId, 
        rating: !!body.rating 
      });
      return NextResponse.json(
        { message: 'Data tidak lengkap' }, 
        { status: 400 }
      );
    }

    // Validasi rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { message: 'Rating harus antara 1-5' }, 
        { status: 400 }
      );
    }

    console.log('Fetching transactions from:', TRANSACTIONS_URL);

    // Ambil data transaksi untuk validasi invoice code
    let transactions: Transaction[] = [];
    try {
      const transactionsResponse = await fetch(TRANSACTIONS_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Transactions response status:', transactionsResponse.status);

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        console.log('Transactions data:', transactionsData);
        transactions = transactionsData.data || transactionsData || [];
      } else {
        const errorText = await transactionsResponse.text();
        console.error('Transactions API error:', errorText);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { message: 'Gagal memvalidasi kode invoice' }, 
        { status: 500 }
      );
    }

    // Validasi kode invoice - HARUS ada transaksi yang valid
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

    const namaFromDatabase = validTransaction.nama;
    console.log('Valid transaction found:', validTransaction);

    console.log('Fetching destinations from:', DESTINATIONS_URL);

    // Ambil data destinasi untuk update komentar
    let destinations: Destination[] = [];
    try {
      const destinationsResponse = await fetch(DESTINATIONS_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Destinations response status:', destinationsResponse.status);

      if (destinationsResponse.ok) {
        const destinationsData = await destinationsResponse.json();
        console.log('Destinations data:', destinationsData);
        destinations = destinationsData.data || destinationsData || [];
      } else {
        const errorText = await destinationsResponse.text();
        console.error('Destinations API error:', errorText);
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
      console.log('Destination not found for ID:', body.destinationId);
      return NextResponse.json(
        { message: 'Destinasi tidak ditemukan' }, 
        { status: 404 }
      );
    }

    console.log('Found destination:', destination);

    // Validasi destinasi yang dikomentari HARUS ada dalam transaksi
    const transactionDestinations = validTransaction.destinasi ? 
      validTransaction.destinasi.split(',').map((dest: string) => dest.trim()) : [];
    
    // Cek apakah destinasi yang dikomentari ada dalam daftar destinasi yang dipesan
    const isDestinationInTransaction = transactionDestinations.some((dest: string) => 
      dest.toLowerCase() === destination.nama.toLowerCase()
    );

    if (!isDestinationInTransaction) {
      return NextResponse.json(
        { 
          message: `Anda hanya dapat memberikan komentar untuk destinasi yang Anda pesan. Destinasi yang dipesan: ${transactionDestinations.join(', ')}` 
        }, 
        { status: 403 }
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

    // Cek apakah user sudah pernah komentar untuk destinasi ini
    const hasUserCommented = existingComments.some((comment: any) => 
      comment.nama === namaFromDatabase
    );

    if (hasUserCommented) {
      return NextResponse.json(
        { message: 'Anda sudah pernah memberikan komentar untuk destinasi ini' }, 
        { status: 400 }
      );
    }

    // Tambahkan komentar baru
    const newComment = {
      nama: namaFromDatabase,
      komentar: body.komentar,
      rating: body.rating,
      tanggal: new Date().toISOString(),
    };

    existingComments.push(newComment);

    console.log('New comment to add:', newComment);
    console.log('Total comments after adding:', existingComments.length);

    // Kirim update ke Google Apps Script
    try {
      const updatePayload = {
        action: 'updateComment',
        destinationId: body.destinationId,
        komentar: JSON.stringify(existingComments),
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
      console.log('Update response status:', updateResponse.status);
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