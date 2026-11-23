import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AirplaneTakeoff,
  CaretLeft,
  CaretRight,
  DownloadSimple,
  Funnel,
  GlobeHemisphereEast,
  MagnifyingGlass,
  MapPin,
  MapPinArea,
  PencilSimple,
  Plus,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import api from "../../api";

const EMPTY_FORM = {
  code: "",
  name: "",
  city: "",
};

export default function Airports() {
  const [urlParams] = useSearchParams();
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_airports: 0,
    domestic_count: 0,
    international_count: 0,
    active_hubs: 0,
  });

  const [search, setSearch] = useState(() => urlParams.get("search") || "");
  const [regionFilter, setRegionFilter] = useState("all"); // all | domestic | international
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
      setSearch(q);
      setCurrentPage(1);
    }
  }, [urlParams]);

  const fetchAirports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/airports");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAirports(list);
      if (res.data?.summary) {
        setSummary(res.data.summary);
      } else {
        const domestic = list.filter((a) => a.is_domestic).length;
        setSummary({
          total_airports: list.length,
          domestic_count: domestic,
          international_count: list.length - domestic,
          active_hubs: list.filter(
            (a) => Number(a.departing_flights_count || 0) + Number(a.arriving_flights_count || 0) > 0
          ).length,
        });
      }
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh mục sân bay.",
      });
      setAirports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  const filteredAirports = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return airports.filter((a) => {
      if (regionFilter === "domestic" && !a.is_domestic) return false;
      if (regionFilter === "international" && a.is_domestic) return false;
      if (!kw) return true;
      return (
        (a.code || "").toLowerCase().includes(kw) ||
        (a.name || "").toLowerCase().includes(kw) ||
        (a.city || "").toLowerCase().includes(kw)
      );
    });
  }, [airports, search, regionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAirports.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfFirst = (safePage - 1) * itemsPerPage;
  const currentAirports = filteredAirports.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }, [totalPages]);

  const openAddModal = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (airport) => {
    setEditId(airport.id);
    setForm({
      code: (airport.code || "").toUpperCase(),
      name: airport.name || "",
      city: airport.city || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      setFormError("Mã sân bay IATA phải gồm đúng 3 chữ cái in hoa (VD: HAN, SGN, SIN).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code,
        name: form.name.trim(),
        city: form.city.trim(),
      };
      if (editId) {
        await api.put(`/admin/airports/${editId}`, payload);
        setNotice({ type: "success", text: `Đã cập nhật sân bay ${code} (${payload.city}).` });
      } else {
        await api.post("/admin/airports", payload);
        setNotice({ type: "success", text: `Đã thêm sân bay mới ${code} (${payload.city}).` });
      }
      setModalOpen(false);
      fetchAirports();
    } catch (err) {
      const msg =
        Object.values(err.response?.data?.errors || {}).flat()[0] ||
        err.response?.data?.message ||
        "Không thể lưu thông tin sân bay.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/airports/${deleteTarget.id}`);
      setNotice({
        type: "success",
        text: `Đã xóa sân bay ${deleteTarget.code} (${deleteTarget.city}).`,
      });
      setDeleteTarget(null);
      fetchAirports();
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể xóa sân bay này.",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const header = ["STT,Mã IATA,Tên sân bay,Thành phố,Khu vực,Chuyến đi,Chuyến đến"];
    const rows = filteredAirports.map(
      (a, idx) =>
        `${idx + 1},"${a.code}","${a.name}","${a.city}","${
          a.is_domestic ? "Nội địa" : "Quốc tế"
        }",${a.departing_flights_count || 0},${a.arriving_flights_count || 0}`
    );
    const csv = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "skylink_airports_network.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpiCards = [
    {
      label: "Tổng sân bay",
      value: summary.total_airports.toLocaleString("vi-VN"),
      sub: "Mạng đường bay SkyLink",
      icon: MapPinArea,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Nội địa Việt Nam",
      value: summary.domestic_count.toLocaleString("vi-VN"),
      sub: "Cảng hàng không nội địa",
      icon: MapPin,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      label: "Quốc tế",
      value: summary.international_count.toLocaleString("vi-VN"),
      sub: "Khu vực Đông Nam Á & Châu Á",
      icon: GlobeHemisphereEast,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
    },
    {
      label: "Đang khai thác bay",
      value: summary.active_hubs.toLocaleString("vi-VN"),
      sub: "Có lịch cất / hạ cánh",
      icon: AirplaneTakeoff,
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
            <MapPinArea size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Quản lý Sân bay (Airports)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Quản lý danh mục cảng hàng không chuẩn mã IATA nội địa &amp; quốc tế của SkyLink.
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
            <span>Xuất danh mục</span>
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
            <span>Thêm sân bay</span>
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
              Khu vực mạng bay
            </label>
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Lọc theo khu vực sân bay"
              className="cursor-pointer bg-[#f4f8ff] px-3.5 py-2 font-bold text-[#123975] outline-none"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
            >
              <option value="all">Tất cả khu vực ({summary.total_airports})</option>
              <option value="domestic">Nội địa Việt Nam ({summary.domestic_count})</option>
              <option value="international">Quốc tế ({summary.international_count})</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 255 }}
            >
              <input
                type="text"
                placeholder="Tìm mã IATA, tên sân bay, thành phố..."
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
              onClick={fetchAirports}
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

        {/* Airports Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                style={{ fontSize: 11.5 }}
              >
                <th className="px-3.5 py-3">Mã IATA</th>
                <th className="px-3.5 py-3">Tên cảng hàng không</th>
                <th className="px-3.5 py-3">Thành phố / Điểm đến</th>
                <th className="px-3.5 py-3">Khu vực</th>
                <th className="px-3.5 py-3">Tần suất khai thác</th>
                <th className="px-3.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Đang tải danh mục sân bay...
                  </td>
                </tr>
              ) : currentAirports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Không tìm thấy sân bay nào phù hợp.
                  </td>
                </tr>
              ) : (
                currentAirports.map((a) => {
                  const depCount = Number(a.departing_flights_count || 0);
                  const arrCount = Number(a.arriving_flights_count || 0);

                  return (
                    <tr
                      key={a.id}
                      className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                    >
                      <td className="whitespace-nowrap px-3.5 py-3">
                        <span
                          className="inline-flex items-center justify-center font-mono font-black text-white shadow-xs"
                          style={{
                            background: a.is_domestic
                              ? "linear-gradient(135deg, #0b5ed7 0%, #1d75f2 100%)"
                              : "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
                            borderRadius: 10,
                            padding: "5px 12px",
                            fontSize: 13,
                            letterSpacing: "0.06em",
                          }}
                        >
                          {a.code}
                        </span>
                      </td>

                      <td className="px-3.5 py-3">
                        <div
                          className="truncate font-bold text-[#091e47]"
                          style={{ maxWidth: 260, fontSize: 13.5 }}
                          title={a.name}
                        >
                          {a.name}
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        <span
                          className="block truncate font-semibold text-[#163d7a]"
                          style={{ maxWidth: 185, fontSize: 13 }}
                          title={a.city}
                        >
                          {a.city}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3.5 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 font-bold"
                          style={{
                            borderRadius: 9999,
                            fontSize: 11.5,
                            background: a.is_domestic ? "#ecfdf5" : "#eef2ff",
                            color: a.is_domestic ? "#059669" : "#4338ca",
                            border: a.is_domestic ? "1px solid #a7f3d0" : "1px solid #c7d2fe",
                          }}
                        >
                          {a.is_domestic ? "Nội địa" : "Quốc tế"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3.5 py-3">
                        <div className="font-bold text-[#091e47]" style={{ fontSize: 13 }}>
                          {(depCount + arrCount).toLocaleString("vi-VN")} chuyến
                        </div>
                        <div className="font-medium text-slate-400" style={{ fontSize: 11.5 }}>
                          {depCount.toLocaleString("vi-VN")} đi • {arrCount.toLocaleString("vi-VN")} đến
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3.5 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(a)}
                            title="Chỉnh sửa sân bay"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f4f8ff] text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            style={{ borderRadius: 9999, border: "1px solid #cde2fd" }}
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(a)}
                            title="Xóa sân bay"
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

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <span className="font-semibold text-slate-500" style={{ fontSize: 13 }}>
            Hiển thị{" "}
            <strong>
              {filteredAirports.length === 0 ? 0 : indexOfFirst + 1}–
              {Math.min(indexOfFirst + itemsPerPage, filteredAirports.length)}
            </strong>{" "}
            trong tổng số <strong>{filteredAirports.length}</strong> sân bay
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

            {pageNumbers.map((p) => (
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
            ))}

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

      {/* ADD / EDIT AIRPORT MODAL */}
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
                  Danh mục IATA SkyLink
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  {editId ? `Chỉnh sửa sân bay ${form.code}` : "Thêm sân bay mới"}
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
                  Mã sân bay IATA (3 ký tự) *
                </label>
                <input
                  required
                  type="text"
                  maxLength={3}
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase() })
                  }
                  placeholder="VD: HAN, SGN, SIN, NRT..."
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-mono font-black tracking-widest text-[#091e47] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  Tên cảng hàng không *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Sân bay Quốc tế Nội Bài"
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  Thành phố / Điểm đến *
                </label>
                <input
                  required
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="VD: Hà Nội, Tokyo (Nhật Bản)..."
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                />
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
                  {saving ? "Đang lưu..." : editId ? "Lưu thay đổi" : "Thêm sân bay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <h3 className="font-black text-[#091e47]" style={{ margin: "0 0 8px 0", fontSize: 17 }}>
              Xác nhận xóa sân bay?
            </h3>
            <p className="font-medium text-slate-600" style={{ margin: "0 0 18px 0", fontSize: 13 }}>
              Bạn có chắc muốn xóa sân bay <strong>{deleteTarget.code}</strong> ({deleteTarget.name})?
              Nếu sân bay đang có chuyến bay khai thác, hệ thống sẽ tự động chặn để bảo toàn dữ liệu.
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
                {deleting ? "Đang xóa..." : "Xóa sân bay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
