import { useEffect, useState, useMemo } from "react";
import api from "../../api";
import { Spinner } from "react-bootstrap";
import {
  Users as UsersIcon,
  UserPlus,
  CalendarCheck,
  Crown,
  UserCirclePlus,
  MagnifyingGlass,
  ArrowsClockwise,
  DownloadSimple,
  Eye,
  PencilSimple,
  Trash,
  CaretLeft,
  CaretRight,
  CaretUpDown,
  X,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";

const AVATAR_COLORS = [
  "#f59e0b",
  "#10b981",
  "#1d75f2",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

function formatDateVi(raw) {
  if (!raw) return "—";
  const dt = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return String(raw);
  const d = String(dt.getDate()).padStart(2, "0");
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const y = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} ${hh}:${mm}`;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Users");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(0);

  const [summary, setSummary] = useState({
    total_users: 0,
    active_users: 0,
    vip_users: 0,
    new_users: 0,
  });

  // In-app modals & feedback
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [viewUser, setViewUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formModal, setFormModal] = useState(null); // null | { mode: 'create' | 'edit', user?: ... }
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    membership_tier: "standard",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, sortDir, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", {
        params: {
          search,
          role: roleFilter,
          sort: sortDir,
          page,
        },
      });

      const payload = res.data || {};
      setUsers(payload.data || []);
      setLastPage(payload.last_page || 1);
      setTotalUsers(payload.total || 0);
      setFromIdx(payload.from || 0);
      setToIdx(payload.to || 0);
      if (payload.summary) {
        setSummary(payload.summary);
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  const displayedUsers = useMemo(() => {
    if (tierFilter === "all") return users;
    return users.filter((u) => {
      const t = String(u.membership_tier || "standard").toLowerCase();
      if (tierFilter === "vip") return u.is_vip || t === "vip" || t === "platinum" || t === "gold";
      return !u.is_vip && t === "standard";
    });
  }, [users, tierFilter]);

  const toggleSortDir = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const openCreateModal = () => {
    setFormError("");
    setFormValues({
      name: "",
      email: "",
      password: "",
      role: "member",
      membership_tier: "standard",
    });
    setFormModal({ mode: "create" });
  };

  const openEditModal = (user) => {
    setFormError("");
    setFormValues({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role === "admin" ? "admin" : "member",
      membership_tier: String(user.membership_tier || "standard").toLowerCase(),
    });
    setFormModal({ mode: "edit", user });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (formModal?.mode === "create") {
        await api.post("/admin/users", formValues);
        setNotice({ type: "success", text: `Đã thêm người dùng "${formValues.name}" thành công.` });
      } else if (formModal?.mode === "edit" && formModal.user) {
        const payload = { ...formValues };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${formModal.user.id}`, payload);
        setNotice({ type: "success", text: `Đã cập nhật thông tin "${formValues.name}".` });
      }
      setFormModal(null);
      fetchUsers();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Không thể lưu thông tin. Vui lòng kiểm tra lại email hoặc mật khẩu (tối thiểu 6 ký tự)."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      setNotice({ type: "success", text: `Đã xóa người dùng "${deleteTarget.name}".` });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể xóa người dùng này.",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Họ và tên,Email,Vai trò,Hạng thành viên,Ngày tạo"].join(",") +
      "\n" +
      displayedUsers
        .map(
          (u) =>
            `${u.id},"${u.name}","${u.email}","${u.role === "admin" ? "Quản trị viên" : "Người dùng"}","${
              u.membership_tier || "Standard"
            }","${formatDateVi(u.created_at)}"`
        )
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `skylink_users_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Windowed pagination helper
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
      label: "Tổng người dùng",
      value: Number(summary.total_users || totalUsers).toLocaleString("vi-VN"),
      sub: "Toàn hệ thống",
      icon: UsersIcon,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Người dùng hoạt động",
      value: Number(summary.active_users || totalUsers).toLocaleString("vi-VN"),
      sub: "100% đang mở",
      icon: CalendarCheck,
      iconBg: "#ebf3ff",
      iconColor: "#0b57d0",
    },
    {
      label: "Khách hàng VIP",
      value: Number(summary.vip_users || 0).toLocaleString("vi-VN"),
      sub: "SkyClub Gold / VIP",
      icon: Crown,
      iconBg: "#fff7ed",
      iconColor: "#f59e0b",
    },
    {
      label: "Người dùng mới",
      value: Number(summary.new_users || 0).toLocaleString("vi-VN"),
      sub: "30 ngày gần đây",
      icon: UserCirclePlus,
      iconBg: "#ecfdf5",
      iconColor: "#059669",
    },
  ];

  return (
    <div style={{ maxWidth: "1520px", margin: "0 auto", padding: "4px 0 16px 0" }}>
      {/* 1. HEADER TITLE + ADD USER CTA */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-white/95 text-blue-600 shadow-sm"
            style={{ borderRadius: 14, border: "1px solid #d5e6fc" }}
          >
            <UsersIcon size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Quản lý người dùng
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Theo dõi và quản lý thông tin tài khoản người dùng trên hệ thống SkyLink.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex w-fit cursor-pointer items-center gap-2 font-extrabold text-white shadow-md transition hover:brightness-105"
          style={{
            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
            borderRadius: 9999,
            border: "none",
            padding: "10px 22px",
            fontSize: 13.5,
            boxShadow: "0 8px 20px rgba(13, 97, 225, 0.28)",
            whiteSpace: "nowrap",
          }}
        >
          <UserPlus size={17} weight="bold" />
          <span>+ Thêm người dùng</span>
        </button>
      </div>

      {/* Status Notice */}
      {notice.text && (
        <div
          className={`mb-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-bold ${
            notice.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {notice.type === "error" ? (
              <WarningCircle size={16} weight="fill" />
            ) : (
              <CheckCircle size={16} weight="fill" />
            )}
            {notice.text}
          </span>
          <button
            type="button"
            onClick={() => setNotice({ type: "", text: "" })}
            className="cursor-pointer bg-transparent p-1 text-current opacity-70 hover:opacity-100"
            style={{ border: "none" }}
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* 2. ROW OF 4 KPI CARDS matching mockup */}
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
                  borderRadius: 14,
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
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-black leading-none text-[#091e47]" style={{ fontSize: 26 }}>
                    {card.value}
                  </span>
                </div>
                <p className="mt-1 font-semibold text-emerald-600" style={{ margin: 0, fontSize: 12 }}>
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MAIN WHITE TABLE CARD matching mockup */}
      <div
        className="overflow-hidden bg-white"
        style={{
          borderRadius: 24,
          border: "1px solid #d5e6fc",
          boxShadow: "0 14px 36px rgba(18, 60, 130, 0.08)",
        }}
      >
        {/* Filter & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Lọc theo vai trò"
              className="cursor-pointer bg-[#f4f8ff] px-3.5 py-2 font-bold text-[#123975] outline-none"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
            >
              <option value="All Users">Tất cả vai trò</option>
              <option value="Admin">Quản trị viên</option>
              <option value="User">Người dùng</option>
            </select>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              aria-label="Lọc theo hạng thành viên"
              className="cursor-pointer bg-[#f4f8ff] px-3.5 py-2 font-bold text-[#123975] outline-none"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13 }}
            >
              <option value="all">Tất cả hạng</option>
              <option value="vip">Khách hàng VIP / Gold</option>
              <option value="standard">Hạng Tiêu chuẩn</option>
            </select>

            {/* Search Input */}
            <div
              className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
              style={{
                borderRadius: 9999,
                border: "1px solid #d5e6fc",
                minWidth: 240,
              }}
            >
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
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
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchUsers}
              className="inline-flex cursor-pointer items-center gap-1.5 bg-white px-3.5 py-2 font-bold text-[#163d7a] transition hover:bg-blue-50"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13, whiteSpace: "nowrap" }}
            >
              <ArrowsClockwise size={15} weight="bold" />
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadData}
              className="inline-flex cursor-pointer items-center gap-1.5 bg-white px-3.5 py-2 font-bold text-[#163d7a] transition hover:bg-blue-50"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", fontSize: 13, whiteSpace: "nowrap" }}
            >
              <DownloadSimple size={15} weight="bold" />
              <span>Xuất file</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f4f8ff", borderBottom: "1px solid #e2eeff" }}>
                <th
                  onClick={toggleSortDir}
                  className="cursor-pointer px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f] select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    ID <CaretUpDown size={13} weight="bold" />
                  </span>
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Họ và tên
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Email
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Vai trò
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Trạng thái
                </th>
                <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Ngày tạo
                </th>
                <th className="px-3 py-3 text-right text-[11px] font-black uppercase tracking-wider text-[#33507f]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Spinner animation="border" variant="primary" />
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-semibold text-slate-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user, idx) => {
                  const isAdmin = user.role === "admin";
                  const avatarBg = AVATAR_COLORS[(user.id || idx) % AVATAR_COLORS.length];
                  const initial = (user.name || "U").trim().charAt(0).toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                    >
                      <td className="px-3 py-3 font-bold text-slate-600" style={{ fontSize: 13.5 }}>
                        {user.id}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-xs font-black text-white shadow-xs"
                            style={{ background: avatarBg, borderRadius: 9999 }}
                          >
                            {initial}
                          </span>
                          <span
                            className="truncate font-bold text-[#091e47]"
                            style={{ maxWidth: 145, fontSize: 13.5 }}
                            title={user.name}
                          >
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="block truncate font-medium text-slate-600"
                          style={{ maxWidth: 180, fontSize: 13.5 }}
                          title={user.email}
                        >
                          {user.email}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {isAdmin ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 font-bold"
                            style={{
                              background: "#ebf3ff",
                              color: "#0b4fd0",
                              border: "1px solid #cde2fd",
                              borderRadius: 9999,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Crown size={12} weight="fill" className="text-amber-500" />
                            Quản trị viên
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 font-bold"
                            style={{
                              background: "#f1f5f9",
                              color: "#334155",
                              borderRadius: 9999,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Người dùng
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 font-bold"
                          style={{
                            background: "#ecfdf5",
                            color: "#059669",
                            border: "1px solid #a7f3d0",
                            borderRadius: 9999,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5"
                            style={{ background: "#10b981", borderRadius: 9999 }}
                          />
                          Hoạt động
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-600" style={{ fontSize: 12.5 }}>
                        {formatDateVi(user.created_at)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewUser(user)}
                            title="Xem chi tiết"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f0f6ff] text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                          >
                            <Eye size={14} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            title="Chỉnh sửa"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f0f6ff] text-[#0b4fd0] transition hover:bg-blue-600 hover:text-white"
                            style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                          >
                            <PencilSimple size={14} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            title="Xóa người dùng"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#fef2f2] text-rose-600 transition hover:bg-rose-600 hover:text-white"
                            style={{ borderRadius: 9999, border: "1px solid #fecaca" }}
                          >
                            <Trash size={14} weight="bold" />
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

        {/* Footer Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <span className="text-xs font-semibold text-slate-500">
            Hiển thị <strong>{fromIdx || 0}–{toIdx || 0}</strong> trong tổng số{" "}
            <strong>{totalUsers}</strong> người dùng
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
                <span key={`dots-${idx}`} className="px-1.5 text-xs font-bold text-slate-400">
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

      {/* MODAL 1: CREATE / EDIT USER */}
      {formModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 17 }}>
                {formModal.mode === "create" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
              </h3>
              <button
                type="button"
                onClick={() => setFormModal(null)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-[#163d7a]">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-[#163d7a]">Email</label>
                <input
                  type="email"
                  required
                  value={formValues.email}
                  onChange={(e) => setFormValues((v) => ({ ...v, email: e.target.value }))}
                  placeholder="email@skylink.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-[#163d7a]">
                  Mật khẩu {formModal.mode === "edit" && "(Để trống nếu không đổi)"}
                </label>
                <input
                  type="password"
                  required={formModal.mode === "create"}
                  minLength={6}
                  value={formValues.password}
                  onChange={(e) => setFormValues((v) => ({ ...v, password: e.target.value }))}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-[#163d7a]">Vai trò</label>
                  <select
                    value={formValues.role}
                    onChange={(e) => setFormValues((v) => ({ ...v, role: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="member">Người dùng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold text-[#163d7a]">
                    Hạng SkyClub
                  </label>
                  <select
                    value={formValues.membership_tier}
                    onChange={(e) =>
                      setFormValues((v) => ({ ...v, membership_tier: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="gold">Gold</option>
                    <option value="vip">VIP</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormModal(null)}
                  className="cursor-pointer bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700"
                  style={{ borderRadius: 9999, border: "none" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer px-5 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                    border: "none",
                  }}
                >
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW USER DETAILS */}
      {viewUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 17 }}>
                Chi tiết tài khoản #{viewUser.id}
              </h3>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="cursor-pointer rounded-xl bg-transparent p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4 text-xs font-semibold text-[#163d7a]">
              <p style={{ margin: 0 }}>
                <strong>Họ và tên:</strong> {viewUser.name}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Email:</strong> {viewUser.email}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Vai trò:</strong>{" "}
                {viewUser.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Hạng thành viên:</strong> {viewUser.membership_tier || "Standard"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Ngày tạo:</strong> {formatDateVi(viewUser.created_at)}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setViewUser(null)}
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

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <h3 className="font-black text-[#091e47]" style={{ margin: "0 0 8px 0", fontSize: 17 }}>
              Xác nhận xóa người dùng?
            </h3>
            <p className="text-xs font-medium text-slate-600" style={{ margin: "0 0 18px 0" }}>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{deleteTarget.name}</strong> (
              {deleteTarget.email}) khỏi hệ thống? Thao tác này không thể hoàn tác.
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

export default Users;
