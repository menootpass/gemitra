export type Dictionary = {
  navigation: {
    home: string;
    destinations: string;
    events: string;
  };
  hero: {
    title: string;
    subtitle: string;
    exploreNow: string;
    contactUs: string;
    yearsExperience: string;
    localExploration: string;
  };
  stats: {
    hiddenDestinations: string;
    localExperience: string;
    satisfiedTravelers: string;
    travelStories: string;
  };
  sections: {
    exploreHiddenBeauty: string;
    gemitraServices: string;
    exploreOnMap: string;
    mapDescription: string;
    viewAllDestinations: string;
    secretHillNorth: string;
    freeConsultation: string;
  };
  services: {
    hiddenGemPackages: string;
    customTrip: string;
    experiencedGuides: string;
    travelDocumentation: string;
  };
  footer: {
    explore: string;
    discover: string;
    newStories: string;
  };
  whatsapp: {
    message: string;
  };
  feedback: {
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    phone: string;
    category: string;
    serviceRating: string;
    feedbackMessage: string;
    submit: string;
    submitting: string;
    successMessage: string;
    errorRequired: string;
    errorRating: string;
    errorGeneral: string;
    processingInfo: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;
    ratingText: string;
    ratingPlaceholder: string;
    categories: {
      general: string;
      service: string;
      destination: string;
      website: string;
      suggestion: string;
      complaint: string;
    };
  };
  wisata: {
    title: string;
    searchPlaceholder: string;
    allCategories: string;
    listView: string;
    mapView: string;
    detailButton: string;
    addToCart: string;
    addToCartNotification: string;
    checkoutNotification: string;
    perPerson: string;
    loadingMore: string;
    loadMoreButton: string;
    allDestinationsShown: string;
    showCart: string;
    tryAgain: string;
    error: string;
    categories: {
      nature: string;
      cultureHistory: string;
      creativeEducation: string;
      hiddenCulinary: string;
    };
  };
  wisataDetail: {
    addDestination: string;
    perDestination: string;
    facilities: string;
    comments: string;
    visitors: string;
    noComments: string;
    commentAdded: string;
    notFound: string;
  };
  invoice: {
    title: string;
    companyName: string;
    website: string;
    phone: string;
    orderNumber: string;
    date: string;
    cashier: string;
    customer: string;
    tourPackage: string;
    vehicleRental: string;
    unit: string;
    pax: string;
    pricePerPax: string;
    quantity: string;
    subtotal: string;
    subtotalDestinations: string;
    subtotalVehicle: string;
    totalToPay: string;
    paymentMethod: string;
    change: string;
    status: {
      paid: string;
      pending: string;
      cancelled: string;
    };
    whatsappButton: string;
    screenshotInstruction: string;
    screenshotTitle: string;
    screenshotDescription: string;
    screenshotTips: string;
    thankYou: string;
    poweredBy: string;
    invoiceNotFound: string;
    invalidCode: string;
    debugInfo: string;
    ensureCode: string;
    ensureData: string;
    ensureScript: string;
    ensureEnv: string;
  };
  events: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    allTime: string;
    sortBy: string;
    quickFilter: string;
    activeFilters: string;
    showingResults: string;
    sortedBy: string;
    noEventsFound: string;
    tryDifferentFilters: string;
    resetAllFilters: string;
    loadingMore: string;
    loadMoreButton: string;
    allEventsShown: string;
    totalEvents: string;
    readMore: string;
    readers: string;
    failedToLoad: string;
    tryAgain: string;
    dateLabels: {
      today: string;
      tomorrow: string;
      thisWeek: string;
      thisMonth: string;
      nextMonth: string;
      upcoming: string;
      past: string;
      eventFinished: string;
      soon: string;
    };
    sortOptions: {
      newest: string;
      oldest: string;
      popular: string;
      alphabetical: string;
      location: string;
    };
  };
};

const dictionaries = {
  id: {
    navigation: {
      home: "Beranda",
      destinations: "Destinasi",
      events: "Event",
    },
    hero: {
      title: "Temukan Hidden Gems\nWisata Lokal Bersama Gemitra",
      subtitle: "Gemitra menghubungkanmu dengan destinasi wisata lokal tersembunyi yang belum banyak dijelajahi. Rasakan pengalaman unik, autentik, dan penuh inspirasi di setiap perjalananmu bersama kami.",
      exploreNow: "Pesan Disini",
      contactUs: "Hubungi Kami",
      yearsExperience: "★ 5+ Tahun",
      localExploration: "Eksplorasi Lokal",
    },
    stats: {
      hiddenDestinations: "Destinasi Tersembunyi",
      localExperience: "Pengalaman Lokal",
      satisfiedTravelers: "Traveler Puas",
      travelStories: "Cerita Perjalanan",
    },
    sections: {
      exploreHiddenBeauty: "Jelajahi Keindahan Tersembunyi",
      gemitraServices: "Layanan Gemitra",
      exploreOnMap: "Jelajahi Destinasi di Peta",
      mapDescription: "Temukan hidden gems tersembunyi di Yogyakarta. Klik pin di peta untuk melihat detail destinasi wisata yang menarik.",
      viewAllDestinations: "Lihat Semua Destinasi",
      secretHillNorth: "Bukit Rahasia di Utara",
      freeConsultation: "Konsultasi Trip Gratis!",
    },
    services: {
      hiddenGemPackages: "Paket Wisata Hidden Gems",
      customTrip: "Custom Trip & Private Tour",
      experiencedGuides: "Guide Lokal Berpengalaman",
      travelDocumentation: "Dokumentasi Perjalanan",
    },
    footer: {
      explore: "Jelajah",
      discover: "Temukan",
      newStories: "Cerita Baru",
    },
    whatsapp: {
      message: "Halo! Saya ingin bertanya seputar Gemitra ini",
    },
    feedback: {
      title: "Kirim Feedback",
      subtitle: "Kami sangat menghargai pendapat Anda untuk meningkatkan layanan Gemitra",
      fullName: "Nama Lengkap",
      email: "Email",
      phone: "Nomor Telepon",
      category: "Kategori Feedback",
      serviceRating: "Rating Layanan Kami",
      feedbackMessage: "Pesan Feedback",
      submit: "Kirim Feedback",
      submitting: "Mengirim Feedback...",
      successMessage: "Terima kasih! Feedback Anda berhasil dikirim.",
      errorRequired: "Harap lengkapi nama, email, dan pesan.",
      errorRating: "Harap berikan rating untuk layanan kami.",
      errorGeneral: "Terjadi kesalahan saat mengirim feedback.",
      processingInfo: "Feedback Anda akan kami proses dalam 1-2 hari kerja",
      namePlaceholder: "Masukkan nama lengkap Anda",
      emailPlaceholder: "contoh@email.com",
      phonePlaceholder: "081234567890",
      messagePlaceholder: "Bagikan pengalaman, saran, atau keluhan Anda tentang layanan Gemitra...",
      ratingText: "Rating: {rating} bintang",
      ratingPlaceholder: "Klik bintang untuk memberikan rating",
      categories: {
        general: "Umum",
        service: "Layanan",
        destination: "Destinasi",
        website: "Website",
        suggestion: "Saran & Ide",
        complaint: "Keluhan",
      },
    },
    wisata: {
      title: "Destinasi Wisata",
      searchPlaceholder: "Cari destinasi...",
      allCategories: "Semua Kategori",
      listView: "List",
      mapView: "Peta",
      detailButton: "Detail",
      addToCart: "Tambahkan ke Keranjang",
      addToCartNotification: "Destinasi ditambahkan ke keranjang!",
      checkoutNotification: "Silakan checkout di keranjang sebelah kanan bawah",
      perPerson: "per person",
      loadingMore: "Memuat destinasi lainnya...",
      loadMoreButton: "📄 Muat Lebih Banyak",
      allDestinationsShown: "Semua destinasi telah ditampilkan",
      showCart: "Tampilkan Cart",
      tryAgain: "Coba Lagi",
      error: "Error:",
      categories: {
        nature: "Alam",
        cultureHistory: "Budaya & Sejarah",
        creativeEducation: "Kreatif & Edukasi",
        hiddenCulinary: "Kuliner Tersembunyi",
      },
    },
    wisataDetail: {
      addDestination: "Tambahkan destinasi wisata",
      perDestination: "per destinasi",
      facilities: "Fasilitas",
      comments: "Komentar",
      visitors: "pengunjung",
      noComments: "Belum ada komentar",
      commentAdded: "Komentar berhasil ditambahkan!",
      notFound: "Wisata tidak ditemukan.",
    },
    invoice: {
      title: "e-Receipt",
      companyName: "Gemitra Jogja & Travel",
      website: "gemitra.vercel.app",
      phone: "+62 857-0183-4668",
      orderNumber: "No. Pesanan:",
      date: "Tanggal:",
      cashier: "Kasir:",
      customer: "Pelanggan:",
      tourPackage: "Paket Wisata",
      vehicleRental: "Sewa Kendaraan",
      unit: "Unit",
      pax: "Pax",
      pricePerPax: "Harga per pax:",
      quantity: "Jumlah pax:",
      subtotal: "Subtotal:",
      subtotalDestinations: "Subtotal Destinasi",
      subtotalVehicle: "Subtotal Kendaraan",
      totalToPay: "TOTAL BAYAR",
      paymentMethod: "QRIS / Transfer",
      change: "Kembalian",
      status: {
        paid: "✅ LUNAS",
        pending: "⏳ MENUNGGU PEMBAYARAN",
        cancelled: "❌ DIBATALKAN"
      },
      whatsappButton: "Lanjutkan ke WhatsApp",
      screenshotInstruction: "Screenshot Invoice Ini",
      screenshotTitle: "Screenshot Invoice Ini",
      screenshotDescription: "Simpan screenshot invoice ini sebagai bukti pembelian. Kirimkan screenshot ke WhatsApp untuk konfirmasi pembayaran.",
      screenshotTips: "Tips Screenshot:",
      thankYou: "Terima Kasih!",
      poweredBy: "Powered by Gemitra",
      invoiceNotFound: "Invoice Tidak Ditemukan",
      invalidCode: "Kode invoice tidak valid atau data tidak ada.",
      debugInfo: "Debug Info:",
      ensureCode: "Kode invoice sudah benar",
      ensureData: "Data ada di database",
      ensureScript: "Google Apps Script sudah di-deploy",
      ensureEnv: "Environment variable sudah dikonfigurasi"
    },
    events: {
      title: "Daftar Event",
      subtitle: "Temukan event menarik di Yogyakarta",
      searchPlaceholder: "🔍 Cari event berdasarkan judul, deskripsi, atau lokasi...",
      allCategories: "📂 Semua Kategori",
      allTime: "📅 Semua Waktu",
      sortBy: "🎯 Urutkan:",
      quickFilter: "⚡ Quick Filter:",
      activeFilters: "Filter Aktif:",
      showingResults: "Menampilkan {count} dari {total} event",
      sortedBy: "(Diurutkan berdasarkan {sortType})",
      noEventsFound: "Event Tidak Ditemukan",
      tryDifferentFilters: "Coba ubah kata kunci pencarian atau pilih filter yang berbeda",
      resetAllFilters: "Reset Semua Filter",
      loadingMore: "Memuat event lainnya...",
      loadMoreButton: "📄 Muat Lebih Banyak Event",
      allEventsShown: "Semua event telah ditampilkan!",
      totalEvents: "Total: {count} event",
      readMore: "Baca Selengkapnya →",
      readers: "pembaca",
      failedToLoad: "Gagal Memuat Data Event",
      tryAgain: "Coba Lagi",
      dateLabels: {
        today: "Hari Ini",
        tomorrow: "Besok",
        thisWeek: "Minggu Ini",
        thisMonth: "Bulan Ini",
        nextMonth: "Bulan Depan",
        upcoming: "Event Mendatang",
        past: "Event Lampau",
        eventFinished: "Event Selesai",
        soon: "Minggu Ini",
      },
      sortOptions: {
        newest: "terbaru",
        oldest: "terlama",
        popular: "terpopuler",
        alphabetical: "A-Z",
        location: "lokasi",
      },
    },
  },
  en: {
    navigation: {
      home: "Home",
      destinations: "Destinations",
      events: "Events",
    },
    hero: {
      title: "Discover Hidden Gems\nLocal Tourism with Gemitra",
      subtitle: "Gemitra connects you with hidden local tourist destinations that haven't been widely explored. Experience unique, authentic, and inspiring journeys with us on every trip.",
      exploreNow: "Booking Here",
      contactUs: "Contact Us",
      yearsExperience: "★ 5+ Years",
      localExploration: "Local Exploration",
    },
    stats: {
      hiddenDestinations: "Hidden Destinations",
      localExperience: "Local Experience",
      satisfiedTravelers: "Satisfied Travelers",
      travelStories: "Travel Stories",
    },
    sections: {
      exploreHiddenBeauty: "Explore Hidden Beauty",
      gemitraServices: "Gemitra Services",
      exploreOnMap: "Explore Destinations on Map",
      mapDescription: "Discover hidden gems in Yogyakarta. Click pins on the map to see details of interesting tourist destinations.",
      viewAllDestinations: "View All Destinations",
      secretHillNorth: "Secret Hill in the North",
      freeConsultation: "Free Trip Consultation!",
    },
    services: {
      hiddenGemPackages: "Hidden Gems Tourism Packages",
      customTrip: "Custom Trip & Private Tour",
      experiencedGuides: "Experienced Local Guides",
      travelDocumentation: "Travel Documentation",
    },
    footer: {
      explore: "Explore",
      discover: "Discover",
      newStories: "New Stories",
    },
    whatsapp: {
      message: "Hello! I would like to ask about Gemitra",
    },
    feedback: {
      title: "Send Feedback",
      subtitle: "We highly value your opinion to improve Gemitra's services",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      category: "Feedback Category",
      serviceRating: "Rate Our Service",
      feedbackMessage: "Feedback Message",
      submit: "Send Feedback",
      submitting: "Sending Feedback...",
      successMessage: "Thank you! Your feedback has been successfully sent.",
      errorRequired: "Please fill in name, email, and message.",
      errorRating: "Please provide a rating for our service.",
      errorGeneral: "An error occurred while sending feedback.",
      processingInfo: "Your feedback will be processed within 1-2 business days",
      namePlaceholder: "Enter your full name",
      emailPlaceholder: "example@email.com",
      phonePlaceholder: "081234567890",
      messagePlaceholder: "Share your experience, suggestions, or complaints about Gemitra's services...",
      ratingText: "Rating: {rating} star",
      ratingPlaceholder: "Click stars to give rating",
      categories: {
        general: "General",
        service: "Service",
        destination: "Destination",
        website: "Website",
        suggestion: "Suggestions & Ideas",
        complaint: "Complaint",
      },
    },
    wisata: {
      title: "Tourist Destinations",
      searchPlaceholder: "Search destinations...",
      allCategories: "All Categories",
      listView: "List",
      mapView: "Map",
      detailButton: "Details",
      addToCart: "Add to Cart",
      addToCartNotification: "Destination added to cart!",
      checkoutNotification: "Please checkout in the cart on the bottom right",
      perPerson: "per person",
      loadingMore: "Loading more destinations...",
      loadMoreButton: "📄 Load More",
      allDestinationsShown: "All destinations have been displayed",
      showCart: "Show Cart",
      tryAgain: "Try Again",
      error: "Error:",
      categories: {
        nature: "Nature",
        cultureHistory: "Culture & History",
        creativeEducation: "Creative & Education",
        hiddenCulinary: "Hidden Culinary",
      },
    },
    wisataDetail: {
      addDestination: "Add tourist destination",
      perDestination: "per destination",
      facilities: "Facilities",
      comments: "Comments",
      visitors: "visitors",
      noComments: "No comments yet",
      commentAdded: "Comment successfully added!",
      notFound: "Destination not found.",
    },
    invoice: {
      title: "e-Receipt",
      companyName: "Gemitra Jogja & Travel",
      website: "gemitra.vercel.app",
      phone: "+62 857-0183-4668",
      orderNumber: "Order No.:",
      date: "Date:",
      cashier: "Cashier:",
      customer: "Customer:",
      tourPackage: "Tour Package",
      vehicleRental: "Vehicle Rental",
      unit: "Unit",
      pax: "Pax",
      pricePerPax: "Price per pax:",
      quantity: "Quantity:",
      subtotal: "Subtotal:",
      subtotalDestinations: "Destinations Subtotal",
      subtotalVehicle: "Vehicle Subtotal",
      totalToPay: "TOTAL TO PAY",
      paymentMethod: "QRIS / Transfer",
      change: "Change",
      status: {
        paid: "✅ PAID",
        pending: "⏳ PENDING PAYMENT",
        cancelled: "❌ CANCELLED"
      },
      whatsappButton: "Continue to WhatsApp",
      screenshotInstruction: "Screenshot This Invoice",
      screenshotTitle: "Screenshot This Invoice",
      screenshotDescription: "Save a screenshot of this invoice as proof of purchase. Send the screenshot to WhatsApp for payment confirmation.",
      screenshotTips: "Screenshot Tips:",
      thankYou: "Thank You!",
      poweredBy: "Powered by Gemitra",
      invoiceNotFound: "Invoice Not Found",
      invalidCode: "Invalid invoice code or data not found.",
      debugInfo: "Debug Info:",
      ensureCode: "Invoice code is correct",
      ensureData: "Data exists in database",
      ensureScript: "Google Apps Script is deployed",
      ensureEnv: "Environment variable is configured"
    },
    events: {
      title: "Event List",
      subtitle: "Discover exciting events in Yogyakarta",
      searchPlaceholder: "🔍 Search events by title, description, or location...",
      allCategories: "📂 All Categories",
      allTime: "📅 All Time",
      sortBy: "🎯 Sort by:",
      quickFilter: "⚡ Quick Filter:",
      activeFilters: "Active Filters:",
      showingResults: "Showing {count} of {total} events",
      sortedBy: "(Sorted by {sortType})",
      noEventsFound: "No Events Found",
      tryDifferentFilters: "Try changing search keywords or select different filters",
      resetAllFilters: "Reset All Filters",
      loadingMore: "Loading more events...",
      loadMoreButton: "📄 Load More Events",
      allEventsShown: "All events have been displayed!",
      totalEvents: "Total: {count} events",
      readMore: "Read More →",
      readers: "readers",
      failedToLoad: "Failed to Load Event Data",
      tryAgain: "Try Again",
      dateLabels: {
        today: "Today",
        tomorrow: "Tomorrow",
        thisWeek: "This Week",
        thisMonth: "This Month",
        nextMonth: "Next Month",
        upcoming: "Upcoming Events",
        past: "Past Events",
        eventFinished: "Event Finished",
        soon: "This Week",
      },
      sortOptions: {
        newest: "newest",
        oldest: "oldest",
        popular: "most popular",
        alphabetical: "A-Z",
        location: "location",
      },
    },
  },
} as const;

export type Locale = keyof typeof dictionaries;

export const getDictionary = (locale: Locale): Dictionary => {
  return dictionaries[locale];
};

export default dictionaries;
