import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AirplaneTilt,
  CalendarBlank,
  CheckCircle,
  Clock,
  CreditCard,
  LockKey,
  MapPinLine,
  Tag,
  Ticket,
  UsersThree,
  XCircle,
} from "@phosphor-icons/react";
import api from "../api";
import { normalizeHotelImageUrl } from "../utils/travelServiceImages";

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
    : parsedDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function TravelServicePayment() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const canPay = reservation?.status !== "cancelled";
  const isHotel = reservation?.product?.type === "hotel";
  const isExperience = reservation?.product?.type === "experience";
  const isCar = reservation?.product?.type === "car";
  const serviceLabel = isExperience ? "trải nghiệm" : isCar ? "thuê xe" : "phòng";
  const guestLabel = isExperience ? "Khách liên hệ chính" : isCar ? "Người thuê xe chính" : "Khách lưu trú chính";

  useEffect(() => {
    let active = true;
    api.get(`/travel-service-reservations/${reservationId}`)
      .then(({ data }) => {
        if (!active) return;
        const loadedReservation = data.data;
        if (!["hotel", "experience", "car"].includes(loadedReservation.product?.type)) {
          navigate("/my-travel-services", { replace: true });
          return;
        }
        setReservation(loadedReservation);
        if (loadedReservation.payment_status === "paid") {
          setPaid(true);
          setTransactionId(loadedReservation.payments?.[0]?.transaction_id || "");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || "Không tìm thấy đơn đặt dịch vụ này.");
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
      const { data } = await api.post(`/travel-service-reservations/${reservation.id}/pay`, {
        payment_method: paymentMethod,
      });
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
        Đang tải thông tin đặt phòng...
      </main>
    );
  }

  if (!reservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-white px-4 py-10">
        <section className="w-full max-w-xl rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-xl shadow-blue-900/10 backdrop-blur">
          <XCircle size={36} className="mx-auto text-rose-600" />
          <h1 className="mt-3 text-xl font-black text-slate-900">Không tải được đơn đặt dịch vụ</h1>
          <p role="alert" className="mt-2 text-sm text-slate-600">{error}</p>
          <Link to="/my-travel-services" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white">
            Về dịch vụ đã đặt
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#dff2ff] via-[#f2f8ff] to-[#e9f2ff] px-4 py-5 text-slate-900 sm:px-6 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-28 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute -right-16 top-64 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=85"
          alt=""
          className="absolute -right-12 -top-8 hidden h-[310px] w-[58%] object-cover object-center opacity-55 [mask-image:linear-gradient(to_right,transparent,black_34%)] lg:block"
        />
        <div className="absolute -bottom-36 -left-20 h-72 w-[120%] -rotate-6 rounded-[50%] bg-gradient-to-r from-blue-500/80 via-sky-400/50 to-blue-300/20 blur-sm" />
        <div className="absolute -bottom-48 -left-12 h-72 w-[120%] -rotate-6 rounded-[50%] border-t-[22px] border-white/70" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Link to="/my-travel-services" className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-extrabold text-blue-800 shadow-sm backdrop-blur transition hover:bg-white sm:text-sm">
          <ArrowLeft size={16} weight="bold" /> Quay lại dịch vụ đã đặt
        </Link>

        <header className="mb-6 max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-[#123875]">
            <AirplaneTilt size={27} weight="fill" className="text-blue-700" />
            <span className="text-lg font-black tracking-tight">SkyLink Airlines</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#10234f] sm:text-4xl">Thanh toán đặt {serviceLabel}</h1>
          <p className="mt-2 text-sm font-medium text-[#3d5c91] sm:text-base">Thanh toán này độc lập với thanh toán vé máy bay.</p>
        </header>

        {paid ? (
          <section className="mx-auto max-w-3xl rounded-3xl border border-white/80 bg-white/95 p-7 shadow-xl shadow-blue-900/10 backdrop-blur sm:p-9">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle size={38} weight="fill" />
            </div>
            <h2 className="mt-4 text-center text-2xl font-black text-slate-900">Thanh toán thành công</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-slate-600">
              SkyLink đã ghi nhận khoản thanh toán mô phỏng. Đơn {serviceLabel} đang chờ Admin xác nhận; đây chưa phải xác nhận từ nhà cung cấp.
            </p>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-slate-500">Mã đặt {serviceLabel}</span>
                <strong className="font-mono text-slate-900">{reservation.reference_code}</strong>
              </div>
              {reservation.guest_name && (
                <div className="mt-2 border-t border-slate-200 pt-2">
                  <p className="text-slate-500">{guestLabel}</p>
                  <p className="mt-1 font-bold text-slate-900">{reservation.guest_name}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{reservation.guest_email} · {reservation.guest_phone}</p>
                </div>
              )}
              {transactionId && (
                <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Mã giao dịch mô phỏng</span>
                  <strong className="break-all font-mono text-xs text-slate-800">{transactionId}</strong>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/my-travel-services" className="rounded-xl bg-blue-700 px-5 py-3 text-center text-sm font-extrabold text-white transition hover:bg-blue-800">
                Xem dịch vụ đã đặt
              </Link>
              <Link to="/my-bookings" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                Xem vé máy bay
              </Link>
            </div>
          </section>
        ) : !canPay ? (
          <section className="mx-auto max-w-3xl rounded-3xl border border-white/80 bg-white/95 p-7 text-center shadow-xl shadow-blue-900/10 backdrop-blur sm:p-9">
            <XCircle size={38} className="mx-auto text-rose-600" />
            <h2 className="mt-4 text-2xl font-black text-slate-900">Đơn đặt {serviceLabel} đã bị hủy</h2>
            <p className="mt-2 text-sm text-slate-600">Không thể tiếp tục thanh toán cho đơn này.</p>
            <Link to="/my-travel-services" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white">
              Về dịch vụ đã đặt
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <section className="overflow-hidden rounded-[26px] border border-white/90 bg-white/95 shadow-xl shadow-blue-900/10 backdrop-blur">
              <div className="relative flex min-h-[112px] items-center gap-4 overflow-hidden bg-gradient-to-r from-blue-100 via-sky-100 to-blue-50 px-5 py-5 sm:px-6">
                {reservation.product?.image_url && isHotel && (
                  <img src={normalizeHotelImageUrl(reservation.product.image_url)} alt="" className="absolute inset-y-0 right-0 h-full w-2/3 object-cover object-center" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-blue-50/95 to-blue-50/10" />
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                  <CalendarBlank size={27} weight="fill" />
                </div>
                <div className="relative min-w-0">
                  <h2 className="text-xl font-black text-[#123875] sm:text-2xl">Thông tin đặt {serviceLabel}</h2>
                  <p className="mt-1 truncate text-sm font-bold text-blue-700">{reservation.product?.name}</p>
                </div>
              </div>

              <div className="p-5 sm:px-6 sm:py-6">
                <dl className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPinLine size={21} weight="fill" className="shrink-0 text-blue-600" />
                    <dt className="min-w-24 text-slate-600">Địa điểm</dt>
                    <dd className="ml-auto text-right font-bold text-[#132958]">{reservation.product?.city || "—"}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarBlank size={21} weight="fill" className="shrink-0 text-blue-600" />
                    <dt className="min-w-24 text-slate-600">{isExperience ? "Ngày trải nghiệm" : isCar ? "Ngày nhận xe" : "Nhận phòng"}</dt>
                    <dd className="ml-auto text-right font-bold text-[#132958]">{formatDate(reservation.start_date)}</dd>
                  </div>
                  {!isExperience && (
                    <div className="flex items-center gap-3">
                      <CalendarBlank size={21} weight="fill" className="shrink-0 text-blue-600" />
                      <dt className="min-w-24 text-slate-600">{isCar ? "Ngày trả xe" : "Trả phòng"}</dt>
                      <dd className="ml-auto text-right font-bold text-[#132958]">{formatDate(reservation.end_date)}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <UsersThree size={21} weight="fill" className="shrink-0 text-blue-600" />
                    <dt className="min-w-24 text-slate-600">{isExperience ? "Số khách" : isCar ? "Khách / xe" : "Khách / phòng"}</dt>
                    <dd className="ml-auto text-right font-bold text-[#132958]">
                      {reservation.guest_count} khách{!isExperience ? ` · ${reservation.quantity} ${isCar ? "xe" : "phòng"}` : ""}
                    </dd>
                  </div>
                  {reservation.guest_name && (
                    <div className="border-t border-blue-100 pt-4">
                      <div className="flex items-center gap-3">
                        <UsersThree size={21} weight="fill" className="shrink-0 text-blue-600" />
                        <span className="text-slate-600">{guestLabel}</span>
                        <strong className="ml-auto text-right text-[#132958]">{reservation.guest_name}</strong>
                      </div>
                      <div className="mt-2 flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>{reservation.guest_email}</span>
                        <span>{reservation.guest_phone}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 border-t border-blue-100 pt-4">
                    <Tag size={20} weight="fill" className="shrink-0 text-blue-600" />
                    <dt className="text-slate-600">Mã đặt</dt>
                    <dd className="ml-auto rounded-full bg-blue-100 px-3 py-1 font-mono font-extrabold text-blue-900">{reservation.reference_code}</dd>
                  </div>
                  {reservation.booking?.pnr_code && (
                    <div className="flex items-center gap-3">
                      <Ticket size={20} weight="fill" className="shrink-0 text-blue-600" />
                      <dt className="text-slate-600">Vé liên kết</dt>
                      <dd className="ml-auto font-mono font-bold text-[#132958]">{reservation.booking.pnr_code}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-blue-100 to-sky-50 px-4 py-4">
                  <span className="text-sm font-extrabold text-blue-900">Tổng tiền cần thanh toán</span>
                  <strong className="text-2xl font-black text-blue-800">{currency.format(Number(reservation.total_price || 0))}</strong>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-white/90 bg-white/95 shadow-xl shadow-blue-900/10 backdrop-blur">
              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-5 text-white sm:px-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <CreditCard size={30} weight="fill" />
                </div>
                <div>
                  <h2 className="text-xl font-black sm:text-2xl">Phương thức thanh toán</h2>
                  <p className="mt-1 text-xs leading-relaxed text-blue-50 sm:text-sm">Chọn phương thức để tiếp tục thanh toán riêng cho dịch vụ.</p>
                </div>
                <CheckCircle size={34} weight="fill" className="ml-auto shrink-0 text-cyan-200" />
              </div>

              <div className="p-5 sm:px-6 sm:py-6">
                <div className="space-y-3">
                {[
                  { id: "vnpay", title: "VNPAY / Thẻ ATM", description: "Thanh toán thông qua VNPAY", brand: "VNPAY", logoClass: "bg-blue-50 text-blue-700" },
                  { id: "momo", title: "Ví MoMo", description: "Thanh toán mô phỏng MoMo", brand: "MoMo", logoClass: "bg-fuchsia-50 text-fuchsia-700" },
                ].map((method) => (
                  <label key={method.id} style={{ display: "flex" }} className={`w-full cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition duration-200 sm:p-4 ${paymentMethod === method.id ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100" : "border-blue-100 bg-white hover:border-blue-300 hover:bg-slate-50"}`}>
                    <input type="radio" name="payment-method" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="h-5 w-5 shrink-0 accent-blue-700" />
                    <span className={`flex h-11 min-w-14 items-center justify-center rounded-xl px-2 text-xs font-black ${method.logoClass}`}>{method.brand}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold text-slate-900">{method.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">{method.description}</span>
                    </span>
                    <span className="ml-auto hidden shrink-0 text-[11px] font-black tracking-wide text-blue-700 sm:block">
                      {method.id === "vnpay" ? "ATM · VISA" : "MOBILE"}
                    </span>
                  </label>
                ))}
                </div>
                {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
                <button type="button" onClick={pay} disabled={paying} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-wait disabled:opacity-60">
                  <CreditCard size={19} weight="fill" />
                  {paying ? "Đang xử lý thanh toán..." : "Xác nhận thanh toán"}
                  {!paying && <ArrowRight size={17} weight="bold" />}
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                  <LockKey size={15} weight="fill" className="text-blue-700" /> Thanh toán an toàn và bảo mật
                </p>
                <p className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  <Clock size={16} className="mt-0.5 shrink-0" />
                  Giao dịch mô phỏng cho đồ án, chưa trừ tiền thật và chưa kết nối nhà cung cấp. Sau thanh toán, đơn vẫn chờ Admin xác nhận.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
