import { useEffect, useMemo, useState } from "react";
import {
  AirplaneTilt,
  ArrowClockwise,
  CheckCircle,
  CreditCard,
  CurrencyCircleDollar,
  Database,
  DownloadSimple,
  Eye,
  FileCsv,
  FileText,
  MagnifyingGlass,
  Printer,
  SuitcaseRolling,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import api from "../../api";

const currencyFmt = new Intl.NumberFormat("vi-VN");

function formatMoneyVnd(val) {
  return `${currencyFmt.format(Math.round(Number(val || 0)))} ₫`;
}

function formatCompactVnd(val) {
  const n = Number(val || 0);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} Tỷ ₫`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Tr ₫`;
  return formatMoneyVnd(n);
}

function formatDateVi(raw) {
  if (!raw) return "—";
  const dt = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return String(raw).slice(0, 10);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

function matchesPeriod(dateStr, period) {
  if (period === "all") return true;
  if (!dateStr) return false;
  const ts = new Date(String(dateStr).replace(" ", "T")).getTime();
  if (Number.isNaN(ts)) return false;
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  if (period === "today") return ts >= startToday;
  if (period === "7d") return ts >= now.getTime() - 7 * 86400000;
  if (period === "30d") return ts >= now.getTime() - 30 * 86400000;
  if (period === "month") return ts >= startMonth;
  return true;
}

function escapeCsvCell(val) {
  const s = String(val ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

function getCategoryUi(cat) {
  const map = {
    "Tài chính": { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    "Vận hành bay": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    "Dịch vụ du lịch": { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
    "Khách hàng": { bg: "#fff7ed", color: "#d97706", border: "#fed7aa" },
  };
  return map[cat] || map["Vận hành bay"];
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all"); // all | today | 7d | 30d | month
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [previewReport, setPreviewReport] = useState(null);

  const [rawData, setRawData] = useState({
    bookings: [],
    payments: [],
    travel: [],
    flights: [],
    users: [],
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bRes, pRes, tRes, fRes, uRes] = await Promise.allSettled([
        api.get("/admin/bookings"),
        api.get("/admin/payments", { params: { per_page: 50 } }),
        api.get("/admin/travel-service-reservations", { params: { per_page: 200 } }),
        api.get("/admin/flights", { params: { per_page: 50 } }),
        api.get("/admin/users", { params: { per_page: 100 } }),
      ]);

      setRawData({
        bookings:
          bRes.status === "fulfilled" && Array.isArray(bRes.value.data?.data)
            ? bRes.value.data.data
            : [],
        payments:
          pRes.status === "fulfilled" && Array.isArray(pRes.value.data?.data)
            ? pRes.value.data.data
            : [],
        travel:
          tRes.status === "fulfilled"
            ? tRes.value.data?.data?.data || tRes.value.data?.data || []
            : [],
        flights:
          fRes.status === "fulfilled" && Array.isArray(fRes.value.data?.data)
            ? fRes.value.data.data
            : [],
        users:
          uRes.status === "fulfilled"
            ? uRes.value.data?.data?.data || uRes.value.data?.data || []
            : [],
      });
    } catch (err) {
      setNotice({ type: "error", text: "Không thể tổng hợp dữ liệu báo cáo." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const periodFiltered = useMemo(() => {
    const bookings = rawData.bookings.filter((b) => matchesPeriod(b.created_at, period));
    const payments = rawData.payments.filter((p) => matchesPeriod(p.paid_at, period));
    const travel = rawData.travel.filter((t) => matchesPeriod(t.created_at, period));
    const flights = rawData.flights.filter((f) => matchesPeriod(f.departure_time, period));
    const users = rawData.users.filter((u) => matchesPeriod(u.created_at, period));
    return { bookings, payments, travel, flights, users };
  }, [rawData, period]);

  const periodRevenue = useMemo(() => {
    const fRev = periodFiltered.bookings
      .filter((b) => String(b.status || "").toLowerCase() === "paid")
      .reduce((acc, b) => acc + Number(b.total_amount ?? b.total_price ?? 0), 0);
    const tRev = periodFiltered.travel
      .filter((t) => String(t.payment_status || "").toLowerCase() === "paid")
      .reduce((acc, t) => acc + Number(t.total_price ?? 0), 0);
    return fRev + tRev;
  }, [periodFiltered]);

  const reportModules = useMemo(() => {
    const paidBookings = periodFiltered.bookings.filter(
      (b) => String(b.status || "").toLowerCase() === "paid"
    );

    return [
      {
        id: "financial",
        title: "Báo cáo Doanh thu & Lợi nhuận Chặng bay",
        description: "Tổng hợp doanh thu vé đã thanh toán, chi phí khai thác (72%) và lợi nhuận ròng.",
        category: "Tài chính",
        icon: CurrencyCircleDollar,
        count: paidBookings.length,
        headers: ["Mã PNR", "Chặng bay", "Số hiệu", "Doanh thu (VND)", "Chi phí 72%", "Lợi nhuận ròng", "Ngày đặt"],
        rows: paidBookings.map((b) => {
          const dep = b.flight?.departure_airport?.code || b.flight?.departureAirport?.code || "HAN";
          const arr = b.flight?.arrival_airport?.code || b.flight?.arrivalAirport?.code || "SGN";
          const rev = Math.round(Number(b.total_amount ?? b.total_price ?? 0));
          const cost = Math.round(rev * 0.72);
          return [
            b.pnr_code || `BK${b.id}`,
            `${dep} → ${arr}`,
            b.flight?.flight_number || "—",
            formatMoneyVnd(rev),
            formatMoneyVnd(cost),
            formatMoneyVnd(rev - cost),
            formatDateVi(b.created_at),
          ];
        }),
      },
      {
        id: "payment_audit",
        title: "Báo cáo Đối soát Giao dịch Thanh toán",
        description: "Nhật ký giao dịch VNPay, MoMo, mã đối soát, PNR và trạng thái thu tiền.",
        category: "Tài chính",
        icon: CreditCard,
        count: periodFiltered.payments.length,
        headers: ["Mã giao dịch", "PNR", "Chặng bay", "Khách hàng", "Số tiền (VND)", "Cổng TT", "Trạng thái"],
        rows: periodFiltered.payments.map((p) => [
          p.transaction_id,
          p.pnr_code || `BK${p.booking_id}`,
          p.route || "—",
          p.customer_name || "Khách hàng",
          formatMoneyVnd(p.amount),
          String(p.payment_method || "VNPAY").toUpperCase(),
          p.status === "success" ? "Thành công" : p.status === "pending" ? "Đang chờ" : "Thất bại",
        ]),
      },
      {
        id: "bookings_ops",
        title: "Báo cáo Đặt chỗ & Hành khách",
        description: "Danh sách đặt vé theo PNR, thông tin khách hàng, số lượng vé và trạng thái đơn.",
        category: "Vận hành bay",
        icon: FileText,
        count: periodFiltered.bookings.length,
        headers: ["Mã PNR", "Khách đặt", "Email", "Chặng bay", "Số vé", "Tổng tiền", "Trạng thái"],
        rows: periodFiltered.bookings.map((b) => {
          const dep = b.flight?.departure_airport?.code || b.flight?.departureAirport?.code || "HAN";
          const arr = b.flight?.arrival_airport?.code || b.flight?.arrivalAirport?.code || "SGN";
          const st =
            b.status === "paid" ? "Đã thanh toán" : b.status === "cancelled" ? "Đã hủy" : "Chờ xác nhận";
          return [
            b.pnr_code || `BK${b.id}`,
            b.user?.name || b.tickets?.[0]?.passenger_name || "Khách hàng",
            b.user?.email || "—",
            `${dep} → ${arr}`,
            b.tickets?.length || 1,
            formatMoneyVnd(b.total_amount ?? b.total_price ?? 0),
            st,
          ];
        }),
      },
      {
        id: "travel_services",
        title: "Báo cáo Dịch vụ Du lịch (KS / Xe / Tour)",
        description: "Thống kê đơn đặt khách sạn, thuê xe, trải nghiệm kèm liên kết PNR và thanh toán.",
        category: "Dịch vụ du lịch",
        icon: SuitcaseRolling,
        count: periodFiltered.travel.length,
        headers: ["Mã đơn", "Dịch vụ", "Thành phố", "Khách hàng", "Ngày đi", "Tổng tiền", "Thanh toán"],
        rows: periodFiltered.travel.map((t) => [
          t.reference_code || `TS${t.id}`,
          t.product?.name || "Dịch vụ",
          t.product?.city || "—",
          t.guest_name || t.user?.name || "Khách hàng",
          formatDateVi(t.start_date),
          formatMoneyVnd(t.total_price),
          t.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán",
        ]),
      },
      {
        id: "flights_schedule",
        title: "Báo cáo Lịch khai thác Chuyến bay",
        description: "Lịch trình chặng bay, đội tàu bay, số ghế mở bán và trạng thái khai thác.",
        category: "Vận hành bay",
        icon: AirplaneTilt,
        count: periodFiltered.flights.length,
        headers: ["Số hiệu", "Chặng bay", "Tàu bay", "Ngày bay", "Giá cơ bản", "Ghế trống", "Trạng thái"],
        rows: periodFiltered.flights.map((f) => {
          const dep = f.departure_airport?.code || f.departureAirport?.code || "?";
          const arr = f.arrival_airport?.code || f.arrivalAirport?.code || "?";
          return [
            f.flight_number,
            `${dep} → ${arr}`,
            f.aircraft?.model || `#${f.aircraft_id}`,
            formatDateVi(f.departure_time),
            formatMoneyVnd(f.base_price),
            f.available_seats,
            f.status,
          ];
        }),
      },
      {
        id: "users_vip",
        title: "Báo cáo Khách hàng & Hội viên SkyClub",
        description: "Danh sách tài khoản người dùng, phân hạng hội viên VIP và ngày tham gia.",
        category: "Khách hàng",
        icon: UsersThree,
        count: periodFiltered.users.length,
        headers: ["ID", "Họ tên", "Email", "Hạng hội viên", "Vai trò", "Ngày tạo"],
        rows: periodFiltered.users.map((u) => [
          u.id,
          u.name,
          u.email,
          u.membership_tier || (u.is_vip ? "VIP" : "Standard"),
          u.roles?.some((r) => r.name === "admin") ? "Quản trị viên" : "Khách hàng",
          formatDateVi(u.created_at),
        ]),
      },
    ];
  }, [periodFiltered]);

  const visibleReports = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return reportModules.filter((r) => {
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (!kw) return true;
      return r.title.toLowerCase().includes(kw) || r.description.toLowerCase().includes(kw);
    });
  }, [reportModules, categoryFilter, search]);

  const exportCsv = (report) => {
    const headerLine = report.headers.map(escapeCsvCell).join(",");
    const dataLines = report.rows.map((r) => r.map(escapeCsvCell).join(","));
    const csv = "data:text/csv;charset=utf-8,\uFEFF" + [headerLine, ...dataLines].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `skylink_${report.id}_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice({
      type: "success",
      text: `Đã xuất file CSV "${report.title}" (${report.count} bản ghi).`,
    });
  };

  const exportJson = (report) => {
    const jsonRows = report.rows.map((r) => {
      const obj = {};
      report.headers.forEach((h, idx) => {
        obj[h] = r[idx];
      });
      return obj;
    });
    const blob = new Blob(
      [
        JSON.stringify(
          {
            report: report.title,
            period,
            exported_at: new Date().toISOString(),
            total_records: report.count,
            records: jsonRows,
          },
          null,
          2
        ),
      ],
      { type: "application/json;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skylink_${report.id}_${period}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice({
      type: "success",
      text: `Đã xuất file JSON "${report.title}" (${report.count} bản ghi).`,
    });
  };

  const totalRecordsReady =
    periodFiltered.bookings.length +
    periodFiltered.payments.length +
    periodFiltered.travel.length +
    periodFiltered.flights.length +
    periodFiltered.users.length;

  const kpiCards = [
    {
      label: "Mẫu báo cáo",
      value: `${reportModules.length} phân hệ`,
      sub: "100% dữ liệu thật MySQL",
      icon: FileText,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Bản ghi sẵn sàng",
      value: totalRecordsReady.toLocaleString("vi-VN"),
      sub: "Theo kỳ báo cáo đã chọn",
      icon: Database,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
    },
    {
      label: "Doanh thu kỳ chọn",
      value: formatCompactVnd(periodRevenue),
      sub: "Vé máy bay & Dịch vụ",
      icon: CurrencyCircleDollar,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      label: "Định dạng xuất",
      value: "CSV / JSON",
      sub: "Chuẩn UTF-8 tiếng Việt",
      icon: CheckCircle,
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
            <FileText size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Báo cáo Tổng hợp (Reports)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Trích xuất, xem trước và đối soát báo cáo tài chính, vận hành bay &amp; khách hàng.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAllData}
            className="inline-flex cursor-pointer items-center gap-1.5 bg-white/95 font-extrabold text-[#123975] shadow-sm transition hover:bg-blue-50"
            style={{
              borderRadius: 9999,
              border: "1px solid #d5e6fc",
              padding: "9px 16px",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <ArrowClockwise size={15} weight="bold" className={loading ? "animate-spin text-blue-600" : "text-blue-600"} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex cursor-pointer items-center gap-1.5 font-extrabold text-white shadow-md transition hover:brightness-105"
            style={{
              background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
              borderRadius: 9999,
              border: "none",
              padding: "9px 18px",
              fontSize: 13,
              whiteSpace: "nowrap",
              boxShadow: "0 8px 20px rgba(13, 97, 225, 0.28)",
            }}
          >
            <Printer size={16} weight="bold" />
            <span>In trang báo cáo</span>
          </button>
        </div>
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

      {/* 2. 4 KPI CARDS */}
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
                  style={{ fontSize: 22 }}
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
                Kỳ báo cáo
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
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

            <div>
              <label
                className="font-extrabold text-[#476494]"
                style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
              >
                Phân hệ
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả phân hệ</option>
                <option value="Tài chính">Tài chính</option>
                <option value="Vận hành bay">Vận hành bay</option>
                <option value="Dịch vụ du lịch">Dịch vụ du lịch</option>
                <option value="Khách hàng">Khách hàng</option>
              </select>
            </div>
          </div>

          <div
            className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
            style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 235 }}
          >
            <input
              type="text"
              placeholder="Tìm tên báo cáo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
              style={{ fontSize: 13 }}
            />
            <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                style={{ fontSize: 11.5 }}
              >
                <th className="px-3.5 py-3">Báo cáo</th>
                <th className="px-3 py-3">Phân hệ</th>
                <th className="px-3 py-3">Bản ghi</th>
                <th className="px-3.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleReports.map((r) => {
                const Icon = r.icon;
                const catUi = getCategoryUi(r.category);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                  >
                    <td className="px-3.5 py-3.5">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#ebf3ff] text-blue-600"
                          style={{ borderRadius: 12 }}
                        >
                          <Icon size={20} weight="duotone" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#091e47]" style={{ fontSize: 13.5 }}>
                            {r.title}
                          </div>
                          <div className="mt-0.5 font-medium text-slate-400" style={{ fontSize: 12 }}>
                            {r.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span
                        className="inline-flex items-center px-2.5 py-1 font-bold"
                        style={{
                          background: catUi.bg,
                          color: catUi.color,
                          border: `1px solid ${catUi.border}`,
                          borderRadius: 9999,
                          fontSize: 11.5,
                        }}
                      >
                        {r.category}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 font-black text-[#091e47]" style={{ fontSize: 13 }}>
                      {loading ? "..." : `${r.count.toLocaleString("vi-VN")} dòng`}
                    </td>

                    <td className="whitespace-nowrap px-3.5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewReport(r)}
                          className="inline-flex cursor-pointer items-center gap-1 bg-white font-extrabold text-[#123975] transition hover:bg-blue-50"
                          style={{
                            borderRadius: 9999,
                            border: "1px solid #d5e6fc",
                            padding: "6px 12px",
                            fontSize: 12,
                          }}
                        >
                          <Eye size={14} weight="bold" className="text-blue-600" />
                          <span>Xem trước</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => exportCsv(r)}
                          className="inline-flex cursor-pointer items-center gap-1 font-extrabold text-white transition hover:brightness-105"
                          style={{
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            borderRadius: 9999,
                            border: "none",
                            padding: "6px 13px",
                            fontSize: 12,
                          }}
                        >
                          <FileCsv size={14} weight="bold" />
                          <span>CSV</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => exportJson(r)}
                          title="Tải định dạng JSON"
                          className="inline-flex cursor-pointer items-center bg-[#f4f8ff] font-extrabold text-[#163d7a] transition hover:bg-blue-100"
                          style={{
                            borderRadius: 9999,
                            border: "1px solid #cde2fd",
                            padding: "6px 10px",
                            fontSize: 11.5,
                          }}
                        >
                          JSON
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  Xem trước dữ liệu báo cáo ({previewReport.count} bản ghi)
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  {previewReport.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {previewReport.rows.length === 0 ? (
                <p className="py-10 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                  Không có bản ghi nào trong kỳ báo cáo đã chọn.
                </p>
              ) : (
                <table className="w-full border-collapse text-left" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#f8fbff] font-extrabold text-[#476494]">
                      {previewReport.headers.map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewReport.rows.slice(0, 12).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-[#f7faff]">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="whitespace-nowrap px-3 py-2 font-semibold text-[#091e47]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {previewReport.rows.length > 12 && (
                <p className="mt-3 text-center font-semibold text-slate-400" style={{ fontSize: 12 }}>
                  Đang hiển thị 12 / {previewReport.rows.length} dòng đầu tiên. Tải file CSV hoặc JSON để xem toàn bộ.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-6 py-3.5">
              <button
                type="button"
                onClick={() => exportJson(previewReport)}
                className="inline-flex cursor-pointer items-center gap-1.5 bg-[#f4f8ff] px-4 py-2 text-xs font-extrabold text-[#123975]"
                style={{ borderRadius: 9999, border: "1px solid #cde2fd" }}
              >
                <DownloadSimple size={14} weight="bold" />
                Tải JSON
              </button>
              <button
                type="button"
                onClick={() => exportCsv(previewReport)}
                className="inline-flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                }}
              >
                <FileCsv size={14} weight="bold" />
                Tải CSV (Excel)
              </button>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="cursor-pointer bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700"
                style={{ borderRadius: 9999, border: "none" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
