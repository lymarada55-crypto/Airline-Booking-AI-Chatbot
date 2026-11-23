import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Buildings,
  CalendarCheck,
  CarProfile,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  Compass,
  CurrencyCircleDollar,
  DownloadSimple,
  Funnel,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Star,
  SuitcaseRolling,
  Trash,
  X,
  XCircle,
} from "@phosphor-icons/react";
import api from "../../api";
import { getCanonicalTravelProductImage } from "../../utils/travelServiceImages";

const currencyFmt = new Intl.NumberFormat("vi-VN");

function formatMoneyVnd(val) {
  return `${currencyFmt.format(Math.round(Number(val || 0)))} ₫`;
}

function formatDateVi(raw) {
  if (!raw) return "—";
  const dt = new Date(`${String(raw).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return "—";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

function getTypeMeta(type) {
  if (type === "hotel") {
    return { label: "Khách sạn", unit: "đêm", icon: Buildings, color: "#0284c7", bg: "#e0f2fe" };
  }
  if (type === "car") {
    return { label: "Thuê xe", unit: "ngày", icon: CarProfile, color: "#2563eb", bg: "#dbeafe" };
  }
  return { label: "Trải nghiệm", unit: "khách", icon: Compass, color: "#7c3aed", bg: "#f3e8ff" };
}

function getResStatusUi(status) {
  const map = {
    pending_payment: { label: "Chờ thanh toán", bg: "#fff7ed", color: "#d97706", border: "#fed7aa" },
    booked: { label: "Đã đặt nội bộ", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    pending_confirmation: { label: "Chờ xác nhận", bg: "#fff7ed", color: "#d97706", border: "#fed7aa" },
    confirmed: { label: "Đã xác nhận", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    cancelled: { label: "Đã hủy", bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  };
  return map[status] || map.booked;
}

const EMPTY_FORM = {
  type: "hotel",
  name: "",
  city: "",
  location: "",
  price: "",
  price_unit: "đêm",
  rating: "4.8",
  max_guests: "2",
  inventory_count: "10",
  image_url: "",
  description: "",
  is_active: true,
};

export default function TravelServices() {
  const [urlParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'reservations'

  // Global summary from DB
  const [summary, setSummary] = useState({
    total_products: 0,
    active_products: 0,
    hotels: 0,
    cars: 0,
    experiences: 0,
    total_reservations: 0,
    paid_reservations: 0,
    total_revenue: 0,
  });

  // Catalog state
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodSearch, setProdSearch] = useState(() => urlParams.get("search") || "");
  const [prodType, setProdType] = useState("all");
  const [prodStatus, setProdStatus] = useState("all");
  const [prodPage, setProdPage] = useState(1);
  const [prodLastPage, setProdLastPage] = useState(1);
  const [prodTotal, setProdTotal] = useState(0);

  // Reservations state
  const [reservations, setReservations] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [resSearch, setResSearch] = useState("");
  const [resType, setResType] = useState("all");
  const [resStatus, setResStatus] = useState("all");
  const [resPayment, setResPayment] = useState("all");
  const [resPage, setResPage] = useState(1);
  const [resLastPage, setResLastPage] = useState(1);
  const [resTotal, setResTotal] = useState(0);

  // Feedback & Modals
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [busyId, setBusyId] = useState(null);

  // Product create/edit modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingProduct, setSavingProduct] = useState(false);

  // Reservation detail modal
  const [selectedRes, setSelectedRes] = useState(null);

  // Confirm dialog (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState(null);
  // { title, message, tone: 'primary'|'danger', confirmLabel, onConfirm }

  useEffect(() => {
    const q = urlParams.get("search");
    if (q !== null) {
      setProdSearch(q);
      setResSearch(q);
      setProdPage(1);
      setResPage(1);
    }
  }, [urlParams]);

  const loadProducts = async () => {
    setProdLoading(true);
    try {
      const { data } = await api.get("/admin/travel-products", {
        params: {
          search: prodSearch.trim() || undefined,
          type: prodType,
          status: prodStatus,
          per_page: 8,
          page: prodPage,
        },
      });
      setProducts(data.data?.data || []);
      setProdLastPage(data.data?.last_page || 1);
      setProdTotal(data.data?.total || 0);
      if (data.summary) setSummary((prev) => ({ ...prev, ...data.summary }));
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh mục dịch vụ du lịch.",
      });
    } finally {
      setProdLoading(false);
    }
  };

  const loadReservations = async () => {
    setResLoading(true);
    try {
      const { data } = await api.get("/admin/travel-service-reservations", {
        params: {
          search: resSearch.trim() || undefined,
          type: resType,
          status: resStatus,
          payment_status: resPayment,
          per_page: 8,
          page: resPage,
        },
      });
      setReservations(data.data?.data || []);
      setResLastPage(data.data?.last_page || 1);
      setResTotal(data.data?.total || 0);
      if (data.summary) setSummary((prev) => ({ ...prev, ...data.summary }));
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách đơn dịch vụ.",
      });
    } finally {
      setResLoading(false);
    }
  };

  useEffect(() => {
    const t = window.setTimeout(loadProducts, 200);
    return () => window.clearTimeout(t);
  }, [prodSearch, prodType, prodStatus, prodPage]);

  useEffect(() => {
    if (activeTab !== "reservations") return;
    const t = window.setTimeout(loadReservations, 200);
    return () => window.clearTimeout(t);
  }, [activeTab, resSearch, resType, resStatus, resPayment, resPage]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      type: product.type || "hotel",
      name: product.name || "",
      city: product.city || "",
      location: product.location || "",
      price: String(Math.round(Number(product.price || 0))),
      price_unit: product.price_unit || getTypeMeta(product.type).unit,
      rating: String(product.rating ?? "4.8"),
      max_guests: String(product.max_guests ?? 2),
      inventory_count: String(product.inventory_count ?? 10),
      image_url: product.image_url || "",
      description: product.description || "",
      is_active: Boolean(product.is_active),
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    setNotice({ type: "", text: "" });
    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
        rating: Number(form.rating || 4.8),
        max_guests: Number(form.max_guests || 2),
        inventory_count: Number(form.inventory_count || 0),
      };
      if (editingProduct) {
        await api.put(`/admin/travel-products/${editingProduct.id}`, payload);
        setNotice({ type: "success", text: `Đã cập nhật dịch vụ "${form.name}".` });
      } else {
        await api.post("/admin/travel-products", payload);
        setNotice({ type: "success", text: `Đã thêm dịch vụ mới "${form.name}".` });
      }
      setProductModalOpen(false);
      loadProducts();
    } catch (err) {
      setNotice({
        type: "error",
        text:
          err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat()[0] ||
          "Không thể lưu dịch vụ du lịch.",
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleProductActive = async (product) => {
    setBusyId(`prod-${product.id}`);
    try {
      await api.put(`/admin/travel-products/${product.id}`, {
        is_active: !product.is_active,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !product.is_active } : p))
      );
      setSummary((prev) => ({
        ...prev,
        active_products: prev.active_products + (product.is_active ? -1 : 1),
      }));
      setNotice({
        type: "success",
        text: `Đã ${product.is_active ? "tạm ngưng bán" : "mở bán lại"} "${product.name}".`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể thay đổi trạng thái dịch vụ.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const requestDeleteProduct = (product) => {
    setConfirmModal({
      title: "Xóa dịch vụ khỏi danh mục?",
      message: `Bạn có chắc muốn xóa "${product.name}" (${product.city})? Nếu dịch vụ đã có đơn đặt, hệ thống sẽ yêu cầu tạm ngưng bán thay vì xóa.`,
      tone: "danger",
      confirmLabel: "Xóa dịch vụ",
      onConfirm: async () => {
        setBusyId(`prod-${product.id}`);
        try {
          await api.delete(`/admin/travel-products/${product.id}`);
          setNotice({ type: "success", text: `Đã xóa dịch vụ "${product.name}".` });
          setConfirmModal(null);
          loadProducts();
        } catch (err) {
          setNotice({
            type: "error",
            text: err.response?.data?.message || "Không thể xóa dịch vụ này.",
          });
          setConfirmModal(null);
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const requestUpdateReservation = (reservation, nextStatus) => {
    const isConfirm = nextStatus === "confirmed";
    setConfirmModal({
      title: isConfirm ? "Xác nhận đơn dịch vụ?" : "Hủy đơn dịch vụ?",
      message: isConfirm
        ? `Xác nhận đơn ${reservation.reference_code} (${reservation.product?.name || "Dịch vụ"}) cho khách ${reservation.guest_name || reservation.user?.name || "—"}?`
        : `Hủy đơn chưa thanh toán ${reservation.reference_code}? Tồn kho sẽ được giải phóng tự động.`,
      tone: isConfirm ? "primary" : "danger",
      confirmLabel: isConfirm ? "Xác nhận đơn" : "Hủy đơn",
      onConfirm: async () => {
        setBusyId(`res-${reservation.id}`);
        try {
          const { data } = await api.patch(
            `/admin/travel-service-reservations/${reservation.id}`,
            { status: nextStatus }
          );
          setNotice({
            type: "success",
            text: isConfirm
              ? `Đã xác nhận đơn ${reservation.reference_code}.`
              : `Đã hủy đơn ${reservation.reference_code}.`,
          });
          if (selectedRes?.id === reservation.id && data.data) {
            setSelectedRes(data.data);
          }
          setConfirmModal(null);
          loadReservations();
        } catch (err) {
          setNotice({
            type: "error",
            text:
              err.response?.data?.message ||
              Object.values(err.response?.data?.errors || {}).flat()[0] ||
              "Không thể cập nhật trạng thái đơn dịch vụ.",
          });
          setConfirmModal(null);
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleExportCsv = () => {
    if (activeTab === "catalog") {
      const header = ["ID,Loại,Tên dịch vụ,Thành phố,Giá (VND),Đơn vị,Tồn kho,Trạng thái"];
      const rows = products.map(
        (p) =>
          `${p.id},"${getTypeMeta(p.type).label}","${p.name}","${p.city}",${Math.round(
            Number(p.price || 0)
          )},"${p.price_unit || getTypeMeta(p.type).unit}",${p.inventory_count},"${
            p.is_active ? "Đang mở bán" : "Tạm ngưng"
          }"`
      );
      const csv = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...rows].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csv));
      link.setAttribute("download", "skylink_travel_catalog.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const header = [
        "Mã đặt,Dịch vụ,Loại,Khách hàng,Ngày sử dụng,Tổng tiền (VND),Thanh toán,Trạng thái",
      ];
      const rows = reservations.map(
        (r) =>
          `"${r.reference_code}","${r.product?.name || "Dịch vụ"}","${getTypeMeta(
            r.product?.type
          ).label}","${r.guest_name || r.user?.name || "—"}","${formatDateVi(
            r.start_date
          )}",${Math.round(Number(r.total_price || 0))},"${
            r.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"
          }","${getResStatusUi(r.status).label}"`
      );
      const csv = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...rows].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csv));
      link.setAttribute("download", "skylink_travel_reservations.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const buildPageWindow = (curr, totalP) => {
    const pages = [];
    if (totalP <= 5) {
      for (let i = 1; i <= totalP; i++) pages.push(i);
    } else {
      pages.push(1);
      if (curr > 3) pages.push("...");
      const s = Math.max(2, curr - 1);
      const e = Math.min(totalP - 1, curr + 1);
      for (let i = s; i <= e; i++) pages.push(i);
      if (curr < totalP - 2) pages.push("...");
      pages.push(totalP);
    }
    return pages;
  };

  const prodPages = useMemo(() => buildPageWindow(prodPage, prodLastPage), [prodPage, prodLastPage]);
  const resPages = useMemo(() => buildPageWindow(resPage, resLastPage), [resPage, resLastPage]);

  const kpiCards = [
    {
      label: "Dịch vụ đang bán",
      value: `${summary.active_products}/${summary.total_products}`,
      sub: `${summary.hotels} KS • ${summary.cars} Xe • ${summary.experiences} Tour`,
      icon: Buildings,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Tổng đơn dịch vụ",
      value: summary.total_reservations.toLocaleString("vi-VN"),
      sub: "Toàn hệ thống SkyLink",
      icon: CalendarCheck,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
    },
    {
      label: "Đã thanh toán",
      value: summary.paid_reservations.toLocaleString("vi-VN"),
      sub: `${
        summary.total_reservations
          ? Math.round((summary.paid_reservations / summary.total_reservations) * 100)
          : 0
      }% tỷ lệ hoàn tất`,
      icon: CheckCircle,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      label: "Doanh thu dịch vụ",
      value:
        summary.total_revenue >= 1_000_000_000
          ? `${(summary.total_revenue / 1_000_000_000).toFixed(2)} Tỷ ₫`
          : summary.total_revenue >= 1_000_000
          ? `${(summary.total_revenue / 1_000_000).toFixed(1)} Tr ₫`
          : formatMoneyVnd(summary.total_revenue),
      sub: "Từ đơn đã thanh toán",
      icon: CurrencyCircleDollar,
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
            <SuitcaseRolling size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Quản lý Dịch vụ Du lịch
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Quản lý danh mục Khách sạn, Thuê xe, Trải nghiệm và theo dõi đơn đặt dịch vụ.
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
            <span>Xuất báo cáo</span>
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
            <span>Thêm dịch vụ</span>
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
                  style={{ fontSize: 23 }}
                >
                  {card.value}
                </span>
                <p
                  className="mt-1 truncate font-semibold text-slate-400"
                  style={{ margin: 0, fontSize: 12 }}
                  title={card.sub}
                >
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MAIN WHITE CARD WITH 2 TABS */}
      <div
        className="overflow-hidden bg-white"
        style={{
          borderRadius: 24,
          border: "1px solid #d5e6fc",
          boxShadow: "0 14px 36px rgba(18, 60, 130, 0.08)",
        }}
      >
        {/* Tab Switcher Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#f8fbff] px-5 py-3">
          <div className="inline-flex gap-1.5 rounded-full bg-white p-1" style={{ border: "1px solid #d5e6fc" }}>
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-1.5 font-extrabold transition"
              style={
                activeTab === "catalog"
                  ? {
                      background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                      color: "#ffffff",
                      borderRadius: 9999,
                      border: "none",
                      fontSize: 13,
                      boxShadow: "0 4px 12px rgba(13, 97, 225, 0.25)",
                    }
                  : {
                      background: "transparent",
                      color: "#476494",
                      borderRadius: 9999,
                      border: "none",
                      fontSize: 13,
                    }
              }
            >
              <Buildings size={15} weight="duotone" />
              <span>Danh mục dịch vụ ({summary.total_products})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reservations")}
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-1.5 font-extrabold transition"
              style={
                activeTab === "reservations"
                  ? {
                      background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                      color: "#ffffff",
                      borderRadius: 9999,
                      border: "none",
                      fontSize: 13,
                      boxShadow: "0 4px 12px rgba(13, 97, 225, 0.25)",
                    }
                  : {
                      background: "transparent",
                      color: "#476494",
                      borderRadius: 9999,
                      border: "none",
                      fontSize: 13,
                    }
              }
            >
              <CalendarCheck size={15} weight="duotone" />
              <span>Đơn đặt dịch vụ ({summary.total_reservations})</span>
            </button>
          </div>

          <span className="font-semibold text-slate-400" style={{ fontSize: 12 }}>
            {activeTab === "catalog"
              ? "Quản lý giá niêm yết, tồn kho & trạng thái mở bán"
              : "Xác nhận đơn, theo dõi liên kết PNR & thanh toán"}
          </span>
        </div>

        {/* TAB 1: CATALOG */}
        {activeTab === "catalog" && (
          <>
            {/* Catalog Filters */}
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
                    value={prodType}
                    onChange={(e) => {
                      setProdType(e.target.value);
                      setProdPage(1);
                    }}
                    className="cursor-pointer bg-[#f4f8ff] px-3.5 py-2 font-bold text-[#123975] outline-none"
                    style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
                  >
                    <option value="all">Tất cả loại ({summary.total_products})</option>
                    <option value="hotel">Khách sạn ({summary.hotels})</option>
                    <option value="car">Thuê xe ({summary.cars})</option>
                    <option value="experience">Trải nghiệm ({summary.experiences})</option>
                  </select>
                </div>

                <div>
                  <label
                    className="font-extrabold text-[#476494]"
                    style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
                  >
                    Trạng thái bán
                  </label>
                  <select
                    value={prodStatus}
                    onChange={(e) => {
                      setProdStatus(e.target.value);
                      setProdPage(1);
                    }}
                    className="cursor-pointer bg-[#f4f8ff] px-3.5 py-2 font-bold text-[#123975] outline-none"
                    style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang mở bán</option>
                    <option value="inactive">Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div
                  className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 235 }}
                >
                  <input
                    type="text"
                    placeholder="Tìm tên khách sạn, xe, thành phố..."
                    value={prodSearch}
                    onChange={(e) => {
                      setProdSearch(e.target.value);
                      setProdPage(1);
                    }}
                    className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    style={{ fontSize: 13 }}
                  />
                  <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
                </div>

                <button
                  type="button"
                  onClick={loadProducts}
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

            {/* Catalog Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr
                    className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                    style={{ fontSize: 11.5 }}
                  >
                    <th className="px-3 py-3">Dịch vụ</th>
                    <th className="px-3 py-3">Loại</th>
                    <th className="px-3 py-3">Thành phố</th>
                    <th className="px-3 py-3">Giá niêm yết</th>
                    <th className="px-3 py-3">Tồn kho</th>
                    <th className="px-3 py-3">Trạng thái</th>
                    <th className="px-3 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {prodLoading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                        Đang tải danh mục dịch vụ...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                        Không tìm thấy dịch vụ phù hợp.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const tMeta = getTypeMeta(product.type);
                      const TypeIcon = tMeta.icon;
                      const thumbUrl = getCanonicalTravelProductImage(product);
                      return (
                        <tr
                          key={product.id}
                          className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={thumbUrl}
                                alt={product.name}
                                className="h-10 w-12 shrink-0 rounded-xl object-cover border border-slate-200/80"
                              />
                              <div className="min-w-0">
                                <div
                                  className="truncate font-bold text-[#091e47]"
                                  style={{ maxWidth: 210, fontSize: 13 }}
                                  title={product.name}
                                >
                                  {product.name}
                                </div>
                                <div
                                  className="flex items-center gap-1.5 font-medium text-slate-400"
                                  style={{ fontSize: 11.5 }}
                                >
                                  <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold">
                                    <Star size={11} weight="fill" /> {Number(product.rating || 4.8).toFixed(1)}
                                  </span>
                                  <span>• Tối đa {product.max_guests} khách</span>
                                  {product.reservations_count > 0 && (
                                    <span>• {product.reservations_count} đơn</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 font-bold"
                              style={{
                                background: tMeta.bg,
                                color: tMeta.color,
                                borderRadius: 9999,
                                fontSize: 12,
                              }}
                            >
                              <TypeIcon size={14} weight="duotone" />
                              {tMeta.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className="block truncate font-semibold text-[#163d7a]"
                              style={{ maxWidth: 120, fontSize: 13 }}
                              title={product.city}
                            >
                              {product.city}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <div className="font-black text-[#091e47]" style={{ fontSize: 13 }}>
                              {formatMoneyVnd(product.price)}
                            </div>
                            <div className="font-medium text-slate-400" style={{ fontSize: 11 }}>
                              / {product.price_unit || tMeta.unit}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-bold text-[#091e47]" style={{ fontSize: 13 }}>
                            {product.inventory_count}{" "}
                            <span className="font-medium text-slate-400" style={{ fontSize: 11.5 }}>
                              {product.type === "hotel" ? "phòng" : product.type === "car" ? "xe" : "suất"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <button
                              type="button"
                              disabled={busyId === `prod-${product.id}`}
                              onClick={() => handleToggleProductActive(product)}
                              title="Nhấn để bật/tắt trạng thái bán"
                              className="inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1 font-bold transition hover:brightness-95"
                              style={{
                                borderRadius: 9999,
                                fontSize: 11.5,
                                background: product.is_active ? "#ecfdf5" : "#f1f5f9",
                                color: product.is_active ? "#059669" : "#64748b",
                                border: product.is_active ? "1px solid #a7f3d0" : "1px solid #cbd5e1",
                              }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: product.is_active ? "#10b981" : "#94a3b8" }}
                              />
                              {product.is_active ? "Đang bán" : "Tạm ngưng"}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(product)}
                                title="Chỉnh sửa dịch vụ"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f4f8ff] text-blue-600 transition hover:bg-blue-600 hover:text-white"
                                style={{ borderRadius: 9999, border: "1px solid #cde2fd" }}
                              >
                                <PencilSimple size={15} weight="bold" />
                              </button>
                              <button
                                type="button"
                                onClick={() => requestDeleteProduct(product)}
                                title="Xóa dịch vụ"
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

            {/* Catalog Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
              <span className="font-semibold text-slate-500" style={{ fontSize: 13 }}>
                Trang <strong>{prodPage}</strong> / <strong>{prodLastPage}</strong> • Tổng{" "}
                <strong>{prodTotal}</strong> dịch vụ
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={prodPage <= 1}
                  onClick={() => setProdPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                {prodPages.map((p, idx) =>
                  p === "..." ? (
                    <span key={`p-dots-${idx}`} className="px-1 text-xs font-bold text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProdPage(p)}
                      className="flex h-8 min-w-[32px] cursor-pointer items-center justify-center px-2 text-xs font-extrabold transition"
                      style={
                        p === prodPage
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
                  disabled={prodPage >= prodLastPage}
                  onClick={() => setProdPage((p) => Math.min(prodLastPage, p + 1))}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: RESERVATIONS */}
        {activeTab === "reservations" && (
          <>
            {/* Reservations Filters */}
            <div className="flex flex-wrap items-end justify-between gap-2.5 border-b border-slate-100 p-4">
              <div className="flex flex-wrap items-end gap-2.5">
                <div>
                  <label
                    className="font-extrabold text-[#476494]"
                    style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
                  >
                    Loại dịch vụ
                  </label>
                  <select
                    value={resType}
                    onChange={(e) => {
                      setResType(e.target.value);
                      setResPage(1);
                    }}
                    className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                    style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="hotel">Khách sạn</option>
                    <option value="car">Thuê xe</option>
                    <option value="experience">Trải nghiệm</option>
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
                    value={resStatus}
                    onChange={(e) => {
                      setResStatus(e.target.value);
                      setResPage(1);
                    }}
                    className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                    style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending_payment">Chờ thanh toán</option>
                    <option value="pending_confirmation">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label
                    className="font-extrabold text-[#476494]"
                    style={{ display: "block", marginBottom: 4, fontSize: 11.5 }}
                  >
                    Thanh toán
                  </label>
                  <select
                    value={resPayment}
                    onChange={(e) => {
                      setResPayment(e.target.value);
                      setResPage(1);
                    }}
                    className="cursor-pointer bg-[#f4f8ff] px-3 py-2 font-bold text-[#123975] outline-none"
                    style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
                  >
                    <option value="all">Mọi thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="unpaid">Chưa thanh toán</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 210 }}
                >
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, khách, PNR..."
                    value={resSearch}
                    onChange={(e) => {
                      setResSearch(e.target.value);
                      setResPage(1);
                    }}
                    className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    style={{ fontSize: 13 }}
                  />
                  <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
                </div>

                <button
                  type="button"
                  onClick={loadReservations}
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

            {/* Reservations Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr
                    className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                    style={{ fontSize: 11.5 }}
                  >
                    <th className="px-2.5 py-3">Mã đặt</th>
                    <th className="px-2.5 py-3">Dịch vụ</th>
                    <th className="px-2.5 py-3">Khách hàng</th>
                    <th className="px-2.5 py-3">Lịch trình / Giá</th>
                    <th className="px-2.5 py-3">Thanh toán</th>
                    <th className="px-2.5 py-3">Trạng thái</th>
                    <th className="px-2.5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {resLoading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                        Đang tải đơn dịch vụ...
                      </td>
                    </tr>
                  ) : reservations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                        Chưa có đơn đặt dịch vụ nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((r) => {
                      const product = r.product || {};
                      const tMeta = getTypeMeta(product.type);
                      const stUi = getResStatusUi(r.status);
                      const isPaid = r.payment_status === "paid";

                      return (
                        <tr
                          key={r.id}
                          className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                        >
                          <td className="px-2.5 py-3">
                            <div className="font-mono font-black text-[#091e47]" style={{ fontSize: 12.5 }}>
                              {r.reference_code}
                            </div>
                            <div className="font-medium text-slate-400" style={{ fontSize: 11 }}>
                              {formatDateVi(r.created_at)}
                            </div>
                          </td>
                          <td className="px-2.5 py-3">
                            <div
                              className="truncate font-bold text-[#091e47]"
                              style={{ maxWidth: 165, fontSize: 13 }}
                              title={product.name}
                            >
                              {product.name || "Dịch vụ"}
                            </div>
                            <div className="font-medium text-slate-400" style={{ fontSize: 11.5 }}>
                              {tMeta.label} • {product.city || "—"}
                            </div>
                          </td>
                          <td className="px-2.5 py-3">
                            <div
                              className="truncate font-bold text-[#091e47]"
                              style={{ maxWidth: 125, fontSize: 13 }}
                              title={r.guest_name || r.user?.name}
                            >
                              {r.guest_name || r.user?.name || "Khách hàng"}
                            </div>
                            <div className="font-medium text-slate-400" style={{ fontSize: 11 }}>
                              {r.booking?.pnr_code ? `PNR: ${r.booking.pnr_code}` : `${r.guest_count} khách`}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-3">
                            <div className="font-black text-[#091e47]" style={{ fontSize: 13 }}>
                              {formatMoneyVnd(r.total_price)}
                            </div>
                            <div className="font-medium text-slate-400" style={{ fontSize: 11 }}>
                              {formatDateVi(r.start_date)}
                              {r.end_date ? ` – ${formatDateVi(r.end_date)}` : ""}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-3">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 font-bold"
                              style={{
                                borderRadius: 9999,
                                fontSize: 11.5,
                                background: isPaid ? "#ecfdf5" : "#fff7ed",
                                color: isPaid ? "#059669" : "#d97706",
                                border: isPaid ? "1px solid #a7f3d0" : "1px solid #fed7aa",
                              }}
                            >
                              {isPaid ? <CheckCircle size={12} weight="fill" /> : <Clock size={12} />}
                              {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-3">
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
                          <td className="whitespace-nowrap px-2.5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedRes(r)}
                              className="inline-flex cursor-pointer items-center gap-1 bg-white font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                              style={{
                                borderRadius: 9999,
                                border: "1px solid #cde2fd",
                                padding: "5px 12px",
                                fontSize: 12,
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

            {/* Reservations Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
              <span className="font-semibold text-slate-500" style={{ fontSize: 13 }}>
                Trang <strong>{resPage}</strong> / <strong>{resLastPage}</strong> • Tổng{" "}
                <strong>{resTotal}</strong> đơn dịch vụ
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={resPage <= 1}
                  onClick={() => setResPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                {resPages.map((p, idx) =>
                  p === "..." ? (
                    <span key={`r-dots-${idx}`} className="px-1 text-xs font-bold text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setResPage(p)}
                      className="flex h-8 min-w-[32px] cursor-pointer items-center justify-center px-2 text-xs font-extrabold transition"
                      style={
                        p === resPage
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
                  disabled={resPage >= resLastPage}
                  onClick={() => setResPage((p) => Math.min(resLastPage, p + 1))}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  Danh mục Travel Services
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  {editingProduct ? `Chỉnh sửa: ${editingProduct.name}` : "Thêm dịch vụ du lịch mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5" style={{ fontSize: 13 }}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Loại hình *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        type: nextType,
                        price_unit: getTypeMeta(nextType).unit,
                      }));
                    }}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-[#091e47] outline-none"
                  >
                    <option value="hotel">Khách sạn</option>
                    <option value="car">Thuê xe</option>
                    <option value="experience">Trải nghiệm / Tour</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Thành phố *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="VD: Đà Nẵng, Tokyo, Singapore..."
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  Tên dịch vụ *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: InterContinental Danang Sun Peninsula Resort"
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Giá niêm yết (VNĐ) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="2500000"
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Tồn kho *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.inventory_count}
                    onChange={(e) => setForm((prev) => ({ ...prev, inventory_count: e.target.value }))}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Số khách tối đa *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.max_guests}
                    onChange={(e) => setForm((prev) => ({ ...prev, max_guests: e.target.value }))}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Địa chỉ / Khu vực
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="VD: Bán đảo Sơn Trà, Đà Nẵng"
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-semibold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                    Đánh giá (1.0 – 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                    className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  URL Ảnh đại diện (HD)
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-medium text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#163d7a]" style={{ display: "block", marginBottom: 4 }}>
                  Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Tiện ích nổi bật, dịch vụ đi kèm..."
                  className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 font-medium text-slate-800 outline-none"
                />
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 font-bold text-[#091e47]">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                <span>Mở bán ngay trên hệ thống SkyLink</span>
              </label>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="cursor-pointer bg-slate-100 px-4 py-2 font-extrabold text-slate-700"
                  style={{ borderRadius: 9999, border: "none", fontSize: 13 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="cursor-pointer px-5 py-2 font-extrabold text-white disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                    border: "none",
                    fontSize: 13,
                  }}
                >
                  {savingProduct ? "Đang lưu..." : editingProduct ? "Lưu thay đổi" : "Tạo dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESERVATION DETAIL MODAL */}
      {selectedRes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600" style={{ margin: 0 }}>
                  {getTypeMeta(selectedRes.product?.type).label} • {selectedRes.product?.city || "SkyLink"}
                </p>
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  Chi tiết đơn {selectedRes.reference_code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRes(null)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4 font-semibold text-[#163d7a]" style={{ fontSize: 13 }}>
              <div className="flex items-center gap-3 pb-2 border-b border-blue-200/70">
                <img
                  src={getCanonicalTravelProductImage(selectedRes.product || {})}
                  alt={selectedRes.product?.name}
                  className="h-12 w-16 rounded-xl object-cover border border-white shadow-xs"
                />
                <div className="min-w-0">
                  <div className="font-black text-[#091e47] truncate">{selectedRes.product?.name}</div>
                  <div className="text-xs text-slate-500">
                    Ngày đặt: {formatDateVi(selectedRes.created_at)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <p style={{ margin: 0 }}>
                  <strong>Khách hàng:</strong> {selectedRes.guest_name || selectedRes.user?.name || "—"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Điện thoại:</strong> {selectedRes.guest_phone || "—"}
                </p>
                <p style={{ margin: 0 }} className="truncate">
                  <strong>Email:</strong> {selectedRes.guest_email || selectedRes.user?.email || "—"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Liên kết PNR:</strong> {selectedRes.booking?.pnr_code || "Đặt độc lập"}
                </p>
              </div>

              <div className="border-t border-blue-200/70 pt-2 space-y-1">
                <p style={{ margin: 0 }}>
                  <strong>Lịch trình:</strong> {formatDateVi(selectedRes.start_date)}
                  {selectedRes.end_date ? ` – ${formatDateVi(selectedRes.end_date)}` : ""} ({selectedRes.guest_count} khách • {selectedRes.quantity}{" "}
                  {selectedRes.product?.type === "hotel" ? "phòng" : selectedRes.product?.type === "car" ? "xe" : "suất"})
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Tổng tiền:</strong>{" "}
                  <span className="font-black text-[#0b4fd0]">{formatMoneyVnd(selectedRes.total_price)}</span>
                </p>
                {selectedRes.payments?.[0] && (
                  <p style={{ margin: 0, fontSize: 12 }} className="text-slate-500">
                    <strong>Giao dịch:</strong> {selectedRes.payments[0].payment_method?.toUpperCase()} •{" "}
                    {selectedRes.payments[0].transaction_id}
                  </p>
                )}
                {selectedRes.notes && (
                  <p style={{ margin: 0 }} className="rounded-xl bg-white/80 p-2 text-xs text-slate-600">
                    <strong>Ghi chú khách:</strong> {selectedRes.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-2">
                {["pending_payment", "booked", "pending_confirmation"].includes(selectedRes.status) &&
                  selectedRes.payment_status === "paid" && (
                    <button
                      type="button"
                      onClick={() => requestUpdateReservation(selectedRes, "confirmed")}
                      className="inline-flex cursor-pointer items-center gap-1.5 bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-700"
                      style={{ borderRadius: 9999, border: "none" }}
                    >
                      <CheckCircle size={15} weight="bold" />
                      Xác nhận đơn
                    </button>
                  )}

                {["pending_payment", "booked", "pending_confirmation"].includes(selectedRes.status) &&
                  selectedRes.payment_status !== "paid" && (
                    <button
                      type="button"
                      onClick={() => requestUpdateReservation(selectedRes, "cancelled")}
                      className="inline-flex cursor-pointer items-center gap-1.5 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                      style={{ borderRadius: 9999, border: "1px solid #fecaca" }}
                    >
                      <XCircle size={15} weight="bold" />
                      Hủy đơn chưa thanh toán
                    </button>
                  )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedRes(null)}
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

      {/* SAFE CONFIRMATION MODAL (ZERO window.confirm) */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <h3 className="font-black text-[#091e47]" style={{ margin: "0 0 8px 0", fontSize: 17 }}>
              {confirmModal.title}
            </h3>
            <p className="font-medium text-slate-600" style={{ margin: "0 0 18px 0", fontSize: 13 }}>
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="cursor-pointer bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700"
                style={{ borderRadius: 9999, border: "none" }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="cursor-pointer px-4 py-2 text-xs font-extrabold text-white"
                style={{
                  background:
                    confirmModal.tone === "danger"
                      ? "#dc2626"
                      : "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                }}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
