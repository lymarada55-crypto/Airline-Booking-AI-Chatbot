import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  ClockCountdown,
  Copy,
  DownloadSimple,
  Gift,
  MagnifyingGlass,
  PencilSimple,
  Percent,
  Plus,
  Tag,
  Ticket,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";

const STORAGE_KEY = "skylink_admin_offers_v1";

const DEFAULT_OFFERS = [
  {
    id: 1,
    code: "SKYLINK500",
    title: "Chào Mùa Lễ Hội Cuối Năm 2026",
    category: "Vé máy bay",
    discountType: "fixed",
    discountValue: 500000,
    minBooking: 2500000,
    validUntil: "2026-12-31",
    usageCount: 142,
    usageLimit: 300,
    active: true,
    note: "Áp dụng đơn vé khứ hồi nội địa & quốc tế từ 2.500.000 ₫.",
  },
  {
    id: 2,
    code: "WELCOME20",
    title: "Ưu Đãi Thành Viên Mới SkyClub",
    category: "Hội viên VIP",
    discountType: "percent",
    discountValue: 20,
    minBooking: 1000000,
    validUntil: "2026-12-31",
    usageCount: 89,
    usageLimit: 200,
    active: true,
    note: "Giảm 20% (tối đa 400.000 ₫) cho lần đặt vé đầu tiên.",
  },
  {
    id: 3,
    code: "STAY300",
    title: "Combo Bay & Nghỉ Dưỡng 5 Sao",
    category: "Khách sạn",
    discountType: "fixed",
    discountValue: 300000,
    minBooking: 1800000,
    validUntil: "2027-01-15",
    usageCount: 64,
    usageLimit: 150,
    active: true,
    note: "Áp dụng đặt phòng khách sạn từ 2 đêm kèm mã vé SkyLink.",
  },
  {
    id: 4,
    code: "SKYLOUNGE15",
    title: "Đặc Quyền Phòng Chờ & eSIM 5G",
    category: "Dịch vụ phụ trợ",
    discountType: "percent",
    discountValue: 15,
    minBooking: 500000,
    validUntil: "2026-12-20",
    usageCount: 38,
    usageLimit: 100,
    active: true,
    note: "Giảm 15% khi đặt kèm gói eSIM 5G quốc tế hoặc SkyLounge.",
  },
  {
    id: 5,
    code: "VIPCLUB2026",
    title: "Tri Ân Hội Viên Hạng Vàng & Bạch Kim",
    category: "Hội viên VIP",
    discountType: "percent",
    discountValue: 15,
    minBooking: 0,
    validUntil: "2026-12-31",
    usageCount: 54,
    usageLimit: 120,
    active: false,
    note: "Tạm dừng để chuẩn bị nâng cấp chương trình năm 2027.",
  },
  {
    id: 6,
    code: "EARLYBIRD",
    title: "Đặt Sớm Mùa Hè Rực Rỡ",
    category: "Vé máy bay",
    discountType: "percent",
    discountValue: 10,
    minBooking: 1200000,
    validUntil: "2026-08-31",
    usageCount: 210,
    usageLimit: 250,
    active: true,
    note: "Chiến dịch đặt sớm hè 2026 đã kết thúc.",
  },
];

const currencyFmt = new Intl.NumberFormat("vi-VN");

function formatMoneyVnd(val) {
  return `${currencyFmt.format(Math.round(Number(val || 0)))} ₫`;
}

function formatDateVi(raw) {
  if (!raw) return "—";
  const parts = String(raw).slice(0, 10).split("-");
  if (parts.length !== 3) return raw;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getComputedStatus(offer) {
  const todayStr = new Date().toISOString().slice(0, 10);
  if (offer.validUntil && offer.validUntil < todayStr) return "expired";
  if (offer.usageLimit > 0 && offer.usageCount >= offer.usageLimit) return "expired";
  return offer.active ? "active" : "paused";
}

function getStatusUi(status) {
  if (status === "active") {
    return { label: "Đang áp dụng", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
  }
  if (status === "paused") {
    return { label: "Tạm dừng", bg: "#fff7ed", color: "#d97706", border: "#fed7aa" };
  }
  return { label: "Hết hạn", bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
}

const EMPTY_FORM = {
  code: "",
  title: "",
  category: "Vé máy bay",
  discountType: "percent",
  discountValue: "15",
  minBooking: "1000000",
  validUntil: "2026-12-31",
  usageLimit: "200",
  active: true,
  note: "",
};

export default function Offers() {
  const [urlParams] = useSearchParams();
  const [offers, setOffers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_OFFERS;
  });

  const [search, setSearch] = useState(() => urlParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    } catch {
      // ignore
    }
  }, [offers]);

  useEffect(() => {
    const q = urlParams.get("search");
    if (q !== null) setSearch(q);
  }, [urlParams]);

  const summary = useMemo(() => {
    let active = 0;
    let expired = 0;
    let totalUsage = 0;
    for (const o of offers) {
      const st = getComputedStatus(o);
      if (st === "active") active++;
      if (st === "expired") expired++;
      totalUsage += Number(o.usageCount || 0);
    }
    return { total: offers.length, active, expired, totalUsage };
  }, [offers]);

  const filteredOffers = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return offers.filter((o) => {
      const st = getComputedStatus(o);
      if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (!kw) return true;
      return (
        o.code.toLowerCase().includes(kw) ||
        o.title.toLowerCase().includes(kw) ||
        o.category.toLowerCase().includes(kw)
      );
    });
  }, [offers, search, categoryFilter, statusFilter]);

  const openCreateModal = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditId(offer.id);
    setForm({
      code: offer.code,
      title: offer.title,
      category: offer.category || "Vé máy bay",
      discountType: offer.discountType || "percent",
      discountValue: String(offer.discountValue ?? 10),
      minBooking: String(offer.minBooking ?? 0),
      validUntil: offer.validUntil || "2026-12-31",
      usageLimit: String(offer.usageLimit ?? 100),
      active: Boolean(offer.active),
      note: offer.note || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError("");

    const cleanCode = form.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanCode || cleanCode.length < 4) {
      setFormError("Mã ưu đãi phải có tối thiểu 4 ký tự không chứa khoảng trắng.");
      return;
    }

    const duplicate = offers.some((o) => o.code === cleanCode && o.id !== editId);
    if (duplicate) {
      setFormError(`Mã ưu đãi "${cleanCode}" đã tồn tại.`);
      return;
    }

    const val = Number(form.discountValue || 0);
    if (form.discountType === "percent" && (val <= 0 || val > 80)) {
      setFormError("Mức giảm theo phần trăm phải từ 1% đến 80%.");
      return;
    }
    if (form.discountType === "fixed" && val < 50000) {
      setFormError("Mức giảm trực tiếp phải từ 50.000 ₫ trở lên.");
      return;
    }

    if (editId) {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === editId
            ? {
                ...o,
                code: cleanCode,
                title: form.title.trim(),
                category: form.category,
                discountType: form.discountType,
                discountValue: val,
                minBooking: Number(form.minBooking || 0),
                validUntil: form.validUntil,
                usageLimit: Number(form.usageLimit || 100),
                active: form.active,
                note: form.note.trim(),
              }
            : o
        )
      );
      setNotice({ type: "success", text: `Đã cập nhật mã ưu đãi ${cleanCode}.` });
    } else {
      const nextOffer = {
        id: Date.now(),
        code: cleanCode,
        title: form.title.trim(),
        category: form.category,
        discountType: form.discountType,
        discountValue: val,
        minBooking: Number(form.minBooking || 0),
        validUntil: form.validUntil,
        usageCount: 0,
        usageLimit: Number(form.usageLimit || 100),
        active: form.active,
        note: form.note.trim(),
      };
      setOffers((prev) => [nextOffer, ...prev]);
      setNotice({ type: "success", text: `Đã tạo chương trình khuyến mãi ${cleanCode}.` });
    }
    setModalOpen(false);
  };

  const handleToggleActive = (offer) => {
    const st = getComputedStatus(offer);
    if (st === "expired") {
      setNotice({
        type: "error",
        text: `Mã ${offer.code} đã hết hạn. Vui lòng chỉnh sửa "Hạn sử dụng" mới để kích hoạt lại.`,
      });
      return;
    }
    setOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, active: !o.active } : o))
    );
    setNotice({
      type: "success",
      text: `Đã ${offer.active ? "tạm dừng" : "kích hoạt"} mã ưu đãi ${offer.code}.`,
    });
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setNotice({ type: "success", text: `Đã sao chép mã "${code}" vào bộ nhớ tạm.` });
    } catch {
      setNotice({ type: "success", text: `Mã ưu đãi: ${code}` });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    setNotice({ type: "success", text: `Đã xóa mã khuyến mãi ${deleteTarget.code}.` });
    setDeleteTarget(null);
  };

  const handleExportCsv = () => {
    const header = ["Mã ưu đãi,Chương trình,Phạm vi,Mức giảm,Đơn tối thiểu (VND),Hạn dùng,Đã dùng,Hạn mức,Trạng thái"];
    const rows = filteredOffers.map((o) => {
      const st = getStatusUi(getComputedStatus(o));
      const disc = o.discountType === "percent" ? `${o.discountValue}%` : formatMoneyVnd(o.discountValue);
      return `"${o.code}","${o.title}","${o.category}","${disc}",${o.minBooking},"${formatDateVi(
        o.validUntil
      )}",${o.usageCount},${o.usageLimit},"${st.label}"`;
    });
    const csv = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "skylink_offers_promotions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpiCards = [
    {
      label: "Tổng chương trình",
      value: summary.total.toLocaleString("vi-VN"),
      sub: "Chiến dịch ưu đãi SkyLink",
      icon: Gift,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Đang áp dụng",
      value: summary.active.toLocaleString("vi-VN"),
      sub: "Còn hiệu lực trên web",
      icon: CheckCircle,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      label: "Tổng lượt sử dụng",
      value: summary.totalUsage.toLocaleString("vi-VN"),
      sub: "Khách đã áp dụng mã",
      icon: Ticket,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
    },
    {
      label: "Đã hết hạn",
      value: summary.expired.toLocaleString("vi-VN"),
      sub: "Tự động đóng theo ngày",
      icon: ClockCountdown,
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
            <Percent size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Ưu đãi &amp; Khuyến mãi (Offers)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Quản lý mã giảm giá, chiến dịch theo mùa và đặc quyền hội viên SkyClub.
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
            <span>Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
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
            <span>Tạo khuyến mãi</span>
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
                Phạm vi áp dụng
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả phạm vi</option>
                <option value="Vé máy bay">Vé máy bay</option>
                <option value="Khách sạn">Khách sạn</option>
                <option value="Hội viên VIP">Hội viên VIP</option>
                <option value="Dịch vụ phụ trợ">Dịch vụ phụ trợ</option>
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang áp dụng</option>
                <option value="paused">Tạm dừng</option>
                <option value="expired">Hết hạn</option>
              </select>
            </div>
          </div>

          <div
            className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
            style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 245 }}
          >
            <input
              type="text"
              placeholder="Tìm mã khuyến mãi, tên chiến dịch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
              style={{ fontSize: 13 }}
            />
            <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
          </div>
        </div>

        {/* Offers Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                style={{ fontSize: 11.5 }}
              >
                <th className="px-2.5 py-3">Mã ưu đãi</th>
                <th className="px-2.5 py-3">Chiến dịch</th>
                <th className="px-2.5 py-3">Mức giảm</th>
                <th className="px-2.5 py-3 whitespace-nowrap">Đơn tối thiểu</th>
                <th className="px-2.5 py-3">Lượt dùng</th>
                <th className="px-2.5 py-3">Trạng thái</th>
                <th className="px-2.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Không tìm thấy mã ưu đãi nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((o) => {
                  const st = getComputedStatus(o);
                  const stUi = getStatusUi(st);
                  const pct = o.usageLimit > 0 ? Math.min(100, Math.round((o.usageCount / o.usageLimit) * 100)) : 0;

                  return (
                    <tr
                      key={o.id}
                      className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                    >
                      <td className="whitespace-nowrap px-2.5 py-3">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(o.code)}
                          title="Nhấn để sao chép mã"
                          className="inline-flex cursor-pointer items-center gap-1 font-mono font-black text-[#0b4fd0] transition hover:bg-blue-100"
                          style={{
                            background: "#eff6ff",
                            border: "1px dashed #93c5fd",
                            borderRadius: 9,
                            padding: "4px 8px",
                            fontSize: 12,
                          }}
                        >
                          <Tag size={12} weight="duotone" />
                          <span>{o.code}</span>
                          <Copy size={11} className="opacity-65" />
                        </button>
                      </td>

                      <td className="px-2.5 py-3">
                        <div
                          className="truncate font-bold text-[#091e47]"
                          style={{ maxWidth: 175, fontSize: 13 }}
                          title={o.title}
                        >
                          {o.title}
                        </div>
                        <div className="truncate font-medium text-slate-400" style={{ maxWidth: 175, fontSize: 11.5 }}>
                          {o.category} • {formatDateVi(o.validUntil)}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-2.5 py-3 font-black text-rose-600" style={{ fontSize: 13 }}>
                        {o.discountType === "percent"
                          ? `Giảm ${o.discountValue}%`
                          : `-${formatMoneyVnd(o.discountValue)}`}
                      </td>

                      <td className="whitespace-nowrap px-2.5 py-3 font-semibold text-[#163d7a]" style={{ fontSize: 12.5 }}>
                        {o.minBooking > 0 ? formatMoneyVnd(o.minBooking) : "Không giới hạn"}
                      </td>

                      <td className="whitespace-nowrap px-2.5 py-3">
                        <div className="font-bold text-[#091e47]" style={{ fontSize: 12.5 }}>
                          {o.usageCount}/{o.usageLimit}
                        </div>
                        <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: pct >= 90 ? "#ef4444" : "#1d75f2",
                            }}
                          />
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-2.5 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(o)}
                          title="Nhấn để bật / tạm dừng mã ưu đãi"
                          className="inline-flex cursor-pointer items-center px-2.5 py-1 font-bold transition hover:brightness-95"
                          style={{
                            background: stUi.bg,
                            color: stUi.color,
                            border: `1px solid ${stUi.border}`,
                            borderRadius: 9999,
                            fontSize: 11.5,
                          }}
                        >
                          {stUi.label}
                        </button>
                      </td>

                      <td className="whitespace-nowrap px-2.5 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(o)}
                            title="Chỉnh sửa khuyến mãi"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f4f8ff] text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            style={{ borderRadius: 9999, border: "1px solid #cde2fd" }}
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(o)}
                            title="Xóa khuyến mãi"
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

      {/* CREATE / EDIT OFFER MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  Chiến dịch Marketing SkyLink
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  {editId ? `Chỉnh sửa mã ${form.code}` : "Tạo mã khuyến mãi mới"}
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
                    Mã ưu đãi (Promo Code) *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="VD: TET2027, SKY500"
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-mono font-black text-[#091e47] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Phạm vi áp dụng *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-[#091e47] outline-none"
                  >
                    <option value="Vé máy bay">Vé máy bay</option>
                    <option value="Khách sạn">Khách sạn</option>
                    <option value="Hội viên VIP">Hội viên VIP</option>
                    <option value="Dịch vụ phụ trợ">Dịch vụ phụ trợ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  Tên chương trình khuyến mãi *
                </label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Ưu đãi bay Tết Nguyên Đán 2027"
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Hình thức giảm *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-[#091e47] outline-none"
                  >
                    <option value="percent">Giảm theo phần trăm (%)</option>
                    <option value="fixed">Giảm tiền trực tiếp (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Giá trị giảm ({form.discountType === "percent" ? "%" : "VNĐ"}) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Đơn tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minBooking}
                    onChange={(e) => setForm({ ...form, minBooking: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Hạn mức lượt dùng
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Hạn sử dụng *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 font-bold text-[#091e47]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <span>Kích hoạt áp dụng ngay</span>
              </label>

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
                  className="cursor-pointer px-5 py-2 font-extrabold text-white"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                    border: "none",
                    fontSize: 13,
                  }}
                >
                  {editId ? "Lưu thay đổi" : "Tạo khuyến mãi"}
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
              Xác nhận xóa khuyến mãi?
            </h3>
            <p className="font-medium text-slate-600" style={{ margin: "0 0 18px 0", fontSize: 13 }}>
              Bạn có chắc muốn xóa mã ưu đãi <strong>{deleteTarget.code}</strong> ({deleteTarget.title})?
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
                onClick={handleConfirmDelete}
                className="cursor-pointer bg-rose-600 px-4 py-2 text-xs font-extrabold text-white"
                style={{ borderRadius: 9999, border: "none" }}
              >
                Xóa mã ưu đãi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
