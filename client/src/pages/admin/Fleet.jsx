import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Airplane,
  Armchair,
  CheckCircle,
  DownloadSimple,
  Funnel,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
  WarningCircle,
  Wrench,
  X,
} from "@phosphor-icons/react";
import api from "../../api";

function getAircraftStatusUi(status) {
  const s = Number(status);
  if (s === 1) {
    return { label: "Đang khai thác", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
  }
  if (s === 2) {
    return { label: "Đang bảo dưỡng", bg: "#fff7ed", color: "#d97706", border: "#fed7aa" };
  }
  return { label: "Ngừng bay", bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
}

const EMPTY_FORM = {
  tail_number: "",
  model: "Airbus A321neo",
  status: "1",
  business_rows: "4",
  economy_rows: "20",
};

const MODEL_PRESETS = [
  "Boeing 787-9 Dreamliner",
  "Airbus A350-900 XWB",
  "Airbus A321neo",
  "Airbus A320neo",
  "Embraer E190",
];

export default function Fleet() {
  const [urlParams] = useSearchParams();
  const [aircrafts, setAircrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_aircrafts: 0,
    active_count: 0,
    maintenance_count: 0,
    grounded_count: 0,
    total_seats: 0,
    total_business_seats: 0,
    total_economy_seats: 0,
  });

  const [search, setSearch] = useState(() => urlParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState({ type: "", text: "" });

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Seat map modal
  const [seatMapAircraft, setSeatMapAircraft] = useState(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = urlParams.get("search");
    if (q !== null) setSearch(q);
  }, [urlParams]);

  const fetchAircrafts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/aircrafts");
      setAircrafts(res.data?.data || []);
      if (res.data?.summary) setSummary(res.data.summary);
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách đội tàu bay.",
      });
      setAircrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircrafts();
  }, []);

  const filteredAircrafts = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return aircrafts.filter((a) => {
      if (statusFilter !== "all" && String(a.status) !== statusFilter) return false;
      if (!kw) return true;
      return (
        (a.tail_number || "").toLowerCase().includes(kw) ||
        (a.model || "").toLowerCase().includes(kw)
      );
    });
  }, [aircrafts, search, statusFilter]);

  const openAddModal = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (aircraft) => {
    setEditId(aircraft.id);
    setForm({
      tail_number: aircraft.tail_number || "",
      model: aircraft.model || "",
      status: String(aircraft.status ?? 1),
      business_rows: "4",
      economy_rows: "20",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openSeatMap = async (aircraft) => {
    setSeatMapLoading(true);
    setSeatMapAircraft({ ...aircraft, seats: [] });
    try {
      const res = await api.get(`/admin/aircrafts/${aircraft.id}`);
      setSeatMapAircraft(res.data?.data || aircraft);
    } catch {
      setNotice({ type: "error", text: "Không thể tải sơ đồ ghế của tàu bay." });
      setSeatMapAircraft(null);
    } finally {
      setSeatMapLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = {
        tail_number: form.tail_number.trim().toUpperCase(),
        model: form.model.trim(),
        status: Number(form.status),
      };
      if (!editId) {
        payload.business_rows = Number(form.business_rows || 0);
        payload.economy_rows = Number(form.economy_rows || 20);
        const res = await api.post("/admin/aircrafts", payload);
        setNotice({ type: "success", text: res.data?.message || "Đã thêm tàu bay mới thành công." });
      } else {
        const res = await api.put(`/admin/aircrafts/${editId}`, payload);
        setNotice({ type: "success", text: res.data?.message || "Đã cập nhật tàu bay thành công." });
      }
      setModalOpen(false);
      fetchAircrafts();
    } catch (err) {
      const msg =
        Object.values(err.response?.data?.errors || {}).flat()[0] ||
        err.response?.data?.message ||
        "Không thể lưu thông tin tàu bay.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/aircrafts/${deleteTarget.id}`);
      setNotice({ type: "success", text: res.data?.message || "Đã xóa tàu bay khỏi đội bay." });
      setDeleteTarget(null);
      fetchAircrafts();
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể xóa tàu bay này.",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const header = ["ID,Số đăng bạ,Dòng tàu bay,Tổng ghế,Thương gia,Phổ thông,Chuyến khai thác,Trạng thái"];
    const rows = filteredAircrafts.map((a) => {
      const st = getAircraftStatusUi(a.status);
      return `${a.id},"${a.tail_number}","${a.model}",${a.seats_count || 0},${
        a.business_seats_count || 0
      },${a.economy_seats_count || 0},${a.flights_count || 0},"${st.label}"`;
    });
    const csv = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "skylink_fleet_aircrafts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group seats by row number for visual cabin map
  const groupedSeatRows = useMemo(() => {
    const seats = seatMapAircraft?.seats || [];
    const map = new Map();
    for (const s of seats) {
      const match = String(s.seat_number || "").match(/^(\d+)([A-Z]+)$/i);
      const rowNum = match ? Number(match[1]) : 0;
      const col = match ? match[2].toUpperCase() : s.seat_number;
      if (!map.has(rowNum)) map.set(rowNum, []);
      map.get(rowNum).push({ ...s, rowNum, col });
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rowNum, rowSeats]) => ({
        rowNum,
        seatClass: rowSeats[0]?.seat_class || "economy",
        seats: rowSeats.sort((x, y) => x.col.localeCompare(y.col)),
      }));
  }, [seatMapAircraft]);

  const previewTotalSeats =
    Number(form.business_rows || 0) * 4 + Number(form.economy_rows || 0) * 6;

  const kpiCards = [
    {
      label: "Tổng đội tàu bay",
      value: summary.total_aircrafts.toLocaleString("vi-VN"),
      sub: "Tàu bay đăng ký SkyLink",
      icon: Airplane,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Đang khai thác",
      value: summary.active_count.toLocaleString("vi-VN"),
      sub: "Sẵn sàng cất cánh",
      icon: CheckCircle,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      label: "Đang bảo dưỡng",
      value: summary.maintenance_count.toLocaleString("vi-VN"),
      sub: `${summary.grounded_count} tàu bay ngừng bay`,
      icon: Wrench,
      iconBg: "#fff7ed",
      iconColor: "#f59e0b",
    },
    {
      label: "Tổng ghế đội bay",
      value: summary.total_seats.toLocaleString("vi-VN"),
      sub: `${summary.total_business_seats} TG • ${summary.total_economy_seats} PT`,
      icon: Armchair,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
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
            <Armchair size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Quản lý Đội tàu bay (Fleet)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Theo dõi số đăng bạ, dòng máy bay, sơ đồ ghế khoang Thương gia / Phổ thông và lịch bảo dưỡng.
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
            <span>Xuất danh sách</span>
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
            <span>Thêm tàu bay</span>
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
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 p-4">
          <div>
            <label
              className="font-extrabold text-[#476494]"
              style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
            >
              Trạng thái kỹ thuật
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer bg-[#f4f8ff] px-3.5 py-2 font-bold text-[#123975] outline-none"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
            >
              <option value="all">Tất cả trạng thái ({summary.total_aircrafts})</option>
              <option value="1">Đang khai thác ({summary.active_count})</option>
              <option value="2">Đang bảo dưỡng ({summary.maintenance_count})</option>
              <option value="0">Ngừng bay ({summary.grounded_count})</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 245 }}
            >
              <input
                type="text"
                placeholder="Tìm số đăng bạ, dòng máy bay..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                style={{ fontSize: 13 }}
              />
              <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
            </div>

            <button
              type="button"
              onClick={fetchAircrafts}
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

        {/* Fleet Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                style={{ fontSize: 11.5 }}
              >
                <th className="px-3.5 py-3">Số đăng bạ</th>
                <th className="px-3.5 py-3">Dòng tàu bay</th>
                <th className="px-3.5 py-3">Cấu hình ghế</th>
                <th className="px-3.5 py-3">Chuyến bay</th>
                <th className="px-3.5 py-3">Trạng thái</th>
                <th className="px-3.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Đang tải danh sách đội tàu bay...
                  </td>
                </tr>
              ) : filteredAircrafts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Không tìm thấy tàu bay nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredAircrafts.map((a) => {
                  const stUi = getAircraftStatusUi(a.status);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                    >
                      <td className="whitespace-nowrap px-3.5 py-3.5">
                        <span
                          className="inline-flex items-center font-mono font-black text-white shadow-xs"
                          style={{
                            background: "linear-gradient(135deg, #092c7a 0%, #0b5ed7 100%)",
                            borderRadius: 10,
                            padding: "5px 11px",
                            fontSize: 12.5,
                            letterSpacing: "0.05em",
                          }}
                        >
                          {a.tail_number}
                        </span>
                      </td>

                      <td className="px-3.5 py-3.5">
                        <div className="font-bold text-[#091e47]" style={{ fontSize: 13.5 }}>
                          {a.model}
                        </div>
                        <div className="font-medium text-slate-400" style={{ fontSize: 11.5 }}>
                          Tàu bay #{a.id}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3.5 py-3.5">
                        <div className="font-black text-[#091e47]" style={{ fontSize: 13 }}>
                          {a.seats_count || 0} ghế
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5" style={{ fontSize: 11 }}>
                          <span
                            className="px-2 py-0.5 font-bold text-amber-700"
                            style={{ background: "#fef3c7", borderRadius: 9999 }}
                          >
                            {a.business_seats_count || 0} Thương gia
                          </span>
                          <span
                            className="px-2 py-0.5 font-bold text-blue-700"
                            style={{ background: "#dbeafe", borderRadius: 9999 }}
                          >
                            {a.economy_seats_count || 0} Phổ thông
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3.5 py-3.5 font-bold text-[#163d7a]" style={{ fontSize: 13 }}>
                        {(a.flights_count || 0).toLocaleString("vi-VN")} chuyến
                      </td>

                      <td className="whitespace-nowrap px-3.5 py-3.5">
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

                      <td className="whitespace-nowrap px-3.5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openSeatMap(a)}
                            className="inline-flex cursor-pointer items-center gap-1 bg-white font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                            style={{
                              borderRadius: 9999,
                              border: "1px solid #cde2fd",
                              padding: "5px 11px",
                              fontSize: 12,
                            }}
                          >
                            <Armchair size={14} weight="duotone" />
                            <span>Sơ đồ ghế</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(a)}
                            title="Chỉnh sửa tàu bay"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f4f8ff] text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            style={{ borderRadius: 9999, border: "1px solid #cde2fd" }}
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(a)}
                            title="Xóa tàu bay"
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
      </div>

      {/* SEAT MAP MODAL */}
      {seatMapAircraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  Cấu hình khoang hành khách • {seatMapAircraft.tail_number}
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  Sơ đồ ghế — {seatMapAircraft.model} ({seatMapAircraft.seats_count || seatMapAircraft.seats?.length || 0} ghế)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSeatMapAircraft(null)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-[#f8fbff] px-6 py-2.5 text-xs font-bold text-[#163d7a]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-amber-100 border border-amber-400" />
                Hạng Thương gia (Business)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-blue-50 border border-blue-300" />
                Hạng Phổ thông (Economy)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {seatMapLoading ? (
                <p className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                  Đang tải sơ đồ ghế...
                </p>
              ) : groupedSeatRows.length === 0 ? (
                <p className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                  Tàu bay này chưa có cấu hình ghế trong hệ thống.
                </p>
              ) : (
                <div className="mx-auto max-w-md space-y-2">
                  {groupedSeatRows.map((row) => {
                    const mid = Math.ceil(row.seats.length / 2);
                    const leftSeats = row.seats.slice(0, mid);
                    const rightSeats = row.seats.slice(mid);
                    const clsLower = String(row.seatClass || "").toLowerCase();
                    const isBiz =
                      ["business", "vip", "first"].includes(clsLower) ||
                      (!["economy", "standard"].includes(clsLower) && row.rowNum > 0 && row.rowNum <= 5);

                    return (
                      <div key={row.rowNum} className="flex items-center justify-center gap-4">
                        <div className="flex gap-1.5">
                          {leftSeats.map((s) => (
                            <span
                              key={s.id}
                              className="flex h-8 w-10 items-center justify-center rounded-lg font-mono text-xs font-extrabold"
                              style={{
                                background: isBiz ? "#fef3c7" : "#eff6ff",
                                color: isBiz ? "#b45309" : "#1d4ed8",
                                border: isBiz ? "1px solid #fbbf24" : "1px solid #93c5fd",
                              }}
                            >
                              {s.seat_number}
                            </span>
                          ))}
                        </div>
                        <span className="w-6 text-center text-[11px] font-extrabold text-slate-400">
                          {row.rowNum}
                        </span>
                        <div className="flex gap-1.5">
                          {rightSeats.map((s) => (
                            <span
                              key={s.id}
                              className="flex h-8 w-10 items-center justify-center rounded-lg font-mono text-xs font-extrabold"
                              style={{
                                background: isBiz ? "#fef3c7" : "#eff6ff",
                                color: isBiz ? "#b45309" : "#1d4ed8",
                                border: isBiz ? "1px solid #fbbf24" : "1px solid #93c5fd",
                              }}
                            >
                              {s.seat_number}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setSeatMapAircraft(null)}
                className="cursor-pointer px-5 py-2 text-xs font-extrabold text-white"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                }}
              >
                Đóng sơ đồ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT AIRCRAFT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  Đội tàu bay SkyLink
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  {editId ? `Cập nhật tàu bay ${form.tail_number}` : "Thêm tàu bay mới"}
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
              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  Số đăng bạ (Tail Number) *
                </label>
                <input
                  required
                  type="text"
                  value={form.tail_number}
                  onChange={(e) => setForm({ ...form, tail_number: e.target.value.toUpperCase() })}
                  placeholder="VD: VN-A868, VN-A901..."
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-mono font-black text-[#091e47] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  Dòng tàu bay *
                </label>
                <input
                  required
                  list="skylink-aircraft-models"
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="VD: Boeing 787-9 Dreamliner"
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                />
                <datalist id="skylink-aircraft-models">
                  {MODEL_PRESETS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  Trạng thái kỹ thuật *
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-[#091e47] outline-none"
                >
                  <option value="1">Đang khai thác</option>
                  <option value="2">Đang bảo dưỡng kỹ thuật</option>
                  <option value="0">Ngừng bay</option>
                </select>
              </div>

              {!editId && (
                <div className="rounded-2xl border border-blue-100 bg-[#f4f8ff] p-3.5">
                  <p className="mb-2 font-extrabold text-[#123975]" style={{ margin: "0 0 8px 0", fontSize: 12.5 }}>
                    Tự động khởi tạo sơ đồ ghế ({previewTotalSeats} ghế)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#476494]" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
                        Hàng Thương gia (4 ghế/hàng)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={form.business_rows}
                        onChange={(e) => setForm({ ...form, business_rows: e.target.value })}
                        className="w-full rounded-xl border border-blue-100 bg-white px-3 py-1.5 font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#476494]" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
                        Hàng Phổ thông (6 ghế/hàng)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="45"
                        value={form.economy_rows}
                        onChange={(e) => setForm({ ...form, economy_rows: e.target.value })}
                        className="w-full rounded-xl border border-blue-100 bg-white px-3 py-1.5 font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  {saving ? "Đang lưu..." : editId ? "Lưu thay đổi" : "Thêm tàu bay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE DELETE MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <h3 className="font-black text-[#091e47]" style={{ margin: "0 0 8px 0", fontSize: 17 }}>
              Xác nhận xóa tàu bay?
            </h3>
            <p className="font-medium text-slate-600" style={{ margin: "0 0 18px 0", fontSize: 13 }}>
              Bạn có chắc muốn xóa tàu bay <strong>{deleteTarget.tail_number}</strong> ({deleteTarget.model})?
              Nếu tàu bay đang có chuyến bay khai thác, hệ thống sẽ tự động chặn để bảo toàn lịch bay.
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
                {deleting ? "Đang xóa..." : "Xóa tàu bay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
