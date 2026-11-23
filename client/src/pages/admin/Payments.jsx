import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  CreditCard,
  CurrencyCircleDollar,
  DownloadSimple,
  Funnel,
  MagnifyingGlass,
  Receipt,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import api from "../../api";

const currencyFmt = new Intl.NumberFormat("vi-VN");

function formatMoneyVnd(val) {
  return `${currencyFmt.format(Math.round(Number(val || 0)))} ₫`;
}

function formatDateTimeVi(raw) {
  if (!raw) return "—";
  const dt = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return String(raw);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()} • ${hh}:${mi}`;
}

function getMethodUi(method) {
  const m = String(method || "").toLowerCase();
  if (m.includes("vnpay")) {
    return { label: "VNPay", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
  }
  if (m.includes("momo")) {
    return { label: "MoMo", bg: "#fdf2f8", color: "#be185d", border: "#fbcfe8" };
  }
  if (m.includes("admin")) {
    return { label: "Thủ công", bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
  }
  return { label: m ? m.toUpperCase() : "Khác", bg: "#f8fafc", color: "#334155", border: "#e2e8f0" };
}

function getStatusUi(status) {
  const s = String(status || "").toLowerCase();
  if (s === "success" || s === "paid") {
    return { label: "Thành công", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
  }
  if (s === "pending") {
    return { label: "Đang chờ", bg: "#fff7ed", color: "#d97706", border: "#fed7aa" };
  }
  return { label: "Thất bại", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
}

export default function Payments() {
  const [urlParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    total_transactions: 0,
    total_collected: 0,
    success_count: 0,
    pending_count: 0,
    failed_count: 0,
  });

  const [search, setSearch] = useState(() => urlParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  const [notice, setNotice] = useState({ type: "", text: "" });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = urlParams.get("search");
    if (q !== null) {
      setSearch(q);
      setPage(1);
    }
  }, [urlParams]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/payments", {
        params: {
          search: search.trim() || undefined,
          status: statusFilter,
          method: methodFilter,
          per_page: 8,
          page,
        },
      });
      setPayments(res.data?.data || []);
      setLastPage(res.data?.last_page || 1);
      setTotalPayments(res.data?.total || 0);
      if (res.data?.summary) setSummary(res.data.summary);
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách giao dịch thanh toán.",
      });
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = window.setTimeout(fetchPayments, 250);
    return () => window.clearTimeout(t);
  }, [search, statusFilter, methodFilter, page]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/payments/${deleteTarget.id}`);
      setNotice({
        type: "success",
        text: `Đã xóa bản ghi giao dịch ${deleteTarget.transaction_id}.`,
      });
      setDeleteTarget(null);
      setSelectedPayment(null);
      fetchPayments();
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể xóa giao dịch này.",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const header = ["Mã giao dịch,Mã PNR,Chặng bay,Khách hàng,Email,Số tiền (VND),Cổng TT,Trạng thái,Thời gian"];
    const rows = payments.map((p) => {
      const st = getStatusUi(p.status);
      const m = getMethodUi(p.payment_method);
      return `"${p.transaction_id}","${p.pnr_code}","${p.route}","${p.customer_name}","${p.customer_email}",${p.amount},"${m.label}","${st.label}","${p.paid_at || ""}"`;
    });
    const csv = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "skylink_payment_reconciliation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (lastPage <= 5) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const s = Math.max(2, page - 1);
      const e = Math.min(lastPage - 1, page + 1);
      for (let i = s; i <= e; i++) pages.push(i);
      if (page < lastPage - 2) pages.push("...");
      pages.push(lastPage);
    }
    return pages;
  }, [page, lastPage]);

  const kpiCards = [
    {
      label: "Tổng giao dịch",
      value: summary.total_transactions.toLocaleString("vi-VN"),
      sub: "Toàn hệ thống thanh toán",
      icon: CreditCard,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Tổng thu thực tế",
      value:
        summary.total_collected >= 1_000_000_000
          ? `${(summary.total_collected / 1_000_000_000).toFixed(2)} Tỷ ₫`
          : summary.total_collected >= 1_000_000
          ? `${(summary.total_collected / 1_000_000).toFixed(1)} Tr ₫`
          : formatMoneyVnd(summary.total_collected),
      sub: "Từ giao dịch thành công",
      icon: CurrencyCircleDollar,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      label: "Thành công",
      value: summary.success_count.toLocaleString("vi-VN"),
      sub: `${
        summary.total_transactions
          ? Math.round((summary.success_count / summary.total_transactions) * 100)
          : 0
      }% tỷ lệ thành công`,
      icon: CheckCircle,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
    },
    {
      label: "Chờ / Thất bại",
      value: (summary.pending_count + summary.failed_count).toLocaleString("vi-VN"),
      sub: `${summary.pending_count} chờ • ${summary.failed_count} lỗi`,
      icon: WarningCircle,
      iconBg: "#fff7ed",
      iconColor: "#f59e0b",
    },
  ];

  return (
    <div style={{ maxWidth: "1520px", margin: "0 auto", padding: "4px 0 16px 0" }}>
      {/* 1. HEADER ROW */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-white/95 text-blue-600 shadow-sm"
            style={{ borderRadius: 14, border: "1px solid #d5e6fc" }}
          >
            <CreditCard size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Quản lý Thanh toán (Payment)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Đối soát giao dịch VNPay, MoMo, kiểm tra biên lai và chứng từ thu tiền vé máy bay.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex w-fit cursor-pointer items-center gap-2 bg-white/95 font-extrabold text-[#123975] shadow-sm transition hover:bg-blue-50"
          style={{
            borderRadius: 9999,
            border: "1px solid #d5e6fc",
            padding: "9px 18px",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          <DownloadSimple size={16} weight="bold" className="text-blue-600" />
          <span>Xuất đối soát CSV</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {notice.text && (
        <div
          className={`mb-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 font-bold ${
            notice.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
          style={{ fontSize: 13 }}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice({ type: "", text: "" })}
            className="cursor-pointer bg-transparent p-1 text-current opacity-70 hover:opacity-100"
            style={{ border: "none" }}
          >
            <X size={15} weight="bold" />
          </button>
        </div>
      )}

      {/* 2. 4 REAL DB KPI CARDS */}
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-3.5 bg-white/95 px-4 py-3.5 backdrop-blur-md transition hover:-translate-y-0.5"
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 10px 26px rgba(18, 60, 130, 0.08)",
              }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center"
                style={{
                  background: card.iconBg,
                  color: card.iconColor,
                  borderRadius: 9999,
                }}
              >
                <Icon size={24} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="font-bold text-[#476494]"
                  style={{ margin: 0, fontSize: 13, whiteSpace: "nowrap" }}
                >
                  {card.label}
                </p>
                <span
                  className="mt-1 block font-black leading-none text-[#091e47]"
                  style={{ fontSize: 23 }}
                >
                  {card.value}
                </span>
                <p className="mt-1 truncate font-semibold text-slate-400" style={{ margin: 0, fontSize: 12 }}>
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MAIN WHITE CARD */}
      <div
        className="overflow-hidden bg-white"
        style={{
          borderRadius: 24,
          border: "1px solid #d5e6fc",
          boxShadow: "0 14px 36px rgba(18, 60, 130, 0.08)",
        }}
      >
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-end justify-between gap-2.5 border-b border-slate-100 p-4">
          <div className="flex flex-wrap items-end gap-2.5">
            <div>
              <label
                className="font-extrabold text-[#476494]"
                style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
              >
                Trạng thái giao dịch
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Lọc trạng thái giao dịch"
                className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="success">Thành công</option>
                <option value="pending">Đang chờ</option>
                <option value="failed">Thất bại</option>
              </select>
            </div>

            <div>
              <label
                className="font-extrabold text-[#476494]"
                style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
              >
                Cổng thanh toán
              </label>
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Lọc cổng thanh toán"
                className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả cổng</option>
                <option value="vnpay">VNPay</option>
                <option value="momo">Ví MoMo</option>
                <option value="other">Thủ công / Khác</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 235 }}
            >
              <input
                type="text"
                placeholder="Tìm mã giao dịch, PNR, khách hàng..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                style={{ fontSize: 13 }}
              />
              <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
            </div>

            <button
              type="button"
              onClick={fetchPayments}
              className="inline-flex cursor-pointer items-center gap-1.5 font-extrabold text-white shadow-sm transition hover:brightness-105"
              style={{
                background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                borderRadius: 9999,
                border: "none",
                padding: "9px 16px",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              <Funnel size={15} weight="fill" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                style={{ fontSize: 11.5 }}
              >
                <th className="px-3 py-3">Mã giao dịch</th>
                <th className="px-3 py-3">Khách hàng</th>
                <th className="px-3 py-3">PNR / Chặng</th>
                <th className="px-3 py-3">Số tiền</th>
                <th className="px-3 py-3">Cổng TT</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-3 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Đang tải lịch sử giao dịch...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Không tìm thấy giao dịch thanh toán nào phù hợp.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const mUi = getMethodUi(p.payment_method);
                  const stUi = getStatusUi(p.status);

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                    >
                      <td className="px-3 py-3">
                        <div
                          className="truncate font-mono font-black text-[#0b4fd0]"
                          style={{ maxWidth: 160, fontSize: 12.5 }}
                          title={p.transaction_id}
                        >
                          {p.transaction_id}
                        </div>
                        <div className="font-medium text-slate-400" style={{ fontSize: 11 }}>
                          {formatDateTimeVi(p.paid_at)}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div
                          className="truncate font-bold text-[#091e47]"
                          style={{ maxWidth: 150, fontSize: 13 }}
                          title={p.customer_name}
                        >
                          {p.customer_name}
                        </div>
                        <div
                          className="truncate font-medium text-slate-400"
                          style={{ maxWidth: 150, fontSize: 11.5 }}
                          title={p.customer_email}
                        >
                          {p.customer_email}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="font-mono font-black text-[#091e47]" style={{ fontSize: 13 }}>
                          {p.pnr_code}
                        </div>
                        <div className="font-medium text-slate-400" style={{ fontSize: 11.5 }}>
                          {p.route}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 font-black text-[#091e47]" style={{ fontSize: 13 }}>
                        {formatMoneyVnd(p.amount)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-1 font-bold"
                          style={{
                            background: mUi.bg,
                            color: mUi.color,
                            border: `1px solid ${mUi.border}`,
                            borderRadius: 9999,
                            fontSize: 11.5,
                          }}
                        >
                          {mUi.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-1 font-bold"
                          style={{
                            background: stUi.bg,
                            color: stUi.color,
                            border: `1px solid ${stUi.border}`,
                            borderRadius: 9999,
                            fontSize: 11.5,
                          }}
                        >
                          {stUi.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(p)}
                          className="inline-flex cursor-pointer items-center gap-1 bg-white font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                          style={{
                            borderRadius: 9999,
                            border: "1px solid #cde2fd",
                            padding: "5px 12px",
                            fontSize: 12,
                          }}
                        >
                          <Receipt size={14} weight="bold" />
                          <span>Biên lai</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Windowed Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <span className="font-semibold text-slate-500" style={{ fontSize: 13 }}>
            Trang <strong>{page}</strong> / <strong>{lastPage}</strong> • Tổng{" "}
            <strong>{totalPayments.toLocaleString("vi-VN")}</strong> giao dịch
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
            >
              <CaretLeft size={14} weight="bold" />
            </button>

            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`pay-dots-${idx}`} className="px-1 text-xs font-bold text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className="flex h-8 min-w-[32px] cursor-pointer items-center justify-center px-2 text-xs font-extrabold transition"
                  style={
                    p === page
                      ? {
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                          color: "#ffffff",
                          borderRadius: 9999,
                          border: "none",
                        }
                      : {
                          background: "#ffffff",
                          color: "#1e3a6b",
                          borderRadius: 9999,
                          border: "1px solid #d5e6fc",
                        }
                  }
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* RECEIPT DETAIL MODAL */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  Biên lai đối soát SkyLink
                </p>
                <h3 className="font-mono font-black text-[#091e47]" style={{ margin: 0, fontSize: 16 }}>
                  {selectedPayment.transaction_id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="space-y-2 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4 font-semibold text-[#163d7a]" style={{ fontSize: 13 }}>
              <p style={{ margin: 0 }}>
                <strong>Khách hàng:</strong> {selectedPayment.customer_name}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Email:</strong> {selectedPayment.customer_email}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Mã đặt chỗ (PNR):</strong>{" "}
                <span className="font-mono font-black text-[#091e47]">{selectedPayment.pnr_code}</span>{" "}
                {selectedPayment.route !== "—" ? `(${selectedPayment.route})` : ""}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Cổng thanh toán:</strong> {getMethodUi(selectedPayment.payment_method).label}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Thời gian ghi nhận:</strong> {formatDateTimeVi(selectedPayment.paid_at)}
              </p>
              <p style={{ margin: 0 }} className="border-t border-blue-200/70 pt-2">
                <strong>Số tiền:</strong>{" "}
                <span className="font-black text-[#0b4fd0]" style={{ fontSize: 16 }}>
                  {formatMoneyVnd(selectedPayment.amount)}
                </span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              {selectedPayment.status === "success" ? (
                <span className="font-semibold text-slate-400" style={{ fontSize: 12 }}>
                  Giao dịch thành công được khóa bảo toàn chứng từ.
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedPayment)}
                  className="inline-flex cursor-pointer items-center gap-1.5 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                  style={{ borderRadius: 9999, border: "1px solid #fecaca" }}
                >
                  <Trash size={14} weight="bold" />
                  Xóa bản ghi lỗi
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="cursor-pointer px-5 py-2 text-xs font-extrabold text-white"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAFE DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <h3 className="font-black text-[#091e47]" style={{ margin: "0 0 8px 0", fontSize: 17 }}>
              Xác nhận xóa bản ghi giao dịch?
            </h3>
            <p className="font-medium text-slate-600" style={{ margin: "0 0 18px 0", fontSize: 13 }}>
              Bạn có chắc muốn xóa giao dịch <strong>{deleteTarget.transaction_id}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700"
                style={{ borderRadius: 9999, border: "none" }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="cursor-pointer bg-rose-600 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                style={{ borderRadius: 9999, border: "none" }}
              >
                {deleting ? "Đang xóa..." : "Xóa bản ghi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
