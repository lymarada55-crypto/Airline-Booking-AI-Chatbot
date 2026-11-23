import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import { Spinner } from "react-bootstrap";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  XCircle,
  DownloadSimple,
  MagnifyingGlass,
  Funnel,
  AirplaneTilt,
  Buildings,
  Car,
  Compass,
  CaretLeft,
  CaretRight,
  X,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";

function formatDateTimeVi(raw) {
  if (!raw) return "";
  const dt = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return String(raw);
  const d = String(dt.getDate()).padStart(2, "0");
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const y = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} • ${hh}:${mm}`;
}

function normalizeStatus(rawStatus) {
  const s = String(rawStatus || "").toLowerCase();
  if (s === "paid" || s === "confirmed" || s === "completed" || s === "success") {
    return "paid";
  }
  if (s === "cancelled" || s === "canceled" || s === "failed") {
    return "cancelled";
  }
  return "pending";
}

function getStatusUi(normStatus) {
  if (normStatus === "paid") {
    return {
      label: "Đã thanh toán",
      bg: "#ecfdf5",
      color: "#059669",
      border: "#a7f3d0",
    };
  }
  if (normStatus === "cancelled") {
    return {
      label: "Đã hủy",
      bg: "#f5f3ff",
      color: "#7c3aed",
      border: "#ddd6fe",
    };
  }
  return {
    label: "Chờ xác nhận",
    bg: "#fff7ed",
    color: "#d97706",
    border: "#fed7aa",
  };
}

function getServiceMeta(serviceType) {
  switch (serviceType) {
    case "hotel":
      return { label: "Khách sạn", icon: Buildings, color: "#0b57d0" };
    case "car":
      return { label: "Thuê xe", icon: Car, color: "#0284c7" };
    case "experience":
      return { label: "Tour du lịch", icon: Compass, color: "#0891b2" };
    default:
      return { label: "Vé máy bay", icon: AirplaneTilt, color: "#1d75f2" };
  }
}

function formatPaymentMethod(method) {
  const m = String(method || "").toLowerCase();
  if (m === "vnpay") return "VNPay QR / ATM";
  if (m === "momo") return "Ví MoMo";
  if (m === "stripe" || m === "card" || m === "credit_card") return "Thẻ Quốc tế (Visa/Master)";
  if (m === "bank_transfer") return "Chuyển khoản ngân hàng";
  if (m === "admin_manual") return "Xác nhận thủ công (Admin)";
  if (m === "cash" || m === "cod") return "Thanh toán tại quầy";
  return m ? m.toUpperCase() : "Chưa ghi nhận";
}

function Bookings() {
  const [urlParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => urlParams.get("search") || "");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [notice, setNotice] = useState({ type: "", text: "" });
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = urlParams.get("search");
    if (q !== null) {
      setSearch(q);
      setCurrentPage(1);
    }
  }, [urlParams]);

  useEffect(() => {
    fetchAllReservations();
  }, []);

  const fetchAllReservations = async () => {
    setLoading(true);
    try {
      const [flightsRes, travelRes] = await Promise.allSettled([
        api.get("/admin/bookings"),
        api.get("/admin/travel-service-reservations", { params: { per_page: 200 } }),
      ]);

      const flightList =
        flightsRes.status === "fulfilled"
          ? Array.isArray(flightsRes.value.data?.data)
            ? flightsRes.value.data.data
            : []
          : [];

      const travelRaw =
        travelRes.status === "fulfilled"
          ? travelRes.value.data?.data?.data || travelRes.value.data?.data || []
          : [];
      const travelList = Array.isArray(travelRaw) ? travelRaw : [];

      const normalizedFlights = flightList.map((b) => {
        const depAirport = b.flight?.departure_airport || b.flight?.departureAirport;
        const arrAirport = b.flight?.arrival_airport || b.flight?.arrivalAirport;
        const depCode = depAirport?.code || "HAN";
        const arrCode = arrAirport?.code || "SGN";
        const depCity = depAirport?.city || depCode;
        const arrCity = arrAirport?.city || arrCode;
        const flightNum = b.flight?.flight_number || b.flight?.flight_code || "VN";
        const rawPaxName = String(b.tickets?.[0]?.passenger_name || b.passenger || "").trim();
        const bookerName = b.user?.name || "Khách vãng lai";
        const customer =
          rawPaxName.length >= 3 ? rawPaxName : bookerName || rawPaxName || "Khách hàng";
        const tickets = Array.isArray(b.tickets) ? b.tickets : [];
        const checkedInCount = tickets.filter((t) => Boolean(t.check_in || t.checkIn)).length;

        return {
          uid: `flight-${b.id}`,
          id: b.id,
          source: "flight",
          serviceType: "flight",
          code: b.pnr_code || b.pnr || `BK${b.id}`,
          customer,
          bookerName,
          passengerCount: tickets.length || 1,
          checkedInCount,
          customerEmail: b.user?.email || "—",
          paymentMethod: formatPaymentMethod(b.payment?.payment_method),
          headline: `${depCode} → ${arrCode}`,
          subline: `${flightNum} • ${formatDateTimeVi(b.flight?.departure_time || b.created_at)}`,
          routeDetail: `${depCity} (${depCode}) → ${arrCity} (${arrCode})`,
          amount: Number(b.total_amount ?? b.total_price ?? b.price ?? 0),
          status: normalizeStatus(b.status),
          rawStatus: b.status,
          createdAt: b.created_at || "",
          tickets,
        };
      });

      const normalizedTravel = travelList.map((r) => {
        const product = r.product || r.travel_product || {};
        const tType = product.type || r.service_type || "hotel";
        const unitLabel =
          tType === "hotel" ? "đêm" : tType === "car" ? "ngày" : "khách";
        const qty = Number(r.quantity || 1);
        const city = product.city || product.location || "Việt Nam";

        const startDateFmt = r.start_date
          ? (() => {
              const dt = new Date(String(r.start_date).replace(" ", "T"));
              if (Number.isNaN(dt.getTime())) return String(r.start_date).slice(0, 10);
              const dd = String(dt.getDate()).padStart(2, "0");
              const mm = String(dt.getMonth() + 1).padStart(2, "0");
              return `${dd}/${mm}/${dt.getFullYear()}`;
            })()
          : "";

        return {
          uid: `travel-${r.id}`,
          id: r.id,
          source: "travel",
          serviceType: tType,
          code: r.reservation_code || r.booking_code || `TS${r.id}`,
          customer: r.customer_name || r.user?.name || "Khách hàng",
          bookerName: r.user?.name || r.customer_name || "Khách vãng lai",
          passengerCount: qty,
          checkedInCount: 0,
          customerEmail: r.customer_email || r.user?.email || "—",
          paymentMethod: formatPaymentMethod(r.payment_method),
          headline: product.name || city,
          subline: `${city} • ${qty} ${unitLabel}${startDateFmt ? ` • ${startDateFmt}` : ""}`,
          routeDetail: `${product.name || "Dịch vụ du lịch"} — ${city}`,
          amount: Number(r.total_price ?? r.total_amount ?? 0),
          status: normalizeStatus(r.status),
          rawStatus: r.status,
          createdAt: r.created_at || "",
          tickets: [],
        };
      });

      const merged = [...normalizedFlights, ...normalizedTravel].sort((a, b) => {
        const ta = new Date(String(a.createdAt || 0).replace(" ", "T")).getTime() || 0;
        const tb = new Date(String(b.createdAt || 0).replace(" ", "T")).getTime() || 0;
        return tb - ta;
      });

      setItems(merged);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Summary counts across all loaded bookings
  const summary = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let cancelled = 0;
    for (const item of items) {
      if (item.status === "paid") paid++;
      else if (item.status === "cancelled") cancelled++;
      else pending++;
    }
    return { total: items.length, paid, pending, cancelled };
  }, [items]);

  const filteredItems = useMemo(() => {
    const kw = search.trim().toLowerCase();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return items.filter((item) => {
      if (serviceFilter !== "all" && item.serviceType !== serviceFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      if (dateFilter !== "all") {
        const ts = new Date(String(item.createdAt || "").replace(" ", "T")).getTime();
        if (Number.isNaN(ts)) return false;
        if (dateFilter === "today" && ts < startOfToday) return false;
        if (dateFilter === "7d" && ts < now.getTime() - 7 * 86400000) return false;
        if (dateFilter === "30d" && ts < now.getTime() - 30 * 86400000) return false;
        if (dateFilter === "month" && ts < startOfMonth) return false;
      }

      if (!kw) return true;
      return (
        item.code.toLowerCase().includes(kw) ||
        item.customer.toLowerCase().includes(kw) ||
        (item.bookerName || "").toLowerCase().includes(kw) ||
        item.headline.toLowerCase().includes(kw) ||
        item.subline.toLowerCase().includes(kw) ||
        item.routeDetail.toLowerCase().includes(kw)
      );
    });
  }, [items, search, serviceFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfFirst = (safePage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [safePage, totalPages]);

  const handleUpdateStatus = async (item, nextStatus) => {
    setUpdatingStatus(true);
    try {
      if (item.source === "flight") {
        await api.put(`/admin/bookings/${item.id}`, { status: nextStatus });
      } else {
        const travelStatus =
          nextStatus === "paid"
            ? "confirmed"
            : nextStatus === "cancelled"
            ? "cancelled"
            : "pending";
        await api.patch(`/admin/travel-service-reservations/${item.id}`, {
          status: travelStatus,
        });
      }

      setItems((prev) =>
        prev.map((row) =>
          row.uid === item.uid ? { ...row, status: nextStatus, rawStatus: nextStatus } : row
        )
      );
      setSelectedItem((prev) =>
        prev && prev.uid === item.uid ? { ...prev, status: nextStatus } : prev
      );
      setNotice({
        type: "success",
        text: `Đã cập nhật trạng thái đơn ${item.code} thành "${getStatusUi(nextStatus).label}".`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể cập nhật trạng thái đơn đặt chỗ.",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/bookings/${deleteTarget.id}`);
      setItems((prev) => prev.filter((row) => row.uid !== deleteTarget.uid));
      setNotice({ type: "success", text: `Đã xóa đơn đặt chỗ ${deleteTarget.code}.` });
      setDeleteTarget(null);
      setSelectedItem(null);
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể xóa đơn đặt chỗ này.",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const header = ["STT,Mã đặt chỗ,Dịch vụ,Khách hàng,Hành trình / Chi tiết,Tổng tiền (VND),Trạng thái"];
    const rows = filteredItems.map((item, idx) => {
      const sMeta = getServiceMeta(item.serviceType);
      const stUi = getStatusUi(item.status);
      return `${idx + 1},"${item.code}","${sMeta.label}","${item.customer}","${item.headline} (${item.subline})",${item.amount},"${stUi.label}"`;
    });
    const csv = "data:text/csv;charset=utf-8," + [...header, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "skylink_reservations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpiCards = [
    {
      label: "Tổng đặt chỗ",
      value: summary.total.toLocaleString("vi-VN"),
      sub: "Vé bay & Dịch vụ",
      icon: CalendarCheck,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Đã thanh toán",
      value: summary.paid.toLocaleString("vi-VN"),
      sub: `${summary.total ? Math.round((summary.paid / summary.total) * 100) : 0}% tổng đơn`,
      icon: CheckCircle,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      label: "Chờ xác nhận",
      value: summary.pending.toLocaleString("vi-VN"),
      sub: "Cần theo dõi",
      icon: Clock,
      iconBg: "#fff7ed",
      iconColor: "#f59e0b",
    },
    {
      label: "Đã hủy",
      value: summary.cancelled.toLocaleString("vi-VN"),
      sub: `${summary.total ? Math.round((summary.cancelled / summary.total) * 100) : 0}% tỷ lệ hủy`,
      icon: XCircle,
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
    },
  ];

  return (
    <div style={{ maxWidth: "1520px", margin: "0 auto", padding: "4px 0 16px 0" }}>
      {/* 1. HEADER ROW matching mockup */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-white/95 text-blue-600 shadow-sm"
            style={{ borderRadius: 14, border: "1px solid #d5e6fc" }}
          >
            <CalendarCheck size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Quản lý đặt chỗ (Reservation)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Quản lý tất cả các đặt chỗ vé máy bay &amp; dịch vụ du lịch của hệ thống SkyLink.
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
            fontSize: 13.5,
            whiteSpace: "nowrap",
          }}
        >
          <DownloadSimple size={16} weight="bold" className="text-blue-600" />
          <span>Xuất báo cáo</span>
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
          <span className="inline-flex items-center gap-2">
            {notice.type === "error" ? (
              <WarningCircle size={17} weight="fill" />
            ) : (
              <CheckCircle size={17} weight="fill" />
            )}
            {notice.text}
          </span>
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

      {/* 2. 4 KPI STAT CARDS matching mockup */}
      <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-3.5 bg-white"
              style={{
                padding: "16px 18px",
                borderRadius: 20,
                border: "1px solid rgba(213, 230, 252, 0.95)",
                boxShadow: "0 10px 26px rgba(18, 60, 130, 0.06)",
              }}
            >
              <div
                className="flex shrink-0 items-center justify-center"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 9999,
                  background: card.iconBg,
                  color: card.iconColor,
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
                  style={{ fontSize: 26 }}
                >
                  {card.value}
                </span>
                <p className="mt-1 font-semibold text-slate-400" style={{ margin: 0, fontSize: 12 }}>
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
        {/* Filter Toolbar matching mockup */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                className="font-extrabold text-[#476494]"
                style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
              >
                Loại dịch vụ
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo loại dịch vụ"
                className="cursor-pointer bg-[#f4f8ff] px-3.5 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả dịch vụ</option>
                <option value="flight">Vé máy bay</option>
                <option value="hotel">Khách sạn</option>
                <option value="car">Thuê xe</option>
                <option value="experience">Tour du lịch</option>
              </select>
            </div>

            <div>
              <label
                className="font-extrabold text-[#476494]"
                style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
              >
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo trạng thái"
                className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label
                className="font-extrabold text-[#476494]"
                style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
              >
                Thời gian đặt
              </label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo thời gian đặt"
                className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="7d">7 ngày qua</option>
                <option value="30d">30 ngày qua</option>
                <option value="month">Tháng này</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
              style={{
                borderRadius: 9999,
                border: "1px solid #d5e6fc",
                minWidth: 215,
              }}
            >
              <input
                type="text"
                placeholder="Tìm kiếm mã đặt chỗ, tên khách..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                style={{ fontSize: 13 }}
              />
              <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
            </div>

            <button
              type="button"
              onClick={fetchAllReservations}
              className="inline-flex cursor-pointer items-center gap-1.5 font-extrabold text-white shadow-sm transition hover:brightness-105"
              style={{
                background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                borderRadius: 9999,
                border: "none",
                padding: "9px 18px",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              <Funnel size={15} weight="fill" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Unified Reservations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f4f8ff", borderBottom: "1px solid #e2eeff" }}>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  #
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Mã đặt chỗ
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Dịch vụ
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Khách hàng
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Hành trình / Thời gian
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Tổng tiền
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Trạng thái
                </th>
                <th className="px-3 py-3 text-right text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <Spinner animation="border" variant="primary" />
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-sm font-semibold text-slate-400">
                    Không tìm thấy đơn đặt chỗ nào phù hợp.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const sMeta = getServiceMeta(item.serviceType);
                  const ServiceIcon = sMeta.icon;
                  const stUi = getStatusUi(item.status);

                  return (
                    <tr
                      key={item.uid}
                      className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                    >
                      <td className="px-2.5 py-3 font-bold text-slate-500" style={{ fontSize: 13 }}>
                        {indexOfFirst + idx + 1}
                      </td>
                      <td className="px-2.5 py-3 font-mono font-black text-[#091e47]" style={{ fontSize: 13 }}>
                        {item.code}
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 font-bold text-[#163d7a]"
                          style={{ fontSize: 13 }}
                        >
                          <ServiceIcon size={16} weight="duotone" style={{ color: sMeta.color }} />
                          {sMeta.label}
                        </span>
                      </td>
                      <td className="px-2.5 py-3">
                        <span
                          className="block truncate font-bold text-[#091e47]"
                          style={{ maxWidth: 112, fontSize: 13 }}
                          title={item.customer}
                        >
                          {item.customer}
                        </span>
                        {item.source === "flight" && (
                          <span
                            className="block truncate font-medium text-slate-400"
                            style={{ maxWidth: 112, fontSize: 11 }}
                          >
                            {item.passengerCount} khách
                            {item.checkedInCount > 0 ? " • Đã check-in" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-2.5 py-3">
                        <div
                          className="truncate font-bold text-[#091e47]"
                          style={{ maxWidth: 155, fontSize: 13 }}
                          title={item.headline}
                        >
                          {item.headline}
                        </div>
                        <div
                          className="truncate font-medium text-slate-400"
                          style={{ maxWidth: 155, fontSize: 11.5 }}
                          title={item.subline}
                        >
                          {item.subline}
                        </div>
                      </td>
                      <td
                        className="whitespace-nowrap px-2.5 py-3 font-black text-[#091e47]"
                        style={{ fontSize: 13 }}
                      >
                        {item.amount.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-2.5 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-1 font-bold"
                          style={{
                            background: stUi.bg,
                            color: stUi.color,
                            border: `1px solid ${stUi.border}`,
                            borderRadius: 9999,
                            fontSize: 11.5,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {stUi.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex cursor-pointer items-center gap-1 bg-white font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                          style={{
                            borderRadius: 9999,
                            border: "1px solid #cde2fd",
                            padding: "5px 12px",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <span className="font-semibold text-slate-500" style={{ fontSize: 13 }}>
            Hiển thị{" "}
            <strong>
              {filteredItems.length === 0 ? 0 : indexOfFirst + 1}–
              {Math.min(indexOfFirst + itemsPerPage, filteredItems.length)}
            </strong>{" "}
            trong tổng số <strong>{filteredItems.length}</strong> đặt chỗ
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
            >
              <CaretLeft size={14} weight="bold" />
            </button>

            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-1.5 text-xs font-bold text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className="flex h-8 min-w-[32px] cursor-pointer items-center justify-center px-2 text-xs font-extrabold transition"
                  style={
                    p === safePage
                      ? {
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                          color: "#ffffff",
                          borderRadius: 9999,
                          border: "none",
                          boxShadow: "0 4px 12px rgba(13, 97, 225, 0.28)",
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
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL & STATUS UPDATE MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  {getServiceMeta(selectedItem.serviceType).label}
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  Chi tiết đơn {selectedItem.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div
              className="space-y-2.5 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4 font-semibold text-[#163d7a]"
              style={{ fontSize: 13 }}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <p style={{ margin: 0 }}>
                  <strong>Người đặt:</strong> {selectedItem.bookerName}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Ngày đặt:</strong> {formatDateTimeVi(selectedItem.createdAt)}
                </p>
                <p style={{ margin: 0 }} className="truncate" title={selectedItem.customerEmail}>
                  <strong>Email:</strong> {selectedItem.customerEmail}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Thanh toán:</strong> {selectedItem.paymentMethod}
                </p>
              </div>
              <div className="border-t border-blue-200/70 pt-2 space-y-1.5">
                <p style={{ margin: 0 }}>
                  <strong>Hành trình / Dịch vụ:</strong> {selectedItem.routeDetail}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Thời gian:</strong> {selectedItem.subline}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Tổng thanh toán:</strong>{" "}
                  <span className="font-black text-[#0b4fd0]">
                    {selectedItem.amount.toLocaleString("vi-VN")} ₫
                  </span>
                </p>
              </div>
              {selectedItem.tickets?.length > 0 && (
                <div className="border-t border-blue-200/70 pt-2.5">
                  <strong className="block mb-1.5">
                    Danh sách hành khách ({selectedItem.tickets.length}):
                  </strong>
                  <div className="space-y-1.5">
                    {selectedItem.tickets.map((t, i) => {
                      const isCheckedIn = Boolean(t.check_in || t.checkIn);
                      const seatNo = t.seat?.seat_number;
                      const seatClass =
                        t.seat?.seat_class === "business"
                          ? "Thương gia"
                          : t.seat?.seat_class === "economy"
                          ? "Phổ thông"
                          : "";
                      return (
                        <div
                          key={t.id || i}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-1.5 border border-blue-100"
                          style={{ fontSize: 12.5 }}
                        >
                          <span className="font-bold text-[#091e47]">
                            {i + 1}. {t.passenger_name}
                            {seatNo ? ` • Ghế ${seatNo}${seatClass ? ` (${seatClass})` : ""}` : ""}
                          </span>
                          <span
                            className="px-2 py-0.5 font-extrabold"
                            style={{
                              borderRadius: 9999,
                              fontSize: 11,
                              background: isCheckedIn ? "#ecfdf5" : "#f1f5f9",
                              color: isCheckedIn ? "#059669" : "#64748b",
                              border: isCheckedIn ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                            }}
                          >
                            {isCheckedIn ? "Đã check-in" : "Chưa check-in"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Update Controls */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Cập nhật trạng thái đơn
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "paid", label: "Đã thanh toán", bg: "#ecfdf5", color: "#059669" },
                  { id: "pending", label: "Chờ xác nhận", bg: "#fff7ed", color: "#d97706" },
                  { id: "cancelled", label: "Hủy đơn", bg: "#fef2f2", color: "#dc2626" },
                ].map((opt) => {
                  const isCurr = selectedItem.status === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={updatingStatus || isCurr}
                      onClick={() => handleUpdateStatus(selectedItem, opt.id)}
                      className="cursor-pointer px-3.5 py-2 text-xs font-extrabold transition disabled:cursor-default"
                      style={{
                        borderRadius: 9999,
                        background: isCurr ? "#0b5ed7" : opt.bg,
                        color: isCurr ? "#ffffff" : opt.color,
                        border: isCurr ? "1px solid #0b5ed7" : "1px solid #e2e8f0",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              {selectedItem.source === "flight" ? (
                selectedItem.status === "paid" ? (
                  <span
                    className="font-semibold text-slate-400"
                    style={{ fontSize: 12 }}
                  >
                    Đơn đã thanh toán được bảo toàn chứng từ (Hủy đơn nếu cần xóa).
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(selectedItem)}
                    className="inline-flex cursor-pointer items-center gap-1.5 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                    style={{ borderRadius: 9999, border: "1px solid #fecaca" }}
                  >
                    <Trash size={14} weight="bold" />
                    Xóa đơn này
                  </button>
                )
              ) : (
                <span className="font-semibold text-slate-400" style={{ fontSize: 12 }}>
                  Dịch vụ du lịch quản lý bằng trạng thái đơn.
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <h3 className="font-black text-[#091e47]" style={{ margin: "0 0 8px 0", fontSize: 17 }}>
              Xác nhận xóa đơn đặt chỗ?
            </h3>
            <p className="text-xs font-medium text-slate-600" style={{ margin: "0 0 18px 0" }}>
              Bạn có chắc muốn xóa đơn <strong>{deleteTarget.code}</strong> của khách{" "}
              <strong>{deleteTarget.customer}</strong>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700"
                style={{ borderRadius: 9999, border: "none" }}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="cursor-pointer bg-rose-600 px-5 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                style={{ borderRadius: 9999, border: "none" }}
              >
                {deleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
