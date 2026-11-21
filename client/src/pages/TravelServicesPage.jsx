import { createElement, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  AirplaneTilt,
  CalendarBlank,
  CheckCircle,
  EnvelopeSimple,
  Flame,
  Heart,
  Info,
  MapPinLine,
  Phone,
  Star,
  SuitcaseRolling,
  SlidersHorizontal,
  User,
  WifiHigh,
  SwimmingPool,
  ForkKnife,
  UsersThree,
  ArrowRight,
  Clock,
  Ticket,
  CarProfile,
  GasPump,
  GearSix,
  CircleNotch,
  Crown,
  Gift,
  Lightning,
  PencilSimple,
  Snowflake,
  Tag,
} from "@phosphor-icons/react";
import api from "../api";
import Navbar from "../components/Navbar";
import { getCanonicalTravelProductImage } from "../utils/travelServiceImages";

const serviceLabels = {
  hotel: "Khách sạn",
  experience: "Trải nghiệm",
  car: "Thuê xe",
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const hotelImagesByCity = {
  "Hà Nội": [
    "photo-1566073771259-6a8506099945",
    "photo-1564501049412-61c2a3083791",
    "photo-1582719508461-905c673771fd",
    "photo-1590490360182-c33d57733427",
    "photo-1578683010236-d716f9a3f461",
  ],
  "Đà Nẵng": [
    "photo-1571896349842-33c89424de2d",
    "photo-1542314831-068cd1dbfeeb",
    "photo-1566665797739-1674de7a421a",
    "photo-1611892440504-42a792e24d32",
    "photo-1596394516093-501ba68a0ba6",
  ],
  "TP. Hồ Chí Minh": [
    "photo-1566195992011-5f6b21e539aa",
    "photo-1512918728675-ed5a9ecdebfd",
    "photo-1568084680786-a84f91d1153c",
    "photo-1564013799919-ab600027ffc6",
  ],
  "Nha Trang": [
    "photo-1535827841776-24afc1e255ac",
    "photo-1512918728675-ed5a9ecdebfd",
    "photo-1445019980597-93fa8acb246c",
  ],
  "Phú Quốc": [
    "photo-1535827841776-24afc1e255ac",
    "photo-1445019980597-93fa8acb246c",
    "photo-1505693416388-ac5ce068fe85",
  ],
  "Đà Lạt": [
    "photo-1510798831971-661eb04b3739",
    "photo-1470770841072-f978cf4d019e",
    "photo-1564013799919-ab600027ffc6",
  ],
  "Huế": [
    "photo-1520250497591-112f2f40a3f4",
    "photo-1590490360182-c33d57733427",
    "photo-1564013799919-ab600027ffc6",
  ],
  "Hội An": [
    "photo-1505693416388-ac5ce068fe85",
  ],
};

const distinctHotelImageIds = [
  "photo-1566073771259-6a8506099945",
  "photo-1582719508461-905c673771fd",
  "photo-1542314831-068cd1dbfeeb",
  "photo-1571896349842-33c89424de2d",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1564501049412-61c2a3083791",
  "photo-1551882547-ff40c63fe5fa",
  "photo-1566665797739-1674de7a421a",
  "photo-1590490360182-c33d57733427",
  "photo-1578683010236-d716f9a3f461",
  "photo-1611892440504-42a792e24d32",
  "photo-1596394516093-501ba68a0ba6",
  "photo-1566195992011-5f6b21e539aa",
  "photo-1512918728675-ed5a9ecdebfd",
  "photo-1568084680786-a84f91d1153c",
  "photo-1564013799919-ab600027ffc6",
  "photo-1535827841776-24afc1e255ac",
  "photo-1445019980597-93fa8acb246c",
  "photo-1505693416388-ac5ce068fe85",
  "photo-1510798831971-661eb04b3739",
  "photo-1470770841072-f978cf4d019e",
  "photo-1584132967334-10e028bd69f7",
  "photo-1590073242678-70ee3fc28e8e",
  "photo-1571003123894-1cbf6d2d8f6f",
  "photo-1540541338287-41700207dee6",
  "photo-1563911302283-d2bc129e7570",
  "photo-1576675784201-0e142b423952",
  "photo-1587985064135-0366536eab42",
  "photo-1591088398332-8a7791972843",
  "photo-1618773928121-c32242e63f39",
  "photo-1595576508898-0ad5c879a061",
  "photo-1560448204-e02f11c3d0e2",
];

const hotelBadges = [
  {
    label: "Được yêu thích",
    Icon: Star,
    bg: "rgba(218, 248, 232, 0.94)",
    color: "#065f46",
    iconColor: "#eab308",
  },
  {
    label: "Giá tốt",
    Icon: Tag,
    bg: "rgba(219, 238, 255, 0.94)",
    color: "#1e40af",
    iconColor: "#2563eb",
  },
  {
    label: "Trải nghiệm đẳng cấp",
    Icon: Crown,
    bg: "rgba(254, 243, 199, 0.94)",
    color: "#92400e",
    iconColor: "#d97706",
  },
  {
    label: "Ưu đãi đặc biệt",
    Icon: Gift,
    bg: "rgba(243, 232, 255, 0.94)",
    color: "#6b21a8",
    iconColor: "#9333ea",
  },
];

const hotelReviewCounts = ["2.5K", "1.8K", "1.2K", "1.5K", "2.1K", "1.4K", "1.9K", "1.6K"];
const experienceReviewCounts = ["2.5K", "3.1K", "1.8K", "1.2K", "2.4K", "1.9K", "1.6K", "2.2K"];

const distinctExperienceImageIds = [
  "photo-1559592413-7cec4d0cae2b", // Hoi An ancient town lanterns & river
  "photo-1528127269322-539801943592", // Vietnam heritage / Ha Long bay boats
  "photo-1555939594-58d7cb561ad1", // Hanoi culinary street food feast
  "photo-1507525428034-b723cf961d3e", // Nha Trang tropical palm beach & sea
  "photo-1583417319070-4a69db38a482", // Da Nang Golden Bridge / mountains
  "photo-1500375592092-40eb2168fd21", // Turquoise island bay & boat tour
  "photo-1544551763-46a013bb70d5", // Coral reef diving & snorkeling
  "photo-1504674900247-0877df9cc836", // Local Vietnamese cuisine platter
  "photo-1518005020951-eccb494ad742", // Ancient temple & heritage architecture
  "photo-1470770841072-f978cf4d019e", // Da Lat misty mountain lake & pines
  "photo-1441974231531-c6227db76b6e", // Lush green forest & nature trail
  "photo-1433086966358-54859d0ed716", // Waterfall adventure in highlands
  "photo-1519608487953-e999c86e7455", // Lantern night cruise on river
  "photo-1442512595331-e89e73853f31", // Artisan Vietnamese coffee workshop
  "photo-1476514525535-07fb3b4ae5f1", // Scenic mountain lake boat trip
  "photo-1506744038136-46273834b3fb", // Panorama valley & river tour
  "photo-1501785888041-af3ef285b470", // Coastal bay sightseeing cruise
  "photo-1530789253388-582c481c54b0", // Highland sunrise cloud hunting
  "photo-1469854523086-cc02fe5d8800", // Road trip & cultural exploration
  "photo-1502082553048-f009c37129b9", // Tropical botanical garden & forest
  "photo-1519046904884-53103b34b206", // Sunny white sand beach getaway
  "photo-1510414842594-a61c69b5ae57", // Sunset island hopping tour
  "photo-1540555700478-4be289fbecef", // Traditional spa & wellness experience
  "photo-1512100356356-de1b84283e18", // Seaplane / coastal aerial view
  "photo-1537996194471-e657df975ab4", // Heritage pagoda & tropical garden
  "photo-1552465011-b4e21bf6e79a", // Emerald bay & limestone cliffs
  "photo-1516483638261-f4dbaf036963", // Coastal village & cliffside walk
  "photo-1520250497591-112f2f40a3f4", // Sunset resort & lagoon cruise
  "photo-1504280390367-361c6d9f38f4", // Nature camping & pine hills
  "photo-1513635269975-59663e0ac1ad", // City sightseeing & heritage walk
  "photo-1493976040374-85c8e12f0c0e", // Traditional cultural temple gate
  "photo-1503899036084-c55cdd92da26", // Evening street market & lanterns
];

const hotelImageUrl = (imageId) => (
  `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1000&q=85`
);

const experienceImages = {
  ocean: ["photo-1500375592092-40eb2168fd21", "photo-1544551763-46a013bb70d5"],
  food: ["photo-1555939594-58d7cb561ad1", "photo-1504674900247-0877df9cc836"],
  heritage: ["photo-1518005020951-eccb494ad742", "photo-1561214115-f2f134cc4912"],
  nature: ["photo-1441974231531-c6227db76b6e", "photo-1433086966358-54859d0ed716"],
  mountain: ["photo-1530789253388-582c481c54b0", "photo-1470770841072-f978cf4d019e"],
  night: ["photo-1519608487953-e999c86e7455", "photo-1519608487953-e999c86e7455"],
  coffee: ["photo-1442512595331-e89e73853f31"],
  activity: ["photo-1558618666-fcd25c85cd64", "photo-1472396961693-142e6e269027"],
};

const distinctCarImageIds = [
  "photo-1590362891991-f776e747a588", // Clean white modern sedan (Card 1)
  "photo-1563720223185-11003d516935", // Modern white SUV crossover (Card 2)
  "photo-1606664515524-ed2f786a0bd6", // Black luxury SUV crossover (Card 3)
  "photo-1609521263047-f8f205293f24", // Silver family MPV / 7-seater SUV (Card 4)
  "photo-1549317661-bd32c8ce0db2", // White modern sedan/SUV on scenic road
  "photo-1552519507-da3b142c6e3d", // Dark luxury car on highway
  "photo-1503376780353-7e6692767b70", // Sleek silver/dark touring car
  "photo-1550355291-b1c1a8c8a9ab", // Modern white family crossover
  "photo-1541899481282-d53bffe3c35d", // Compact white urban car
  "photo-1494976388531-d1058494cdd8", // Executive touring vehicle
  "photo-1502877338535-766e1452684a", // Coastal road driving sedan
  "photo-1519641471654-76ce0107ad1b", // White SUV on mountain pass
  "photo-1503736334956-4c8f8e92946d", // Red/dark sporty sedan
  "photo-1542362567-b07e54358753", // Modern coupe/sedan exterior
  "photo-1551830820-330a71b99659", // Blue SUV crossover
  "photo-1617531653332-bd46c24f2068", // Luxury black sedan
  "photo-1511919884226-fd3cad34687c", // Touring car on open road
  "photo-1492144534655-ae79c964c9d7", // Silver luxury sedan
  "photo-1493238792000-8113da705763", // Dark metallic sedan
  "photo-1504215680853-026ed2a45def", // Mountain road SUV adventure
  "photo-1580273916550-e323be2ae537", // Metallic grey sedan
  "photo-1605559424843-9e4c228bf1c2", // Sleek modern electric/hybrid car
  "photo-1619767886558-efdc259cde1a", // White family SUV parked outdoors
  "photo-1553440569-bcc63803a83d", // Modern touring car by coast
  "photo-1544636331-e26879cd4d9b", // Dark executive sedan
  "photo-1568605117036-5fe5e7bab0b7", // Silver sports/touring sedan
  "photo-1570733577524-3a047079e80d", // Luxury crossover SUV
  "photo-1617788138017-80ad40651399", // Electric crossover vehicle
  "photo-1618843479313-40f8afb4b4d8", // Executive black mercedes-style sedan
  "photo-1555215695-3004980ad54e", // Blue luxury touring sedan
  "photo-1507136566006-cfc505b114fc", // Scenic drive modern automobile
];

const carBadges = [
  {
    label: "Phổ biến",
    Icon: Lightning,
    bg: "#1d78f0",
    color: "#ffffff",
  },
  {
    label: "Tiết kiệm",
    Icon: Tag,
    bg: "#10b981",
    color: "#ffffff",
  },
  {
    label: "Xe cao cấp",
    Icon: CarProfile,
    bg: "#7c3aed",
    color: "#ffffff",
  },
  {
    label: "Xe gia đình",
    Icon: CarProfile,
    bg: "#f97316",
    color: "#ffffff",
  },
];

const carReviewCounts = ["2.5K", "1.8K", "3.1K", "1.2K", "2.2K", "1.6K", "1.9K", "1.4K"];

const fallbackCarImage = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=85";

const getCarImage = (product) => getCanonicalTravelProductImage(product, "car", 1000);

const getExperienceImage = (product) => getCanonicalTravelProductImage(product, "experience", 1000);

const amenityIcons = {
  "Wi-Fi": WifiHigh,
  "Hồ bơi": SwimmingPool,
  "Bữa sáng": ForkKnife,
};

export default function TravelServicesPage() {
  const { type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");
  const [reservationId, setReservationId] = useState(null);
  const [busyProductId, setBusyProductId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [guestContact, setGuestContact] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const q = searchParams.get("q") || "";
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const bookingId = searchParams.get("booking_id") || "";
  const guests = Number(searchParams.get("guests") || 1);
  const isStayOrRental = type === "hotel" || type === "car";
  const requiresGuestContact = ["hotel", "experience", "car"].includes(type);
  const nextDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  };
  const effectiveEndDate = endDate || (bookingId && isStayOrRental ? nextDate(startDate) : "");
  const label = serviceLabels[type];
  const isHotelPage = type === "hotel";
  const isExperiencePage = type === "experience";
  const isCarPage = type === "car";
  const allLocationsUrl = `/travel/${type}?${new URLSearchParams({
    start_date: startDate,
    end_date: effectiveEndDate,
    guests: String(guests),
    ...(bookingId ? { booking_id: bookingId } : {}),
  }).toString()}`;

  const updateEndDate = (date) => {
    const nextParams = new URLSearchParams(searchParams);
    if (date) {
      nextParams.set("end_date", date);
    } else {
      nextParams.delete("end_date");
    }
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (!label) {
      setLoading(false);
      setError("Loại dịch vụ không hợp lệ.");
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get(`/travel-services/${type}`, {
      params: {
        q,
        per_page: 200,
        start_date: startDate,
        end_date: effectiveEndDate || undefined,
        guests,
        sort: "rating_desc",
      },
      signal: controller.signal,
    })
      .then(({ data }) => setProducts(data.data?.data || []))
      .catch((requestError) => {
        if (requestError.name !== "CanceledError") {
          setError(requestError.response?.data?.message || "Không thể tải danh sách dịch vụ lúc này.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [type, label, q, startDate, effectiveEndDate, guests]);

  const reserve = async (product) => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      setError("Vui lòng đăng nhập để gửi yêu cầu đặt dịch vụ.");
      return;
    }

    if (requiresGuestContact) {
      const { name, email, phone } = guestContact;
      if (!name.trim()) {
        const contactRole = type === "hotel" ? "khách lưu trú" : type === "car" ? "người thuê xe" : "khách liên hệ";
        setError("");
        window.alert(`Vui lòng nhập họ tên của ${contactRole} chính trước khi tiếp tục.`);
        return;
      }

      if (!email.trim()) {
        setError("");
        window.alert("Vui lòng nhập email liên hệ trước khi tiếp tục.");
        return;
      }

      if (!phone.trim()) {
        setError("");
        window.alert("Vui lòng nhập số điện thoại liên hệ trước khi tiếp tục.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("");
        window.alert("Email liên hệ chưa đúng định dạng. Vui lòng kiểm tra lại.");
        return;
      }

      if (!/^\+?[0-9\s().-]{8,30}$/.test(phone.trim())) {
        setError("");
        window.alert("Số điện thoại chưa đúng định dạng. Vui lòng nhập từ 8 đến 30 ký tự hợp lệ.");
        return;
      }
    }

    setBusyProductId(product.id);
    setError("");
    setReservationMessage("");
    try {
      const effectiveStart = startDate || new Date().toISOString().slice(0, 10);
      const effectiveEnd =
        effectiveEndDate ||
        (isStayOrRental || isExperiencePage ? nextDate(effectiveStart) : null);
      const { data } = await api.post(`/travel-services/${type}/${product.id}/reservations`, {
        start_date: effectiveStart,
        end_date: effectiveEnd,
        guest_count: guests,
        quantity: quantities[product.id] || 1,
        ...(requiresGuestContact ? {
          guest_name: guestContact.name.trim(),
          guest_email: guestContact.email.trim(),
          guest_phone: guestContact.phone.trim(),
        } : {}),
        ...(bookingId ? { booking_id: Number(bookingId) } : {}),
      });
      setReservationId(data.data.id);
      if (["hotel", "experience", "car"].includes(type)) {
        navigate(`/travel-service-payment/${data.data.id}`);
        return;
      }
      setReservationMessage(
        `Yêu cầu đã được ghi nhận. Mã đặt dịch vụ: ${data.data.reference_code}. Tổng tiền: ${currency.format(data.data.total_price)}.`
      );
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại để đặt dịch vụ.");
      } else {
        setError(
          requestError.response?.data?.message ||
          Object.values(requestError.response?.data?.errors || {}).flat()[0] ||
          "Không thể gửi yêu cầu đặt dịch vụ lúc này."
        );
      }
    } finally {
      setBusyProductId(null);
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites((previous) => previous.includes(productId)
      ? previous.filter((id) => id !== productId)
      : [...previous, productId]);
  };

  const formatDate = (date) => date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    : "";

  const defaultCheckoutDate = nextDate(startDate || new Date().toISOString().slice(0, 10));

  const sortedProducts = type === "hotel"
    ? [...products].sort((a, b) => {
        const aNumbered = /\s\d+$/.test(a.name || "");
        const bNumbered = /\s\d+$/.test(b.name || "");
        if (aNumbered !== bNumbered) return aNumbered ? 1 : -1;
        return Number(b.rating || 0) - Number(a.rating || 0);
      })
    : products;

  const hotelImageUrls = sortedProducts.map((product) => {
    if (type !== "hotel") return getCanonicalTravelProductImage(product, type, 1000);
    return getCanonicalTravelProductImage(product, "hotel", 1000);
  });

  if (!label) {
    return <main className="mx-auto max-w-5xl p-8 text-slate-700">{error}</main>;
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden pb-14 text-slate-900 ${
        isHotelPage || isExperiencePage || isCarPage
          ? "bg-gradient-to-br from-[#d9ecff] via-[#eef6ff] to-[#dfeeff]"
          : "bg-[#f7f8fb]"
      }`}
      style={{ paddingTop: 84 }}
    >
      <Navbar />

      {(isHotelPage || isExperiencePage || isCarPage) && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: 290 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 22% 28% at 10% 35%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.45) 55%, transparent 100%), radial-gradient(ellipse 26% 24% at 32% 80%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 55%, transparent 100%), linear-gradient(105deg, #c7e0ff 0%, #dceeff 45%, #b8d7fc 100%)",
            }}
          />
          <img
            src={
              isCarPage
                ? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85"
                : "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg"
            }
            alt=""
            className="hidden md:block"
            style={{
              position: "absolute",
              right: 0,
              top: isCarPage ? 0 : 24,
              width: "56%",
              height: isCarPage ? 290 : 265,
              objectFit: "cover",
              objectPosition: "center",
              maskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.5) 18%, black 36%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.5) 18%, black 36%, black 100%)",
            }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-7 lg:px-10">
        <div className="mb-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-blue-800 shadow-sm backdrop-blur transition hover:bg-white sm:text-sm"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={16} weight="bold" />{" "}
            {isExperiencePage ? "Quay lại trang chủ" : "Trở về trang chủ"}
          </Link>
        </div>

        <header
          className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          style={{ minHeight: 96 }}
        >
          <div>
            <p
              className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700"
              style={{ margin: "0 0 6px 0" }}
            >
              SKYLINK TRAVEL
            </p>
            <h1
              className="text-3xl font-black tracking-tight text-[#0c2659] sm:text-4xl"
              style={{ margin: 0 }}
            >
              {isHotelPage
                ? "Khám phá nơi lưu trú"
                : isExperiencePage
                  ? "Khám phá trải nghiệm"
                  : `Khám phá ${label.toLowerCase()}`}
            </h1>
            {isHotelPage ? (
              <div>
                <p
                  className="mt-2 text-sm font-medium text-[#3b5582] sm:text-base"
                  style={{ margin: "8px 0 0 0" }}
                >
                  Lưu lại hành trình của bạn và quản lý các đặt phòng dễ dàng hơn.
                </p>
                <div
                  style={{
                    width: 64,
                    height: 3,
                    borderRadius: 99,
                    background: "linear-gradient(90deg, #0b5ed7 0%, #60a5fa 100%)",
                    marginTop: 6,
                  }}
                />
              </div>
            ) : isExperiencePage ? (
              <div>
                <p
                  className="mt-2 text-sm font-medium text-[#3b5582] sm:text-base"
                  style={{ margin: "8px 0 0 0" }}
                >
                  Hành trình mới, những điểm đến tuyệt vời đang chờ bạn.
                </p>
                <div
                  style={{
                    width: 64,
                    height: 3,
                    borderRadius: 99,
                    background: "linear-gradient(90deg, #0b5ed7 0%, #60a5fa 100%)",
                    marginTop: 6,
                  }}
                />
              </div>
            ) : isCarPage ? (
              <p className="mt-2 text-sm font-medium text-[#49618d] sm:text-base">
                Chọn chiếc xe phù hợp để chủ động khám phá hành trình của bạn.
              </p>
            ) : (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">
                  {q || "Tất cả địa điểm"}
                </span>
                <span className="text-slate-300">•</span>
                <CalendarBlank size={15} />
                <span>
                  {formatDate(startDate)}
                  {effectiveEndDate ? ` – ${formatDate(effectiveEndDate)}` : ""}
                </span>
                <span className="text-slate-300">•</span>
                <UsersThree size={15} />
                <span>{guests} khách</span>
              </p>
            )}
          </div>
          {(isHotelPage || isExperiencePage || isCarPage) && q && (
            <Link
              to={allLocationsUrl}
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/90 bg-white/90 px-4 py-2 text-xs font-extrabold text-blue-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white sm:self-auto sm:text-sm"
              style={{ textDecoration: "none" }}
            >
              <MapPinLine size={17} weight="fill" /> Xem tất cả địa điểm{" "}
              <ArrowRight size={16} weight="bold" />
            </Link>
          )}
        </header>

        {bookingId && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900 sm:text-sm">
            <Ticket
              size={18}
              weight="fill"
              className="mt-0.5 shrink-0 text-blue-600"
            />
            <p style={{ margin: 0 }}>
              Dịch vụ này sẽ được gắn với vé máy bay cho hành trình đến{" "}
              <strong>{q || "điểm đến đã chọn"}</strong>. Đặt chỗ và hủy dịch vụ
              được xử lý riêng, không thay đổi vé.
            </p>
          </div>
        )}

        {(isStayOrRental || isExperiencePage) && (
          <label
            style={{
              display: "flex",
              borderRadius: 20,
              padding: "10px 18px",
              background: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 10px 28px rgba(38, 84, 160, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.95)",
            }}
            className="mb-4 w-full flex-wrap items-center gap-3 text-sm backdrop-blur"
          >
            <span
              className="flex shrink-0 items-center justify-center text-white"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(180deg, #1d78f0 0%, #0b5ed7 100%)",
                boxShadow: "0 4px 12px rgba(13, 94, 215, 0.25)",
              }}
            >
              <CalendarBlank size={19} weight="fill" />
            </span>
            <span className="font-extrabold text-[#122b66]">
              {type === "hotel"
                ? "Ngày trả phòng"
                : type === "car"
                  ? "Ngày thuê xe"
                  : "Ngày trả / kết thúc"}
            </span>
            <input
              type="date"
              value={effectiveEndDate || defaultCheckoutDate}
              min={nextDate(startDate || new Date().toISOString().slice(0, 10))}
              onChange={(event) => updateEndDate(event.target.value)}
              className="font-bold text-slate-800 outline-none"
              style={{
                borderRadius: 9999,
                border: "1px solid #d4e3fa",
                background: "#f8fbff",
                padding: "6px 14px",
              }}
            />
            <span
              className="hidden md:inline"
              style={{
                width: 1,
                height: 22,
                background: "#dbe7f9",
                marginInline: 4,
              }}
            />
            <span className="hidden text-xs font-medium text-[#526b90] md:inline">
              {bookingId
                ? "Ngày bắt đầu theo lịch trình chuyến bay; chọn ngày kết thúc phù hợp."
                : isCarPage
                  ? "Chọn ngày kết thúc thuê xe và địa điểm nhận/trả."
                  : "Chọn ngày kết thúc phù hợp với lịch trình."}
            </span>
            {isCarPage ? (
              <svg
                viewBox="0 0 130 34"
                fill="none"
                className="ml-auto hidden sm:block"
                style={{ width: 120, height: 32, overflow: "visible" }}
                aria-hidden="true"
              >
                <path
                  d="M14 26C42 30 74 14 112 18"
                  stroke="#3b82f6"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                {/* Left Pin */}
                <path
                  d="M14 12C10.7 12 8 14.7 8 18C8 22.5 14 28 14 28C14 28 20 22.5 20 18C20 14.7 17.3 12 14 12ZM14 20.2C12.8 20.2 11.8 19.2 11.8 18C11.8 16.8 12.8 15.8 14 15.8C15.2 15.8 16.2 16.8 16.2 18C16.2 19.2 15.2 20.2 14 20.2Z"
                  fill="#1d78f0"
                />
                {/* Right Pin */}
                <path
                  d="M114 2C110.1 2 107 5.1 107 9C107 14.2 114 21 114 21C114 21 121 14.2 121 9C121 5.1 117.9 2 114 2ZM114 11.5C112.6 11.5 111.5 10.4 111.5 9C111.5 7.6 112.6 6.5 114 6.5C115.4 6.5 116.5 7.6 116.5 9C116.5 10.4 115.4 11.5 114 11.5Z"
                  fill="#0b5ed7"
                />
              </svg>
            ) : (
              <span
                className="ml-auto hidden items-center justify-center sm:flex"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#e8f2ff",
                  color: "#3b82f6",
                }}
              >
                <CalendarBlank size={20} weight="fill" />
              </span>
            )}
          </label>
        )}

        {requiresGuestContact && (
          <section
            className="relative mb-6 overflow-hidden border backdrop-blur-xl"
            style={{
              borderRadius: 28,
              padding: "18px 24px",
              background: "rgba(255, 255, 255, 0.94)",
              borderColor: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 16px 42px rgba(38, 84, 160, 0.12)",
            }}
          >
            {/* Lightweight Vector City Skyline + "Travel More Live Better" on Right */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-3 hidden lg:flex items-center gap-2 opacity-90"
            >
              <svg
                viewBox="0 0 270 86"
                fill="none"
                style={{ width: 255, height: 82 }}
              >
                <defs>
                  <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                {/* City Skyline Silhouette */}
                <rect x="18" y="42" width="12" height="30" rx="1" fill="url(#skylineGrad)" />
                <rect x="33" y="32" width="14" height="40" rx="1" fill="url(#skylineGrad)" />
                <rect x="50" y="38" width="11" height="34" rx="1" fill="url(#skylineGrad)" />
                <rect x="64" y="22" width="15" height="50" rx="1.5" fill="url(#skylineGrad)" />
                <rect x="82" y="12" width="16" height="60" rx="1.5" fill="url(#skylineGrad)" />
                <rect x="100" y="15" width="15" height="57" rx="1.5" fill="url(#skylineGrad)" />
                <rect x="118" y="28" width="13" height="44" rx="1" fill="url(#skylineGrad)" />
                <rect x="134" y="36" width="12" height="36" rx="1" fill="url(#skylineGrad)" />
                <path
                  d="M6 72H154"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity="0.5"
                />
                {/* Location Pin */}
                <path
                  d="M164 18C158.5 18 154 22.5 154 28C154 35.5 164 45 164 45C164 45 174 35.5 174 28C174 22.5 169.5 18 164 18ZM164 31.5C162.1 31.5 160.5 29.9 160.5 28C160.5 26.1 162.1 24.5 164 24.5C165.9 24.5 167.5 26.1 167.5 28C167.5 29.9 165.9 31.5 164 31.5Z"
                  fill="#0b5ed7"
                />
                {/* Script Tagline */}
                <text
                  x="178"
                  y="27"
                  fill="#1558c0"
                  fontSize="12"
                  fontWeight="800"
                  fontStyle="italic"
                  transform="rotate(-8 178 27)"
                >
                  Travel More
                </text>
                <text
                  x="178"
                  y="43"
                  fill="#1558c0"
                  fontSize="12"
                  fontWeight="800"
                  fontStyle="italic"
                  transform="rotate(-8 178 43)"
                >
                  Live Better
                </text>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Left Circle Icon: Suitcase / Car / User Avatar with Edit Badge */}
              <div
                className="relative hidden shrink-0 items-center justify-center rounded-full sm:flex"
                style={{
                  width: 82,
                  height: 82,
                  background: "linear-gradient(180deg, #d7ebff 0%, #edf6ff 100%)",
                  boxShadow:
                    "inset 0 2px 6px rgba(255,255,255,0.9), 0 8px 18px rgba(25,103,210,0.12)",
                  border: "1px solid #ffffff",
                  color: "#0b57d0",
                }}
              >
                {isHotelPage ? (
                  <SuitcaseRolling size={38} weight="fill" />
                ) : isCarPage ? (
                  <CarProfile size={38} weight="fill" />
                ) : (
                  <>
                    <User size={40} weight="fill" />
                    <span
                      className="flex items-center justify-center rounded-full bg-white text-blue-700 shadow-sm"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "1px solid #cfe2fc",
                      }}
                    >
                      <PencilSimple size={12} weight="fill" />
                    </span>
                  </>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  className="text-lg font-black text-[#0b2b66] sm:text-xl"
                  style={{ margin: 0 }}
                >
                  {type === "hotel"
                    ? "Thông tin khách lưu trú chính"
                    : type === "car"
                      ? "Thông tin người thuê xe chính"
                      : "Thông tin khách liên hệ chính"}
                </h2>
                <p
                  className="mt-1 max-w-2xl text-xs leading-5 text-[#4e678c]"
                  style={{ margin: "4px 0 0 0" }}
                >
                  Thông tin này được lưu cùng đơn để liên hệ về yêu cầu dịch vụ.
                  Không nhập thông tin thẻ hoặc mật khẩu thanh toán.
                </p>

                <div className="mt-3.5 grid gap-3 sm:grid-cols-3 lg:max-w-4xl">
                  <label className="block w-full text-xs font-extrabold text-[#122b66]">
                    <span className="mb-1.5 flex items-center gap-1.5">
                      <User size={14} weight="fill" className="text-blue-700" /> Họ
                      và tên
                    </span>
                    <input
                      type="text"
                      autoComplete="name"
                      maxLength={255}
                      required
                      value={guestContact.name}
                      onChange={(event) =>
                        setGuestContact((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder={
                        type === "hotel"
                          ? "Tên khách lưu trú chính"
                          : type === "car"
                            ? "Tên người thuê xe"
                            : "Tên khách liên hệ"
                      }
                      className="w-full text-xs font-medium outline-none transition focus:ring-2 focus:ring-blue-200"
                      style={{
                        borderRadius: 9999,
                        border: "1px solid #d5e4fa",
                        background: "#eef5ff",
                        padding: "9px 15px",
                        color: "#0b2b66",
                      }}
                    />
                  </label>
                  <label className="block w-full text-xs font-extrabold text-[#122b66]">
                    <span className="mb-1.5 flex items-center gap-1.5">
                      <EnvelopeSimple
                        size={14}
                        weight="fill"
                        className="text-blue-700"
                      />{" "}
                      Email liên hệ
                    </span>
                    <input
                      type="email"
                      autoComplete="email"
                      maxLength={255}
                      required
                      value={guestContact.email}
                      onChange={(event) =>
                        setGuestContact((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="email@example.com"
                      className="w-full text-xs font-medium outline-none transition focus:ring-2 focus:ring-blue-200"
                      style={{
                        borderRadius: 9999,
                        border: "1px solid #d5e4fa",
                        background: "#eef5ff",
                        padding: "9px 15px",
                        color: "#0b2b66",
                      }}
                    />
                  </label>
                  <label className="block w-full text-xs font-extrabold text-[#122b66]">
                    <span className="mb-1.5 flex items-center gap-1.5">
                      <Phone size={14} weight="fill" className="text-blue-700" /> Số
                      điện thoại
                    </span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      maxLength={30}
                      required
                      value={guestContact.phone}
                      onChange={(event) =>
                        setGuestContact((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+84 90 123 4567"
                      className="w-full text-xs font-medium outline-none transition focus:ring-2 focus:ring-blue-200"
                      style={{
                        borderRadius: 9999,
                        border: "1px solid #d5e4fa",
                        background: "#eef5ff",
                        padding: "9px 15px",
                        color: "#0b2b66",
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}

        {reservationMessage && (
          <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
            <span>{reservationMessage}</span>
            {reservationId && (
              <Link
                to="/my-travel-services"
                className="shrink-0 font-extrabold underline underline-offset-2"
              >
                Xem dịch vụ đã đặt
              </Link>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
            {error.includes("đăng nhập") && (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="ml-2 font-bold underline underline-offset-2"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2
              className="flex items-center gap-2 text-xl font-black text-[#0b2b66] sm:text-2xl"
              style={{ margin: 0 }}
            >
              {(isHotelPage || isExperiencePage || isCarPage) && (
                <Star size={24} weight="fill" className="text-amber-400" />
              )}
              Lựa chọn dành cho bạn
            </h2>
            <p
              className="text-xs font-medium text-[#4e678c] sm:text-sm"
              style={{ margin: "2px 0 0 0" }}
            >
              {isHotelPage
                ? "Khách sạn được yêu thích và đánh giá cao từ khách hàng của SkyLink."
                : isExperiencePage
                  ? "Khám phá các tour du lịch hấp dẫn với mức giá tốt nhất từ SkyLink."
                  : isCarPage
                    ? "Đa dạng dòng xe, phù hợp mọi hành trình."
                    : !loading
                      ? `${products.length} lựa chọn phù hợp`
                      : ""}
            </p>
          </div>
          {!loading && products.length > 0 && (
            <div className="flex items-center gap-2">
              {isExperiencePage && (
                <svg
                  viewBox="0 0 150 32"
                  fill="none"
                  className="hidden sm:block"
                  style={{ width: 135, height: 28, overflow: "visible" }}
                  aria-hidden="true"
                >
                  <path
                    d="M4 26C48 26 88 22 124 12"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeOpacity="0.6"
                  />
                  <g transform="translate(125, 0) rotate(-14)">
                    <path
                      d="M18 8L11 9.2L5.5 2L3.5 2.7L6.5 10L2 10.8L0.5 8.5L-0.5 9L0.8 12.5L-0.5 15.8L0.5 16.2L2 13.8L6.5 14.5L3.5 21.8L5.5 22.4L11 15.2L18 16.2C19.5 16.2 20.5 15.2 20.5 12C20.5 8.8 19.5 8 18 8Z"
                      fill="#1d78f0"
                    />
                  </g>
                </svg>
              )}
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-extrabold text-blue-700 shadow-sm"
              >
                {isCarPage ? (
                  <>
                    Xem thêm tất cả <ArrowRight size={14} weight="bold" />
                  </>
                ) : (
                  <>
                    <ArrowRight size={14} weight="bold" /> Xem thêm
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className={`grid gap-5 sm:grid-cols-2 ${isHotelPage || isExperiencePage || isCarPage ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3"}`}>
            {[1, 2, 3].map((item) => (
              <div key={item} className="overflow-hidden rounded-3xl bg-white shadow-sm">
                <div className="h-56 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={`rounded-3xl border px-6 py-16 text-center shadow-sm ${
            isHotelPage || isExperiencePage || isCarPage ? "border-white bg-white/85 shadow-blue-900/5" : "border-slate-200 bg-white"
          }`}>
            <MapPinLine size={36} className="mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-slate-800">Chưa có dịch vụ phù hợp</h3>
            <p className="mt-1 text-sm text-slate-500">Thử chọn địa điểm khác hoặc xem toàn bộ danh sách.</p>
          </div>
        ) : (
          <div className={`grid items-stretch gap-4 sm:grid-cols-2 ${
            isHotelPage || isExperiencePage || isCarPage ? "lg:grid-cols-3 xl:grid-cols-4" : "xl:grid-cols-3"
          }`}>
            {sortedProducts.map((product, index) => {
                const amenities = product.details?.amenities || [];
                const imageUrl = type === "experience"
                  ? getExperienceImage(product, index)
                  : type === "car"
                    ? getCarImage(product, index)
                    : hotelImageUrls[index];
                const isAvailable = product.available_units > 0;
                const quantity = quantities[product.id] || 1;
                const canBook = isAvailable && product.available_units >= (type === "experience" ? guests : quantity);
                const rating = Number(product.rating || 0);

                if (type === "car") {
                  const carDetails = product.details || {};
                  const seats = carDetails.seats || product.max_guests || 5;
                  const carBadge = carBadges[index % carBadges.length];
                  const CarBadgeIcon = carBadge.Icon;
                  const carReviewCount =
                    carReviewCounts[index % carReviewCounts.length];
                  const isFav = favorites.includes(product.id);

                  return (
                    <article
                      key={product.id}
                      className="group flex h-full flex-col justify-between overflow-hidden border border-white bg-white transition duration-300 hover:-translate-y-1"
                      style={{
                        padding: 10,
                        borderRadius: 24,
                        boxShadow: "0 12px 30px rgba(34, 78, 152, 0.10)",
                      }}
                    >
                      {/* Padded Rounded Car Photo */}
                      <div
                        className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-sky-100 to-slate-200"
                        style={{ height: 128, borderRadius: 16 }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Ảnh minh họa ${product.name}`}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          onError={(event) => {
                            if (event.currentTarget.src !== fallbackCarImage) {
                              event.currentTarget.src = fallbackCarImage;
                            } else {
                              event.currentTarget.style.display = "none";
                            }
                          }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(12,45,103,0.14) 0%, transparent 50%, rgba(12,45,103,0.12) 100%)",
                          }}
                        />

                        {/* Top-Left Colored Pill Badge matching Mockup */}
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full font-extrabold text-white shadow-sm"
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            zIndex: 10,
                            background: carBadge.bg,
                            color: carBadge.color,
                            fontSize: 11,
                            lineHeight: "16px",
                            padding: "4px 11px",
                            border: "1px solid rgba(255,255,255,0.45)",
                          }}
                        >
                          <CarBadgeIcon size={13} weight="fill" />
                          {carBadge.label}
                        </span>

                        {/* Top-Right Circular Heart Button */}
                        <button
                          type="button"
                          aria-label={isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
                          onClick={() => toggleFavorite(product.id)}
                          className="flex items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            zIndex: 10,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            border: "1px solid rgba(226, 232, 240, 0.9)",
                            cursor: "pointer",
                            color: isFav ? "#ef4444" : "#1e3a8a",
                          }}
                        >
                          <Heart
                            size={15}
                            weight={isFav ? "fill" : "regular"}
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div
                        className="flex flex-1 flex-col justify-between"
                        style={{ padding: "12px 8px 6px 8px" }}
                      >
                        <div>
                          {/* Car Title */}
                          <h3
                            className="truncate font-black"
                            title={product.name}
                            style={{
                              color: "#0b2b66",
                              fontSize: 16,
                              lineHeight: "22px",
                              margin: 0,
                            }}
                          >
                            {product.name}
                          </h3>

                          {/* 3 Compact Specs Row: 5 chỗ | Tự động | Máy lạnh */}
                          <div
                            className="flex flex-wrap items-center gap-3 text-xs font-semibold"
                            style={{ color: "#4e678c", marginTop: 7 }}
                          >
                            <span className="inline-flex items-center gap-1">
                              <User
                                size={13}
                                weight="bold"
                                style={{ color: "#3b82f6" }}
                              />
                              {seats} chỗ
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <GearSix
                                size={13}
                                weight="bold"
                                style={{ color: "#3b82f6" }}
                              />
                              {carDetails.transmission || "Tự động"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Snowflake
                                size={13}
                                weight="bold"
                                style={{ color: "#3b82f6" }}
                              />
                              Máy lạnh
                            </span>
                          </div>

                          {/* Star Rating & Review Count Row */}
                          <div
                            className="flex items-center gap-1"
                            style={{ marginTop: 7, fontSize: 12 }}
                          >
                            <Star
                              size={15}
                              weight="fill"
                              style={{ color: "#f59e0b", flexShrink: 0 }}
                            />
                            <span
                              className="font-black"
                              style={{ color: "#ea580c" }}
                            >
                              {rating > 0 ? rating.toFixed(1) : "4.8"}
                            </span>
                            <span
                              className="font-medium"
                              style={{ color: "#526b90", fontSize: 11.5 }}
                            >
                              ({carReviewCount} đánh giá)
                            </span>
                          </div>
                        </div>

                        {/* Bottom Footer Row: Price/ngày on Left + Blue Pill Button "Đặt xe ->" on Right */}
                        <div
                          className="flex items-center justify-between gap-2"
                          style={{ marginTop: 12 }}
                        >
                          <div style={{ whiteSpace: "nowrap" }}>
                            <span
                              className="font-black"
                              style={{ color: "#0b2b66", fontSize: 17 }}
                            >
                              {currency.format(product.price)}
                            </span>
                            <span
                              className="font-semibold"
                              style={{
                                color: "#475569",
                                fontSize: 11.5,
                                marginLeft: 2,
                              }}
                            >
                              /ngày
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => reserve(product)}
                            disabled={busyProductId === product.id || !canBook}
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-extrabold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                            style={{
                              cursor:
                                busyProductId === product.id || !canBook
                                  ? "not-allowed"
                                  : "pointer",
                              padding: "8px 16px",
                              borderRadius: 9999,
                              border: "none",
                              background:
                                "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                              boxShadow: "0 6px 16px rgba(13, 94, 215, 0.28)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {busyProductId === product.id ? (
                              <>
                                <CircleNotch
                                  size={14}
                                  className="animate-spin"
                                />{" "}
                                Đang đặt...
                              </>
                            ) : !canBook ? (
                              "Hết xe"
                            ) : (
                              "Đặt xe"
                            )}
                            {busyProductId !== product.id && canBook && (
                              <ArrowRight size={13} weight="bold" />
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }

                if (type === "experience") {
                  const experienceDetails = product.details || {};
                  const includedItems = experienceDetails.includes || [];
                  const expReviewCount =
                    experienceReviewCounts[index % experienceReviewCounts.length];
                  const isFav = favorites.includes(product.id);
                  const feature1 =
                    includedItems[0] || "Hướng dẫn viên";
                  const feature2 =
                    includedItems[1] || "Vé tham quan";

                  return (
                    <article
                      key={product.id}
                      className="group flex h-full flex-col justify-between overflow-hidden border border-white bg-white transition duration-300 hover:-translate-y-1"
                      style={{
                        padding: 10,
                        borderRadius: 24,
                        boxShadow: "0 14px 32px rgba(31, 74, 148, 0.11)",
                      }}
                    >
                      {/* Padded Rounded Image Box */}
                      <div
                        className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-sky-100 to-teal-100"
                        style={{ height: 158, borderRadius: 16 }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Ảnh minh họa ${product.name}`}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(12,45,103,0.14) 0%, transparent 45%, rgba(8,29,68,0.45) 100%)",
                          }}
                        />

                        {/* Top-Left Emerald Pill Badge: Được yêu thích */}
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full font-extrabold text-white shadow-sm"
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            zIndex: 10,
                            background: "#10b981",
                            color: "#ffffff",
                            fontSize: 11,
                            lineHeight: "16px",
                            padding: "4px 11px",
                            border: "1px solid rgba(255,255,255,0.45)",
                          }}
                        >
                          <CheckCircle size={13} weight="fill" />
                          Được yêu thích
                        </span>

                        {/* Top-Right Circular Heart Button */}
                        <button
                          type="button"
                          aria-label={isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
                          onClick={() => toggleFavorite(product.id)}
                          className="flex items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            zIndex: 10,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            border: "1px solid rgba(226, 232, 240, 0.9)",
                            cursor: "pointer",
                            color: isFav ? "#ef4444" : "#1e3a8a",
                          }}
                        >
                          <Heart
                            size={15}
                            weight={isFav ? "fill" : "regular"}
                            aria-hidden="true"
                          />
                        </button>

                        {/* Bottom-Left Dark Frosted City Pill */}
                        <span
                          className="inline-flex items-center gap-1 rounded-full text-white"
                          style={{
                            position: "absolute",
                            bottom: 10,
                            left: 10,
                            zIndex: 10,
                            background: "rgba(15, 23, 42, 0.58)",
                            backdropFilter: "blur(6px)",
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            border: "1px solid rgba(255,255,255,0.25)",
                          }}
                        >
                          <MapPinLine size={13} weight="fill" />
                          <span className="truncate">{product.city}</span>
                        </span>
                      </div>

                      {/* Card Body */}
                      <div
                        className="relative flex flex-1 flex-col justify-between"
                        style={{ padding: "12px 8px 6px 8px" }}
                      >
                        {/* Subtle Background Landmark Watermark SVG */}
                        <svg
                          viewBox="0 0 64 64"
                          fill="none"
                          aria-hidden="true"
                          className="pointer-events-none"
                          style={{
                            position: "absolute",
                            right: 4,
                            bottom: 42,
                            width: 58,
                            height: 58,
                            opacity: 0.45,
                            color: "#dbeafe",
                          }}
                        >
                          <path
                            d="M32 8L20 18H44L32 8ZM16 24L24 18H40L48 24H16ZM14 34L22 26H42L50 34H14ZM20 34V52H44V34H20ZM10 52H54V56H10V52Z"
                            fill="currentColor"
                          />
                        </svg>

                        <div className="relative z-10">
                          {/* Title */}
                          <h3
                            className="line-clamp-2 font-black"
                            title={product.name}
                            style={{
                              color: "#0b2b66",
                              fontSize: 17,
                              lineHeight: "22px",
                              minHeight: 44,
                              margin: 0,
                            }}
                          >
                            {product.name}
                          </h3>

                          {/* Star Rating & Review Count right below Title */}
                          <div
                            className="flex items-center gap-1"
                            style={{ marginTop: 6, fontSize: 12 }}
                          >
                            <Star
                              size={15}
                              weight="fill"
                              style={{ color: "#f59e0b", flexShrink: 0 }}
                            />
                            <span
                              className="font-black"
                              style={{ color: "#ea580c" }}
                            >
                              {rating > 0 ? rating.toFixed(1) : "4.8"}
                            </span>
                            <span
                              className="font-medium"
                              style={{ color: "#526b90", fontSize: 11.5 }}
                            >
                              ({expReviewCount} đánh giá)
                            </span>
                          </div>

                          {/* Feature Pills (Duration + Included Services) */}
                          <div
                            className="flex flex-wrap items-center gap-1.5"
                            style={{ marginTop: 10 }}
                          >
                            <span
                              className="inline-flex items-center gap-1 rounded-full font-bold"
                              style={{
                                background: "#edf4ff",
                                color: "#1e3a6e",
                                fontSize: 11,
                                padding: "4px 10px",
                              }}
                            >
                              <Clock
                                size={13}
                                weight="bold"
                                style={{ color: "#2563eb" }}
                              />
                              {experienceDetails.duration || "4 giờ"}
                            </span>

                            <span
                              className="inline-flex items-center gap-1 rounded-full font-bold"
                              style={{
                                background: "#edf4ff",
                                color: "#1e3a6e",
                                fontSize: 11,
                                padding: "4px 10px",
                              }}
                            >
                              <ForkKnife
                                size={13}
                                weight="fill"
                                style={{ color: "#1e40af" }}
                              />
                              {feature1}
                            </span>

                            <span
                              className="inline-flex items-center gap-1 rounded-full font-bold"
                              style={{
                                background: "#edf4ff",
                                color: "#1e3a6e",
                                fontSize: 11,
                                padding: "4px 10px",
                              }}
                            >
                              <Ticket
                                size={13}
                                weight="fill"
                                style={{ color: "#2563eb" }}
                              />
                              {feature2}
                            </span>
                          </div>

                          {/* Availability Row */}
                          <div
                            className="flex items-center gap-1.5 text-xs font-bold"
                            style={{
                              marginTop: 10,
                              color: isAvailable ? "#059669" : "#e11d48",
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: isAvailable ? "#10b981" : "#f43f5e",
                                display: "inline-block",
                              }}
                            />
                            <span>
                              {isAvailable
                                ? `Còn ${product.available_units ?? product.inventory_count} chỗ`
                                : "Đã hết chỗ"}
                            </span>
                            <span
                              className="font-medium"
                              style={{ color: "#64748b" }}
                            >
                              · theo catalog
                            </span>
                          </div>
                        </div>

                        {/* Footer Row: Price on Left + Solid Blue Pill Button "Đặt tour ->" on Right */}
                        <div
                          className="relative z-10 flex items-center justify-between gap-2 border-t border-slate-100"
                          style={{ marginTop: 12, paddingTop: 10 }}
                        >
                          <div style={{ whiteSpace: "nowrap" }}>
                            <span
                              className="font-black"
                              style={{ color: "#0b2b66", fontSize: 17 }}
                            >
                              {currency.format(product.price)}
                            </span>
                            <span
                              className="font-semibold"
                              style={{
                                color: "#475569",
                                fontSize: 11.5,
                                marginLeft: 3,
                              }}
                            >
                              /{product.price_unit}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => reserve(product)}
                            disabled={busyProductId === product.id || !canBook}
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-extrabold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                            style={{
                              cursor:
                                busyProductId === product.id || !canBook
                                  ? "not-allowed"
                                  : "pointer",
                              padding: "8px 15px",
                              borderRadius: 9999,
                              border: "none",
                              background:
                                "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                              boxShadow: "0 6px 16px rgba(13, 94, 215, 0.28)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {busyProductId === product.id ? (
                              <>
                                <CircleNotch
                                  size={14}
                                  className="animate-spin"
                                />{" "}
                                Đang đặt...
                              </>
                            ) : !canBook ? (
                              "Hết chỗ"
                            ) : (
                              "Đặt tour"
                            )}
                            {busyProductId !== product.id && canBook && (
                              <ArrowRight size={13} weight="bold" />
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }

                const badgeInfo = hotelBadges[index % hotelBadges.length];
                const BadgeIcon = badgeInfo.Icon;
                const reviewCount = hotelReviewCounts[index % hotelReviewCounts.length];
                const isFav = favorites.includes(product.id);

                return (
                  <article
                    key={product.id}
                    className="group flex h-full flex-col justify-between overflow-hidden border border-white bg-white transition duration-300 hover:-translate-y-1"
                    style={{
                      padding: 10,
                      borderRadius: 24,
                      boxShadow: "0 12px 30px rgba(34, 78, 152, 0.10)",
                    }}
                  >
                    <div
                      className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-sky-200"
                      style={{ height: 152, borderRadius: 16 }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Ảnh minh họa ${product.name}`}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl font-black text-blue-800/50">
                          {product.name.slice(0, 1)}
                        </div>
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(12,45,103,0.14) 0%, transparent 45%, rgba(12,45,103,0.15) 100%)",
                        }}
                      />

                      {/* Top-Left Colored Pill Badge matching Mockup */}
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full font-extrabold shadow-sm"
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          zIndex: 10,
                          background: badgeInfo.bg,
                          color: badgeInfo.color,
                          fontSize: 11,
                          lineHeight: "16px",
                          padding: "4px 11px",
                          border: "1px solid rgba(255,255,255,0.75)",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        <BadgeIcon
                          size={13}
                          weight="fill"
                          style={{ color: badgeInfo.iconColor }}
                          aria-hidden="true"
                        />
                        {badgeInfo.label}
                      </span>

                      {/* Top-Right Circular Heart Button */}
                      <button
                        type="button"
                        aria-label={isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
                        onClick={() => toggleFavorite(product.id)}
                        className="flex items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          zIndex: 10,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          border: "1px solid rgba(226, 232, 240, 0.9)",
                          cursor: "pointer",
                          color: isFav ? "#ef4444" : "#25447d",
                        }}
                      >
                        <Heart
                          size={15}
                          weight={isFav ? "fill" : "regular"}
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <div
                      className="flex flex-1 flex-col justify-between"
                      style={{ padding: "12px 8px 6px 8px" }}
                    >
                      <div>
                        <h3
                          className="truncate font-black"
                          title={product.name}
                          style={{
                            color: "#0b2b66",
                            fontSize: 16.5,
                            lineHeight: "22px",
                            margin: 0,
                          }}
                        >
                          {product.name}
                        </h3>

                        <p
                          className="flex items-center gap-1.5 truncate text-xs font-medium"
                          style={{ color: "#526b90", margin: "5px 0 0 0" }}
                        >
                          <MapPinLine
                            size={14}
                            weight="fill"
                            className="shrink-0"
                            style={{ color: "#60a5fa" }}
                          />
                          <span className="truncate">{product.city}</span>
                        </p>

                        {/* Star Rating & Review Count Row */}
                        <div
                          className="flex items-center gap-1"
                          style={{ marginTop: 6, fontSize: 12 }}
                        >
                          <Star
                            size={14}
                            weight="fill"
                            style={{ color: "#f59e0b", flexShrink: 0 }}
                          />
                          <span
                            className="font-black"
                            style={{ color: "#d97706" }}
                          >
                            {rating > 0 ? rating.toFixed(1) : "4.8"}
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: "#64748b", fontSize: 11 }}
                          >
                            ({reviewCount} đánh giá)
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Price on Left + Solid Blue Pill Button "Đặt khách sạn ->" on Right */}
                      <div
                        className="flex items-center justify-between gap-2"
                        style={{ marginTop: 12, whiteSpace: "nowrap" }}
                      >
                        <div>
                          <span
                            className="font-semibold"
                            style={{ color: "#3b82f6", fontSize: 11, marginRight: 3 }}
                          >
                            Từ
                          </span>
                          <span
                            className="font-black"
                            style={{ color: "#0b2b66", fontSize: 15.5 }}
                          >
                            {currency.format(product.price)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => reserve(product)}
                          disabled={busyProductId === product.id || !canBook}
                          aria-label={`Đặt phòng ${product.name}`}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-extrabold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                          style={{
                            cursor:
                              busyProductId === product.id || !canBook
                                ? "not-allowed"
                                : "pointer",
                            padding: "7px 14px",
                            borderRadius: 9999,
                            border: "none",
                            background:
                              "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                            boxShadow: "0 6px 16px rgba(13, 94, 215, 0.28)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {busyProductId === product.id ? (
                            <>
                              <CircleNotch size={13} className="animate-spin" />{" "}
                              Đang đặt...
                            </>
                          ) : !canBook ? (
                            "Hết phòng"
                          ) : (
                            "Đặt phòng"
                          )}
                          {busyProductId !== product.id && canBook && (
                            <ArrowRight size={13} weight="bold" />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </div>
    </main>
  );
}
