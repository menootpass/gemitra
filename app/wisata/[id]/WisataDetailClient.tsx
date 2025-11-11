"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import SidebarCart from "../../components/SidebarCart";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import CommentForm from "../../components/CommentForm";
import OptimizedImageSlider from "../../components/OptimizedImageSlider";
import { CartItem, Destination } from "../../types";
import { ShoppingCartSimple } from "phosphor-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPriceByLanguage, formatPrice, createCartItemWithPricing } from "../../utils/priceUtils";

interface WisataDetailClientProps {
  destination: Destination;
}

export default function WisataDetailClient({ destination: data }: WisataDetailClientProps) {
  const { dictionary, locale } = useLanguage();

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [kendaraan, setKendaraan] = useState("Mobilio");
  const [visibleSidebar, setVisibleSidebar] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Booking state
  const [tanggalBooking, setTanggalBooking] = useState("");
  const [waktuBooking, setWaktuBooking] = useState("");
  const [jumlahPenumpang, setJumlahPenumpang] = useState(1);

  // Real-time comments state
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Cart notification state
  const [showCartNotification, setShowCartNotification] = useState(false);
   
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("gemitra_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          console.warn('Invalid cart data in localStorage, resetting to empty array');
          localStorage.removeItem("gemitra_cart");
          setCart([]);
        }
      }
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      localStorage.removeItem("gemitra_cart");
      setCart([]);
    }
    
    const savedKendaraan = localStorage.getItem("gemitra_kendaraan");
    if (savedKendaraan) setKendaraan(savedKendaraan);
    const savedTanggal = localStorage.getItem("gemitra_tanggal");
    if (savedTanggal) setTanggalBooking(savedTanggal);
    const savedWaktu = localStorage.getItem("gemitra_waktu");
    if (savedWaktu) setWaktuBooking(savedWaktu);
    const savedPenumpang = localStorage.getItem("gemitra_penumpang");
    if (savedPenumpang) setJumlahPenumpang(parseInt(savedPenumpang));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && Array.isArray(cart)) {
      try {
        localStorage.setItem("gemitra_cart", JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("gemitra_kendaraan", kendaraan);
  }, [kendaraan, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("gemitra_tanggal", tanggalBooking);
  }, [tanggalBooking, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("gemitra_waktu", waktuBooking);
  }, [waktuBooking, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("gemitra_penumpang", jumlahPenumpang.toString());
  }, [jumlahPenumpang, hydrated]);

  // Update local comments when data changes
  useEffect(() => {
    if (data && data.komentar) {
      let comments = data.komentar;
      
      if (typeof comments === 'string') {
        try {
          comments = JSON.parse(comments);
        } catch (error) {
          comments = [];
        }
      }
      
      if (Array.isArray(comments)) {
        setLocalComments(comments);
      } else {
        setLocalComments([]);
      }
    } else {
      setLocalComments([]);
    }
  }, [data]);

  // Hitung rating rata-rata dengan useMemo
  const averageRating = useMemo(() => {
    return localComments.length > 0 
      ? localComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / localComments.length
      : 0;
  }, [localComments]);

  // Optimize handlers dengan useCallback
  const handleAddToCart = useCallback(() => {
    if (!data) return;
    if (cart.find(item => item.id == data.id)) return;
    if (cart.length >= 3) return;
    
    // Debug: log destination data before creating cart item
    console.log('Destination data before creating cart item:', {
      id: data.id,
      nama: data.nama,
      harga: data.harga,
      mancanegara: data.mancanegara,
      locale: locale
    });
    
    const cartItem = createCartItemWithPricing(data, locale);
    
    // Debug: log created cart item
    console.log('Created cart item:', cartItem);
    
    setCart(prev => [...prev, cartItem]);
    
    setShowCartNotification(true);
    setTimeout(() => {
      setShowCartNotification(false);
    }, 4000);
  }, [data, cart, locale]);

  const handleRemoveFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleCommentAdded = useCallback((newComment: any) => {
    setLocalComments(prev => {
      const updated = [...prev, newComment];
      return updated;
    });
    
    setToastMessage(dictionary.wisataDetail.commentAdded);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    setTimeout(() => {
      const commentsContainer = document.querySelector('.comments-container');
      if (commentsContainer) {
        commentsContainer.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }
    }, 100);
  }, [dictionary.wisataDetail.commentAdded]);

  // Process image data dengan useMemo
  const processImageData = useMemo(() => {
    if (!data.img) return [];
    if (Array.isArray(data.img) && data.img.length > 0) {
      return data.img;
    }
    if (typeof data.img === 'string') {
      try {
        const parsed = JSON.parse(data.img);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        try {
          const cleaned = data.img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e2) {
          // Failed to parse even after cleaning
        }
      }
      
      if (data.img.startsWith('[') && data.img.endsWith(']')) {
        try {
          const urlMatches = data.img.match(/https?:\/\/[^\s,\]]+/g);
          if (urlMatches && urlMatches.length > 0) {
            return urlMatches;
          }
        } catch (e) {
          // Failed to extract URLs
        }
        
        try {
          const content = data.img.slice(1, -1);
          const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
          const validUrls = urls.filter((url: string) => url.startsWith('http'));
          if (validUrls.length > 0) {
            return validUrls;
          }
        } catch (e) {
          // Failed manual extraction
        }
        
        try {
          const content = data.img.slice(1, -1);
          const urls = content.split(',').map((url: string) => {
            const trimmed = url.trim();
            return trimmed.replace(/^["']|["']$/g, '');
          });
          const validUrls = urls.filter((url: string) => url.startsWith('http'));
          if (validUrls.length > 0) {
            return validUrls;
          }
        } catch (e) {
          // Failed additional parsing
        }
      }
      
      if (data.img.startsWith('http://') || data.img.startsWith('https://')) {
        return [data.img];
      }
      if (data.img.includes('drive.google.com')) {
        return [data.img];
      }
      if (data.img.includes('.com') || data.img.includes('.org') || data.img.includes('.net')) {
        return [`https://${data.img}`];
      }
      return [];
    }
    return [];
  }, [data.img]);

  if (!hydrated) {
    return (
      <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
        <div className="w-full max-w-3xl mx-auto mt-8 mb-6 flex-1">
          <LoadingSkeleton type="detail" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto mt-8 mb-6 flex-1">
        <div className="rounded-3xl overflow-hidden shadow-xl bg-glass">
          <div className="relative w-full h-72 sm:h-[26rem] lg:h-[30rem]">
            <OptimizedImageSlider 
              images={processImageData}
              alt={data.nama}
              className="w-full h-full object-cover"
              priority={true}
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
          
          {/* Tombol Tambahkan Destinasi Wisata */}
          <div className="p-4 border-b border-[#213DFF11] flex justify-end">
            <button
              className="bg-[#16A86E] text-white font-bold px-5 py-2 rounded-full shadow hover:bg-[#213DFF] transition disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={cart.length >= 3 || !!cart.find(item => item.id == data.id)}
            >
              {dictionary.wisataDetail.addDestination}
            </button>
          </div>
          
          <div className="p-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF]">{data.nama}</h1>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= averageRating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-[#16A86E] font-bold text-lg">
                  {averageRating > 0 ? averageRating.toFixed(1) : data.rating}★
                </span>
              </div>
            </div>
            <span className="text-black/60 text-sm mb-2">{data.lokasi} &middot; {data.kategori}</span>
            {(data.harga || data.mancanegara) && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#16A86E] font-bold text-xl">
                  {formatPrice(getPriceByLanguage(data, locale), locale)}
                </span>
                <span className="text-gray-500 text-sm">{dictionary.wisataDetail.perDestination}</span>
              </div>
            )}
            <p className="text-black/80 text-base mb-2">{data.deskripsi}</p>
            
            {/* Informasi Pengunjung */}
            {data.dikunjungi !== undefined && (
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="text-[#213DFF] font-semibold">👥</span>
                <span className="text-black/70">
                  {data.dikunjungi.toLocaleString()} {dictionary.wisataDetail.visitors}
                </span>
              </div>
            )}
            
            <div className="mb-2">
              <h2 className="font-bold text-[#16A86E] mb-1">{dictionary.wisataDetail.facilities}</h2>
              <ul className="flex flex-wrap gap-2">
                {(() => {
                  let fasilitasArray: string[] = [];
                  
                  if (data.fasilitas) {
                    if (Array.isArray(data.fasilitas)) {
                      fasilitasArray = data.fasilitas;
                    } else if (typeof data.fasilitas === 'string') {
                      try {
                        const parsed = JSON.parse(data.fasilitas);
                        if (Array.isArray(parsed)) {
                          fasilitasArray = parsed;
                        } else {
                          fasilitasArray = (data.fasilitas as string).split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
                        }
                      } catch (e) {
                        fasilitasArray = (data.fasilitas as string).split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
                      }
                    }
                  }
                  
                  return fasilitasArray.length > 0 ? (
                    fasilitasArray.map((f: string, index: number) => (
                      <li key={`${f}-${index}`} className="px-3 py-1 rounded-full bg-[#213DFF11] text-[#213DFF] text-xs font-semibold">{f}</li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm italic">No facilities information available</li>
                  );
                })()}
              </ul>
            </div>
            
            <div className="comments-container">
              <h2 className="font-bold text-[#16A86E] mb-1">{dictionary.wisataDetail.comments} ({localComments.length})</h2>
              <ul className="flex flex-col gap-2 mb-4">
                {localComments.length > 0 ? (
                  localComments.map((k, i: number) => (
                    <li 
                      key={`${k.nama}-${k.tanggal}-${i}`} 
                      className={`bg-[#16A86E11] rounded-xl px-3 py-2 text-sm transition-all duration-300 ${
                        i === localComments.length - 1 ? 'animate-pulse bg-[#16A86E22]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-bold text-[#16A86E]">{k.nama}</span>
                        {k.rating && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-xs ${
                                  star <= k.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({k.rating})</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700">{k.komentar}</p>
                      {k.tanggal && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(k.tanggal).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm italic">{dictionary.wisataDetail.noComments}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Comment Form */}
        <div className="mt-6">
          <CommentForm 
            destinationId={data.id} 
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </div>
      
      {/* Sidebar Cart Trigger Button */}
      {!visibleSidebar && (
        <button
          className="fixed right-4 bottom-4 z-40 bg-[#213DFF] text-white p-4 rounded-full shadow-lg hover:bg-[#16A86E] transition flex items-center justify-center cursor-pointer"
          style={{ boxShadow: "0 4px 24px 0 #213DFF22" }}
          onClick={() => setVisibleSidebar(true)}
          aria-label={dictionary.wisata.showCart}
        >
          <ShoppingCartSimple size={28} weight="bold" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}
      
      {/* Sidebar Cart */}
      <SidebarCart
        cart={cart}
        kendaraan={kendaraan}
        tanggalBooking={tanggalBooking}
        waktuBooking={waktuBooking}
        jumlahPenumpang={jumlahPenumpang}
        visible={visibleSidebar}
        onClose={() => setVisibleSidebar(false)}
        onRemoveFromCart={handleRemoveFromCart}
        onKendaraanChange={setKendaraan}
        onTanggalChange={setTanggalBooking}
        onWaktuChange={setWaktuBooking}
        onPenumpangChange={setJumlahPenumpang}
        onCartUpdate={setCart}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-bounce">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {toastMessage}
          </div>
        </div>
      )}
      
      {/* Cart Notification */}
      {showCartNotification && (
        <div className="fixed top-4 left-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-bounce">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="flex flex-col">
              <span className="font-semibold">{dictionary.wisata.addToCartNotification}</span>
              <span className="text-xs opacity-90">{dictionary.wisata.checkoutNotification}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
