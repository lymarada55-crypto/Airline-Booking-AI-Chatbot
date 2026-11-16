import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AirplaneTilt,
  Bed,
  CaretDown,
  CaretUp,
  CalendarBlank,
  CalendarCheck,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  ForkKnife,
  Info,
  MapPinLine,
  Package,
  UsersThree,
  Ticket,
  WifiHigh,
  SwimmingPool,
  XCircle,
  X,
  LockKey,
} from "@phosphor-icons/react";
import api from "../api";
import { normalizeHotelImageUrl } from "../utils/travelServiceImages";

const statusDetails = {
  pending_payment: {
    label: "Chờ thanh toán",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    Icon: Clock,
  },
  pending_confirmation: {
    label: "Chờ xác nhận",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    Icon: Clock,
  },
  booked: {
    label: "Đã đặt nội bộ",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    Icon: CheckCircle,
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    Icon: CheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    Icon: XCircle,
  },
};

const cityImages = {
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
  "Hội An": ["photo-1505693416388-ac5ce068fe85"],
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

const experienceImages = {
  ocean: ["photo-1500375592092-40eb2168fd21", "photo-1544551763-46a013bb70d5"],
  food: ["photo-1555939594-58d7cb561ad1", "photo-1504674900247-0877df9cc836"],
  heritage: ["photo-1518005020951-eccb494ad742", "photo-1561214115-f2f134cc4912"],
  nature: ["photo-1441974231531-c6227db76b6e", "photo-1433086966358-54859d0ed716"],
  mountain: ["photo-1530789253388-582c481c54b0", "photo-1470770841072-f978cf4d019e"],
  night: ["photo-1519608487953-e999c86e7455"],
  coffee: ["photo-1442512595331-e89e73853f31"],
  activity: ["photo-1558618666-fcd25c85cd64", "photo-1472396961693-142e6e269027"],
};

const getExperienceImageTheme = (product) => {
  const name = product.name?.toLocaleLowerCase("vi") || "";
  const details = product.details || {};

  if (/ẩm thực|nấu|món ăn|món ngon|đặc sản|ăn uống/.test(name)) return "food";
  if (/hoàng hôn|hoa đăng|phố cổ.*đêm|đêm/.test(name)) return "night";
  if (/thuyền|du thuyền|đảo|biển|san hô|lặn|sup|câu mực|bãi sao|an bàng|hòn chồng/.test(name)) return "ocean";
  if (/cà phê|cafe/.test(name)) return "coffee";
  if (/đạp xe|xe đạp|chèo|kayak|safari|máng trượt/.test(name)) return "activity";
  if (/thác|rừng|vườn|nông trại|đồi chè|săn mây|langbiang|bạch mã|pongour/.test(name)) return "nature";
  if (/bà nà|ngũ hành sơn|sơn trà|đèo|núi|cao nguyên/.test(name)) return "mountain";
  if (/bảo tàng|dinh|di tích|văn miếu|hoàng thành|chùa|lăng vua|lăng tẩm|làng gốm|làng mộc|làng hương|nhà tù|kiến trúc|nhà thờ|múa rối/.test(name)) return "heritage";
  return details.duration === "1 ngày" ? "nature" : "activity";
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

const getNights = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(`${String(startDate).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(endDate).slice(0, 10)}T00:00:00`);
  const nights = Math.round((end - start) / 86400000);
  return nights > 0 ? nights : null;
};

const imageForReservation = (reservation) => {
  const product = reservation.product || {};
  if (product.image_url) {
    return product.type === "hotel"
      ? normalizeHotelImageUrl(product.image_url)
      : product.image_url;
  }

  const productId = Number(product.id || reservation.id) || 0;
  let imageId;

  if (product.type === "car") {
    imageId = carImages[productId % carImages.length];
  } else if (product.type === "experience") {
    const images = experienceImages[getExperienceImageTheme(product)];
    imageId = images[productId % images.length];
  } else {
    const images = cityImages[product.city] || cityImages["Hà Nội"];
    imageId = images[(productId - 1) % images.length];
  }

  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=85`;
};

const amenityIcons = {
  "Wi-Fi": WifiHigh,
  "Hồ bơi": SwimmingPool,
  "Bữa sáng": ForkKnife,
};

const fetchReservations = () => api.get("/travel-service-reservations");

export default function MyTravelServices() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
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
    try {
      const { data } = await fetchReservations();
      setReservations(data.data?.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể tải các dịch vụ đã đặt. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations()
      .then(({ data }) => {
        setReservations(data.data?.data || []);
        setError("");
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || "Không thể tải các dịch vụ đã đặt. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, []);

  const cancelReservation = async (id) => {
    setBusyReservationId(id);
    setError("");
    try {
      await api.patch(`/travel-service-reservations/${id}/cancel`);
      await loadReservations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể hủy dịch vụ này. Vui lòng thử lại.");
    } finally {
      setBusyReservationId(null);
    }
  };

  const payReservation = async () => {
    if (!paymentReservation) return;

    setPaying(true);
    setError("");
    try {
      const { data } = await api.post(`/travel-service-reservations/${paymentReservation.id}/pay`, {
        payment_method: paymentMethod,
      });
      setPaymentReservation(null);
      setSuccessMessage(`${data.message} Mã đặt dịch vụ: ${paymentReservation.reference_code}.`);
      await loadReservations();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        Object.values(requestError.response?.data?.errors || {}).flat()[0] ||
        "Không thể thanh toán khách sạn lúc này. Vui lòng thử lại."
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#dff2ff] via-[#f2f8ff] to-[#e9f2ff] px-4 py-5 text-slate-900 sm:px-7 sm:py-7 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[285px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/45 via-blue-100/35 to-transparent" />
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=85"
          alt=""
          className="absolute -right-10 -top-8 h-[285px] w-[75%] object-cover object-center opacity-55 [mask-image:linear-gradient(to_right,transparent,black_32%)]"
        />
        <div className="absolute -left-20 top-10 h-40 w-80 rounded-full bg-white/55 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-48 w-[120%] -rotate-6 rounded-[50%] bg-gradient-to-r from-blue-500/45 via-sky-300/35 to-transparent blur-sm" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-4 py-2 text-xs font-bold text-blue-800 shadow-sm backdrop-blur transition hover:bg-white sm:text-sm"
          >
            <ArrowLeft size={17} weight="bold" /> Trang chủ
          </Link>
          <span className="hidden h-8 w-px bg-blue-300/60 sm:block" />
          <div className="hidden items-center gap-2 text-[#102b63] sm:flex">
            <AirplaneTilt size={29} weight="fill" className="text-blue-700" />
            <span className="text-lg font-black tracking-tight">SkyLink Airlines</span>
          </div>
        </div>

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden h-[72px] w-[72px] shrink-0 items-center justify-center rounded-3xl bg-blue-500/15 text-blue-600 shadow-inner sm:flex">
              <CalendarCheck size={39} weight="fill" />
            </span>
            <div>
              <p className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">SkyLink travel</p>
              <h1 className="text-3xl font-black tracking-tight text-[#10234f] sm:text-4xl lg:text-5xl">Dịch vụ đã đặt</h1>
              <p className="mt-2 text-sm font-medium text-[#49618d] sm:text-base">Theo dõi thông tin và trạng thái các dịch vụ của bạn.</p>
            </div>
          </div>
          {!loading && reservations.length > 0 && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/90 bg-white/85 px-4 py-2.5 text-sm font-extrabold text-blue-800 shadow-sm backdrop-blur">
              <CalendarCheck size={18} weight="fill" className="text-blue-600" />
              {reservations.length} dịch vụ
            </span>
          )}
        </header>

        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/75 px-4 py-3 text-xs leading-relaxed text-blue-950 shadow-sm shadow-blue-900/5 sm:px-5 sm:py-3.5 sm:text-sm">
          <Info size={20} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
          <p>Thanh toán khách sạn, trải nghiệm và thuê xe ở đây là mô phỏng trong đồ án, tách biệt với thanh toán vé; catalog chưa kết nối hoặc xác nhận trực tiếp với nhà cung cấp.</p>
        </div>

        {successMessage && (
          <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button type="button" onClick={loadReservations} className="font-bold underline underline-offset-2">
              Tải lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4" aria-label="Đang tải dịch vụ đã đặt">
            {[1, 2].map((item) => (
              <div key={item} className="flex animate-pulse flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:flex-row">
                <div className="h-48 rounded-2xl bg-slate-200 sm:h-36 sm:w-52" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-6 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="h-10 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error && reservations.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-lg font-extrabold text-[#12264f]">Chưa thể tải danh sách</h2>
            <p className="mt-2 text-sm text-slate-500">Kiểm tra kết nối rồi thử tải lại.</p>
            <button
              type="button"
              onClick={loadReservations}
              className="mt-5 rounded-xl bg-[#172f68] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102556]"
            >
              Tải lại danh sách
            </button>
          </div>
        ) : reservations.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Package size={28} weight="duotone" />
            </div>
            <h2 className="text-lg font-extrabold text-[#12264f]">Bạn chưa có dịch vụ nào</h2>
            <p className="mt-2 text-sm text-slate-500">Tìm khách sạn, trải nghiệm hoặc xe để bắt đầu chuyến đi.</p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172f68] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102556]"
            >
              Khám phá dịch vụ <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {reservations.map((reservation) => {
              const product = reservation.product || {};
              const status = statusDetails[reservation.status] || statusDetails.pending_confirmation;
              const StatusIcon = status.Icon;
              const isExpanded = expandedReservationId === reservation.id;
              const nights = getNights(reservation.start_date, reservation.end_date);
              const canCancel = ["pending_payment", "booked", "pending_confirmation"].includes(reservation.status);
              const isHotel = product.type === "hotel";
              const isExperience = product.type === "experience";
              const isCar = product.type === "car";
              const canPaySeparately = isHotel || isExperience || isCar;
              const isPaid = reservation.payment_status === "paid";
              const amenities = product.details?.amenities || [];

              return (
                <article
                  key={reservation.id}
                  className="overflow-hidden rounded-[26px] border border-white/90 bg-white/90 shadow-[0_12px_34px_-20px_rgba(20,54,110,0.32)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-22px_rgba(20,54,110,0.34)]"
                >
                  <div className="grid gap-4 p-3 sm:grid-cols-[minmax(230px,310px)_minmax(0,1fr)_220px] sm:gap-5 sm:p-3.5">
                    <div className="group/image relative h-52 overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-100 via-indigo-100 to-sky-200 sm:h-[190px]">
                      <img
                        src={imageForReservation(reservation)}
                        alt={`Ảnh minh họa ${product.name || "dịch vụ"}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover/image:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/5" />
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
                        <MapPinLine size={14} weight="fill" />
                        {product.city || "SkyLink"}
                      </span>
                    </div>

                    <div className="min-w-0 py-1 sm:py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-blue-700">
                          {isHotel ? <Bed size={14} weight="fill" /> : isCar ? <Package size={14} weight="fill" /> : <Ticket size={14} weight="fill" />}
                          {isHotel ? "Khách sạn" : isCar ? "Thuê xe" : "Trải nghiệm"}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 ${status.className}`}>
                          <StatusIcon size={15} weight="fill" /> {status.label}
                        </span>
                      </div>

                      <h2 className="mt-2 text-lg font-black leading-snug text-[#102b63] sm:text-xl">
                        {product.name || "Dịch vụ"}
                      </h2>

                      {reservation.booking?.pnr_code && (
                        <Link
                          to="/my-bookings"
                          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-800 transition hover:bg-blue-100"
                        >
                          <Ticket size={14} weight="fill" />
                          Gắn với vé {reservation.booking.pnr_code}
                        </Link>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-2 font-semibold text-slate-700">
                          <MapPinLine size={15} weight="fill" className="text-blue-600" />
                          {product.location || product.city || "Chưa có địa chỉ"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-2 font-semibold text-slate-700">
                          <CalendarBlank size={15} weight="fill" className="text-blue-600" />
                          {formatDate(reservation.start_date)}
                          {reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}
                          {nights ? ` (${nights} đêm)` : ""}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-2 font-semibold text-slate-700">
                          <UsersThree size={15} weight="fill" className="text-blue-600" />
                          {reservation.guest_count} khách
                          {product.type !== "experience" ? ` · ${reservation.quantity} ${product.type === "car" ? "xe" : "phòng"}` : ""}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                        {canPaySeparately && (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${
                            isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {isPaid ? <CheckCircle size={15} weight="fill" /> : <Clock size={15} weight="bold" />}
                            {isPaid ? "Đã thanh toán riêng" : "Chưa thanh toán"}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => copyReference(reservation.reference_code)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700"
                          aria-label={`Sao chép mã đặt chỗ ${reservation.reference_code}`}
                        >
                          Mã đặt: <span className="font-extrabold text-[#102b63]">{reservation.reference_code}</span>
                          <Copy size={13} />
                          {copiedReference === reservation.reference_code && <span className="text-emerald-700">Đã sao chép</span>}
                        </button>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-3 border-t border-blue-100 pt-4 sm:justify-center sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                      <div className="flex items-end justify-between gap-2 sm:block sm:text-right">
                        <p className="text-xs font-medium text-slate-500">Tổng thanh toán</p>
                        <p className="whitespace-nowrap text-xl font-black tracking-tight text-blue-800 sm:mt-0.5 sm:text-2xl">
                          {currency.format(Number(reservation.total_price || 0))}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedReservationId(isExpanded ? null : reservation.id)}
                          aria-expanded={isExpanded}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_7px_18px_-10px_rgba(23,82,190,0.9)] transition hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                        >
                          {isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                          {isExpanded ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                        </button>
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => cancelReservation(reservation.id)}
                            disabled={busyReservationId === reservation.id || isPaid}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                          >
                            {busyReservationId === reservation.id ? null : <X size={15} weight="bold" />}
                            {isPaid ? "Liên hệ hỗ trợ để hủy" : busyReservationId === reservation.id ? "Đang hủy..." : "Hủy đặt chỗ"}
                          </button>
                        )}
                        {canPaySeparately && !isPaid && reservation.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              setError("");
                              if (isHotel || isExperience || isCar) {
                                navigate(`/travel-service-payment/${reservation.id}`);
                              } else {
                                setPaymentReservation(reservation);
                              }
                            }}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                          >
                            <CreditCard size={17} weight="bold" />
                            Thanh toán {isHotel ? "khách sạn" : isExperience ? "trải nghiệm" : "thuê xe"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-extrabold text-[#17294f]">Thông tin dịch vụ</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {product.description || "Chưa có mô tả cho dịch vụ này."}
                          </p>
                          {amenities.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {amenities.map((amenity) => {
                                const AmenityIcon = amenityIcons[amenity] || CheckCircle;
                                return (
                                  <span key={amenity} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                    <AmenityIcon size={14} className="text-slate-400" /> {amenity}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {(isHotel || isExperience || isCar) && reservation.guest_name && (
                            <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                              <h4 className="text-xs font-extrabold text-slate-700">
                                {isHotel ? "Khách lưu trú chính" : isCar ? "Người thuê xe chính" : "Khách liên hệ chính"}
                              </h4>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{reservation.guest_name}</p>
                              <p className="mt-0.5 break-all text-xs text-slate-500">{reservation.guest_email}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{reservation.guest_phone}</p>
                            </div>
                          )}
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <h3 className="text-sm font-extrabold text-[#17294f]">Chi tiết giá</h3>
                          <div className="mt-2 flex justify-between gap-3 text-sm text-slate-600">
                            <span>Đơn giá</span>
                            <span className="font-bold text-slate-800">{currency.format(Number(reservation.unit_price || product.price || 0))}</span>
                          </div>
                          <div className="mt-2 flex justify-between gap-3 border-t border-slate-100 pt-2 text-sm">
                            <span className="font-semibold text-slate-600">Tổng cộng</span>
                            <span className="font-black text-[#17336f]">{currency.format(Number(reservation.total_price || 0))}</span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                        <CheckCircle size={15} className="mt-0.5 shrink-0" />
                        Đây là dịch vụ trong catalog nội bộ SkyLink, chưa được xác nhận trực tiếp với nhà cung cấp.
                      </p>
                      {isHotel && isPaid && reservation.payments?.[0] && (
                        <p className="mt-2 text-xs text-slate-500">
                          Giao dịch mô phỏng: <span className="font-semibold text-slate-700">{reservation.payments[0].transaction_id}</span>
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

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
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Thanh toán riêng</p>
                <h2 id="hotel-payment-title" className="mt-1 text-2xl font-black text-[#17294f]">
                  Thanh toán {
                    paymentReservation.product?.type === "hotel"
                      ? "khách sạn"
                      : paymentReservation.product?.type === "experience"
                        ? "trải nghiệm"
                        : "thuê xe"
                  }
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
              <span className="text-sm font-semibold text-slate-600">Tổng tiền khách sạn</span>
              <strong className="text-lg font-black text-[#17336f]">
                {currency.format(Number(paymentReservation.total_price || 0))}
              </strong>
            </div>

            <fieldset className="mt-5 space-y-3">
              <legend className="mb-3 text-sm font-extrabold text-slate-800">Chọn phương thức</legend>
              {[
                { id: "vnpay", label: "VNPAY / Thẻ ATM", detail: "Mô phỏng giao dịch VNPAY" },
                { id: "momo", label: "Ví MoMo", detail: "Mô phỏng giao dịch MoMo" },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                    paymentMethod === method.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
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

            <p className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              <LockKey size={16} className="mt-0.5 shrink-0" />
              Đây là thanh toán mô phỏng cho đồ án, chưa trừ tiền thật và chưa xác nhận với nhà cung cấp. Thanh toán vé máy bay không bị thay đổi.
            </p>

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
    </main>
  );
}
