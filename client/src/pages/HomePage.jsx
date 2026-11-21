import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import {
  AirplaneTakeoff,
  MapPinLine,
  CalendarBlank,
  ArrowsLeftRight,
  Users,
  PaperPlaneTilt,
  ArrowRight,
  CheckCircle,
  Tag,
  Headset,
  ShieldCheck,
  ArrowsClockwise,
  Buildings,
  Compass,
  Car,
  AirplaneInFlight,
  WarningCircle,
  X,
  Ticket,
  Crown,
  ForkKnife,
  QrCode,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TOP_DESTINATIONS = [
  // ─── 10 ĐIỂM ĐẾN NỘI ĐỊA VIỆT NAM ───
  {
    city: "Hà Nội",
    code: "HAN",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Thủ đô nghìn năm",
    price: "850.000đ",
    image:
      "https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "TP. Hồ Chí Minh",
    code: "SGN",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Thành phố năng động",
    price: "850.000đ",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Đà Nẵng",
    code: "DAD",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Điểm đến Hot",
    price: "550.000đ",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Phú Quốc",
    code: "PQC",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Đảo ngọc nghỉ dưỡng",
    price: "590.000đ",
    image:
      "https://images.unsplash.com/photo-1516815231560-8f41ec531527?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Đà Lạt",
    code: "DLI",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Thành phố ngàn hoa",
    price: "550.000đ",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Nha Trang",
    code: "CXR",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Thiên đường biển ngọc",
    price: "650.000đ",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Huế",
    code: "HUI",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Cố đô di sản",
    price: "550.000đ",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Hải Phòng",
    code: "HPH",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Cửa ngõ Vịnh Lan Hạ",
    price: "850.000đ",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Cần Thơ",
    code: "VCA",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Thủ phủ Miền Tây",
    price: "850.000đ",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Quy Nhơn",
    code: "UIH",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Kỳ Co – Eo Gió",
    price: "590.000đ",
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000&auto=format&fit=crop",
  },
  // ─── 9 ĐIỂM ĐẾN QUỐC TẾ (ĐNA, ĐBA & TRUNG QUỐC) ───
  {
    city: "Singapore",
    code: "SIN",
    from: "SGN",
    country: "Singapore",
    region: "international",
    featured: true,
    badge: "Quốc đảo sư tử",
    price: "2.150.000đ",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Seoul",
    code: "ICN",
    from: "HAN",
    country: "Hàn Quốc",
    region: "international",
    featured: true,
    badge: "Xứ sở Kim Chi",
    price: "4.650.000đ",
    image:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Tokyo",
    code: "NRT",
    from: "SGN",
    country: "Nhật Bản",
    region: "international",
    featured: true,
    badge: "Xứ sở Hoa Anh Đào",
    price: "5.450.000đ",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Thượng Hải",
    code: "PVG",
    from: "HAN",
    country: "Trung Quốc",
    region: "international",
    featured: true,
    badge: "Bến Thượng Hải",
    price: "3.840.000đ",
    image:
      "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Bắc Kinh",
    code: "PEK",
    from: "HAN",
    country: "Trung Quốc",
    region: "international",
    featured: false,
    badge: "Vạn Lý Trường Thành",
    price: "4.150.000đ",
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Quảng Châu",
    code: "CAN",
    from: "SGN",
    country: "Trung Quốc",
    region: "international",
    featured: false,
    badge: "Thủ phủ thương mại",
    price: "2.650.000đ",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Thâm Quyến",
    code: "SZX",
    from: "SGN",
    country: "Trung Quốc",
    region: "international",
    featured: false,
    badge: "Thung lũng công nghệ",
    price: "2.750.000đ",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Kuala Lumpur",
    code: "KUL",
    from: "SGN",
    country: "Malaysia",
    region: "international",
    featured: false,
    badge: "Tháp đôi Petronas",
    price: "2.190.000đ",
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Phnom Penh",
    code: "PNH",
    from: "SGN",
    country: "Campuchia",
    region: "international",
    featured: false,
    badge: "Đường bay ngắn 55 phút",
    price: "1.750.000đ",
    image:
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1000&q=85",
  },
];

function ServiceCityPicker({ icon: Icon, value, options, placeholder, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedValue = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
  const filteredOptions = options.filter((city) => city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .includes(normalizedValue));

  const selectCity = (city) => {
    onChange(city);
    setIsOpen(false);
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-slate-400" />
        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400"
          value={value}
          onFocus={() => {
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onChange={(event) => {
            onChange(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && filteredOptions.length > 0) {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex((index) => (index + 1) % filteredOptions.length);
            } else if (event.key === "ArrowUp" && filteredOptions.length > 0) {
              event.preventDefault();
              setActiveIndex((index) => (index <= 0 ? filteredOptions.length - 1 : index - 1));
            } else if (event.key === "Enter" && isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
              event.preventDefault();
              selectCity(filteredOptions[activeIndex]);
            } else if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+14px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.28)]"
        >
          <div className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Chọn thành phố
          </div>
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => selectCity("")}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
              !value ? "bg-blue-50 text-blue-800" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <MapPinLine size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Tất cả địa điểm</span>
              <span className="mt-0.5 block text-[11px] text-slate-400">Hiển thị toàn bộ danh sách</span>
            </span>
            {!value && <CheckCircle size={17} weight="fill" className="text-blue-600" />}
          </button>

          {filteredOptions.map((city, index) => (
            <button
              type="button"
              role="option"
              aria-selected={value === city}
              key={city}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectCity(city)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                activeIndex === index ? "bg-blue-50 text-blue-800" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                activeIndex === index ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}>
                <MapPinLine size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{city}</span>
                <span className="mt-0.5 block text-[11px] text-slate-400">Thành phố</span>
              </span>
              {value === city && <CheckCircle size={17} weight="fill" className="text-blue-600" />}
            </button>
          ))}

          {filteredOptions.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-slate-500">
              Không tìm thấy thành phố phù hợp. Bạn vẫn có thể tìm theo tên dịch vụ.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const dateAfterDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => { });
    }
  }, []);

  const [airports, setAirports] = useState([]);
  const [activeTab, setActiveTab] = useState("flights");
  const [destFilter, setDestFilter] = useState("featured"); // "featured" | "domestic" | "international"
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [serviceSearch, setServiceSearch] = useState({
    hotel: { q: "", start_date: dateAfterDays(1), end_date: dateAfterDays(2) },
    experience: { q: "", start_date: dateAfterDays(1) },
    car: { q: "", start_date: dateAfterDays(1), end_date: dateAfterDays(2) },
  });
  const [serviceSuggestions, setServiceSuggestions] = useState({});

  const [searchData, setSearchData] = useState({
    departure: "",
    arrival: "",
    date: dateAfterDays(1),
    returnDate: dateAfterDays(3),
    tripType: "one-way",
    flightClass: "economy",
    passengers: { adults: 1, children: 0 }
  });
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleUpdatePassengers = (type, change) => {
    setSearchData(prev => {
      const total = prev.passengers.adults + prev.passengers.children;
      if (change > 0 && total >= 9) return prev;
      const current = prev.passengers[type];
      const next = Math.max(0, current + change);
      if (type === "adults" && next < 1) return prev;
      return {
        ...prev,
        passengers: {
          ...prev.passengers,
          [type]: next
        }
      };
    });
  };

  const handleSwap = () => {
    setSearchError("");
    setSearchData(prev => ({
      ...prev,
      departure: prev.arrival,
      arrival: prev.departure
    }));
  };

  const handleBookDestination = (fromCode, toCode) => {
    const departDate = searchData.date || dateAfterDays(1);
    localStorage.setItem(
      "search_params",
      JSON.stringify({
        departure: fromCode,
        arrival: toCode,
        date: departDate,
        returnDate: "",
        tripType: "one-way",
        flightClass: searchData.flightClass || "economy",
        passengers: searchData.passengers || { adults: 1, children: 0 },
      })
    );
    navigate("/flights");
  };

  useEffect(() => {
    axios.get("/api/airports")
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        setAirports(list);
      })
      .catch(err => {
        console.error("Failed to load airports:", err);
        setAirports([]);
      });
  }, []);

  useEffect(() => {
    setSearchError("");
    if (activeTab === "flights") return;

    const type = activeTab === "hotels" ? "hotel" : activeTab === "experiences" ? "experience" : "car";
    axios.get(`/api/travel-services/${type}`, { params: { per_page: 200 } })
      .then(({ data }) => {
        const products = data.data?.data || [];
        const suggestions = [...new Set(products.map((product) => product.city).filter(Boolean))];
        setServiceSuggestions((previous) => ({ ...previous, [type]: suggestions }));
      })
      .catch((error) => {
        console.error(`Failed to load ${type} suggestions:`, error);
        setServiceSuggestions((previous) => ({ ...previous, [type]: [] }));
      });
  }, [activeTab]);

  const handleSearch = () => {
    setSearchError("");
    if (activeTab !== "flights") {
      const type = activeTab === "hotels" ? "hotel" : activeTab === "experiences" ? "experience" : "car";
      const search = serviceSearch[type];

      if (!search.start_date) {
        setSearchError("Vui lòng chọn ngày bắt đầu.");
        return;
      }
      if (type !== "experience" && (!search.end_date || search.end_date <= search.start_date)) {
        setSearchError("Ngày trả phải sau ngày bắt đầu.");
        return;
      }

      const params = new URLSearchParams({
        ...search,
        guests: String(searchData.passengers.adults + searchData.passengers.children),
      });
      navigate(`/travel/${type}?${params.toString()}`);
      return;
    }

    if (!searchData.departure || !searchData.arrival) {
      setSearchError("Vui lòng chọn đầy đủ điểm đi và điểm đến.");
      return;
    }
    if (searchData.departure === searchData.arrival) {
      setSearchError("Điểm đi và điểm đến không được trùng nhau. Vui lòng chọn lại.");
      return;
    }
    if (!searchData.date) {
      setSearchError("Vui lòng chọn ngày đi.");
      return;
    }
    if (searchData.date < today) {
      setSearchError("Ngày đi không thể ở trong quá khứ.");
      return;
    }
    if (searchData.tripType === "round-trip" && !searchData.returnDate) {
      setSearchError("Vui lòng chọn ngày về cho chuyến khứ hồi.");
      return;
    }
    if (searchData.tripType === "round-trip" && searchData.returnDate < searchData.date) {
      setSearchError("Ngày về phải sau hoặc cùng ngày với ngày đi.");
      return;
    }
    localStorage.setItem("search_params", JSON.stringify(searchData));
    navigate("/flights");
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[100dvh] bg-[#f8fafc] text-slate-900 font-sans font-medium selection:bg-blue-600 selection:text-white"
    >
      {/* 1. TOP NAVIGATION */}
      <Navbar />

      {/* 2. HERO SECTION matching Genesis Model (Image 2) */}
      <section className="relative pt-16 flex flex-col items-center w-full">
        {/* Background Image / Video Area with Sunset Terminal Scenery */}
        <div
          className="w-full h-[50vh] md:h-[58vh] overflow-hidden relative bg-cover bg-center bg-slate-900"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop')" }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>

          {/* Golden Sunset Ambient Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-black/40"></div>

          {/* Hero Typography */}
          <div className="absolute top-[19%] left-1/2 -translate-x-1/2 text-center text-white z-10 w-full max-w-4xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white/95 text-[11px] font-extrabold uppercase tracking-[0.18em] mb-3 border border-white/25 shadow-md"
            >
              <PaperPlaneTilt size={13} weight="fill" className="text-sky-300" />
              HÀNH TRÌNH 5 SAO BẮT ĐẦU TỪ ĐÂY <ArrowRight size={11} weight="bold" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-black text-4xl md:text-6xl tracking-tight leading-none mb-2.5 drop-shadow-2xl text-white font-sans"
            >
              SkyLink Airlines
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-slate-100 font-medium max-w-xl mx-auto drop-shadow-md tracking-wide"
            >
              Trải nghiệm bay đẳng cấp, kết nối mọi điểm đến Việt Nam &amp; quốc tế
            </motion.p>
          </div>
        </div>

        {/* 3. FLOATING SEARCH ENGINE CARD */}
        <div className="relative z-20 w-full max-w-5xl px-4 -mt-20 md:-mt-28 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.4 }}
            className="w-full bg-white rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_-15px_rgba(13,62,145,0.20)] border border-blue-100/90"
          >
            {/* Inline Validation Error Banner */}
            {searchError && (
              <div
                role="alert"
                className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700"
              >
                <div className="flex items-center gap-2">
                  <WarningCircle size={18} weight="fill" className="shrink-0 text-red-500" />
                  <span>{searchError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchError("")}
                  className="cursor-pointer rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-700"
                  aria-label="Đóng thông báo lỗi"
                >
                  <X size={15} weight="bold" />
                </button>
              </div>
            )}
            {/* Top Category Tabs matching Image 2 */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
              
              {/* Category Icons */}
              <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
                <button
                  type="button"
                  onClick={() => setActiveTab("flights")}
                  className={`flex items-center gap-2 pb-2 -mb-5 border-b-2 transition-all cursor-pointer ${
                    activeTab === "flights"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent hover:text-slate-800"
                  }`}
                >
                  <AirplaneTakeoff size={18} weight="bold" />
                  <span>Chuyến bay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("hotels")}
                  className={`flex items-center gap-2 pb-2 -mb-5 border-b-2 transition-all cursor-pointer ${
                    activeTab === "hotels"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent hover:text-slate-800"
                  }`}
                >
                  <Buildings size={18} />
                  <span>Khách sạn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("experiences")}
                  className={`flex items-center gap-2 pb-2 -mb-5 border-b-2 transition-all cursor-pointer ${
                    activeTab === "experiences"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent hover:text-slate-800"
                  }`}
                >
                  <Compass size={18} />
                  <span>Trải nghiệm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("cars")}
                  className={`flex items-center gap-2 pb-2 -mb-5 border-b-2 transition-all cursor-pointer ${
                    activeTab === "cars"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent hover:text-slate-800"
                  }`}
                >
                  <Car size={18} />
                  <span>Thuê xe</span>
                </button>
              </div>

              {/* Trip Type Toggle Buttons (Only for Flights) */}
              {activeTab === "flights" && (
                <div
                  className="flex items-center gap-1 border border-blue-100 bg-[#f0f6ff] p-1"
                  style={{ borderRadius: 9999 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSearchError("");
                      setSearchData((prev) => ({ ...prev, tripType: "one-way" }));
                    }}
                    className="cursor-pointer px-4 py-1.5 text-xs font-extrabold transition-all"
                    style={
                      searchData.tripType === "one-way"
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            boxShadow: "0 4px 12px rgba(13, 97, 225, 0.25)",
                            borderRadius: 9999,
                            border: "none",
                          }
                        : {
                            background: "transparent",
                            color: "#33507f",
                            borderRadius: 9999,
                            border: "none",
                          }
                    }
                  >
                    Một chiều
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchError("");
                      setSearchData((prev) => ({
                        ...prev,
                        tripType: "round-trip",
                        returnDate:
                          prev.returnDate && prev.returnDate >= (prev.date || today)
                            ? prev.returnDate
                            : dateAfterDays(3),
                      }));
                    }}
                    className="cursor-pointer px-4 py-1.5 text-xs font-extrabold transition-all"
                    style={
                      searchData.tripType === "round-trip"
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            boxShadow: "0 4px 12px rgba(13, 97, 225, 0.25)",
                            borderRadius: 9999,
                            border: "none",
                          }
                        : {
                            background: "transparent",
                            color: "#33507f",
                            borderRadius: 9999,
                            border: "none",
                          }
                    }
                  >
                    Khứ hồi
                  </button>
                </div>
              )}

            </div>

            {/* FLIGHTS SEARCH FORM */}
            {activeTab === "flights" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Departure Input */}
                <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3 hover:border-slate-300 transition-colors relative">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Điểm đi</label>
                  <div className="flex items-center gap-2">
                    <MapPinLine size={16} className="text-slate-400 shrink-0" />
                    <select
                      className={`w-full bg-transparent text-xs font-bold outline-none cursor-pointer appearance-none pr-4 ${
                        searchData.departure ? "text-slate-900" : "text-slate-400"
                      }`}
                      value={searchData.departure}
                      onChange={(e) => setSearchData({ ...searchData, departure: e.target.value })}
                    >
                      <option value="">Chọn điểm đi</option>
                      {(Array.isArray(airports) ? airports : []).map(ap => (
                        <option key={ap.id || ap.code} value={ap.code} className="text-slate-900 font-medium">
                          {ap.city} ({ap.code}) - {ap.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button Icon */}
                <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-9 h-9 bg-white border border-slate-300 shadow-xs flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 cursor-pointer transition-all transform hover:rotate-180"
                    style={{ borderRadius: 9999 }}
                    title="Đổi điểm đi & đến"
                  >
                    <ArrowsLeftRight size={14} weight="bold" />
                  </button>
                </div>

                {/* Arrival Input */}
                <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3 hover:border-slate-300 transition-colors">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Điểm đến</label>
                  <div className="flex items-center gap-2">
                    <MapPinLine size={16} className="text-slate-400 shrink-0" />
                    <select
                      className={`w-full bg-transparent text-xs font-bold outline-none cursor-pointer appearance-none pr-4 ${
                        searchData.arrival ? "text-slate-900" : "text-slate-400"
                      }`}
                      value={searchData.arrival}
                      onChange={(e) => {
                        setSearchError("");
                        setSearchData({ ...searchData, arrival: e.target.value });
                      }}
                    >
                      <option value="">Chọn điểm đến</option>
                      {(Array.isArray(airports) ? airports : []).map(ap => (
                        <option key={ap.id || ap.code} value={ap.code} className="text-slate-900 font-medium">
                          {ap.city} ({ap.code}) - {ap.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Depart Date Input */}
                <div className={`${searchData.tripType === "round-trip" ? "md:col-span-2" : "md:col-span-5"} bg-slate-50 border border-slate-200/90 rounded-2xl p-3 hover:border-slate-300 transition-colors`}>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Ngày đi</label>
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="date"
                      className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                      min={today}
                    />
                  </div>
                </div>

                {/* Return Date Input (Only visible when tripType is round-trip) */}
                {searchData.tripType === "round-trip" && (
                  <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3 hover:border-slate-300 transition-colors">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Ngày về</label>
                    <div className="flex items-center gap-2">
                      <CalendarBlank size={16} className="text-slate-400 shrink-0" />
                      <input
                        type="date"
                        className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
                        value={searchData.returnDate}
                        onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                        min={searchData.date || today}
                      />
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* HOTELS SEARCH FORM */}
            {activeTab === "hotels" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-5 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Thành phố hoặc Khách sạn</label>
                  <ServiceCityPicker
                    icon={Buildings}
                    value={serviceSearch.hotel.q}
                    options={serviceSuggestions.hotel || []}
                    placeholder="Để trống để xem tất cả hoặc chọn thành phố..."
                    onChange={(value) => setServiceSearch((prev) => ({
                      ...prev,
                      hotel: { ...prev.hotel, q: value },
                    }))}
                  />
                </div>
                <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Nhận phòng</label>
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="date"
                      className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
                      min={today}
                      value={serviceSearch.hotel.start_date}
                      onChange={(e) => setServiceSearch((prev) => ({
                        ...prev,
                        hotel: { ...prev.hotel, start_date: e.target.value },
                      }))}
                    />
                  </div>
                </div>
                <div className="md:col-span-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Trả phòng</label>
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="date"
                      className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
                      min={serviceSearch.hotel.start_date || today}
                      value={serviceSearch.hotel.end_date}
                      onChange={(e) => setServiceSearch((prev) => ({
                        ...prev,
                        hotel: { ...prev.hotel, end_date: e.target.value },
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EXPERIENCES SEARCH FORM */}
            {activeTab === "experiences" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-7 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Địa điểm & Trải nghiệm</label>
                  <ServiceCityPicker
                    icon={Compass}
                    value={serviceSearch.experience.q}
                    options={serviceSuggestions.experience || []}
                    placeholder="Để trống để xem tất cả hoặc chọn thành phố..."
                    onChange={(value) => setServiceSearch((prev) => ({
                      ...prev,
                      experience: { ...prev.experience, q: value },
                    }))}
                  />
                </div>
                <div className="md:col-span-5 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Ngày trải nghiệm</label>
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="date"
                      className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
                      min={today}
                      value={serviceSearch.experience.start_date}
                      onChange={(e) => setServiceSearch((prev) => ({
                        ...prev,
                        experience: { ...prev.experience, start_date: e.target.value },
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CAR RENTAL SEARCH FORM */}
            {activeTab === "cars" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-5 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Địa điểm nhận xe</label>
                  <ServiceCityPicker
                    icon={Car}
                    value={serviceSearch.car.q}
                    options={serviceSuggestions.car || []}
                    placeholder="Để trống để xem tất cả hoặc chọn thành phố..."
                    onChange={(value) => setServiceSearch((prev) => ({
                      ...prev,
                      car: { ...prev.car, q: value },
                    }))}
                  />
                </div>
                <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Ngày nhận</label>
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="date"
                      className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
                      min={today}
                      value={serviceSearch.car.start_date}
                      onChange={(e) => setServiceSearch((prev) => ({
                        ...prev,
                        car: { ...prev.car, start_date: e.target.value },
                      }))}
                    />
                  </div>
                </div>
                <div className="md:col-span-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-0.5">Ngày trả</label>
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="date"
                      className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
                      min={serviceSearch.car.start_date || today}
                      value={serviceSearch.car.end_date}
                      onChange={(e) => setServiceSearch((prev) => ({
                        ...prev,
                        car: { ...prev.car, end_date: e.target.value },
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Row: Passengers & Cabin + Search Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
              
              {/* Passengers & Cabin Picker */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#f4f8ff] border border-blue-100 text-xs font-extrabold text-[#123975] hover:bg-blue-50 transition-colors cursor-pointer w-full sm:w-auto justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-600" weight="bold" />
                    <span>
                      {activeTab === "flights" ? "Hành khách" : "Số khách"}:{" "}
                      {searchData.passengers.adults + searchData.passengers.children} Người
                      {activeTab === "flights" &&
                        ` • ${searchData.flightClass === "business" ? "Thương gia" : "Phổ thông"}`}
                    </span>
                  </div>
                  <span className="text-blue-500">˅</span>
                </button>

                {showPassengerDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowPassengerDropdown(false)} />
                    <div className="absolute left-0 mt-2 w-72 bg-white border border-blue-100 rounded-2xl p-4 shadow-2xl z-30">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">Người lớn</div>
                            <div className="text-xs text-slate-400">Từ 12 tuổi trở lên</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdatePassengers("adults", -1)}
                              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-blue-400 text-slate-600 transition-colors cursor-pointer font-bold"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-slate-900 w-4 text-center">
                              {searchData.passengers.adults}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePassengers("adults", 1)}
                              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-blue-400 text-slate-600 transition-colors cursor-pointer font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">Trẻ em</div>
                            <div className="text-xs text-slate-400">2 – 11 tuổi</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdatePassengers("children", -1)}
                              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-blue-400 text-slate-600 transition-colors cursor-pointer font-bold"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-slate-900 w-4 text-center">
                              {searchData.passengers.children}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePassengers("children", 1)}
                              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-blue-400 text-slate-600 transition-colors cursor-pointer font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {activeTab === "flights" && (
                          <div className="border-t border-slate-100 pt-3">
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                              Hạng ghế
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "economy", label: "Phổ thông" },
                                { id: "business", label: "Thương gia" },
                              ].map((cabin) => {
                                const isActive = searchData.flightClass === cabin.id;
                                return (
                                  <button
                                    key={cabin.id}
                                    type="button"
                                    onClick={() =>
                                      setSearchData((prev) => ({ ...prev, flightClass: cabin.id }))
                                    }
                                    className="cursor-pointer rounded-xl py-2 text-xs font-extrabold transition"
                                    style={
                                      isActive
                                        ? {
                                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                                            color: "#ffffff",
                                            border: "1px solid #0b5ed7",
                                          }
                                        : {
                                            background: "#f4f8ff",
                                            color: "#1e3f77",
                                            border: "1px solid #d5e6fc",
                                          }
                                    }
                                  >
                                    {cabin.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400 font-semibold">
                          <span>Tối đa 9 hành khách / lần đặt</span>
                          <button
                            type="button"
                            onClick={() => setShowPassengerDropdown(false)}
                            className="cursor-pointer font-extrabold text-blue-600 hover:underline"
                          >
                            Xong
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Search Button */}
              <button
                type="button"
                onClick={handleSearch}
                className="w-full sm:w-auto text-white font-black px-8 py-3.5 text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  boxShadow: "0 10px 24px rgba(13, 97, 225, 0.30)",
                  borderRadius: 9999,
                  border: "none",
                }}
              >
                <span>
                  {activeTab === "flights" && "Tìm chuyến bay"}
                  {activeTab === "hotels" && "Tìm khách sạn"}
                  {activeTab === "experiences" && "Tìm trải nghiệm"}
                  {activeTab === "cars" && "Tìm xe dịch vụ"}
                </span>
                <ArrowRight size={16} weight="bold" />
              </button>

            </div>

          </motion.div>

          {/* Quick Actions Bar for Returning Passengers */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {[
              {
                label: "Check-in trực tuyến",
                sub: "Nhận thẻ QR",
                icon: QrCode,
                to: "/check-in",
                accent: "#0b57d0",
                bg: "#eff6ff",
              },
              {
                label: "Tình trạng chuyến bay",
                sub: "Giờ bay & Cửa Gate",
                icon: AirplaneInFlight,
                to: "/flight-status",
                accent: "#0284c7",
                bg: "#f0f9ff",
              },
              {
                label: "Quản lý đặt chỗ (PNR)",
                sub: "Đổi / Hủy vé",
                icon: Ticket,
                to: "/my-bookings",
                accent: "#059669",
                bg: "#ecfdf5",
              },
              {
                label: "eSIM 5G & SkyLounge",
                sub: "Tiện ích quốc tế",
                icon: Crown,
                to: "/services/esim-lounge",
                accent: "#d97706",
                bg: "#fffbeb",
              },
              {
                label: "Suất ăn đặc biệt",
                sub: "Đăng ký miễn phí",
                icon: ForkKnife,
                to: "/services/meals",
                accent: "#7c3aed",
                bg: "#f5f3ff",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="inline-flex cursor-pointer items-center gap-2.5 bg-white px-4 py-2.5 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderRadius: 9999,
                    border: "1px solid #d5e6fc",
                  }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: item.bg, color: item.accent }}
                  >
                    <Icon size={15} weight="fill" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-xs font-extrabold text-[#091e47]">
                      {item.label}
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      {item.sub}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. VALUE PROPOSITION FEATURE STRIP (Clickable) */}
        <div className="w-full max-w-6xl px-6 mx-auto mb-16">
          <div className="relative bg-gradient-to-r from-[#edf4ff] via-[#e6f1fe] to-[#edf4ff] border border-blue-100/90 rounded-[28px] p-4 sm:p-5 shadow-xs overflow-hidden">
            
            {/* Background dashed flight path & plane illustration */}
            <div className="absolute right-6 top-3 pointer-events-none hidden sm:flex items-center gap-1 opacity-40">
              <svg width="120" height="30" viewBox="0 0 120 30" fill="none" className="text-blue-400">
                <path d="M0 25 C 40 25, 80 5, 120 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
              <AirplaneInFlight size={22} weight="fill" className="text-blue-500 transform rotate-12 -ml-2 -mt-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
              
              {/* Card 1: Giá tốt nhất */}
              <button
                type="button"
                onClick={() => navigate("/promotions")}
                className="group bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#eaf2ff] border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                    <Tag size={22} weight="fill" className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#13234d] leading-snug">Đảm bảo giá tốt nhất</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Xem ưu đãi mới nhất</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={11} weight="bold" />
                </div>
              </button>

              {/* Card 2: Hỗ trợ 24/7 */}
              <button
                type="button"
                onClick={() => navigate("/support")}
                className="group bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8faee] border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                    <Headset size={22} weight="fill" className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#13234d] leading-snug">Hỗ trợ 24/7</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Luôn sẵn sàng tư vấn</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={11} weight="bold" />
                </div>
              </button>

              {/* Card 3: Đặt vé an toàn */}
              <button
                type="button"
                onClick={() => navigate("/flight-safety/policy")}
                className="group bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#e6f4ff] border border-sky-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                    <ShieldCheck size={22} weight="fill" className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#13234d] leading-snug">An toàn chuẩn 5 sao</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tiêu chuẩn IOSA / ICAO</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-sky-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={11} weight="bold" />
                </div>
              </button>

              {/* Card 4: Linh hoạt đổi vé */}
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="group bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#fff2e8] border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-inner">
                    <ArrowsClockwise size={22} weight="bold" className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#13234d] leading-snug">Linh hoạt đổi vé</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Quản lý &amp; đổi lịch trình</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={11} weight="bold" />
                </div>
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* 5. POPULAR DESTINATIONS & EXCLUSIVE OFFERS GRID */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Điểm đến hàng đầu
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Khám phá trọn bộ 19 điểm đến Nội địa Việt Nam &amp; Quốc tế cùng SkyLink Airlines
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center gap-1 border border-blue-100 bg-[#f0f6ff] p-1"
              style={{ borderRadius: 9999 }}
            >
              {[
                { id: "featured", label: "Nổi bật (9)" },
                { id: "domestic", label: "Nội địa (10)" },
                { id: "international", label: "Quốc tế (9)" },
              ].map((tab) => {
                const active = destFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDestFilter(tab.id)}
                    className="cursor-pointer px-4 py-1.5 text-xs font-extrabold transition"
                    style={
                      active
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            borderRadius: 9999,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(13, 97, 225, 0.24)",
                          }
                        : {
                            background: "transparent",
                            color: "#33507f",
                            borderRadius: 9999,
                            border: "none",
                          }
                    }
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Destination Cards Grid (Featured 9 / Domestic 10 / International 9) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {TOP_DESTINATIONS.filter((d) =>
            destFilter === "featured" ? d.featured : d.region === destFilter
          ).map((dest) => (
            <div
              key={dest.code}
              onClick={() => handleBookDestination(dest.from, dest.code)}
              className="relative rounded-3xl overflow-hidden shadow-lg group h-[320px] border border-blue-100/80 cursor-pointer"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-white/30">
                  {dest.badge}
                </span>
                <span className="bg-blue-600/85 backdrop-blur-md text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-full border border-white/25">
                  {dest.from} → {dest.code}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-1">
                <h3 className="text-2xl font-black">
                  {dest.city} ({dest.code})
                </h3>
                <p className="text-xs text-slate-300 font-medium">{dest.country}</p>
                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-[10px] text-slate-300 block uppercase font-bold">
                      Giá từ
                    </span>
                    <span className="text-lg font-black text-white">
                      {dest.price}{" "}
                      <span className="text-xs font-medium text-slate-300">/Vé</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookDestination(dest.from, dest.code);
                    }}
                    className="inline-flex items-center gap-1.5 bg-white text-[#0b4fd0] hover:bg-blue-50 font-extrabold text-xs px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    <span>Đặt vé ngay</span>
                    <ArrowRight size={12} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full-width Exclusive Offers Banner Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[#122754] via-[#0f1f42] to-[#071026] p-8 border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="space-y-2 relative z-10 max-w-xl">
            <h3 className="text-2xl font-black tracking-tight">Ưu đãi độc quyền cho thành viên SkyLink</h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Đăng ký email ngay hôm nay để nhận mã giảm giá lên tới <strong className="text-cyan-400 font-bold text-base">20%</strong> cho mọi chuyến bay nội địa và quốc tế.
            </p>
          </div>

          {/* Airplane illustration in background */}
          <div className="absolute right-1/3 bottom-0 opacity-15 pointer-events-none hidden lg:block">
            <PaperPlaneTilt size={200} weight="fill" className="text-blue-400" />
          </div>

          <form onSubmit={handleNewsletter} className="w-full md:w-auto min-w-[320px] space-y-2 relative z-10">
            <div className="relative">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-400 outline-none focus:border-cyan-400 transition-colors pr-12"
                required
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <PaperPlaneTilt size={20} weight="fill" />
              </button>
            </div>
            {newsletterSubscribed && (
              <p className="text-[11px] text-emerald-400 font-semibold">✓ Đăng ký nhận ưu đãi thành công!</p>
            )}
          </form>
        </div>

      </section>

      {/* 6. PARTNER AIRLINES LOGO STRIP matching Image 2 */}
      <section className="border-t border-slate-200/80 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 transition-all text-xs font-black tracking-widest text-slate-700 uppercase">
            <span>EMIRATES</span>
            <span>QATAR AIRWAYS</span>
            <span>LUFTHANSA</span>
            <span>AIRFRANCE</span>
            <span>DELTA</span>
            <span>TURKISH AIRLINES</span>
            <span>BRITISH AIRWAYS</span>
            <span>SINGAPORE AIRLINES</span>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <Footer />
    </motion.div>
  );
}