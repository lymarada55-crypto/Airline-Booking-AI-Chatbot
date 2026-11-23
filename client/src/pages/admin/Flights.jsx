import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AirplaneTakeoff,
  AirplaneTilt,
  CaretLeft,
  CaretRight,
  CheckCircle,
  ClockCountdown,
  DownloadSimple,
  Funnel,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
  WarningCircle,
  X,
  XCircle,
} from "@phosphor-icons/react";
import api from "../../api";

const currencyFmt = new Intl.NumberFormat("vi-VN");

function formatMoneyVnd(val) {
  return `${currencyFmt.format(Math.round(Number(val || 0)))} ₫`;
}

function parseDateSafe(raw) {
  if (!raw) return null;
  const dt = new Date(String(raw).replace(" ", "T"));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatTimeHm(raw) {
  const dt = parseDateSafe(raw);
  if (!dt) return "—";
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}

function formatDateVi(raw) {
  const dt = parseDateSafe(raw);
  if (!dt) return "—";
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(
    2,
    "0"
  )}/${dt.getFullYear()}`;
}

function formatDuration(depRaw, arrRaw) {
  const d1 = parseDateSafe(depRaw);
  const d2 = parseDateSafe(arrRaw);
  if (!d1 || !d2 || d2 <= d1) return "";
  const mins = Math.round((d2 - d1) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}g ${m > 0 ? `${m}p` : ""}`.trim() : `${m}p`;
}

function toDatetimeLocal(raw) {
  if (!raw) return "";
  return String(raw).replace(" ", "T").slice(0, 16);
}

function getFlightStatusUi(status) {
  const s = String(status || "scheduled").toLowerCase();
  const map = {
    scheduled: { label: "Theo lịch", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    check_in: { label: "Đang Check-in", bg: "#e0f2fe", color: "#0284c7", border: "#bae6fd" },
    boarding: { label: "Lên máy bay", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    in_flight: { label: "Đang bay", bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
    arrived: { label: "Đã hạ cánh", bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
    delayed: { label: "Trễ chuyến", bg: "#fff7ed", color: "#d97706", border: "#fed7aa" },
    cancelled: { label: "Đã hủy", bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  };
  return map[s] || map.scheduled;
}

const EMPTY_FORM = {
  flight_number: "",
  departure_airport_id: "",
  arrival_airport_id: "",
  departure_time: "",
  arrival_time: "",
  aircraft_id: "",
  base_price: "",
  available_seats: "180",
  status: "scheduled",
};

export default function Flights() {
  const [urlParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    total_flights: 0,
    today_flights: 0,
    scheduled: 0,
    delayed: 0,
    cancelled: 0,
  });

  const [searchInput, setSearchInput] = useState(() => urlParams.get("search") || "");
  const [search, setSearch] = useState(() => urlParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [notice, setNotice] = useState({ type: "", text: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = urlParams.get("search");
    if (q !== null) {
      setSearchInput(q);
      setSearch(q);
      setPage(1);
    }
  }, [urlParams]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const fetchAirports = useCallback(async () => {
    try {
      const res = await api.get("/airports");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAirports(list);
    } catch (err) {
      console.error("Failed to fetch airports:", err);
    }
  }, []);

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/flights", {
        params: {
          search: search.trim() || undefined,
          status: statusFilter,
          date: dateFilter || undefined,
          per_page: 8,
          page,
        },
      });
      setFlights(res.data?.data || []);
      setLastPage(res.data?.meta?.last_page || 1);
      setTotal(res.data?.meta?.total || 0);
      if (res.data?.summary) setSummary(res.data.summary);
      if (Array.isArray(res.data?.aircrafts)) setAircrafts(res.data.aircrafts);
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách chuyến bay.",
      });
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFilter, page]);

  useEffect(() => {
    fetchAirports();
  }, [fetchAirports]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const openAddModal = () => {
    setEditId(null);
    setFormError("");
    setForm({
      ...EMPTY_FORM,
      aircraft_id: aircrafts[0]?.id ? String(aircrafts[0].id) : "1",
    });
    setModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditId(f.id);
    setFormError("");
    setForm({
      flight_number: f.flight_number || "",
      departure_airport_id: String(f.departure_airport_id || ""),
      arrival_airport_id: String(f.arrival_airport_id || ""),
      departure_time: toDatetimeLocal(f.departure_time),
      arrival_time: toDatetimeLocal(f.arrival_time),
      aircraft_id: String(f.aircraft_id || aircrafts[0]?.id || "1"),
      base_price: String(Math.round(Number(f.base_price || 0))),
      available_seats: String(f.available_seats ?? 180),
      status: f.status || "scheduled",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (form.departure_airport_id && form.departure_airport_id === form.arrival_airport_id) {
      setFormError("Sân bay đến không được trùng với sân bay khởi hành.");
      return;
    }
    if (form.departure_time && form.arrival_time && form.arrival_time <= form.departure_time) {
      setFormError("Giờ hạ cánh phải sau giờ khởi hành.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        flight_number: form.flight_number.trim().toUpperCase(),
        departure_airport_id: Number(form.departure_airport_id),
        arrival_airport_id: Number(form.arrival_airport_id),
        aircraft_id: Number(form.aircraft_id),
        base_price: Number(form.base_price),
        available_seats: Number(form.available_seats),
        status: form.status,
        departure_time: form.departure_time ? `${form.departure_time.replace("T", " ")}:00` : null,
        arrival_time: form.arrival_time ? `${form.arrival_time.replace("T", " ")}:00` : null,
      };

      if (editId) {
        await api.put(`/admin/flights/${editId}`, payload);
        setNotice({ type: "success", text: `Đã cập nhật chuyến bay ${payload.flight_number}.` });
      } else {
        await api.post("/admin/flights", payload);
        setNotice({ type: "success", text: `Đã thêm chuyến bay mới ${payload.flight_number}.` });
      }
      setModalOpen(false);
      fetchFlights();
    } catch (err) {
      const msg =
        Object.values(err.response?.data?.errors || {}).flat()[0] ||
        err.response?.data?.message ||
        "Không thể lưu thông tin chuyến bay.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/flights/${deleteTarget.id}`);
      setNotice({ type: "success", text: `Đã xóa chuyến bay ${deleteTarget.flight_number}.` });
      setDeleteTarget(null);
      fetchFlights();
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể xóa chuyến bay này.",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const header = ["Số hiệu,Chặng bay,Khởi hành,Hạ cánh,Giá cơ bản (VND),Ghế trống,Trạng thái"];
    const rows = flights.map((f) => {
      const dep = f.departure_airport || f.departureAirport || {};
      const arr = f.arrival_airport || f.arrivalAirport || {};
      const st = getFlightStatusUi(f.status);
      return `"${f.flight_number}","${dep.code || "?"} -> ${arr.code || "?"}","${formatDateVi(
        f.departure_time
      )} ${formatTimeHm(f.departure_time)}","${formatDateVi(f.arrival_time)} ${formatTimeHm(
        f.arrival_time
      )}",${Math.round(Number(f.base_price || 0))},${f.available_seats},"${st.label}"`;
    });
    const csv = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "skylink_flights_schedule.csv");
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
      const start = Math.max(2, page - 1);
      const end = Math.min(lastPage - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < lastPage - 2) pages.push("...");
      pages.push(lastPage);
    }
    return pages;
  }, [page, lastPage]);

  const kpiCards = [
    {
      label: "Tổng chuyến bay",
      value: summary.total_flights.toLocaleString("vi-VN"),
      sub: `Hôm nay: ${summary.today_flights} chuyến`,
      icon: AirplaneTilt,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Đang khai thác",
      value: summary.scheduled.toLocaleString("vi-VN"),
      sub: "Đúng giờ & đang bay",
      icon: CheckCircle,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      label: "Trễ chuyến",
      value: summary.delayed.toLocaleString("vi-VN"),
      sub: "Cần theo dõi điều phối",
      icon: ClockCountdown,
      iconBg: "#fff7ed",
      iconColor: "#f59e0b",
    },
    {
      label: "Đã hủy",
      value: summary.cancelled.toLocaleString("vi-VN"),
      sub: "Ngừng khai thác",
      icon: XCircle,
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
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
            <AirplaneTakeoff size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Quản lý Chuyến bay (Flights)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Điều phối lịch bay, đội tàu bay, giá vé cơ bản và trạng thái khai thác toàn mạng bay.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex cursor-pointer items-center gap-2 bg-white/95 font-extrabold text-[#123975] shadow-sm transition hover:bg-blue-50"
            style={{
              borderRadius: 9999,
              border: "1px solid #d5e6fc",
              padding: "9px 16px",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <DownloadSimple size={16} weight="bold" className="text-blue-600" />
            <span>Xuất lịch bay</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
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
            <Plus size={16} weight="bold" />
            <span>Thêm chuyến bay</span>
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
                  style={{ fontSize: 25 }}
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
                Trạng thái khai thác
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Lọc trạng thái chuyến bay"
                className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="scheduled">Theo lịch</option>
                <option value="check_in">Đang Check-in</option>
                <option value="boarding">Lên máy bay</option>
                <option value="in_flight">Đang bay</option>
                <option value="arrived">Đã hạ cánh</option>
                <option value="delayed">Trễ chuyến</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label
                className="font-extrabold text-[#476494]"
                style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
              >
                Ngày khởi hành
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Lọc theo ngày bay"
                className="cursor-pointer bg-[#f4f8ff] px-3 py-1.5 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13, height: 37 }}
              />
            </div>

            {dateFilter && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter("");
                  setPage(1);
                }}
                className="cursor-pointer bg-slate-100 px-3 py-2 font-bold text-slate-600 transition hover:bg-slate-200"
                style={{ borderRadius: 9999, border: "none", fontSize: 12 }}
              >
                Xóa ngày
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 235 }}
            >
              <input
                type="text"
                placeholder="Tìm số hiệu, mã sân bay, thành phố..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                style={{ fontSize: 13 }}
              />
              <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
            </div>

            <button
              type="button"
              onClick={fetchFlights}
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

        {/* Flights Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                style={{ fontSize: 11.5 }}
              >
                <th className="px-3 py-3">Số hiệu / Tàu bay</th>
                <th className="px-3 py-3">Chặng bay</th>
                <th className="px-3 py-3">Lịch trình</th>
                <th className="px-3 py-3">Giá cơ bản</th>
                <th className="px-3 py-3">Ghế trống</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-3 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Đang tải lịch chuyến bay...
                  </td>
                </tr>
              ) : flights.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Không tìm thấy chuyến bay nào phù hợp.
                  </td>
                </tr>
              ) : (
                flights.map((f) => {
                  const dep = f.departure_airport || f.departureAirport || {};
                  const arr = f.arrival_airport || f.arrivalAirport || {};
                  const stUi = getFlightStatusUi(f.status);
                  const dur = formatDuration(f.departure_time, f.arrival_time);

                  return (
                    <tr
                      key={f.id}
                      className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                    >
                      <td className="px-3 py-3">
                        <div className="font-mono font-black text-[#091e47]" style={{ fontSize: 13.5 }}>
                          {f.flight_number}
                        </div>
                        <div
                          className="truncate font-medium text-slate-400"
                          style={{ maxWidth: 135, fontSize: 11.5 }}
                          title={f.aircraft?.model}
                        >
                          {f.aircraft?.model || `Tàu bay #${f.aircraft_id}`}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-black text-[#091e47]" style={{ fontSize: 13.5 }}>
                          {dep.code || "?"} <span className="text-blue-500">→</span> {arr.code || "?"}
                        </div>
                        <div
                          className="truncate font-medium text-slate-400"
                          style={{ maxWidth: 185, fontSize: 11.5 }}
                          title={`${dep.city || ""} → ${arr.city || ""}`}
                        >
                          {dep.city || dep.name || "—"} → {arr.city || arr.name || "—"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="font-bold text-[#091e47]" style={{ fontSize: 13 }}>
                          {formatTimeHm(f.departure_time)} → {formatTimeHm(f.arrival_time)}
                        </div>
                        <div className="font-medium text-slate-400" style={{ fontSize: 11.5 }}>
                          {formatDateVi(f.departure_time)}
                          {dur ? ` • ${dur}` : ""}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 font-black text-[#091e47]" style={{ fontSize: 13 }}>
                        {formatMoneyVnd(f.base_price)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="font-bold text-[#091e47]" style={{ fontSize: 13 }}>
                          {f.available_seats} ghế
                        </div>
                        {f.bookings_count > 0 && (
                          <div className="font-semibold text-blue-600" style={{ fontSize: 11 }}>
                            {f.bookings_count} đơn đặt
                          </div>
                        )}
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
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(f)}
                            title="Chỉnh sửa chuyến bay"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f4f8ff] text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            style={{ borderRadius: 9999, border: "1px solid #cde2fd" }}
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(f)}
                            title="Xóa chuyến bay"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                            style={{ borderRadius: 9999, border: "1px solid #fecaca" }}
                          >
                            <Trash size={15} weight="bold" />
                          </button>
                        </div>
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
            <strong>{total.toLocaleString("vi-VN")}</strong> chuyến bay
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
                <span key={`f-dots-${idx}`} className="px-1 text-xs font-bold text-slate-400">
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

      {/* ADD / EDIT FLIGHT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  Điều phối khai thác bay
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  {editId ? `Chỉnh sửa chuyến bay ${form.flight_number}` : "Thêm chuyến bay mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {formError && (
              <div
                className="mb-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 font-bold text-rose-700"
                style={{ fontSize: 12.5 }}
              >
                <WarningCircle size={17} weight="fill" className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5" style={{ fontSize: 13 }}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Số hiệu chuyến bay *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.flight_number}
                    onChange={(e) => setForm({ ...form, flight_number: e.target.value.toUpperCase() })}
                    placeholder="VD: VN258, SL886..."
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-mono font-bold text-[#091e47] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Tàu bay khai thác *
                  </label>
                  <select
                    required
                    value={form.aircraft_id}
                    onChange={(e) => setForm({ ...form, aircraft_id: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-[#091e47] outline-none"
                  >
                    {aircrafts.length > 0 ? (
                      aircrafts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.tail_number ? `${a.tail_number} — ` : ""}
                          {a.model}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">Boeing 787-9 Dreamliner</option>
                        <option value="2">Airbus A320neo</option>
                        <option value="3">Airbus A350-900</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Sân bay khởi hành *
                  </label>
                  <select
                    required
                    value={form.departure_airport_id}
                    onChange={(e) => setForm({ ...form, departure_airport_id: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                  >
                    <option value="">Chọn sân bay đi...</option>
                    {airports.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.city || a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Sân bay hạ cánh *
                  </label>
                  <select
                    required
                    value={form.arrival_airport_id}
                    onChange={(e) => setForm({ ...form, arrival_airport_id: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                  >
                    <option value="">Chọn sân bay đến...</option>
                    {airports.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.city || a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Giờ khởi hành *
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={form.departure_time}
                    onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Giờ hạ cánh *
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={form.arrival_time}
                    onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Giá vé cơ bản (VNĐ) *
                  </label>
                  <input
                    required
                    type="number"
                    min="100000"
                    step="10000"
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                    placeholder="1500000"
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Số ghế mở bán *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="500"
                    value={form.available_seats}
                    onChange={(e) => setForm({ ...form, available_seats: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Trạng thái *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-[#091e47] outline-none"
                  >
                    <option value="scheduled">Theo lịch</option>
                    <option value="check_in">Đang Check-in</option>
                    <option value="boarding">Lên máy bay</option>
                    <option value="in_flight">Đang bay</option>
                    <option value="arrived">Đã hạ cánh</option>
                    <option value="delayed">Trễ chuyến</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer bg-slate-100 px-4 py-2 font-extrabold text-slate-700"
                  style={{ borderRadius: 9999, border: "none", fontSize: 13 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer px-5 py-2 font-extrabold text-white disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                    border: "none",
                    fontSize: 13,
                  }}
                >
                  {saving ? "Đang lưu..." : editId ? "Lưu thay đổi" : "Tạo chuyến bay"}
                </button>
              </div>
            </form>
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
              Xác nhận xóa chuyến bay?
            </h3>
            <p className="font-medium text-slate-600" style={{ margin: "0 0 18px 0", fontSize: 13 }}>
              Bạn có chắc muốn xóa chuyến bay <strong>{deleteTarget.flight_number}</strong>? Nếu chuyến
              bay đã có hành khách thanh toán, hệ thống sẽ tự động chặn để bảo toàn vé.
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
                {deleting ? "Đang xóa..." : "Xóa chuyến bay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
