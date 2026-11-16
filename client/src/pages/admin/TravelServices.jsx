import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  CheckCircle,
  Clock,
  MagnifyingGlass,
  XCircle,
} from "@phosphor-icons/react";
import api from "../../api";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const reservationStatus = {
  pending_payment: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  booked: { label: "Đã đặt nội bộ", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  pending_confirmation: { label: "Chờ xác nhận", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  confirmed: { label: "Đã xác nhận", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancelled: { label: "Đã hủy", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

const serviceLabel = (type) => ({
  hotel: "Khách sạn",
  car: "Thuê xe",
  experience: "Trải nghiệm",
}[type] || "Dịch vụ");

const formatDate = (date) => {
  if (!date) return "—";
  const parsedDate = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? "—" : dateFormatter.format(parsedDate);
};

export default function TravelServices() {
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/travel-service-reservations", {
        params: {
          search: search.trim() || undefined,
          status: statusFilter,
          payment_status: paymentFilter,
          page,
        },
      });
      setReservations(data.data?.data || []);
      setLastPage(data.data?.last_page || 1);
      setTotal(data.data?.total || 0);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Không thể tải danh sách đặt dịch vụ. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadReservations, 250);
    return () => window.clearTimeout(timer);
  }, [search, statusFilter, paymentFilter, page]);

  const updateStatus = async (reservation, status) => {
    const isPaid = reservation.payment_status === "paid";
    if (status === "cancelled" && isPaid) {
      setError("Không thể hủy dịch vụ đã thanh toán khi chưa có quy trình hoàn tiền.");
      return;
    }

    const confirmation = status === "confirmed"
      ? `Xác nhận dịch vụ ${reservation.reference_code}?`
      : `Hủy dịch vụ ${reservation.reference_code}?`;
    if (!window.confirm(confirmation)) return;

    setBusyId(reservation.id);
    setError("");
    setNotice("");
    try {
      await api.patch(`/admin/travel-service-reservations/${reservation.id}`, { status });
      setNotice(status === "confirmed" ? "Đã xác nhận dịch vụ." : "Đã hủy dịch vụ.");
      await loadReservations();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        Object.values(requestError.response?.data?.errors || {}).flat()[0] ||
        "Không thể cập nhật trạng thái dịch vụ."
      );
    } finally {
      setBusyId(null);
    }
  };

  const paymentCounts = reservations.reduce((counts, reservation) => {
    if (reservation.payment_status === "paid") counts.paid += 1;
    else counts.unpaid += 1;
    return counts;
  }, { paid: 0, unpaid: 0 });

  return (
    <main className="mx-auto max-w-[1500px] text-slate-900">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Quản trị SkyLink</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Quản lý dịch vụ du lịch</h1>
          <p className="mt-2 text-sm text-slate-500">Theo dõi khách sạn, thuê xe, trải nghiệm và thanh toán dịch vụ riêng.</p>
        </div>
        <button
          type="button"
          onClick={loadReservations}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <ArrowClockwise size={17} className={loading ? "animate-spin" : ""} />
          Tải lại
        </button>
      </header>

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Tổng đặt dịch vụ", value: total, tone: "text-blue-700" },
          { label: "Đã thanh toán (trang hiện tại)", value: paymentCounts.paid, tone: "text-emerald-700" },
          { label: "Chưa thanh toán (trang hiện tại)", value: paymentCounts.unpaid, tone: "text-amber-700" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-black ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(220px,1fr)_190px_190px]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
          <MagnifyingGlass size={17} className="shrink-0 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm mã đặt, khách, email, mã vé..."
            className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm outline-none"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
          aria-label="Lọc trạng thái đặt dịch vụ"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending_payment">Chờ thanh toán</option>
          <option value="booked">Đã đặt nội bộ</option>
          <option value="pending_confirmation">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(event) => {
            setPaymentFilter(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
          aria-label="Lọc trạng thái thanh toán"
        >
          <option value="all">Mọi trạng thái thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="unpaid">Chưa thanh toán</option>
        </select>
      </section>

      {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-extrabold">Mã đặt / Ngày</th>
                <th className="px-4 py-3 font-extrabold">Dịch vụ</th>
                <th className="px-4 py-3 font-extrabold">Khách hàng</th>
                <th className="px-4 py-3 font-extrabold">Lịch trình</th>
                <th className="px-4 py-3 font-extrabold">Liên kết vé</th>
                <th className="px-4 py-3 font-extrabold">Thanh toán</th>
                <th className="px-4 py-3 font-extrabold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-extrabold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-14 text-center text-slate-500"><span className="inline-flex items-center gap-2"><Clock size={18} className="animate-spin" /> Đang tải dữ liệu...</span></td></tr>
              ) : reservations.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-14 text-center text-slate-500">Không tìm thấy đơn dịch vụ phù hợp.</td></tr>
              ) : reservations.map((reservation) => {
                const product = reservation.product || {};
                const status = reservationStatus[reservation.status] || reservationStatus.booked;
                const isPaid = reservation.payment_status === "paid";
                const latestPayment = reservation.payments?.[0];
                const canUpdate = ["pending_payment", "booked", "pending_confirmation"].includes(reservation.status);
                const canConfirm = canUpdate
                  && reservation.status !== "confirmed"
                  && isPaid;
                return (
                  <tr key={reservation.id} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <p className="font-extrabold text-slate-900">{reservation.reference_code}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(reservation.created_at)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800">{product.name || "Dịch vụ"}</p>
                      <p className="mt-1 text-xs text-slate-500">{serviceLabel(product.type)} · {product.city || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{reservation.guest_name || reservation.user?.name || "—"}</p>
                      <p className="mt-1 text-xs text-slate-500">{reservation.guest_email || reservation.user?.email || "—"}</p>
                      {reservation.guest_phone && <p className="mt-1 text-xs text-slate-500">{reservation.guest_phone}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <p>{formatDate(reservation.start_date)}{reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}</p>
                      <p className="mt-1 text-xs text-slate-500">{reservation.guest_count} khách · {reservation.quantity} {product.type === "hotel" ? "phòng" : product.type === "car" ? "xe" : "lượt"}</p>
                      <p className="mt-1 font-extrabold text-slate-800">{currency.format(Number(reservation.total_price || 0))}</p>
                    </td>
                    <td className="px-4 py-4">
                      {reservation.booking?.pnr_code
                        ? <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 font-mono text-xs font-extrabold text-blue-800">{reservation.booking.pnr_code}</span>
                        : <span className="text-xs text-slate-400">Không liên kết</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${isPaid ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                        {isPaid ? <CheckCircle size={14} weight="fill" /> : <Clock size={14} />}
                        {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                      {latestPayment && (
                        <div className="mt-1.5 max-w-[180px] break-all text-[11px] leading-relaxed text-slate-500">
                          {latestPayment.payment_method?.toUpperCase()} · {latestPayment.transaction_id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {canConfirm && (
                          <button
                            type="button"
                            onClick={() => updateStatus(reservation, "confirmed")}
                            disabled={busyId === reservation.id}
                            title="Xác nhận dịch vụ"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle size={15} weight="bold" /> Xác nhận
                          </button>
                        )}
                        {canUpdate && !isPaid && (
                          <button
                            type="button"
                            onClick={() => updateStatus(reservation, "cancelled")}
                            disabled={busyId === reservation.id}
                            title="Hủy dịch vụ chưa thanh toán"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            <XCircle size={15} /> Hủy
                          </button>
                        )}
                        {canUpdate && isPaid && (
                          <span className="max-w-[150px] text-right text-[11px] leading-relaxed text-slate-500">Liên hệ hỗ trợ để xử lý hủy/hoàn tiền</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <span className="text-xs font-medium text-slate-500">Trang {page} / {lastPage} · {total} đơn</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">Trước</button>
            <button type="button" onClick={() => setPage((current) => Math.min(lastPage, current + 1))} disabled={page >= lastPage || loading} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">Tiếp</button>
          </div>
        </footer>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Thanh toán dịch vụ được ghi nhận nội bộ/mô phỏng. Dịch vụ đã thanh toán không thể hủy tại đây vì hệ thống chưa có quy trình hoàn tiền.
      </p>
    </main>
  );
}
