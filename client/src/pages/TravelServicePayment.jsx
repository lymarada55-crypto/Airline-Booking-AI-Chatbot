import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarBlank,
  CarProfile,
  CheckCircle,
  Clock,
  CreditCard,
  EnvelopeSimple,
  ForkKnife,
  GearSix,
  Headset,
  House,
  Lightbulb,
  LockKey,
  MapPinLine,
  PencilSimple,
  Phone,
  Printer,
  ShieldCheck,
  Snowflake,
  Star,
  SuitcaseRolling,
  SwimmingPool,
  Tag,
  Ticket,
  User,
  UsersThree,
  WifiHigh,
  XCircle,
} from "@phosphor-icons/react";
import api from "../api";
import Navbar from "../components/Navbar";
import { getCanonicalTravelProductImage } from "../utils/travelServiceImages";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatDate = (date) => {
  if (!date) return "—";
  const parsedDate = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};

const fallbackProductImages = {
  car: [
    "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1000&q=85",
  ],
  hotel: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85",
  ],
  experience: [
    "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
  ],
};

function getProductDisplayImage(product) {
  if (!product) return fallbackProductImages.car[0];
  return getCanonicalTravelProductImage(product, product.type || "hotel", 1000);
}

function getDiffDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const s = new Date(`${String(startDate).slice(0, 10)}T00:00:00`);
  const e = new Date(`${String(endDate).slice(0, 10)}T00:00:00`);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

export default function TravelServicePayment() {
  const { reservationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const isPaidView = paid || searchParams.get("preview_paid") === "1";

  const canPay = reservation?.status !== "cancelled";
  const productType = reservation?.product?.type || "car";
  const isHotel = productType === "hotel";
  const isExperience = productType === "experience";
  const isCar = productType === "car";
  const serviceLabel = isExperience
    ? "trải nghiệm"
    : isCar
      ? "thuê xe"
      : "phòng";
  const guestLabel = isExperience
    ? "Thông tin khách liên hệ"
    : isCar
      ? "Thông tin người thuê"
      : "Thông tin khách lưu trú";

  useEffect(() => {
    let active = true;
    api
      .get(`/travel-service-reservations/${reservationId}`)
      .then(({ data }) => {
        if (!active) return;
        const loadedReservation = data.data;
        if (
          !["hotel", "experience", "car"].includes(
            loadedReservation.product?.type
          )
        ) {
          navigate("/my-travel-services", { replace: true });
          return;
        }
        setReservation(loadedReservation);
        if (loadedReservation.payment_status === "paid") {
          setPaid(true);
          setTransactionId(
            loadedReservation.payments?.[0]?.transaction_id || ""
          );
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Không tìm thấy đơn đặt dịch vụ này."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reservationId, navigate]);

  const pay = async () => {
    if (!reservation || paying) return;
    setPaying(true);
    setError("");
    try {
      const backendMethod = paymentMethod === "card" ? "vnpay" : paymentMethod;
      const { data } = await api.post(
        `/travel-service-reservations/${reservation.id}/pay`,
        {
          payment_method: backendMethod,
        }
      );
      setReservation(data.data);
      setPaid(true);
      setTransactionId(data.data.payments?.[0]?.transaction_id || "");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          Object.values(requestError.response?.data?.errors || {}).flat()[0] ||
          "Không thể xử lý thanh toán. Vui lòng thử lại."
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-white p-6 text-sm font-semibold text-slate-500">
        Đang tải thông tin thanh toán dịch vụ...
      </main>
    );
  }

  if (!reservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-white px-4 py-10">
        <section className="w-full max-w-xl rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-xl shadow-blue-900/10 backdrop-blur">
          <XCircle size={36} className="mx-auto text-rose-600" />
          <h1 className="mt-3 text-xl font-black text-slate-900">
            Không tải được đơn đặt dịch vụ
          </h1>
          <p role="alert" className="mt-2 text-sm text-slate-600">
            {error}
          </p>
          <Link
            to="/my-travel-services"
            className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
            style={{ textDecoration: "none" }}
          >
            Về dịch vụ đã đặt
          </Link>
        </section>
      </main>
    );
  }

  const product = reservation.product || {};
  const details = product.details || {};
  const unitPrice = Number(reservation.unit_price || product.price || 0);
  const totalPrice = Number(reservation.total_price || 0);
  const quantity = Number(reservation.quantity || 1);
  const guestCount = Number(reservation.guest_count || 1);
  const durationDays = getDiffDays(
    reservation.start_date,
    reservation.end_date
  );
  const rating = Number(product.rating || 4.8).toFixed(1);
  const displayImage = getProductDisplayImage(product);
  const priceUnit =
    product.price_unit || (isCar ? "ngày" : isHotel ? "đêm" : "người");
  const summaryMultiplierText = isExperience
    ? `${guestCount} khách`
    : `${durationDays} ${isCar ? "ngày" : "đêm"} × ${quantity} ${isCar ? "xe" : "phòng"}`;

  const ServiceIcon = isCar
    ? CarProfile
    : isHotel
      ? SuitcaseRolling
      : Ticket;

  return (
    <main
      className="relative min-h-screen overflow-hidden pb-14 text-slate-900"
      style={{
        paddingTop: 84,
        background:
          "linear-gradient(180deg, #d7ebff 0%, #eef6ff 45%, #e1eeff 100%)",
      }}
    >
      <Navbar />

      {/* HERO BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: 285 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 22% 28% at 10% 35%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.45) 55%, transparent 100%), radial-gradient(ellipse 26% 24% at 32% 80%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 55%, transparent 100%), linear-gradient(105deg, #c5dfff 0%, #dceeff 45%, #b5d5fc 100%)",
          }}
        />
        <img
          src={
            isCar && !isPaidView
              ? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85"
              : "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg"
          }
          alt=""
          className="hidden md:block"
          style={{
            position: "absolute",
            right: 0,
            top: isCar && !isPaidView ? 0 : 20,
            width: "56%",
            height: isCar && !isPaidView ? 285 : 260,
            objectFit: "cover",
            objectPosition: "center",
            maskImage:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.5) 18%, black 36%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.5) 18%, black 36%, black 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-7 lg:px-10">
        {/* Back Link Pill */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Link
            to={isPaidView ? "/" : `/travel/${productType}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-blue-800 shadow-sm backdrop-blur transition hover:bg-white sm:text-sm"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={16} weight="bold" />{" "}
            {isPaidView
              ? "Quay lại trang chủ"
              : `Quay lại dịch vụ ${serviceLabel}`}
          </Link>
          {!isPaidView && (
            <Link
              to="/my-travel-services"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/75 px-3.5 py-1.5 text-xs font-bold text-[#35507c] shadow-2xs backdrop-blur transition hover:bg-white"
              style={{ textDecoration: "none" }}
            >
              Dịch vụ đã đặt
            </Link>
          )}
        </div>

        {/* Hero Heading */}
        <header className="mb-3 max-w-2xl" style={{ minHeight: 68 }}>
          {!isPaidView && (
            <p
              className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700"
              style={{ margin: "0 0 4px 0" }}
            >
              SKYLINK TRAVEL
            </p>
          )}
          <h1
            className="text-3xl font-black tracking-tight text-[#0b2b66] sm:text-4xl"
            style={{ margin: 0 }}
          >
            Thanh toán đặt {serviceLabel}
          </h1>
          <p
            className="mt-1 text-sm font-medium text-[#3b5582]"
            style={{ margin: "4px 0 0 0" }}
          >
            {isPaidView
              ? "Cảm ơn bạn đã tin tưởng SkyLink Travel."
              : "Vui lòng kiểm tra thông tin và chọn phương thức thanh toán phù hợp."}
          </p>
        </header>

        {/* TOP SUMMARY BAR (SHOWN BEFORE PAYMENT) */}
        {!isPaidView && (
          <section
            aria-label="Tóm tắt lịch trình đặt dịch vụ"
            className="mb-4 grid items-center gap-4 border border-white bg-white/95 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4"
            style={{
              borderRadius: 22,
              padding: "11px 20px",
              boxShadow: "0 12px 32px rgba(38, 84, 160, 0.10)",
            }}
          >
            {/* Col 1: Product Icon + Name + Plate/Code */}
            <div className="flex items-center gap-3">
              <div
                className="flex shrink-0 items-center justify-center rounded-full"
                style={{
                  width: 48,
                  height: 48,
                  background:
                    "linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)",
                  color: "#0b5ed7",
                  border: "1px solid #bfdbfe",
                }}
              >
                <ServiceIcon size={24} weight="fill" />
              </div>
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-black text-[#0b2b66]"
                  style={{ margin: 0 }}
                >
                  {product.name}
                </p>
                <p
                  className="mt-0.5 text-xs font-medium text-[#526b90]"
                  style={{ margin: "2px 0 0 0" }}
                >
                  {isCar
                    ? `Mã xe: ${reservation.reference_code}`
                    : `Mã đặt: ${reservation.reference_code}`}
                </p>
              </div>
            </div>

            {/* Col 2: Ngày nhận / Nhận phòng */}
            <div className="flex items-start gap-2.5 lg:border-l lg:border-blue-100 lg:pl-5">
              <CalendarBlank
                size={22}
                weight="fill"
                className="mt-0.5 shrink-0 text-blue-600"
              />
              <div>
                <p
                  className="text-xs font-semibold text-[#526b90]"
                  style={{ margin: 0 }}
                >
                  {isCar
                    ? "Ngày nhận"
                    : isHotel
                      ? "Nhận phòng"
                      : "Ngày trải nghiệm"}
                </p>
                <p
                  className="text-sm font-black text-[#0b2b66]"
                  style={{ margin: "2px 0 0 0" }}
                >
                  {formatDate(reservation.start_date)} 08:00
                </p>
                <p
                  className="text-xs font-medium text-[#526b90]"
                  style={{ margin: "1px 0 0 0" }}
                >
                  ({product.location || product.city || "Trung tâm"})
                </p>
              </div>
            </div>

            {/* Col 3: Ngày trả / Trả phòng */}
            <div className="flex items-start gap-2.5 lg:border-l lg:border-blue-100 lg:pl-5">
              <CalendarBlank
                size={22}
                weight="fill"
                className="mt-0.5 shrink-0 text-blue-600"
              />
              <div>
                <p
                  className="text-xs font-semibold text-[#526b90]"
                  style={{ margin: 0 }}
                >
                  {isCar
                    ? "Ngày trả"
                    : isHotel
                      ? "Trả phòng"
                      : "Ngày kết thúc"}
                </p>
                <p
                  className="text-sm font-black text-[#0b2b66]"
                  style={{ margin: "2px 0 0 0" }}
                >
                  {formatDate(reservation.end_date || reservation.start_date)}{" "}
                  08:00
                </p>
                <p
                  className="text-xs font-medium text-[#526b90]"
                  style={{ margin: "1px 0 0 0" }}
                >
                  ({product.location || product.city || "Trung tâm"})
                </p>
              </div>
            </div>

            {/* Col 4: Số lượng + Thay đổi thông tin */}
            <div className="flex items-center justify-between gap-3 lg:border-l lg:border-blue-100 lg:pl-5">
              <div className="flex items-start gap-2.5">
                <UsersThree
                  size={22}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-blue-600"
                />
                <div>
                  <p
                    className="text-xs font-semibold text-[#526b90]"
                    style={{ margin: 0 }}
                  >
                    Số lượng
                  </p>
                  <p
                    className="text-sm font-black text-[#0b2b66]"
                    style={{ margin: "2px 0 0 0" }}
                  >
                    {isExperience
                      ? `${guestCount} khách`
                      : `${quantity} ${isCar ? "xe" : "phòng"}`}
                  </p>
                </div>
              </div>

              <Link
                to={`/travel/${productType}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-[#f4f8ff] px-3.5 py-2 text-xs font-extrabold text-blue-700 shadow-2xs transition hover:border-blue-400 hover:bg-white"
                style={{ textDecoration: "none" }}
              >
                <PencilSimple size={13} weight="fill" />
                Thay đổi thông tin
              </Link>
            </div>
          </section>
        )}

        {isPaidView ? (
          <section
            className="mx-auto border border-white bg-white/95 backdrop-blur-xl"
            style={{
              maxWidth: 1080,
              borderRadius: 30,
              padding: "24px 30px 22px 30px",
              boxShadow: "0 20px 55px rgba(31, 74, 148, 0.14)",
            }}
          >
            {/* Top Centered Green Check Badge & Confetti Rays */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                {/* Festive Confetti SVG Rays */}
                <svg
                  viewBox="0 0 180 64"
                  fill="none"
                  aria-hidden="true"
                  style={{ width: 170, height: 60 }}
                >
                  {/* Left Confetti */}
                  <line
                    x1="28"
                    y1="26"
                    x2="38"
                    y2="30"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="44"
                    y1="14"
                    x2="50"
                    y2="22"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="34" cy="42" r="2.5" fill="#f59e0b" />
                  {/* Right Confetti */}
                  <line
                    x1="152"
                    y1="26"
                    x2="142"
                    y2="30"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="136"
                    y1="14"
                    x2="130"
                    y2="22"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="146" cy="42" r="2.5" fill="#10b981" />
                  {/* Center Glowing Green Circle */}
                  <circle
                    cx="90"
                    cy="32"
                    r="28"
                    fill="#d1fae5"
                    fillOpacity="0.65"
                  />
                  <circle cx="90" cy="32" r="21" fill="#10b981" />
                  <path
                    d="M81 32.5L87 38.5L100 25.5"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2
                className="text-2xl font-black tracking-tight text-[#0b2b66] sm:text-3xl"
                style={{ margin: "2px 0 0 0" }}
              >
                Thanh toán thành công!
              </h2>
              <p
                className="text-xs font-medium text-[#4e678c] sm:text-sm"
                style={{ margin: "4px 0 0 0" }}
              >
                Cảm ơn bạn! Đơn đặt {serviceLabel} của bạn đã được xác nhận.
              </p>

              {/* Mint Green Booking Reference Pill */}
              <div
                className="inline-flex items-center gap-2 rounded-full text-xs font-extrabold sm:text-sm"
                style={{
                  marginTop: 10,
                  background: "#dcfce7",
                  color: "#14532d",
                  border: "1px solid #bbf7d0",
                  padding: "6px 18px",
                }}
              >
                <CheckCircle
                  size={17}
                  weight="fill"
                  style={{ color: "#16a34a" }}
                />
                <span>
                  Mã đặt chỗ:{" "}
                  <strong className="font-mono font-black">
                    SRV-{reservation.reference_code}
                  </strong>
                </span>
              </div>
            </div>

            {/* 3-Column Middle Receipt Grid */}
            <div
              className="grid items-stretch gap-5 lg:grid-cols-3"
              style={{ marginTop: 18 }}
            >
              {/* Col 1: Product Photo with Top-Left Service Badge */}
              <div
                className="relative overflow-hidden bg-blue-50"
                style={{
                  height: 188,
                  borderRadius: 20,
                  boxShadow: "0 10px 26px rgba(31, 74, 148, 0.12)",
                }}
              >
                <img
                  src={displayImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <span
                  className="inline-flex items-center gap-1.5 rounded-full text-xs font-extrabold text-white shadow-sm"
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    background: "#1d78f0",
                    padding: "4px 12px",
                    border: "1px solid rgba(255,255,255,0.5)",
                  }}
                >
                  <ServiceIcon size={13} weight="fill" />
                  {isCar ? "Thuê xe" : isHotel ? "Khách sạn" : "Trải nghiệm"}
                </span>
              </div>

              {/* Col 2: Product Name, Rating, and Schedule Details */}
              <div className="flex flex-col justify-center">
                <h3
                  className="text-xl font-black text-[#0b2b66]"
                  style={{ margin: 0 }}
                >
                  {product.name}
                </h3>

                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{ marginTop: 5 }}
                >
                  <Star
                    size={15}
                    weight="fill"
                    style={{ color: "#f59e0b" }}
                  />
                  <span className="font-black" style={{ color: "#d97706" }}>
                    {rating}
                  </span>
                  <span className="font-medium" style={{ color: "#64748b" }}>
                    (1.2k đánh giá)
                  </span>
                </div>

                <div className="space-y-2 text-xs" style={{ marginTop: 12 }}>
                  <div className="flex items-center gap-2.5 text-[#3b5582]">
                    <MapPinLine
                      size={16}
                      weight="fill"
                      className="shrink-0 text-blue-600"
                    />
                    <span>
                      {isCar ? "Địa điểm nhận:" : "Địa điểm:"}{" "}
                      <strong className="font-extrabold text-[#0b2b66]">
                        {product.city || "Hà Nội"}
                      </strong>
                    </span>
                  </div>

                  {isCar && (
                    <div className="flex items-center gap-2.5 text-[#3b5582]">
                      <MapPinLine
                        size={16}
                        weight="fill"
                        className="shrink-0 text-blue-600"
                      />
                      <span>
                        Địa điểm trả:{" "}
                        <strong className="font-extrabold text-[#0b2b66]">
                          {product.city || "Hà Nội"}
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 text-[#3b5582]">
                    <CalendarBlank
                      size={16}
                      weight="fill"
                      className="shrink-0 text-blue-600"
                    />
                    <span>
                      {isCar
                        ? "Ngày nhận:"
                        : isHotel
                          ? "Nhận phòng:"
                          : "Ngày trải nghiệm:"}{" "}
                      <strong className="font-extrabold text-[#0b2b66]">
                        {formatDate(reservation.start_date)} 08:00
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[#3b5582]">
                    <CalendarBlank
                      size={16}
                      weight="fill"
                      className="shrink-0 text-blue-600"
                    />
                    <span>
                      {isCar
                        ? "Ngày trả:"
                        : isHotel
                          ? "Trả phòng:"
                          : "Ngày kết thúc:"}{" "}
                      <strong className="font-extrabold text-[#0b2b66]">
                        {formatDate(
                          reservation.end_date || reservation.start_date
                        )}{" "}
                        08:00
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[#3b5582]">
                    <ServiceIcon
                      size={16}
                      weight="fill"
                      className="shrink-0 text-blue-600"
                    />
                    <span>
                      Số lượng:{" "}
                      <strong className="font-extrabold text-[#0b2b66]">
                        {isExperience
                          ? `${guestCount} khách`
                          : `${quantity} ${isCar ? "xe" : "phòng"}`}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Col 3: Thông tin thanh toán Card */}
              <div
                className="flex flex-col justify-between"
                style={{
                  borderRadius: 20,
                  background: "#f3f8ff",
                  border: "1px solid #dbeafe",
                  padding: "16px 18px",
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard
                      size={19}
                      weight="fill"
                      className="text-blue-600"
                    />
                    <h4
                      className="text-sm font-black text-[#0b2b66]"
                      style={{ margin: 0 }}
                    >
                      Thông tin thanh toán
                    </h4>
                  </div>

                  {/* Amount & Paid Badge */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-2"
                    style={{ marginTop: 10 }}
                  >
                    <strong
                      className="font-black"
                      style={{ color: "#0b4fd0", fontSize: 22 }}
                    >
                      {currency.format(totalPrice)}
                    </strong>
                    <span
                      className="inline-flex items-center gap-1 rounded-full text-xs font-extrabold"
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        border: "1px solid #bbf7d0",
                        padding: "3px 10px",
                      }}
                    >
                      Đã thanh toán <CheckCircle size={13} weight="fill" />
                    </span>
                  </div>

                  {/* Gateway Brand Row */}
                  <div
                    className="flex items-center gap-2 text-xs font-bold text-[#0b2b66]"
                    style={{ marginTop: 10 }}
                  >
                    <span
                      className="inline-flex items-center rounded-md border border-blue-100 bg-white px-2 py-0.5 text-[10px] font-black shadow-2xs"
                    >
                      {paymentMethod === "momo" ? (
                        <span style={{ color: "#a50064" }}>MoMo</span>
                      ) : (
                        <>
                          <span style={{ color: "#e11d48" }}>VN</span>
                          <span style={{ color: "#0284c7" }}>PAY</span>
                        </>
                      )}
                    </span>
                    <span>
                      {paymentMethod === "momo"
                        ? "Thanh toán qua Ví MoMo"
                        : "Thanh toán qua VNPay"}
                    </span>
                  </div>
                </div>

                <div
                  className="space-y-1.5 border-t border-blue-100 text-xs text-[#4e678c]"
                  style={{ marginTop: 10, paddingTop: 10 }}
                >
                  <div className="flex items-center gap-2">
                    <Clock
                      size={14}
                      weight="bold"
                      className="shrink-0 text-blue-600"
                    />
                    <span>
                      Thời gian thanh toán:{" "}
                      <strong className="font-bold text-[#0b2b66]">
                        {formatDate(reservation.start_date)} 14:25
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag
                      size={14}
                      weight="fill"
                      className="shrink-0 text-blue-600"
                    />
                    <span className="truncate">
                      Mã giao dịch:{" "}
                      <strong className="font-mono font-bold text-[#0b2b66]">
                        {transactionId ||
                          `VNPay-${reservation.reference_code}`}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hướng dẫn tiếp theo Banner */}
            <div
              className="relative flex items-center justify-between gap-4 overflow-hidden"
              style={{
                marginTop: 18,
                borderRadius: 18,
                background:
                  "linear-gradient(90deg, #eff6ff 0%, #f8fbff 65%, #e6f0ff 100%)",
                border: "1px solid #dbeafe",
                padding: "12px 20px",
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="flex shrink-0 items-center justify-center rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    background: "#fef3c7",
                    color: "#d97706",
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
                  }}
                >
                  <Lightbulb size={22} weight="fill" />
                </div>
                <div>
                  <h4
                    className="text-sm font-black text-[#0b2b66]"
                    style={{ margin: 0 }}
                  >
                    Hướng dẫn tiếp theo
                  </h4>
                  <p
                    className="text-xs font-medium text-[#4e678c]"
                    style={{ margin: "2px 0 0 0" }}
                  >
                    {isCar
                      ? "Vui lòng mang theo CCCD/Bằng lái xe và Mã đặt chỗ khi nhận xe tại điểm nhận."
                      : isHotel
                        ? "Vui lòng xuất trình CCCD/Hộ chiếu và Mã đặt chỗ tại quầy lễ tân khi nhận phòng."
                        : "Vui lòng xuất trình Mã đặt chỗ cho hướng dẫn viên tại điểm tập trung trước 15 phút."}
                  </p>
                </div>
              </div>

              {/* Vector Car Keys & Skyline Graphic on Right */}
              <svg
                viewBox="0 0 140 48"
                fill="none"
                aria-hidden="true"
                className="hidden sm:block shrink-0"
                style={{ width: 130, height: 44 }}
              >
                <rect
                  x="10"
                  y="24"
                  width="8"
                  height="20"
                  fill="#93c5fd"
                  fillOpacity="0.4"
                />
                <rect
                  x="21"
                  y="16"
                  width="10"
                  height="28"
                  fill="#93c5fd"
                  fillOpacity="0.5"
                />
                <rect
                  x="34"
                  y="10"
                  width="11"
                  height="34"
                  fill="#93c5fd"
                  fillOpacity="0.45"
                />
                <rect
                  x="48"
                  y="20"
                  width="9"
                  height="24"
                  fill="#93c5fd"
                  fillOpacity="0.4"
                />
                {/* Key Ring & Fob */}
                <circle
                  cx="88"
                  cy="16"
                  r="7"
                  stroke="#3b82f6"
                  strokeWidth="2.2"
                />
                <rect
                  x="68"
                  y="22"
                  width="16"
                  height="22"
                  rx="5"
                  transform="rotate(-25 68 22)"
                  fill="#1e3a8a"
                />
                <rect
                  x="92"
                  y="20"
                  width="15"
                  height="22"
                  rx="5"
                  transform="rotate(20 92 20)"
                  fill="#2563eb"
                />
              </svg>
            </div>

            {/* Bottom 3 Centered Action Pill Buttons */}
            <div
              className="flex flex-wrap items-center justify-center gap-3.5"
              style={{ marginTop: 18 }}
            >
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2.5 text-xs font-extrabold text-[#12469e] shadow-2xs transition hover:border-blue-400 hover:bg-blue-50/40 sm:text-sm"
                style={{ cursor: "pointer" }}
              >
                <Printer size={17} weight="fill" className="text-blue-600" />
                In phiếu xác nhận
              </button>

              <Link
                to="/my-travel-services"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5 sm:text-sm"
                style={{
                  background:
                    "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                  boxShadow: "0 8px 20px rgba(13, 94, 215, 0.30)",
                  textDecoration: "none",
                  color: "#ffffff",
                }}
              >
                <CalendarBlank size={17} weight="fill" />
                Xem dịch vụ đã đặt
              </Link>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2.5 text-xs font-extrabold text-[#12469e] shadow-2xs transition hover:border-blue-400 hover:bg-blue-50/40 sm:text-sm"
                style={{ textDecoration: "none" }}
              >
                <House size={17} weight="fill" className="text-blue-600" />
                Về trang chủ
              </Link>
            </div>
          </section>
        ) : !canPay ? (
          <section className="mx-auto max-w-3xl rounded-3xl border border-white/80 bg-white/95 p-7 text-center shadow-xl shadow-blue-900/10 backdrop-blur sm:p-9">
            <XCircle size={38} className="mx-auto text-rose-600" />
            <h2 className="mt-4 text-2xl font-black text-slate-900">
              Đơn đặt {serviceLabel} đã bị hủy
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Không thể tiếp tục thanh toán cho đơn này.
            </p>
            <Link
              to="/my-travel-services"
              className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
              style={{ textDecoration: "none" }}
            >
              Về dịch vụ đã đặt
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            {/* LEFT COL: THÔNG TIN ĐẶT DỊCH VỤ & NGƯỜI ĐẶT */}
            <div>
              <section
                className="overflow-hidden border border-white bg-white/95 backdrop-blur-xl"
                style={{
                  borderRadius: 26,
                  padding: "18px 22px",
                  boxShadow: "0 16px 42px rgba(38, 84, 160, 0.11)",
                }}
              >
                {/* Section Title */}
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex shrink-0 items-center justify-center rounded-full"
                    style={{
                      width: 38,
                      height: 38,
                      background: "#dbeafe",
                      color: "#0b5ed7",
                    }}
                  >
                    <ServiceIcon size={20} weight="fill" />
                  </div>
                  <h2
                    className="text-lg font-black text-[#0b2b66] sm:text-xl"
                    style={{ margin: 0 }}
                  >
                    Thông tin đặt {serviceLabel}
                  </h2>
                </div>

                {/* 2-Column Product Photo + Price Breakdown */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Product Photo */}
                  <div>
                    <div
                      className="overflow-hidden bg-blue-50"
                      style={{
                        height: 185,
                        borderRadius: 16,
                        boxShadow: "0 8px 20px rgba(31, 74, 148, 0.10)",
                      }}
                    >
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Specs & Breakdown Box */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3
                        className="text-xl font-black text-[#0b2b66]"
                        style={{ margin: 0 }}
                      >
                        {product.name}
                      </h3>

                      {/* Rating Row */}
                      <div
                        className="mt-1.5 flex items-center gap-1.5 text-xs"
                        style={{ marginTop: 6 }}
                      >
                        <Star
                          size={15}
                          weight="fill"
                          style={{ color: "#f59e0b" }}
                        />
                        <span
                          className="font-black"
                          style={{ color: "#d97706" }}
                        >
                          {rating}
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "#64748b" }}
                        >
                          (1.2k đánh giá)
                        </span>
                      </div>

                      {/* 3 Spec Pills */}
                      <div
                        className="flex flex-wrap items-center gap-2"
                        style={{ marginTop: 10 }}
                      >
                        {isCar ? (
                          <>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <User
                                size={13}
                                weight="fill"
                                style={{ color: "#2563eb" }}
                              />
                              {details.seats || product.max_guests || 5} chỗ
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <GearSix
                                size={13}
                                weight="fill"
                                style={{ color: "#2563eb" }}
                              />
                              {details.transmission || "Tự động"}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <Snowflake
                                size={13}
                                weight="bold"
                                style={{ color: "#2563eb" }}
                              />
                              Máy lạnh
                            </span>
                          </>
                        ) : isHotel ? (
                          <>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <WifiHigh
                                size={13}
                                weight="bold"
                                style={{ color: "#2563eb" }}
                              />
                              Wi-Fi
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <SwimmingPool
                                size={13}
                                weight="fill"
                                style={{ color: "#2563eb" }}
                              />
                              Hồ bơi
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <ForkKnife
                                size={13}
                                weight="fill"
                                style={{ color: "#2563eb" }}
                              />
                              Bữa sáng
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <Clock
                                size={13}
                                weight="bold"
                                style={{ color: "#2563eb" }}
                              />
                              {details.duration || "4 giờ"}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <ForkKnife
                                size={13}
                                weight="fill"
                                style={{ color: "#2563eb" }}
                              />
                              Hướng dẫn viên
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#eef5ff",
                                color: "#1e3a6e",
                                padding: "5px 10px",
                              }}
                            >
                              <Ticket
                                size={13}
                                weight="fill"
                                style={{ color: "#2563eb" }}
                              />
                              Vé tham quan
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price Breakdown Sub-card */}
                    <div
                      style={{
                        marginTop: 12,
                        borderRadius: 16,
                        background: "#f3f8ff",
                        border: "1px solid #dbeafe",
                        padding: "12px 14px",
                      }}
                    >
                      <p
                        className="text-xs font-extrabold text-[#0b2b66]"
                        style={{ margin: "0 0 8px 0" }}
                      >
                        Chi tiết {serviceLabel}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#526b90]">
                          Đơn giá
                        </span>
                        <span>
                          <strong className="font-black text-[#0b2b66]">
                            {currency.format(unitPrice)}
                          </strong>{" "}
                          <span className="text-[#526b90]">/ {priceUnit}</span>
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-between text-xs"
                        style={{ marginTop: 6 }}
                      >
                        <span className="font-medium text-[#526b90]">
                          {isExperience
                            ? "Số lượng khách"
                            : isCar
                              ? "Số ngày thuê"
                              : "Số đêm lưu trú"}
                        </span>
                        <strong className="font-bold text-[#0b2b66]">
                          {isExperience
                            ? `${guestCount} khách`
                            : `${durationDays} ${isCar ? "ngày" : "đêm"}${quantity > 1 ? ` × ${quantity} ${isCar ? "xe" : "phòng"}` : ""}`}
                        </strong>
                      </div>

                      <div
                        className="flex items-center justify-between"
                        style={{
                          marginTop: 10,
                          borderRadius: 12,
                          background: "#e0edff",
                          padding: "8px 12px",
                        }}
                      >
                        <span className="text-xs font-extrabold text-[#0b2b66]">
                          Tổng tiền tạm tính
                        </span>
                        <strong
                          className="font-black"
                          style={{ color: "#0b4fd0", fontSize: 18 }}
                        >
                          {currency.format(totalPrice)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom of Left Card: Thông tin người thuê / lưu trú */}
                <div
                  className="border-t border-blue-100"
                  style={{ marginTop: 20, paddingTop: 16 }}
                >
                  <h3
                    className="flex items-center gap-2 text-base font-black text-[#0b2b66]"
                    style={{ margin: "0 0 12px 0" }}
                  >
                    <User size={18} weight="fill" className="text-blue-600" />
                    {guestLabel}
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p
                        className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#4e678c]"
                        style={{ margin: "0 0 6px 0" }}
                      >
                        <User size={13} weight="bold" /> Họ và tên
                      </p>
                      <div
                        className="truncate text-xs font-bold text-[#0b2b66]"
                        style={{
                          borderRadius: 12,
                          background: "#f4f8ff",
                          border: "1px solid #dce8fa",
                          padding: "10px 14px",
                        }}
                      >
                        {reservation.guest_name || "Nguyễn Văn A"}
                      </div>
                    </div>

                    <div>
                      <p
                        className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#4e678c]"
                        style={{ margin: "0 0 6px 0" }}
                      >
                        <EnvelopeSimple size={13} weight="bold" /> Email liên hệ
                      </p>
                      <div
                        className="flex items-center gap-2 truncate text-xs font-bold text-[#0b2b66]"
                        style={{
                          borderRadius: 12,
                          background: "#f4f8ff",
                          border: "1px solid #dce8fa",
                          padding: "10px 14px",
                        }}
                      >
                        <EnvelopeSimple
                          size={14}
                          className="shrink-0 text-blue-600"
                        />
                        <span className="truncate">
                          {reservation.guest_email || "user@skylink.vn"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p
                        className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#4e678c]"
                        style={{ margin: "0 0 6px 0" }}
                      >
                        <Phone size={13} weight="bold" /> Số điện thoại
                      </p>
                      <div
                        className="flex items-center gap-2 truncate text-xs font-bold text-[#0b2b66]"
                        style={{
                          borderRadius: 12,
                          background: "#f4f8ff",
                          border: "1px solid #dce8fa",
                          padding: "10px 14px",
                        }}
                      >
                        <Phone
                          size={14}
                          weight="fill"
                          className="shrink-0 text-blue-600"
                        />
                        <span className="truncate">
                          {reservation.guest_phone || "+84 90 123 4567"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* PCI DSS & Hotline Strip below Left Card */}
              <div
                className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#1e3a6e]"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    weight="fill"
                    className="text-blue-600"
                  />
                  Thanh toán an toàn và bảo mật theo tiêu chuẩn PCI DSS
                </span>
                <span className="hidden sm:inline text-blue-200">|</span>
                <span className="inline-flex items-center gap-2">
                  <Headset size={18} weight="fill" className="text-blue-600" />
                  Hỗ trợ 24/7:{" "}
                  <strong className="font-black text-[#0b2b66]">
                    1900 1234
                  </strong>
                </span>
              </div>
            </div>

            {/* RIGHT COL: PHƯƠNG THỨC THANH TOÁN & TÓM TẮT */}
            <div>
              <section
                className="overflow-hidden border border-white bg-white/95 backdrop-blur-xl"
                style={{
                  borderRadius: 26,
                  boxShadow: "0 16px 42px rgba(38, 84, 160, 0.12)",
                }}
              >
                {/* Blue Gradient Header */}
                <div
                  className="relative flex items-center gap-3.5 px-5 py-4 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #094eb2 0%, #1d78f0 100%)",
                  }}
                >
                  <div
                    className="flex shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
                    style={{
                      width: 46,
                      height: 46,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <LockKey size={24} weight="fill" />
                  </div>
                  <div className="relative z-10">
                    <h2
                      className="text-lg font-black text-white sm:text-xl"
                      style={{ margin: 0 }}
                    >
                      Phương thức thanh toán
                    </h2>
                    <p
                      className="text-xs leading-relaxed text-blue-100"
                      style={{ margin: "2px 0 0 0" }}
                    >
                      Chọn phương thức để tiếp tục thanh toán riêng cho dịch vụ{" "}
                      {serviceLabel}.
                    </p>
                  </div>
                  <ServiceIcon
                    size={68}
                    weight="duotone"
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-2 opacity-15"
                  />
                </div>

                <div className="p-4 sm:p-5">
                  {/* 3 Payment Method Options */}
                  <div className="space-y-2.5">
                    {[
                      {
                        id: "vnpay",
                        title: "VNPay / Thẻ ATM",
                        description: "Thanh toán bằng VNPay",
                        popular: true,
                      },
                      {
                        id: "momo",
                        title: "Ví MoMo",
                        description: "Thanh toán bằng Ví MoMo",
                        popular: false,
                      },
                      {
                        id: "card",
                        title: "Thẻ tín dụng / Ghi nợ",
                        description: "Visa, Mastercard, JCB...",
                        popular: false,
                      },
                    ].map((method) => {
                      const active = paymentMethod === method.id;
                      return (
                        <label
                          key={method.id}
                          style={{
                            display: "flex",
                            position: "relative",
                            borderRadius: 18,
                            padding: "12px 14px",
                            border: active
                              ? "1.5px solid #2563eb"
                              : "1px solid #dbe7f9",
                            background: active ? "#eff6ff" : "#ffffff",
                            cursor: "pointer",
                          }}
                          className="w-full items-center gap-3.5 transition duration-200 hover:border-blue-300"
                        >
                          <input
                            type="radio"
                            name="payment-method"
                            value={method.id}
                            checked={active}
                            onChange={() => setPaymentMethod(method.id)}
                            className="h-4 w-4 shrink-0 accent-blue-700"
                          />

                          {/* Brand Logo Box */}
                          {method.id === "vnpay" ? (
                            <span
                              className="flex shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white px-2.5 py-2 text-xs font-black shadow-2xs"
                              style={{ minWidth: 64 }}
                            >
                              <span style={{ color: "#e11d48" }}>VN</span>
                              <span style={{ color: "#0284c7" }}>PAY</span>
                            </span>
                          ) : method.id === "momo" ? (
                            <span
                              className="flex shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-2xs"
                              style={{
                                width: 42,
                                height: 38,
                                background: "#a50064",
                                lineHeight: "12px",
                                textAlign: "center",
                                fontSize: 10,
                              }}
                            >
                              momo
                            </span>
                          ) : (
                            <span
                              className="flex shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                              style={{
                                width: 42,
                                height: 38,
                                background:
                                  "linear-gradient(135deg, #0b5ed7 0%, #38bdf8 100%)",
                              }}
                            >
                              <CreditCard size={22} weight="fill" />
                            </span>
                          )}

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-extrabold text-[#0b2b66]">
                              {method.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-[#526b90]">
                              {method.description}
                            </span>
                          </span>

                          {method.popular && (
                            <span
                              className="rounded-full text-[10px] font-extrabold text-white"
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 10,
                                background: "#0b5ed7",
                                padding: "2px 9px",
                              }}
                            >
                              Phổ biến
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Tóm tắt thanh toán Box */}
                  <div
                    style={{
                      marginTop: 16,
                      borderRadius: 18,
                      background: "#f5f9ff",
                      border: "1px solid #dbeafe",
                      padding: "14px 16px",
                    }}
                  >
                    <p
                      className="flex items-center gap-2 text-xs font-black text-[#0b2b66]"
                      style={{ margin: "0 0 10px 0" }}
                    >
                      <Tag size={15} weight="fill" className="text-blue-600" />
                      Tóm tắt thanh toán
                    </p>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-[#4e678c]">
                        {product.name} × {summaryMultiplierText}
                      </span>
                      <strong className="shrink-0 font-bold text-[#0b2b66]">
                        {currency.format(totalPrice)}
                      </strong>
                    </div>

                    <div
                      className="flex items-center justify-between gap-2 text-xs"
                      style={{ marginTop: 6 }}
                    >
                      <span className="font-medium text-[#4e678c]">
                        Phí dịch vụ & thuế (nếu có)
                      </span>
                      <span className="font-semibold text-[#4e678c]">0 ₫</span>
                    </div>

                    {reservation.booking?.pnr_code && (
                      <div
                        className="flex items-center justify-between gap-2 text-xs"
                        style={{ marginTop: 6 }}
                      >
                        <span className="font-medium text-[#4e678c]">
                          Vé máy bay liên kết
                        </span>
                        <strong className="font-mono font-bold text-blue-700">
                          {reservation.booking.pnr_code}
                        </strong>
                      </div>
                    )}

                    <div
                      className="flex items-center justify-between border-t border-blue-100"
                      style={{ marginTop: 10, paddingTop: 10 }}
                    >
                      <span className="text-sm font-black text-[#0b2b66]">
                        Tổng thanh toán
                      </span>
                      <strong
                        className="font-black"
                        style={{ color: "#0b4fd0", fontSize: 20 }}
                      >
                        {currency.format(totalPrice)}
                      </strong>
                    </div>
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                    >
                      {error}
                    </p>
                  )}

                  {/* Solid Blue Pill CTA Button: Thanh toán ngay -> */}
                  <button
                    type="button"
                    onClick={pay}
                    disabled={paying}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                    style={{
                      padding: "13px 20px",
                      borderRadius: 9999,
                      border: "none",
                      cursor: paying ? "wait" : "pointer",
                      background:
                        "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                      boxShadow: "0 10px 24px rgba(13, 94, 215, 0.32)",
                    }}
                  >
                    <LockKey size={18} weight="fill" />
                    {paying ? "Đang xử lý thanh toán..." : "Thanh toán ngay"}
                    {!paying && <ArrowRight size={16} weight="bold" />}
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
