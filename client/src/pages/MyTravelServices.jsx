import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  AirplaneTilt,
  Armchair,
  Bed,
  Camera,
  CaretDown,
  CaretRight,
  CaretUp,
  CalendarBlank,
  CalendarCheck,
  CarProfile,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  ForkKnife,
  Headset,
  Info,
  MapPinLine,
  Package,
  ShieldCheck,
  Sparkle,
  SquaresFour,
  SwimmingPool,
  Ticket,
  User,
  WifiHigh,
  X,
  XCircle,
} from "@phosphor-icons/react";
import api from "../api";
import Navbar from "../components/Navbar";
import { getCanonicalTravelProductImage } from "../utils/travelServiceImages";

/* 100% Distinct HD Images: Hero background & Card thumbnails NEVER share the same photo */
const HERO_BANNER_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

/* Distinct Flight Card Photos (completely different from HERO_BANNER_BG_URL) */
const FLIGHT_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=900&q=85",
];

/* Distinct Bright Modern Hotel Room Photos */
const HOTEL_IMAGE_IDS = [
  "photo-1578683010236-d716f9a3f461",
  "photo-1566665797739-1674de7a421a",
  "photo-1582719508461-905c673771fd",
  "photo-1590490360182-c33d57733427",
  "photo-1566073771259-6a8506099945",
  "photo-1564501049412-61c2a3083791",
  "photo-1571896349842-33c89424de2d",
  "photo-1542314831-068cd1dbfeeb",
  "photo-1596394516093-501ba68a0ba6",
  "photo-1566195992011-5f6b21e539aa",
  "photo-1512918728675-ed5a9ecdebfd",
  "photo-1568084680786-a84f91d1153c",
  "photo-1564013799919-ab600027ffc6",
  "photo-1535827841776-24afc1e255ac",
  "photo-1618773928121-c32242e63f39",
];

/* Distinct Car Rental Photos */
const CAR_IMAGE_IDS = [
  "photo-1549317661-bd32c8ce0db2",
  "photo-1503376780353-7e6692767b70",
  "photo-1492144534655-ae79c964c9d7",
  "photo-1503736334956-4c8f8e92946d",
  "photo-1552519507-da3b142c6e3d",
  "photo-1541899481282-d53bffe3c35d",
  "photo-1511919884226-fd3cad34687c",
  "photo-1493238792000-8113da705763",
  "photo-1504215680853-026ed2a45def",
  "photo-1533473359331-0135ef1b58bf",
  "photo-1525609004556-c46c7d6cf023",
  "photo-1542362567-b07e54358753",
  "photo-1551830820-330a71b99659",
  "photo-1617531653332-bd46c24f2068",
  "photo-1583121274602-3e2820c69888",
  "photo-1553440569-bcc63803a83d",
];

/* Distinct Bright Sunny Experience / Tour Photos */
const EXPERIENCE_IMAGE_IDS = [
  "photo-1507525428034-b723cf961d3e",
  "photo-1544551763-46a013bb70d5",
  "photo-1500375592092-40eb2168fd21",
  "photo-1528127269322-539801943592",
  "photo-1555939594-58d7cb561ad1",
  "photo-1504674900247-0877df9cc836",
  "photo-1518005020951-eccb494ad742",
  "photo-1561214115-f2f134cc4912",
  "photo-1441974231531-c6227db76b6e",
  "photo-1433086966358-54859d0ed716",
  "photo-1530789253388-582c481c54b0",
  "photo-1470770841072-f978cf4d019e",
  "photo-1519608487953-e999c86e7455",
  "photo-1472396961693-142e6e269027",
];

const statusDetails = {
  pending_payment: {
    label: "Chờ xác nhận",
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fde68a",
    iconColor: "#d97706",
    Icon: CheckCircle,
  },
  pending_confirmation: {
    label: "Chờ xác nhận",
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fde68a",
    iconColor: "#d97706",
    Icon: CheckCircle,
  },
  pending: {
    label: "Chờ xác nhận",
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fde68a",
    iconColor: "#d97706",
    Icon: CheckCircle,
  },
  booked: {
    label: "Đã xác nhận",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0",
    iconColor: "#16a34a",
    Icon: CheckCircle,
  },
  confirmed: {
    label: "Đã xác nhận",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0",
    iconColor: "#16a34a",
    Icon: CheckCircle,
  },
  paid: {
    label: "Đã xác nhận",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0",
    iconColor: "#16a34a",
    Icon: CheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    bg: "#f1f5f9",
    color: "#475569",
    border: "#e2e8f0",
    iconColor: "#64748b",
    Icon: XCircle,
  },
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatDate = (date) => {
  if (!date) return "";
  const dateValue = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  return Number.isNaN(dateValue.getTime())
    ? String(date)
    : dateValue.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const getNights = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(`${String(startDate).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(endDate).slice(0, 10)}T00:00:00`);
  const nights = Math.round((end - start) / 86400000);
  return nights > 0 ? nights : null;
};

/* Ensures every travel product (hotel/car/experience) uses the EXACT SAME canonical HD photo
   across the List page, Payment page, and My Travel Services page; while Flight cards never duplicate Hero Banner */
const getDistinctCardImageUrl = (reservation, index = 0, usedUrls = new Set()) => {
  const product = reservation.product || {};

  if (product.type === "flight" || reservation.isFlightBooking) {
    for (let i = 0; i < FLIGHT_CARD_IMAGES.length; i += 1) {
      const candidate = FLIGHT_CARD_IMAGES[(index + i) % FLIGHT_CARD_IMAGES.length];
      if (!usedUrls.has(candidate) && candidate !== HERO_BANNER_BG_URL) {
        usedUrls.add(candidate);
        return candidate;
      }
    }
    return FLIGHT_CARD_IMAGES[0];
  }

  // Always use the exact same canonical photo as TravelServicesPage & TravelServicePayment
  return getCanonicalTravelProductImage(product, product.type || "hotel", 900);
};

const amenityIcons = {
  "Wi-Fi": WifiHigh,
  "Hồ bơi": SwimmingPool,
  "Bữa sáng": ForkKnife,
};

/* Reference Showcase Items matching the user's mockup 1:1 with distinct HD photos */
const SHOWCASE_SERVICE_ITEMS = [
  {
    id: "showcase-flight-1",
    isFlightBooking: true,
    status: "confirmed",
    payment_status: "paid",
    reference_code: "SLK2587HN",
    total_price: 1200000,
    unit_price: 1200000,
    guest_count: 1,
    quantity: 1,
    start_date: "2026-11-20",
    end_date: "2026-11-20",
    flight_number: "VN258",
    flight_time_range: "08:00 – 09:30",
    seat_class: "Phổ thông",
    product: {
      id: 901,
      type: "flight",
      name: "Hà Nội → Đà Nẵng",
      city: "Đà Nẵng",
      location: "Sân bay Nội Bài (HAN) → Sân bay Đà Nẵng (DAD)",
      description:
        "Chuyến bay thẳng SkyLink Airlines VN258 khai thác bằng tàu bay Airbus A321neo thế hệ mới.",
      image_url:
        "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=900&q=85",
    },
  },
  {
    id: "showcase-hotel-1",
    status: "confirmed",
    payment_status: "paid",
    reference_code: "HTL20261121",
    total_price: 2500000,
    unit_price: 2500000,
    guest_count: 2,
    quantity: 1,
    start_date: "2026-11-21",
    end_date: "2026-11-22",
    guest_name: "Nguyễn Văn A",
    guest_email: "user@skylink.vn",
    guest_phone: "+84 90 123 4567",
    product: {
      id: 902,
      type: "hotel",
      name: "Khách sạn Skyview Central",
      city: "TP. Hồ Chí Minh",
      location: "12 Nguyễn Văn Cừ, Quận 1, TP. Hồ Chí Minh",
      description:
        "Phòng Deluxe Panorama trung tâm Quận 1, cửa kính lớn nhìn toàn cảnh thành phố, bao gồm buffet sáng 5 sao.",
      image_url:
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=85",
      details: {
        amenities: ["Wi-Fi", "Bữa sáng", "Hồ bơi"],
      },
    },
  },
  {
    id: "showcase-exp-1",
    status: "pending_confirmation",
    payment_status: "pending",
    reference_code: "EXP20261123",
    total_price: 850000,
    unit_price: 850000,
    guest_count: 1,
    quantity: 1,
    start_date: "2026-11-23",
    end_date: "2026-11-23",
    guest_name: "Nguyễn Văn A",
    guest_email: "user@skylink.vn",
    guest_phone: "+84 90 123 4567",
    product: {
      id: 903,
      type: "experience",
      name: "Tour du lịch Vịnh Hạ Long 1 ngày",
      city: "Quảng Ninh",
      location: "Cảng tàu khách quốc tế Hạ Long",
      description:
        "Hành trình du thuyền 5 sao trên làn nước ngọc bích Vịnh Hạ Long, tham quan Hang Sửng Sốt và Đảo Ti Tốp.",
      image_url:
        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85",
    },
  },
];

const mapFlightBookingToItem = (booking, idx = 0) => {
  const flight = booking.flight || {};
  const depCity = flight.departure_airport?.city || flight.departure_airport?.code || "Hà Nội";
  const arrCity = flight.arrival_airport?.city || flight.arrival_airport?.code || "Đà Nẵng";
  const depTime = formatTime(flight.departure_time) || "08:00";
  const arrTime = formatTime(flight.arrival_time) || "09:30";
  const depDate = flight.departure_time
    ? String(flight.departure_time).slice(0, 10)
    : booking.created_at;
  const tickets = Array.isArray(booking.tickets) ? booking.tickets : [];
  const firstClass = tickets[0]?.seat?.class || tickets[0]?.ticket_class || "Economy";
  const seatClassVi =
    firstClass === "Business"
      ? "Thương gia"
      : firstClass === "First"
        ? "Hạng nhất"
        : "Phổ thông";

  return {
    id: `flight-${booking.id}`,
    rawBookingId: booking.id,
    isFlightBooking: true,
    status:
      booking.status === "paid"
        ? "confirmed"
        : booking.status === "cancelled"
          ? "cancelled"
          : "pending_payment",
    payment_status: booking.status === "paid" ? "paid" : "unpaid",
    reference_code: booking.pnr_code || `SLK${booking.id}`,
    total_price: Number(booking.total_price || flight.base_price || 1200000),
    unit_price: Number(flight.base_price || booking.total_price || 1200000),
    guest_count: Math.max(tickets.length, 1),
    quantity: Math.max(tickets.length, 1),
    start_date: depDate,
    end_date: depDate,
    flight_number: flight.flight_number || "VN258",
    flight_time_range: `${depTime} – ${arrTime}`,
    seat_class: seatClassVi,
    rawBooking: booking,
    product: {
      id: flight.id || booking.id,
      type: "flight",
      name: `${depCity} → ${arrCity}`,
      city: arrCity,
      location: `${flight.departure_airport?.name || depCity} → ${flight.arrival_airport?.name || arrCity}`,
      description: `Chuyến bay ${flight.flight_number || "SkyLink"} hành trình ${depCity} đi ${arrCity}. Mã đặt chỗ PNR: ${booking.pnr_code}.`,
      image_url: FLIGHT_CARD_IMAGES[idx % FLIGHT_CARD_IMAGES.length],
    },
  };
};

const fetchReservations = () => api.get("/travel-service-reservations?per_page=50");

export default function MyTravelServices() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onlyShowcase = searchParams.get("demo") === "1";

  const [reservations, setReservations] = useState([]);
  const [flightItems, setFlightItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageSize, setPageSize] = useState(50);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyReservationId, setBusyReservationId] = useState(null);
  const [expandedReservationId, setExpandedReservationId] = useState(null);
  const [copiedReference, setCopiedReference] = useState("");
  const [paymentReservation, setPaymentReservation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [paying, setPaying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const [travelRes, flightRes] = await Promise.allSettled([
        fetchReservations(),
        api.get("/bookings"),
      ]);

      if (travelRes.status === "fulfilled") {
        const list = travelRes.value?.data?.data?.data || travelRes.value?.data?.data || [];
        setReservations(Array.isArray(list) ? list : []);
        setError("");
      } else {
        setError("");
      }

      if (flightRes.status === "fulfilled") {
        const rawFlights = flightRes.value?.data?.data || flightRes.value?.data || [];
        const mapped = Array.isArray(rawFlights)
          ? rawFlights.map((b, i) => mapFlightBookingToItem(b, i))
          : [];
        setFlightItems(mapped);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  /* Merge user's real bookings with mockup showcase categories ONLY if the user has NO data at all! */
  const allItems = useMemo(() => {
    if (onlyShowcase) {
      return SHOWCASE_SERVICE_ITEMS;
    }

    const realMerged = [...reservations, ...flightItems];
    // If the user has real bookings or reservations, show 100% real data
    if (realMerged.length > 0) {
      return realMerged;
    }

    return SHOWCASE_SERVICE_ITEMS;
  }, [onlyShowcase, reservations, flightItems]);

  const counts = useMemo(() => {
    const c = { all: allItems.length, flight: 0, hotel: 0, experience: 0, car: 0 };
    allItems.forEach((item) => {
      const t = item.product?.type || (item.isFlightBooking ? "flight" : "hotel");
      if (c[t] !== undefined) c[t] += 1;
    });
    return c;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const list =
      activeFilter === "all"
        ? allItems
        : allItems.filter((item) => {
            const t = item.product?.type || (item.isFlightBooking ? "flight" : "hotel");
            return t === activeFilter;
          });
    return list.slice(0, pageSize);
  }, [allItems, activeFilter, pageSize]);

  /* Pre-calculate distinct image URLs for every item so no two cards on the page share an image */
  const distinctCardImages = useMemo(() => {
    const used = new Set([HERO_BANNER_BG_URL]);
    const map = {};
    filteredItems.forEach((item, idx) => {
      map[item.id] = getDistinctCardImageUrl(item, idx, used);
    });
    return map;
  }, [filteredItems]);

  const cancelReservation = async (id) => {
    if (String(id).startsWith("showcase-") || String(id).startsWith("flight-")) return;
    setBusyReservationId(id);
    setError("");
    try {
      await api.patch(`/travel-service-reservations/${id}/cancel`);
      await loadReservations();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Không thể hủy dịch vụ này. Vui lòng thử lại."
      );
    } finally {
      setBusyReservationId(null);
    }
  };

  const payReservation = async () => {
    if (!paymentReservation) return;

    setPaying(true);
    setError("");
    try {
      const { data } = await api.post(
        `/travel-service-reservations/${paymentReservation.id}/pay`,
        {
          payment_method: paymentMethod,
        }
      );
      setPaymentReservation(null);
      setSuccessMessage(
        `${data.message} Mã đặt dịch vụ: ${paymentReservation.reference_code}.`
      );
      await loadReservations();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          Object.values(requestError.response?.data?.errors || {}).flat()[0] ||
          "Không thể thanh toán dịch vụ lúc này. Vui lòng thử lại."
      );
    } finally {
      setPaying(false);
    }
  };

  const copyReference = async (referenceCode) => {
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopiedReference(referenceCode);
      window.setTimeout(() => setCopiedReference(""), 1800);
    } catch {
      setError("Không thể sao chép mã đặt chỗ trên trình duyệt này.");
    }
  };

  const filterTabs = [
    { id: "all", label: "Tất cả", count: counts.all, Icon: SquaresFour },
    { id: "flight", label: "Vé máy bay", count: counts.flight, Icon: AirplaneTilt },
    { id: "hotel", label: "Khách sạn", count: counts.hotel, Icon: Bed },
    { id: "experience", label: "Trải nghiệm", count: counts.experience, Icon: Camera },
    { id: "car", label: "Thuê xe", count: counts.car, Icon: CarProfile },
  ];

  return (
    <div
      className="min-h-screen text-slate-900"
      style={{
        background: "linear-gradient(180deg, #b6dbfc 0%, #dceeff 28%, #edf5ff 64%, #d3e7fe 100%)",
      }}
    >
      <Navbar />

      <main className="relative overflow-hidden pb-14 pt-20">
        {/* Hero Background Layer with Sun Glow & Distinct Airliner Photo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: 315 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(186,221,255,0.95) 0%, rgba(208,233,255,0.78) 42%, rgba(225,241,255,0.18) 100%)",
            }}
          />
          {/* Sunburst glow behind the clouds matching the reference image */}
          <div
            className="absolute rounded-full"
            style={{
              left: "44%",
              top: 52,
              width: 240,
              height: 240,
              background:
                "radial-gradient(circle, rgba(255,253,232,0.95) 0%, rgba(255,244,196,0.55) 36%, rgba(255,255,255,0) 72%)",
              filter: "blur(8px)",
            }}
          />
          <img
            src={HERO_BANNER_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "65%",
              objectPosition: "center 30%",
              opacity: 0.94,
              WebkitMaskImage: "linear-gradient(to right, transparent 2%, black 32%)",
              maskImage: "linear-gradient(to right, transparent 2%, black 32%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 90,
              background: "linear-gradient(180deg, rgba(220,238,255,0) 0%, #dceeff 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Top Hero Section */}
          <header className="pb-4 pt-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-extrabold text-[#16428b] shadow-sm transition hover:bg-white"
              style={{ border: "1px solid rgba(255,255,255,0.95)", borderRadius: 9999 }}
            >
              <ArrowLeft size={14} weight="bold" />
              Quay lại trang chủ
            </Link>

            <p
              className="mt-3 text-xs font-black uppercase tracking-[0.15em]"
              style={{ color: "#0b57d0", marginBottom: 2 }}
            >
              SKYLINK TRAVEL
            </p>
            <h1
              className="font-black tracking-tight"
              style={{
                fontSize: "clamp(2rem, 3.3vw, 2.7rem)",
                color: "#091e47",
                lineHeight: 1.12,
                marginBottom: 4,
              }}
            >
              Dịch vụ đã đặt
            </h1>
            <p className="text-sm font-semibold" style={{ color: "#2d4b7a", marginBottom: 0 }}>
              Theo dõi thông tin và trạng thái các dịch vụ của bạn.
            </p>
          </header>

          {/* Filter Tabs Bar with Vertical Dividers matching the reference mockup */}
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 12px 28px rgba(18, 60, 130, 0.08)",
              backdropFilter: "blur(14px)",
              borderRadius: 9999,
            }}
          >
            <div className="flex flex-wrap items-center">
              {filterTabs.map((tab, idx) => {
                const TabIcon = tab.Icon;
                const isActive = activeFilter === tab.id;
                const prevActive = idx > 0 && activeFilter === filterTabs[idx - 1].id;
                return (
                  <div key={tab.id} className="inline-flex items-center">
                    {idx > 0 && !isActive && !prevActive && (
                      <span
                        aria-hidden="true"
                        style={{
                          width: 1,
                          height: 20,
                          background: "#dbe7f8",
                          margin: "0 4px",
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveFilter(tab.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold transition sm:text-[13px]"
                      style={
                        isActive
                          ? {
                              background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                              color: "#ffffff",
                              boxShadow: "0 6px 16px rgba(13, 97, 225, 0.34)",
                              borderRadius: 9999,
                            }
                          : {
                              background: "transparent",
                              color: "#1b3b73",
                              borderRadius: 9999,
                            }
                      }
                    >
                      <TabIcon
                        size={16}
                        weight="fill"
                        style={{ color: isActive ? "#ffffff" : "#1565d8" }}
                      />
                      {tab.id === "experience" && !isActive && (
                        <Sparkle
                          size={11}
                          weight="fill"
                          style={{ color: "#1565d8", marginLeft: -3, marginRight: -3 }}
                        />
                      )}
                      <span>
                        {tab.label} ({tab.count})
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Service Count Dropdown Pill (Single clean chevron) */}
            <div
              className="relative cursor-pointer px-4 py-2 text-xs font-extrabold"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                background: "#ffffff",
                color: "#163b7a",
                border: "1px solid #d5e5fb",
                boxShadow: "0 2px 8px rgba(18, 60, 128, 0.05)",
                borderRadius: 9999,
              }}
            >
              <CalendarCheck size={16} weight="fill" style={{ color: "#1565d8", flexShrink: 0 }} />
              <span>{pageSize} dịch vụ</span>
              <CaretDown size={13} weight="bold" style={{ color: "#3d629c", flexShrink: 0 }} />
              <select
                aria-label="Số lượng dịch vụ hiển thị"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
                <option value={10}>10 dịch vụ</option>
                <option value={20}>20 dịch vụ</option>
                <option value={50}>50 dịch vụ</option>
                <option value={100}>100 dịch vụ</option>
              </select>
            </div>
          </div>

          {successMessage && (
            <div
              role="status"
              className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
            >
              {successMessage}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={loadReservations}
                className="font-bold underline underline-offset-2"
              >
                Tải lại
              </button>
            </div>
          )}

          {/* Reservations Cards List */}
          {loading ? (
            <div className="space-y-3" aria-label="Đang tải dịch vụ đã đặt">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse flex-col gap-4 rounded-3xl bg-white/90 p-3.5 shadow-sm sm:flex-row"
                >
                  <div className="h-36 rounded-2xl bg-slate-200 sm:w-64" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-6 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/3 rounded bg-slate-100" />
                    <div className="h-10 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              className="rounded-3xl bg-white/95 px-6 py-12 text-center shadow-sm"
              style={{ border: "1px solid rgba(255,255,255,0.95)" }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Package size={28} weight="duotone" />
              </div>
              <h2 className="text-lg font-extrabold text-[#12264f]">
                Chưa có dịch vụ trong danh mục này
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Bạn có thể chuyển sang tab Tất cả hoặc khám phá thêm dịch vụ mới của SkyLink.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {activeFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-blue-800 transition hover:bg-blue-100"
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 9999,
                    }}
                  >
                    Xem tất cả ({counts.all})
                  </button>
                )}
                <Link
                  to="/travel/car"
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white transition"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                    boxShadow: "0 8px 18px rgba(13, 97, 225, 0.28)",
                    borderRadius: 9999,
                  }}
                >
                  Khám phá dịch vụ <ArrowRight size={15} weight="bold" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((reservation) => {
                const product = reservation.product || {};
                const type = product.type || (reservation.isFlightBooking ? "flight" : "hotel");
                const isFlight = type === "flight";
                const isHotel = type === "hotel";
                const isExperience = type === "experience";
                const isCar = type === "car";
                const isShowcase = String(reservation.id).startsWith("showcase-");
                const isPaid =
                  reservation.payment_status === "paid" || reservation.status === "confirmed";
                const effectiveStatusKey =
                  reservation.status === "cancelled"
                    ? "cancelled"
                    : isPaid
                      ? "confirmed"
                      : reservation.status || "pending_confirmation";
                const status =
                  statusDetails[effectiveStatusKey] || statusDetails.pending_confirmation;
                const StatusIcon = status.Icon;
                const isExpanded = expandedReservationId === reservation.id;
                const nights = getNights(reservation.start_date, reservation.end_date);
                const canCancel =
                  !reservation.isFlightBooking &&
                  !isShowcase &&
                  ["pending_payment", "booked", "pending_confirmation"].includes(
                    reservation.status
                  );
                const amenities = product.details?.amenities || [];

                const badgeConfig = isFlight
                  ? { label: "Vé máy bay", Icon: AirplaneTilt }
                  : isHotel
                    ? { label: "Khách sạn", Icon: Bed }
                    : isExperience
                      ? { label: "Trải nghiệm", Icon: Camera }
                      : { label: "Thuê xe", Icon: CarProfile };
                const BadgeIcon = badgeConfig.Icon;

                return (
                  <article
                    key={reservation.id}
                    className="overflow-hidden transition duration-200"
                    style={{
                      borderRadius: 24,
                      background: "rgba(255, 255, 255, 0.96)",
                      border: "1px solid rgba(255, 255, 255, 0.99)",
                      boxShadow: "0 10px 28px rgba(20, 62, 132, 0.08)",
                    }}
                  >
                    <div
                      className="grid items-center gap-4 p-3 sm:grid-cols-[minmax(230px,310px)_minmax(0,1fr)_220px] sm:gap-5 sm:p-3.5"
                      style={{
                        gridTemplateColumns:
                          window.innerWidth >= 768 ? "256px minmax(0, 1fr) 268px" : undefined,
                      }}
                    >
                      {/* Left Column: Distinct HD Thumbnail + Bottom-Left Pill Badge */}
                      <div
                        className="relative overflow-hidden"
                        style={{
                          height: 140,
                          borderRadius: 18,
                          background: "linear-gradient(135deg, #c7e2ff 0%, #e1effe 100%)",
                        }}
                      >
                        <img
                          src={distinctCardImages[reservation.id]}
                          alt={product.name || "Dịch vụ SkyLink"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(8,22,48,0.02) 48%, rgba(8,22,48,0.48) 100%)",
                          }}
                        />
                        <span
                          className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold text-white"
                          style={{
                            background: "rgba(18, 37, 68, 0.8)",
                            backdropFilter: "blur(8px)",
                            borderRadius: 9999,
                          }}
                        >
                          <BadgeIcon size={14} weight="fill" />
                          {badgeConfig.label}
                        </span>
                      </div>

                      {/* Middle Column: Status Pill, Bold Title, Subtitle & Metadata */}
                      <div className="min-w-0 py-0.5">
                        {/* Status Pill */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold"
                            style={{
                              background: status.bg,
                              color: status.color,
                              border: `1px solid ${status.border}`,
                              borderRadius: 9999,
                            }}
                          >
                            <StatusIcon
                              size={15}
                              weight="fill"
                              style={{ color: status.iconColor }}
                            />
                            {status.label}
                          </span>
                        </div>

                        {/* Service Title */}
                        <h2
                          className="mt-1.5 truncate font-black"
                          style={{
                            fontSize: "1.3rem",
                            color: "#092152",
                            lineHeight: 1.25,
                            marginBottom: 4,
                          }}
                        >
                          {product.name || "Dịch vụ SkyLink"}
                        </h2>

                        {/* Sub-row 1: Flight number / Hotel address / Experience departure */}
                        {isFlight ? (
                          <p
                            className="flex flex-wrap items-center gap-1.5 text-xs font-bold"
                            style={{ color: "#355384", marginBottom: 12 }}
                          >
                            <ShieldCheck size={16} weight="duotone" style={{ color: "#1b64da" }} />
                            <span>{reservation.flight_number || "VN258"}</span>
                            <span>•</span>
                            <span>{formatDate(reservation.start_date)}</span>
                            <span>|</span>
                            <span>{reservation.flight_time_range || "08:00 – 09:30"}</span>
                          </p>
                        ) : isExperience ? (
                          <p
                            className="flex flex-wrap items-center gap-1.5 text-xs font-bold"
                            style={{ color: "#355384", marginBottom: 4 }}
                          >
                            <ShieldCheck size={16} weight="duotone" style={{ color: "#1b64da" }} />
                            <span>
                              Khởi hành: {formatDate(reservation.start_date)} •{" "}
                              {reservation.guest_count || 1} khách
                            </span>
                          </p>
                        ) : (
                          <p
                            className="flex flex-wrap items-center gap-1.5 text-xs font-bold"
                            style={{ color: "#355384", marginBottom: 12 }}
                          >
                            <MapPinLine size={16} weight="fill" style={{ color: "#1565d8" }} />
                            <span>
                              {product.location ||
                                product.city ||
                                "Sân bay Quốc tế Nội Bài, Hà Nội"}
                            </span>
                          </p>
                        )}

                        {/* Bottom Metadata Row (Flight & Hotel & Car have metadata row; Experience stays ultra-clean like mockup) */}
                        {isFlight ? (
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-0.5 text-xs">
                            <div className="inline-flex items-center gap-2">
                              <User size={17} weight="fill" style={{ color: "#1565d8" }} />
                              <div>
                                <span className="block text-[11px] font-semibold text-slate-400">
                                  Hành khách
                                </span>
                                <strong className="font-extrabold text-[#102a5e]">
                                  {reservation.guest_count || 1} người
                                </strong>
                              </div>
                            </div>

                            <span className="hidden h-6 w-px bg-slate-200 sm:inline-block" />

                            <div className="inline-flex items-center gap-2">
                              <Armchair size={17} weight="fill" style={{ color: "#1565d8" }} />
                              <div>
                                <span className="block text-[11px] font-semibold text-slate-400">
                                  Hạng vé
                                </span>
                                <strong className="font-extrabold text-[#102a5e]">
                                  {reservation.seat_class || "Phổ thông"}
                                </strong>
                              </div>
                            </div>

                            <span className="hidden h-6 w-px bg-slate-200 sm:inline-block" />

                            <div className="inline-flex items-center gap-2">
                              <Ticket size={17} weight="fill" style={{ color: "#1565d8" }} />
                              <div>
                                <span className="block text-[11px] font-semibold text-slate-400">
                                  Mã đặt chỗ
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyReference(reservation.reference_code)}
                                  className="inline-flex items-center gap-1 font-extrabold text-[#102a5e] hover:text-blue-700"
                                >
                                  {reservation.reference_code}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : isHotel ? (
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-0.5 text-xs">
                            <div className="inline-flex items-center gap-2">
                              <CalendarBlank
                                size={17}
                                weight="duotone"
                                style={{ color: "#1565d8" }}
                              />
                              <div>
                                <span className="block text-[11px] font-semibold text-slate-400">
                                  Nhận phòng
                                </span>
                                <strong className="font-extrabold text-[#102a5e]">
                                  {formatDate(reservation.start_date)}
                                </strong>
                              </div>
                            </div>

                            <span className="hidden h-6 w-px bg-slate-200 sm:inline-block" />

                            <div className="inline-flex items-center gap-2">
                              <CalendarBlank
                                size={17}
                                weight="duotone"
                                style={{ color: "#1565d8" }}
                              />
                              <div>
                                <span className="block text-[11px] font-semibold text-slate-400">
                                  Trả phòng
                                </span>
                                <strong className="font-extrabold text-[#102a5e]">
                                  {formatDate(reservation.end_date || reservation.start_date)}
                                </strong>
                              </div>
                            </div>

                            <span className="hidden h-6 w-px bg-slate-200 sm:inline-block" />

                            <div className="inline-flex items-center gap-2">
                              <Bed size={18} weight="fill" style={{ color: "#1565d8" }} />
                              <strong className="font-extrabold text-[#102a5e]">
                                {reservation.quantity || 1} phòng • {reservation.guest_count || 2}{" "}
                                khách
                              </strong>
                            </div>
                          </div>
                        ) : isCar ? (
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-0.5 text-xs">
                            <div className="inline-flex items-center gap-2">
                              <CalendarBlank
                                size={17}
                                weight="duotone"
                                style={{ color: "#1565d8" }}
                              />
                              <div>
                                <span className="block text-[11px] font-semibold text-slate-400">
                                  Ngày nhận
                                </span>
                                <strong className="font-extrabold text-[#102a5e]">
                                  {formatDate(reservation.start_date)}
                                </strong>
                              </div>
                            </div>

                            <span className="hidden h-6 w-px bg-slate-200 sm:inline-block" />

                            <div className="inline-flex items-center gap-2">
                              <CalendarBlank
                                size={17}
                                weight="duotone"
                                style={{ color: "#1565d8" }}
                              />
                              <div>
                                <span className="block text-[11px] font-semibold text-slate-400">
                                  Ngày trả
                                </span>
                                <strong className="font-extrabold text-[#102a5e]">
                                  {formatDate(reservation.end_date || reservation.start_date)}
                                  {nights ? ` (${nights} ngày)` : ""}
                                </strong>
                              </div>
                            </div>

                            <span className="hidden h-6 w-px bg-slate-200 sm:inline-block" />

                            <div className="inline-flex items-center gap-2">
                              <CarProfile size={18} weight="fill" style={{ color: "#1565d8" }} />
                              <strong className="font-extrabold text-[#102a5e]">
                                {reservation.quantity || 1} xe • {reservation.guest_count || 2}{" "}
                                khách
                              </strong>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Right Column: Price on Top + 2 Side-by-Side Pill Buttons on Bottom */}
                      <div
                        className="flex flex-col justify-between border-t border-blue-100/80 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-1"
                        style={{ minHeight: 124 }}
                      >
                        <div className="flex items-baseline justify-between sm:block sm:text-right">
                          <p
                            className="text-xs font-semibold"
                            style={{ color: "#4e6790", marginBottom: 2 }}
                          >
                            Tổng thanh toán
                          </p>
                          <p
                            className="whitespace-nowrap font-black tracking-tight"
                            style={{
                              fontSize: "1.45rem",
                              color: "#0948c6",
                              marginBottom: 0,
                            }}
                          >
                            {currency.format(Number(reservation.total_price || 0))}
                          </p>
                        </div>

                        {/* Two horizontal pill buttons matching the reference image */}
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedReservationId(isExpanded ? null : reservation.id)
                            }
                            aria-expanded={isExpanded}
                            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3.5 py-2 text-xs font-extrabold transition hover:bg-blue-50"
                            style={{
                              background: "#f8fbff",
                              color: "#163d7a",
                              border: "1px solid #cddff8",
                              borderRadius: 9999,
                            }}
                          >
                            <span>{isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}</span>
                            {isExpanded ? (
                              <CaretUp size={13} weight="bold" />
                            ) : (
                              <CaretDown size={13} weight="bold" />
                            )}
                          </button>

                          {/* Primary Right Action Button */}
                          {isFlight ? (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/check-in?pnr=${encodeURIComponent(reservation.reference_code)}`
                                )
                              }
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                              style={{
                                background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                                boxShadow: "0 6px 16px rgba(13, 97, 225, 0.3)",
                                borderRadius: 9999,
                              }}
                            >
                              <span>Làm thủ tục online</span>
                              <ArrowRight size={13} weight="bold" />
                            </button>
                          ) : isHotel ? (
                            <button
                              type="button"
                              onClick={() =>
                                !isPaid && !isShowcase && reservation.status !== "cancelled"
                                  ? navigate(`/travel-service-payment/${reservation.id}`)
                                  : navigate("/travel/hotel")
                              }
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                              style={{
                                background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                                boxShadow: "0 6px 16px rgba(13, 97, 225, 0.3)",
                                borderRadius: 9999,
                              }}
                            >
                              {!isPaid && !isShowcase && reservation.status !== "cancelled" ? (
                                <>
                                  <span>Thanh toán ngay</span>
                                  <ArrowRight size={13} weight="bold" />
                                </>
                              ) : (
                                <>
                                  <ArrowCounterClockwise size={14} weight="bold" />
                                  <span>Đặt lại phòng</span>
                                </>
                              )}
                            </button>
                          ) : isCar ? (
                            <button
                              type="button"
                              onClick={() =>
                                !isPaid && !isShowcase && reservation.status !== "cancelled"
                                  ? navigate(`/travel-service-payment/${reservation.id}`)
                                  : navigate("/travel/car")
                              }
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                              style={{
                                background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                                boxShadow: "0 6px 16px rgba(13, 97, 225, 0.3)",
                                borderRadius: 9999,
                              }}
                            >
                              {!isPaid && !isShowcase && reservation.status !== "cancelled" ? (
                                <>
                                  <span>Thanh toán ngay</span>
                                  <ArrowRight size={13} weight="bold" />
                                </>
                              ) : (
                                <>
                                  <ArrowCounterClockwise size={14} weight="bold" />
                                  <span>Đặt lại xe</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate("/support")}
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-extrabold transition hover:bg-blue-50"
                              style={{
                                background: "#f2f7ff",
                                color: "#0b57d0",
                                border: "1px solid #bfd7fb",
                                borderRadius: 9999,
                              }}
                            >
                              <Headset size={15} weight="bold" />
                              <span>Liên hệ hỗ trợ</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="border-t border-blue-100/80 bg-[#f6faff] px-5 py-4 sm:px-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <h3 className="text-sm font-extrabold text-[#102856]">
                              Thông tin chi tiết dịch vụ
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                              {product.description ||
                                "Dịch vụ thuộc hệ sinh thái du lịch hàng không 5 sao SkyLink Travel."}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => copyReference(reservation.reference_code)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-bold text-[#14356e] ring-1 ring-blue-100 hover:bg-blue-50"
                              >
                                <span>Mã đặt chỗ: {reservation.reference_code}</span>
                                <Copy size={13} />
                              </button>
                              {copiedReference === reservation.reference_code && (
                                <span className="font-bold text-emerald-700">Đã sao chép!</span>
                              )}
                            </div>

                            {isFlight && (() => {
                              try {
                                const mealMap = JSON.parse(
                                  localStorage.getItem("skylink_flight_special_meals") || "{}"
                                );
                                const attachedMeal = mealMap[reservation.reference_code];
                                if (!attachedMeal) return null;
                                return (
                                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs">
                                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-900">
                                      <ForkKnife size={15} weight="fill" className="text-emerald-600" />
                                      Suất ăn đặc biệt: {attachedMeal.code} – {attachedMeal.title} (Miễn phí)
                                    </span>
                                    <Link
                                      to="/services/meals"
                                      className="font-extrabold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                                    >
                                      Đổi suất ăn
                                    </Link>
                                  </div>
                                );
                              } catch {
                                return null;
                              }
                            })()}

                            {amenities.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {amenities.map((amenity) => {
                                  const AmenityIcon = amenityIcons[amenity] || CheckCircle;
                                  return (
                                    <span
                                      key={amenity}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                                    >
                                      <AmenityIcon size={14} className="text-blue-600" /> {amenity}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {(isHotel || isExperience || isCar) && reservation.guest_name && (
                              <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-blue-100">
                                <h4 className="text-xs font-extrabold text-slate-700">
                                  {isHotel
                                    ? "Khách lưu trú chính"
                                    : isCar
                                      ? "Người thuê xe chính"
                                      : "Khách liên hệ chính"}
                                </h4>
                                <p className="mt-1 text-xs font-bold text-slate-800">
                                  {reservation.guest_name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {reservation.guest_email} • {reservation.guest_phone}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-between rounded-2xl border border-blue-100 bg-white p-4">
                            <div>
                              <h3 className="text-sm font-extrabold text-[#102856]">
                                Chi tiết thanh toán
                              </h3>
                              <div className="mt-2 flex justify-between gap-3 text-xs text-slate-600">
                                <span>Đơn giá</span>
                                <span className="font-bold text-slate-800">
                                  {currency.format(
                                    Number(reservation.unit_price || product.price || 0)
                                  )}
                                </span>
                              </div>
                              <div className="mt-1.5 flex justify-between gap-3 text-xs text-slate-600">
                                <span>Số lượng</span>
                                <span className="font-bold text-slate-800">
                                  {reservation.quantity || 1}{" "}
                                  {isFlight
                                    ? "vé"
                                    : isHotel
                                      ? "phòng"
                                      : isCar
                                        ? "xe"
                                        : "khách"}
                                  {nights ? ` × ${nights} ${isCar ? "ngày" : "đêm"}` : ""}
                                </span>
                              </div>
                              <div className="mt-2 flex justify-between gap-3 border-t border-slate-100 pt-2 text-sm">
                                <span className="font-bold text-slate-700">Tổng thanh toán</span>
                                <span className="font-black text-[#0b4fd0]">
                                  {currency.format(Number(reservation.total_price || 0))}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                              {!isShowcase && !reservation.isFlightBooking && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/travel-service-payment/${reservation.id}${
                                        isPaid ? "?preview_paid=1" : ""
                                      }`
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100"
                                >
                                  <CreditCard size={14} weight="bold" />
                                  {isPaid ? "Xem biên lai thanh toán" : "Thanh toán dịch vụ"}
                                </button>
                              )}

                              {canCancel && !isPaid && (
                                <button
                                  type="button"
                                  onClick={() => cancelReservation(reservation.id)}
                                  disabled={busyReservationId === reservation.id}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                                >
                                  <X size={13} weight="bold" />
                                  {busyReservationId === reservation.id
                                    ? "Đang hủy..."
                                    : "Hủy đặt dịch vụ"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* Bottom Support Banner Pill */}
          <div className="mt-4 flex justify-center">
            <Link
              to="/support"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold transition hover:bg-white/95 sm:text-[13px]"
              style={{
                background: "rgba(255, 255, 255, 0.85)",
                color: "#294878",
                border: "1px solid rgba(255, 255, 255, 0.98)",
                boxShadow: "0 8px 24px rgba(21, 64, 138, 0.08)",
                backdropFilter: "blur(10px)",
                borderRadius: 9999,
              }}
            >
              <Info size={18} weight="fill" style={{ color: "#0b5ed7" }} />
              <span>
                Cần hỗ trợ? Liên hệ tổng đài{" "}
                <strong className="font-black text-[#0b2b66]">1900 1234</strong> hoặc chat trực
                tuyến
              </span>
              <CaretRight size={14} weight="bold" style={{ color: "#1565d8" }} />
            </Link>
          </div>
        </div>
      </main>

      {paymentReservation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="hotel-payment-title"
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">
                  Thanh toán riêng
                </p>
                <h2 id="hotel-payment-title" className="mt-1 text-2xl font-black text-[#17294f]">
                  Thanh toán dịch vụ
                </h2>
                <p className="mt-2 text-sm text-slate-500">{paymentReservation.product?.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentReservation(null)}
                disabled={paying}
                aria-label="Đóng"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-600">Tổng tiền</span>
              <strong className="text-lg font-black text-[#17336f]">
                {currency.format(Number(paymentReservation.total_price || 0))}
              </strong>
            </div>

            <fieldset className="mt-5 space-y-3">
              <legend className="mb-3 text-sm font-extrabold text-slate-800">
                Chọn phương thức
              </legend>
              {[
                { id: "vnpay", label: "VNPAY / Thẻ ATM", detail: "Thanh toán bằng VNPAY" },
                { id: "momo", label: "Ví MoMo", detail: "Thanh toán bằng ví MoMo" },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                    paymentMethod === method.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="hotel-payment-method"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="h-4 w-4 accent-blue-700"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-slate-800">{method.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{method.detail}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPaymentReservation(null)}
                disabled={paying}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={payReservation}
                disabled={paying}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
              >
                <CreditCard size={17} weight="bold" />
                {paying ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
