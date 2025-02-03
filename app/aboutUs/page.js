"use client";
import { Envelope, Phone, MapPin, Clock } from "phosphor-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Jumbotron Section */}
      <div className="relative h-96 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-75"></div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Tentang Kami
            </h1>
            <p className="text-xl text-blue-100">
              Membangun Pengalaman Wisata Terbaik
            </p>
          </div>
        </div>
      </div>

      {/* Deskripsi Usaha */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Siapa Kami?
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Kami adalah platform penyedia layanan wisata terkemuka yang
              berkomitmen untuk memberikan pengalaman berwisata yang tak
              terlupakan. Dengan jaringan mitra wisata lokal di Yogyakarta, kami
              menghubungkan traveler dengan destinasi-destinasi terbaik.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                <MapPin size={32} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Lokasi Kami
                </h3>
                <p className="text-gray-600">
                  Universitas Negeri Yogyakarta
                  <br />
                  Sleman, Yogyakarta
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                <Clock size={32} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Jam Operasional
                </h3>
                <p className="text-gray-600">
                  Senin - Jumat: 08.00 - 17.00 WIB
                  <br />
                  Sabtu: 08.00 - 14.00 WIB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tim Kami
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">Farel</h3>
                <p className="text-blue-600 mb-4">ECEO & Founder</p>
                <p className="text-gray-600">
                  Pengalaman lebih dari 10 tahun di industri pariwisata
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">Ary</h3>
                <p className="text-blue-600 mb-4">IT Engineer</p>
                <p className="text-gray-600">
                  Pengalaman lebih dari 5 tahun di industri teknologi
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">Amanda</h3>
                <p className="text-blue-600 mb-4">CEO</p>
                <p className="text-gray-600">
                  Pengalaman lebih dari 100 tahun di industri pariwisata
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kontak Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form Kontak */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Hubungi Kami
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pesan
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>

            {/* Info Kontak */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <Envelope
                  size={28}
                  className="text-blue-600 mt-1 flex-shrink-0"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Email
                  </h3>
                  <p className="text-gray-600">info@wisataindonesia.com</p>
                  <p className="text-gray-600">support@wisataindonesia.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone size={28} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Telepon
                  </h3>
                  <p className="text-gray-600">+62 21 1234 5678</p>
                  <p className="text-gray-600">+62 812 3456 7890</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin
                  size={28}
                  className="text-blue-600 mt-1 flex-shrink-0"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Kantor Pusat
                  </h3>
                  <p className="text-gray-600">
                    Gedung Wisata Mandiri Lt. 15
                    <br />
                    Jl. Sudirman Kav. 25
                    <br />
                    Jakarta Selatan 12920
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2023 Wisata Indonesia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
