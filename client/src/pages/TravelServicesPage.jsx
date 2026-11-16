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
} from "@phosphor-icons/react";
import api from "../api";
import { normalizeHotelImageUrl } from "../utils/travelServiceImages";

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

const hotelImageUrl = (imageId) => (
  `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1200&q=85`
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

const carImages = [
  "photo-1492144534655-ae79c964c9d7",
  "photo-1503376780353-7e6692767b70",
  "photo-1503736334956-4c8f8e92946d",
  "photo-1552519507-da3b142c6e3d",
  "photo-1549317661-bd32c8ce0db2",
  "photo-1550355291-b1c1a8c8a9ab",
  "photo-1541899481282-d53bffe3c35d",
  "photo-1511919884226-fd3cad34687c",
  "photo-1493238792000-8113da705763",
  "photo-1504215680853-026ed2a45def",
  "photo-1533473359331-0135ef1b58bf",
  "photo-1525609004556-c46c7d6cf023",
  "photo-1542362567-b07e54358753",
  "photo-1551830820-330a71b99659",
  "photo-1617531653332-bd46c24f2068",
];

const fallbackCarImage = "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1000&q=85";

const getCarImage = (product) => {
  if (product.image_url) return product.image_url;

  const index = (Number(product.id) || 0) % carImages.length;
  return `https://images.unsplash.com/${carImages[index]}?auto=format&fit=crop&w=1000&q=85`;
};

const getExperienceImage = (product) => {
  if (product.image_url) return product.image_url;

  const name = product.name?.toLocaleLowerCase("vi") || "";
  const details = product.details || {};
  const theme = /ẩm thực|nấu|món ăn|món ngon|đặc sản|ăn uống/.test(name)
    ? "food"
    : /hoàng hôn|hoa đăng|phố cổ.*đêm|đêm/.test(name)
      ? "night"
      : /thuyền|du thuyền|đảo|biển|san hô|lặn|sup|câu mực|bãi sao|an bàng|hòn chồng/.test(name)
        ? "ocean"
        : /cà phê|cafe/.test(name)
          ? "coffee"
          : /đạp xe|xe đạp|chèo|kayak|safari|máng trượt/.test(name)
            ? "activity"
            : /thác|rừng|vườn|nông trại|đồi chè|săn mây|langbiang|bạch mã|pongour/.test(name)
              ? "nature"
              : /bà nà|ngũ hành sơn|sơn trà|đèo|núi|cao nguyên/.test(name)
                ? "mountain"
                : /bảo tàng|dinh|di tích|văn miếu|hoàng thành|chùa|lăng vua|lăng tẩm|làng gốm|làng mộc|làng hương|nhà tù|kiến trúc|nhà thờ|múa rối/.test(name)
                  ? "heritage"
                  : details.duration === "1 ngày"
                    ? "nature"
                    : "activity";
  const images = experienceImages[theme];
  const productId = Number(product.id) || [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const imageId = images[productId % images.length];

  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1000&q=85`;
};

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
      const { data } = await api.post(`/travel-services/${type}/${product.id}/reservations`, {
        start_date: startDate,
        end_date: effectiveEndDate || null,
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

  const cityImageIndexes = {};
  const hotelImageUrls = products.map((product) => {
    if (type !== "hotel") return product.image_url;
    if (product.image_url) return normalizeHotelImageUrl(product.image_url);

    const city = product.city || "";
    const cityImageIndex = cityImageIndexes[city] || 0;
    cityImageIndexes[city] = cityImageIndex + 1;
    const cityImages = hotelImagesByCity[city] || hotelImagesByCity["Hà Nội"];

    return hotelImageUrl(cityImages[cityImageIndex % cityImages.length]);
  });

  if (!label) {
    return <main className="mx-auto max-w-5xl p-8 text-slate-700">{error}</main>;
  }

  return (
    <main className={`relative min-h-screen overflow-hidden px-4 py-5 text-slate-900 sm:px-7 sm:py-7 lg:px-10 ${
      isHotelPage || isExperiencePage || isCarPage ? "bg-gradient-to-br from-[#dff2ff] via-[#f2f8ff] to-[#e9f2ff]" : "bg-[#f7f8fb]"
    }`}>
      {(isHotelPage || isExperiencePage || isCarPage) && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[235px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/45 via-blue-100/35 to-transparent" />
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=85"
            alt=""
            className={`absolute -right-10 -top-8 h-[235px] w-[72%] object-cover object-center opacity-55 [mask-image:linear-gradient(to_right,transparent,black_32%)] ${
              isExperiencePage ? "saturate-125" : ""
            }`}
          />
          <div className="absolute -left-20 top-10 h-40 w-80 rounded-full bg-white/55 blur-3xl" />
          <div className="absolute right-0 top-32 h-24 w-1/2 rounded-full bg-white/35 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/80" />
        </div>
      )}
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-4 py-2 text-xs font-bold text-blue-800 shadow-sm backdrop-blur transition hover:bg-white sm:text-sm">
            <ArrowLeft size={17} weight="bold" /> Trở về trang chủ
          </Link>
          {(isHotelPage || isExperiencePage || isCarPage) && (
            <div className="hidden items-center gap-2 text-[#102b63] sm:flex">
              <AirplaneTilt size={28} weight="fill" className="text-blue-700" />
              <span className="text-lg font-black tracking-tight">SkyLink Airlines</span>
            </div>
          )}
        </div>

        <header className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${isHotelPage || isExperiencePage || isCarPage ? "min-h-[105px]" : ""}`}>
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">
              {isHotelPage || isExperiencePage || isCarPage ? "SkyLink Travel" : "SkyLink travel"}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-[#12264f] sm:text-4xl">
              {isHotelPage ? "Khám phá nơi lưu trú" : isExperiencePage ? "Khám phá trải nghiệm" : `Khám phá ${label.toLowerCase()}`}
            </h1>
            {isHotelPage ? (
              <p className="mt-2 text-sm font-medium text-[#49618d] sm:text-base">
                Lưu lại hành trình của bạn và quản lý các đặt phòng dễ dàng hơn.
              </p>
            ) : isExperiencePage ? (
              <p className="mt-2 text-sm font-medium text-[#49618d] sm:text-base">
                Hành trình mới, những điểm đến tuyệt vời đang chờ bạn.
              </p>
            ) : isCarPage ? (
              <p className="mt-2 text-sm font-medium text-[#49618d] sm:text-base">
                Chọn chiếc xe phù hợp để chủ động khám phá hành trình của bạn.
              </p>
            ) : (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{q || "Tất cả địa điểm"}</span>
                <span className="text-slate-300">•</span>
                <CalendarBlank size={15} />
                <span>{formatDate(startDate)}{effectiveEndDate ? ` – ${formatDate(effectiveEndDate)}` : ""}</span>
                <span className="text-slate-300">•</span>
                <UsersThree size={15} />
                <span>{guests} khách</span>
              </p>
            )}
          </div>
          {(isHotelPage || isExperiencePage || isCarPage) && q && (
            <Link
              to={allLocationsUrl}
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/90 bg-white/90 px-4 py-2.5 text-xs font-extrabold text-blue-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white sm:self-auto sm:text-sm"
            >
              <MapPinLine size={17} weight="fill" /> Xem tất cả địa điểm <ArrowRight size={16} weight="bold" />
            </Link>
          )}
        </header>

        <div className={`mb-4 flex items-start gap-3 rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm ${
          isHotelPage || isExperiencePage || isCarPage
            ? "border border-blue-200 bg-blue-50/75 text-blue-950 shadow-sm shadow-blue-900/5"
            : "border border-amber-200/80 bg-amber-50/80 text-amber-900"
        }`}>
          {isHotelPage || isExperiencePage || isCarPage
            ? <Info size={20} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
            : <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-amber-600" />}
          <p>
            <strong>Giá và số lượng thuộc catalog nội bộ SkyLink.</strong> Đặt chỗ được ghi nhận trong hệ thống, chưa xác nhận với nhà cung cấp bên ngoài.
          </p>
        </div>

        {bookingId && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900 sm:text-sm">
            <Ticket size={18} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
            <p>
              Dịch vụ này sẽ được gắn với vé máy bay cho hành trình đến <strong>{q || "điểm đến đã chọn"}</strong>.
              Đặt chỗ và hủy dịch vụ được xử lý riêng, không thay đổi vé.
            </p>
          </div>
        )}

        {isStayOrRental && startDate && (
          <label
            style={{ display: "flex" }}
            className={`mb-5 w-full flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              isHotelPage || isCarPage
                ? "border-blue-100 bg-white/90 text-blue-950 shadow-blue-900/5 backdrop-blur"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
              <CalendarBlank size={19} weight="fill" />
            </span>
            <span className="font-extrabold text-[#172f68]">{type === "hotel" ? "Ngày trả phòng" : "Ngày trả xe"}</span>
            <input
              type="date"
              value={effectiveEndDate}
              min={nextDate(startDate)}
              onChange={(event) => updateEndDate(event.target.value)}
              className="rounded-xl border border-blue-100 bg-white px-3 py-2 font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <span className="hidden text-xs text-slate-500 md:inline">
              {bookingId ? "Ngày bắt đầu theo lịch trình chuyến bay; chọn ngày kết thúc phù hợp." : "Chọn ngày kết thúc phù hợp với lịch trình."}
            </span>
            {(isHotelPage || isCarPage) && <CalendarBlank size={28} weight="fill" className="ml-auto hidden text-blue-300 sm:block" />}
          </label>
        )}

        {requiresGuestContact && (
          <section className={`relative mb-6 overflow-hidden rounded-3xl border p-4 shadow-sm sm:p-5 ${
            isHotelPage || isExperiencePage || isCarPage ? "border-white/90 bg-white/90 shadow-blue-900/10 backdrop-blur" : "border-slate-200 bg-white"
          }`}>
            {(isHotelPage || isExperiencePage || isCarPage) && (
              <AirplaneTilt size={30} weight="fill" className="absolute right-5 top-5 rotate-[-18deg] text-blue-500/80" />
            )}
            <div className="mb-4 flex items-start gap-3">
              {(isHotelPage || isExperiencePage || isCarPage) && (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-inner">
                  {isHotelPage ? <SuitcaseRolling size={28} weight="fill" /> : isCarPage ? <CarProfile size={28} weight="fill" /> : <User size={28} weight="fill" />}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-[#12264f] sm:text-lg">
                  {type === "hotel" ? "Thông tin khách lưu trú chính" : type === "car" ? "Thông tin người thuê xe chính" : "Thông tin khách liên hệ chính"}
                </h2>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
                  Thông tin này được lưu cùng đơn để liên hệ về yêu cầu dịch vụ. Không nhập thông tin thẻ hoặc mật khẩu thanh toán.
                </p>
              </div>
            </div>
            <div className={`grid gap-3 ${isHotelPage || isExperiencePage || isCarPage ? "sm:grid-cols-3 sm:pl-[68px]" : "sm:grid-cols-3"}`}>
              <label className="block w-full text-xs font-bold text-slate-700">
                <span className="mb-1.5 flex items-center gap-1.5"><User size={15} weight="fill" className="text-blue-700" /> Họ và tên</span>
                <input
                  type="text"
                  autoComplete="name"
                  maxLength={255}
                  required
                  value={guestContact.name}
                  onChange={(event) => setGuestContact((current) => ({ ...current, name: event.target.value }))}
                  placeholder={type === "hotel" ? "Tên khách lưu trú chính" : type === "car" ? "Tên người thuê xe" : "Tên khách liên hệ"}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block w-full text-xs font-bold text-slate-700">
                <span className="mb-1.5 flex items-center gap-1.5"><EnvelopeSimple size={15} weight="fill" className="text-blue-700" /> Email liên hệ</span>
                <input
                  type="email"
                  autoComplete="email"
                  maxLength={255}
                  required
                  value={guestContact.email}
                  onChange={(event) => setGuestContact((current) => ({ ...current, email: event.target.value }))}
                  placeholder="email@example.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block w-full text-xs font-bold text-slate-700">
                <span className="mb-1.5 flex items-center gap-1.5"><Phone size={15} weight="fill" className="text-blue-700" /> Số điện thoại</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  required
                  value={guestContact.phone}
                  onChange={(event) => setGuestContact((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+84 90 123 4567"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </section>
        )}

        {reservationMessage && (
          <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
            <span>{reservationMessage}</span>
            {reservationId && (
              <Link to="/my-travel-services" className="shrink-0 font-extrabold underline underline-offset-2">
                Xem dịch vụ đã đặt
              </Link>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
            {error.includes("đăng nhập") && (
              <button type="button" onClick={() => navigate("/login")} className="ml-2 font-bold underline underline-offset-2">
                Đăng nhập
              </button>
            )}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#12264f] sm:text-xl">
              {(isHotelPage || isExperiencePage || isCarPage) && <Star size={22} weight="fill" className="text-amber-400" />}
              Lựa chọn dành cho bạn
            </h2>
            {!loading && <p className="mt-0.5 text-xs text-slate-500">{products.length} lựa chọn phù hợp</p>}
          </div>
          {!loading && products.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-3 py-2 text-[11px] font-bold text-blue-800 shadow-sm sm:text-xs">
              <SlidersHorizontal size={15} weight="bold" /> Đánh giá cao nhất
            </span>
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
            {products.map((product, index) => {
                const amenities = product.details?.amenities || [];
                const imageUrl = type === "experience"
                  ? getExperienceImage(product)
                  : type === "car"
                    ? getCarImage(product)
                    : hotelImageUrls[index];
                const isAvailable = product.available_units > 0;
                const quantity = quantities[product.id] || 1;
                const canBook = isAvailable && product.available_units >= (type === "experience" ? guests : quantity);
                const rating = Number(product.rating || 0);
                const isNearBeach = amenities.some((amenity) => amenity.toLowerCase().includes("biển"));
                const badge = isNearBeach ? "Gần biển" : rating >= 4.7 ? "Đánh giá cao" : "Dịch vụ SkyLink";

                if (type === "car") {
                  const carDetails = product.details || {};
                  const seats = carDetails.seats || product.max_guests;
                  const features = [
                    {
                      label: carDetails.driver_included ? "Có tài xế" : "Tự lái",
                      Icon: CarProfile,
                    },
                    {
                      label: carDetails.fuel || "Nhiên liệu",
                      Icon: GasPump,
                    },
                    {
                      label: `${seats} chỗ`,
                      Icon: UsersThree,
                    },
                    {
                      label: carDetails.transmission || "Số tự động",
                      Icon: GearSix,
                    },
                  ];

                  return (
                    <article
                      key={product.id}
                      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_10px_28px_-18px_rgba(20,54,110,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-20px_rgba(20,54,110,0.35)]"
                    >
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 via-sky-100 to-slate-200">
                        <img
                          src={imageUrl}
                          alt={`Ảnh minh họa ${product.name}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          onError={(event) => {
                            if (event.currentTarget.src !== fallbackCarImage) {
                              event.currentTarget.src = fallbackCarImage;
                            } else {
                              event.currentTarget.style.display = "none";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#081d44]/75 via-transparent to-slate-950/10" />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-[#18336c] shadow-sm backdrop-blur">
                          <CarProfile size={14} weight="fill" />
                          {carDetails.driver_included ? "Có tài xế" : "Tự lái"}
                        </span>
                        <button
                          type="button"
                          aria-label={favorites.includes(product.id) ? "Bỏ yêu thích" : "Thêm yêu thích"}
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/95 text-slate-500 shadow-sm transition hover:scale-105 hover:text-rose-500"
                        >
                          <Heart size={18} weight={favorites.includes(product.id) ? "fill" : "regular"} className={favorites.includes(product.id) ? "text-rose-500" : ""} />
                        </button>
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white drop-shadow">
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-bold">
                            <MapPinLine size={15} weight="fill" className="shrink-0" />
                            <span className="truncate">{product.city}</span>
                          </span>
                          {rating > 0 && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-amber-700 shadow-sm">
                              <Star size={13} weight="fill" /> {rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 min-h-12 flex-1 text-base font-black leading-snug tracking-tight text-[#17294f]">
                            {product.name}
                          </h3>
                        </div>

                        <p className="mb-3 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
                          <MapPinLine size={15} className="shrink-0 text-slate-400" />
                          <span className="truncate">{product.location || `Nhận xe tại ${product.city}`}</span>
                        </p>

                        <div className="mb-3 flex min-h-7 flex-wrap items-center gap-1.5">
                          {features.map(({ label: featureLabel, Icon }) => (
                            <span
                              key={featureLabel}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-slate-700"
                            >
                              {createElement(Icon, { size: 13, className: "text-blue-700" })} {featureLabel}
                            </span>
                          ))}
                        </div>

                        <div className="mb-3 flex items-center justify-between gap-2 text-[11px]">
                          <span className={`inline-flex items-center gap-1.5 font-bold ${isAvailable ? "text-emerald-700" : "text-rose-700"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {isAvailable ? `Còn ${product.available_units ?? product.inventory_count} xe` : "Đã hết xe"}
                          </span>
                          <span className="text-slate-400">Theo catalog</span>
                        </div>

                        <label style={{ display: "flex" }} className="mb-3 w-full items-center justify-between text-xs font-semibold text-slate-600">
                          Số lượng xe
                          <select
                            value={quantity}
                            onChange={(event) => setQuantities((previous) => ({
                              ...previous,
                              [product.id]: Number(event.target.value),
                            }))}
                            className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          >
                            {Array.from({ length: Math.max(1, Math.min(10, product.available_units || 1)) }, (_, item) => item + 1)
                              .map((count) => <option key={count} value={count}>{count}</option>)}
                          </select>
                        </label>

                        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-[11px] font-medium text-slate-400">Giá thuê mỗi ngày</p>
                            <p className="mt-0.5 whitespace-nowrap text-lg font-black tracking-tight text-[#17336f]">
                              {currency.format(product.price)}
                              <span className="ml-1 text-xs font-semibold text-slate-500">/ngày</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => reserve(product)}
                            disabled={busyProductId === product.id || !canBook}
                           className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-[#17336f] px-3 py-2 text-xs font-extrabold text-white shadow-[0_7px_16px_-9px_rgba(23,51,111,0.9)] transition duration-150 hover:-translate-y-0.5 hover:from-blue-800 hover:to-[#102556] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                          >
                           {busyProductId === product.id
                             ? <><CircleNotch size={16} className="animate-spin" /> Đang đặt...</>
                             : !canBook ? "Hết xe" : "Đặt xe"}
                            {busyProductId !== product.id && canBook && <ArrowRight size={15} weight="bold" />}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }

                if (type === "experience") {
                  const experienceDetails = product.details || {};
                  const includedItems = experienceDetails.includes || [];

                  return (
                    <article
                      key={product.id}
                      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_10px_28px_-18px_rgba(20,54,110,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-20px_rgba(20,54,110,0.35)]"
                    >
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 via-sky-100 to-teal-100">
                        <img
                          src={imageUrl}
                          alt={`Ảnh minh họa ${product.name}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#081d44]/85 via-transparent to-slate-950/10" />
                        <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold text-white shadow-md ${
                          rating >= 4.7 ? "bg-emerald-500/95" : "bg-amber-400/95 text-amber-950"
                        }`}>
                          {rating >= 4.7 ? <CheckCircle size={14} weight="fill" /> : <Flame size={14} weight="fill" />}
                          {rating >= 4.7 ? "Được yêu thích" : "Bán chạy"}
                        </span>
                        <button
                          type="button"
                          aria-label={favorites.includes(product.id) ? "Bỏ yêu thích" : "Thêm yêu thích"}
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/95 text-slate-500 shadow-sm transition hover:scale-105 hover:text-rose-500"
                        >
                          <Heart size={18} weight={favorites.includes(product.id) ? "fill" : "regular"} className={favorites.includes(product.id) ? "text-rose-500" : ""} />
                        </button>
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white drop-shadow">
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-bold">
                            <MapPinLine size={15} weight="fill" className="shrink-0" />
                            <span className="truncate">{product.city}</span>
                          </span>
                          {rating > 0 && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-amber-700 shadow-sm">
                              <Star size={13} weight="fill" /> {rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 min-h-12 flex-1 text-base font-black leading-snug tracking-tight text-[#17294f]">
                            {product.name}
                          </h3>
                        </div>

                        <p className="mb-3 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
                          <MapPinLine size={15} className="shrink-0 text-slate-400" />
                          <span className="truncate">{product.location || product.city}</span>
                        </p>

                        <div className="mb-3 flex min-h-7 flex-wrap items-center gap-1.5">
                          {experienceDetails.duration && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-slate-700">
                              <Clock size={13} className="text-blue-700" /> {experienceDetails.duration}
                            </span>
                          )}
                          {includedItems.slice(0, 2).map((item) => (
                            <span key={item} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-slate-700">
                              <Ticket size={13} className="text-blue-700" /> {item}
                            </span>
                          ))}
                        </div>

                        <div className={`mb-3 flex items-center gap-2 text-[11px] font-bold ${
                          isAvailable ? "text-emerald-700" : "text-rose-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {isAvailable ? `Còn ${product.available_units ?? product.inventory_count} chỗ` : "Đã hết chỗ"}
                          <span className="text-slate-400">· theo catalog</span>
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-[11px] font-medium text-slate-400">Giá mỗi khách</p>
                            <p className="mt-0.5 whitespace-nowrap text-lg font-black tracking-tight text-[#17336f]">
                              {currency.format(product.price)}
                              <span className="ml-1 text-xs font-semibold text-slate-500">/{product.price_unit}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => reserve(product)}
                            disabled={busyProductId === product.id || !canBook}
                           className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-[#17336f] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_7px_16px_-9px_rgba(23,51,111,0.9)] transition duration-150 hover:-translate-y-0.5 hover:from-blue-800 hover:to-[#102556] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                          >
                           {busyProductId === product.id
                             ? <><CircleNotch size={16} className="animate-spin" /> Đang đặt...</>
                             : !canBook ? "Hết chỗ" : "Đặt tour"}
                            {busyProductId !== product.id && canBook && <ArrowRight size={15} weight="bold" />}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    key={product.id}
                    className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_10px_28px_-18px_rgba(20,54,110,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-20px_rgba(20,54,110,0.35)]"
                  >
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-sky-200">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Ảnh minh họa ${product.name}`}
                          loading="lazy"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#081d44]/75 via-transparent to-slate-950/10" />
                      <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-[#18336c] shadow-sm backdrop-blur">
                        {badge}
                      </span>
                      <button
                        type="button"
                        aria-label={favorites.includes(product.id) ? "Bỏ yêu thích" : "Thêm yêu thích"}
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/95 text-slate-500 shadow-sm transition hover:scale-105 hover:text-rose-500"
                      >
                        <Heart size={18} weight={favorites.includes(product.id) ? "fill" : "regular"} className={favorites.includes(product.id) ? "text-rose-500" : ""} />
                      </button>
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white drop-shadow">
                        <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold">
                          <MapPinLine size={15} weight="fill" className="shrink-0" />
                          <span className="truncate">{product.city}</span>
                        </div>
                        {rating > 0 && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-extrabold text-amber-700 shadow-sm">
                            <Star size={13} weight="fill" /> {rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="min-h-12 flex-1 text-base font-black leading-snug tracking-tight text-[#17294f]">
                          {product.name}
                        </h3>
                      </div>

                      <p className="mb-3 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
                        <MapPinLine size={15} className="shrink-0 text-slate-400" />
                        <span className="truncate">{product.location || product.city}</span>
                      </p>
                      <p className="mb-3 line-clamp-2 min-h-9 text-xs leading-relaxed text-slate-600">
                        {product.description}
                      </p>

                      {amenities.length > 0 && (
                        <div className="mb-3 flex min-h-7 flex-wrap items-center gap-1.5">
                          {amenities.slice(0, 3).map((amenity) => {
                            const AmenityIcon = amenityIcons[amenity] || CheckCircle;
                            return (
                              <span key={amenity} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-slate-600">
                                <AmenityIcon size={14} className="text-slate-400" /> {amenity}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className={`mb-3 flex items-center gap-2 text-[11px] font-bold ${
                        isAvailable ? "text-emerald-700" : "text-rose-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {type === "experience" ? "Còn chỗ" : type === "hotel" ? "Còn phòng" : "Còn xe"}: {product.available_units ?? product.inventory_count}
                        {type === "experience" ? "" : type === "hotel" ? " phòng" : " xe"}
                        <span className="ml-auto font-medium text-slate-400">theo catalog</span>
                      </div>

                      {type !== "experience" && (
                        <label style={{ display: "flex" }} className="mb-3 w-full items-center justify-between text-xs font-semibold text-slate-600">
                          Số {type === "hotel" ? "phòng" : "xe"}
                          <select
                            value={quantity}
                            onChange={(event) => setQuantities((previous) => ({
                              ...previous,
                              [product.id]: Number(event.target.value),
                            }))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          >
                            {Array.from({ length: Math.max(1, Math.min(10, product.available_units || 1)) }, (_, item) => item + 1)
                              .map((count) => <option key={count} value={count}>{count}</option>)}
                          </select>
                        </label>
                      )}

                      <div className="mt-auto border-t border-slate-100 pt-3">
                        <div className="mb-3 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-medium text-slate-400">Giá từ</p>
                            <p className="mt-0.5 text-lg font-black tracking-tight text-[#17336f]">
                              {currency.format(product.price)}
                              <span className="ml-1 text-xs font-semibold text-slate-500">/{product.price_unit}</span>
                            </p>
                          </div>
                          <span className="pb-1 text-[10px] font-medium text-slate-400">
                            {formatDate(startDate)}{effectiveEndDate ? ` – ${formatDate(effectiveEndDate)}` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => reserve(product)}
                          disabled={busyProductId === product.id || !canBook}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#172f68] px-4 py-3 text-sm font-extrabold text-white shadow-[0_6px_14px_-7px_rgba(23,47,104,0.8)] transition duration-150 hover:bg-[#102556] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                        >
                          {busyProductId === product.id
                            ? <><CircleNotch size={16} className="animate-spin" /> Đang đặt...</>
                            : !isAvailable
                              ? "Hết chỗ"
                              : type === "hotel"
                                ? "Đặt phòng"
                                : type === "car"
                                  ? "Đặt xe"
                                  : "Đặt trải nghiệm"}
                          {busyProductId !== product.id && isAvailable && <ArrowRight size={16} weight="bold" />}
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
