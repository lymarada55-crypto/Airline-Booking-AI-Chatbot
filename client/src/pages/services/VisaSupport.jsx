import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  GlobeHemisphereEast,
  Headset,
  IdentificationCard,
  Info,
  MagnifyingGlass,
  ShieldCheck,
  Stamp,
  User,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

const HERO_VISA_BG_URL =
  "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1600&q=85";

const NATIONALITIES = [
  { code: "VN", name: "Việt Nam (Hộ chiếu phổ thông)" },
  { code: "KH", name: "Campuchia (Hộ chiếu phổ thông)" },
  { code: "US", name: "Hoa Kỳ (United States)" },
  { code: "JP", name: "Nhật Bản (Japan)" },
  { code: "KR", name: "Hàn Quốc (South Korea)" },
  { code: "SG", name: "Singapore" },
];

const DESTINATIONS = [
  {
    code: "SG",
    name: "Singapore",
    region: "Đông Nam Á",
    statusLabel: "Miễn thị thực (30 ngày)",
    statusType: "exempt",
    processingTime: "Không cần xin Visa trước",
    stayLimit: "Tối đa 30 ngày",
    passportValidity: "Hộ chiếu còn hạn tối thiểu 6 tháng",
    fee: "Miễn phí",
    documents: [
      "Hộ chiếu gốc còn hạn tối thiểu 6 tháng & ít nhất 2 trang trống.",
      "Tờ khai nhập cảnh điện tử SG Arrival Card (khai trực tuyến trong 72h trước giờ bay).",
      "Vé máy bay khứ hồi & xác nhận đặt phòng khách sạn tại Singapore.",
    ],
  },
  {
    code: "MY",
    name: "Malaysia",
    region: "Đông Nam Á",
    statusLabel: "Miễn thị thực (30 ngày)",
    statusType: "exempt",
    processingTime: "Không cần xin Visa trước",
    stayLimit: "Tối đa 30 ngày",
    passportValidity: "Hộ chiếu còn hạn tối thiểu 6 tháng",
    fee: "Miễn phí",
    documents: [
      "Hộ chiếu gốc còn hạn tối thiểu 6 tháng.",
      "Tờ khai nhập cảnh số MDAC (Malaysia Digital Arrival Card) trong vòng 3 ngày trước khi đến.",
      "Vé máy bay khứ hồi hoặc vé đi tiếp nước thứ 3.",
    ],
  },
  {
    code: "KH",
    name: "Campuchia (Phnom Penh / Siem Reap)",
    region: "Đông Nam Á",
    statusLabel: "Miễn thị thực (30 ngày)",
    statusType: "exempt",
    processingTime: "Không cần xin Visa trước",
    stayLimit: "Tối đa 30 ngày",
    passportValidity: "Hộ chiếu còn hạn tối thiểu 6 tháng",
    fee: "Miễn phí",
    documents: [
      "Hộ chiếu gốc còn hạn tối thiểu 6 tháng.",
      "Khai báo e-Arrival Campuchia trực tuyến trong vòng 7 ngày trước giờ nhập cảnh.",
      "Thông tin nơi lưu trú và vé máy bay khứ hồi.",
    ],
  },
  {
    code: "KR",
    name: "Hàn Quốc (Seoul / Busan)",
    region: "Đông Bắc Á",
    statusLabel: "Cần Visa / E-Visa du lịch",
    statusType: "visa_required",
    processingTime: "7 – 12 ngày làm việc",
    stayLimit: "Tối đa 15 – 30 ngày",
    passportValidity: "Hộ chiếu còn hạn tối thiểu 6 tháng",
    fee: "Từ 1.450.000 ₫ (phí dịch vụ + lãnh sự)",
    documents: [
      "Hộ chiếu gốc còn hạn ít nhất 6 tháng & ảnh thẻ nền trắng 3.5×4.5cm.",
      "Hồ sơ chứng minh công việc & tài chính (hoặc miễn chứng minh nếu thuộc diện ưu tiên).",
      "Xác nhận đặt vé máy bay khứ hồi SkyLink & lịch trình lưu trú.",
    ],
  },
  {
    code: "JP",
    name: "Nhật Bản (Tokyo / Osaka)",
    region: "Đông Bắc Á",
    statusLabel: "Cần Visa / E-Visa Nhật Bản",
    statusType: "visa_required",
    processingTime: "5 – 8 ngày làm việc",
    stayLimit: "Tối đa 15 ngày (Single)",
    passportValidity: "Hộ chiếu còn hạn tối thiểu 6 tháng",
    fee: "Từ 1.650.000 ₫ (trọn gói tư vấn)",
    documents: [
      "Hộ chiếu gốc, đơn xin thị thực Nhật Bản & ảnh 4.5×4.5cm nền trắng.",
      "Sao kê tài khoản / chứng minh thu nhập và lịch trình du lịch chi tiết.",
      "Xác nhận vé máy bay khứ hồi & khách sạn tại Nhật Bản.",
    ],
  },
  {
    code: "TW",
    name: "Đài Loan (Đài Bắc / Cao Hùng)",
    region: "Đông Bắc Á",
    statusLabel: "Cần E-Visa / Quan Hồng",
    statusType: "evisa",
    processingTime: "3 – 5 ngày làm việc",
    stayLimit: "Tối đa 14 ngày",
    passportValidity: "Hộ chiếu còn hạn tối thiểu 6 tháng",
    fee: "Từ 1.250.000 ₫",
    documents: [
      "Hộ chiếu gốc còn hạn trên 6 tháng & ảnh 4×6cm nền trắng.",
      "Tờ khai xin cấp phép nhập cảnh trực tuyến (hoặc Visa còn hạn Mỹ/Nhật/Hàn/Châu Âu để xin miễn có điều kiện).",
      "Vé máy bay khứ hồi & đặt phòng khách sạn.",
    ],
  },
  {
    code: "AU",
    name: "Úc (Sydney / Melbourne)",
    region: "Châu Úc",
    statusLabel: "Cần E-Visa (Subclass 600)",
    statusType: "evisa",
    processingTime: "10 – 20 ngày làm việc",
    stayLimit: "Lên đến 3 tháng / lần nhập cảnh",
    passportValidity: "Hộ chiếu còn hạn tối thiểu 6 tháng",
    fee: "Từ 4.200.000 ₫ (bao gồm phí chính phủ Úc)",
    documents: [
      "Hộ chiếu, CCCD, giấy tờ nhân thân & lịch sử du lịch.",
      "Chứng minh tài chính, công việc và kế hoạch chuyến đi tại Úc.",
      "Lấy sinh trắc học (vân tay & ảnh) tại trung tâm VFS Global.",
    ],
  },
  {
    code: "EU",
    name: "Châu Âu (Khối Schengen)",
    region: "Châu Âu",
    statusLabel: "Cần Visa Schengen (Type C)",
    statusType: "visa_required",
    processingTime: "15 – 21 ngày làm việc",
    stayLimit: "Tối đa 90 ngày trong 180 ngày",
    passportValidity: "Hộ chiếu còn hạn ít nhất 3 tháng sau ngày rời Schengen",
    fee: "Từ 3.800.000 ₫",
    documents: [
      "Hộ chiếu gốc, tờ khai Schengen, ảnh 3.5×4.5cm chuẩn ICAO.",
      "Bảo hiểm du lịch quốc tế mức tối thiểu €30.000 (hỗ trợ cấp ngay tại SkyLink Care).",
      "Xác nhận vé máy bay khứ hồi, đặt phòng khách sạn & chứng minh tài chính.",
    ],
  },
];

const ENTRY_SERVICES = [
  {
    id: "fast-track",
    title: "Dịch vụ Fast-Track Sân bay (VIP)",
    subtitle: "Đón tại ống lồng, ưu tiên làm thủ tục xuất nhập cảnh làn riêng & hỗ trợ lấy hành lý trong 10 phút.",
    price: "650.000 ₫ / khách",
    tag: "Phổ biến nhất",
    Icon: AirplaneTilt,
  },
  {
    id: "visa-consult",
    title: "Tư vấn & Hoàn thiện hồ sơ Visa trọn gói",
    subtitle: "Chuyên viên soát hồ sơ, dịch thuật công chứng, đặt lịch hẹn Đại sứ quán / VFS và theo dõi kết quả.",
    price: "Từ 1.250.000 ₫ / bộ",
    tag: "Tỷ lệ đậu 98%",
    Icon: Stamp,
  },
  {
    id: "arrival-card",
    title: "Hỗ trợ khai báo nhập cảnh điện tử",
    subtitle: "Hỗ trợ khai sẵn SG Arrival Card, MDAC Malaysia, Visit Japan Web, e-Arrival Campuchia chính xác 100%.",
    price: "150.000 ₫ / khách",
    tag: "Nhanh trong 15 phút",
    Icon: FileText,
  },
];

export default function VisaSupport() {
  const [nationality, setNationality] = useState("VN");
  const [destinationCode, setDestinationCode] = useState("SG");
  const [checkedDestination, setCheckedDestination] = useState(DESTINATIONS[0]);
  const [checkedNationality, setCheckedNationality] = useState(NATIONALITIES[0]);

  // Consultation Modal State
  const [modalService, setModalService] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const handleCheckVisa = (e) => {
    e.preventDefault();
    const foundDest =
      DESTINATIONS.find((d) => d.code === destinationCode) || DESTINATIONS[0];
    const foundNat =
      NATIONALITIES.find((n) => n.code === nationality) || NATIONALITIES[0];
    setCheckedDestination(foundDest);
    setCheckedNationality(foundNat);
  };

  const openConsultModal = (serviceTitle) => {
    setSubmittedRequest(null);
    setModalService(serviceTitle);
  };

  const handleSubmitConsult = (e) => {
    e.preventDefault();
    const code = `VISA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const record = {
      code,
      service: modalService,
      nationality: checkedNationality.name,
      destination: checkedDestination.name,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      departureDate: departureDate || "Chưa cố định",
      createdAt: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem("skylink_visa_requests") || "[]");
      localStorage.setItem("skylink_visa_requests", JSON.stringify([record, ...prev]));
    } catch {
      // ignore storage errors
    }
    setSubmittedRequest(record);
  };

  const statusBadgeStyle =
    checkedDestination.statusType === "exempt"
      ? { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }
      : checkedDestination.statusType === "evisa"
        ? { background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }
        : { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };

  return (
    <div
      className="min-h-screen font-sans text-slate-900"
      style={{
        background:
          "linear-gradient(180deg, #b8dcff 0%, #dceeff 26%, #eef6ff 64%, #d6eaff 100%)",
      }}
    >
      <Navbar />

      <main className="relative overflow-hidden pb-16 pt-20">
        {/* HERO BACKGROUND LAYER */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: 320 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.84) 46%, rgba(225,241,255,0.22) 100%)",
            }}
          />
          <img
            src={HERO_VISA_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 38%",
              opacity: 0.88,
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 34%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 34%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 92,
              background: "linear-gradient(180deg, rgba(220,238,255,0) 0%, #dceeff 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* TOP HERO HEADER */}
          <header className="pb-6 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-[#16428b] shadow-sm transition hover:bg-white"
              style={{
                border: "1px solid rgba(255,255,255,0.96)",
                borderRadius: 9999,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} weight="bold" />
              Quay lại trang chủ
            </Link>

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div style={{ maxWidth: 560 }}>
                <p
                  className="text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  SKYLINK GLOBAL • HỖ TRỢ XUẤT NHẬP CẢNH
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(2.05rem, 3.5vw, 2.85rem)",
                    color: "#091e47",
                    lineHeight: 1.12,
                    margin: "0 0 8px 0",
                  }}
                >
                  Visa & Hỗ Trợ Nhập Cảnh
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  Tra cứu nhanh yêu cầu thị thực theo quốc tịch & điểm đến, hỗ trợ hoàn thiện hồ sơ
                  Visa và dịch vụ đón tiễn VIP Fast-Track sân bay.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openConsultModal("Tư vấn hồ sơ Visa & Nhập cảnh")}
                className="inline-flex w-fit items-center gap-2 px-5 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(90deg, #0a58ca 0%, #1d75f2 100%)",
                  boxShadow: "0 10px 24px rgba(13, 97, 225, 0.34)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Stamp size={17} weight="fill" />
                <span>Đăng ký tư vấn Visa ngay</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </header>

          {/* VISA REQUIREMENT LOOKUP CARD */}
          <section
            aria-label="Tra cứu yêu cầu thị thực"
            className="mb-7 overflow-hidden bg-white/95"
            style={{
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.10)",
            }}
          >
            {/* Search Form Bar */}
            <form
              onSubmit={handleCheckVisa}
              className="border-b border-blue-50 p-5 sm:p-6"
              style={{ background: "linear-gradient(180deg, #f6faff 0%, #ffffff 100%)" }}
            >
              <div className="mb-4 flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <BookOpen size={20} weight="fill" />
                </span>
                <div>
                  <h2 className="text-base font-black text-[#092152]" style={{ margin: 0 }}>
                    Tra Cứu Yêu Cầu Thị Thực & Giấy Tờ Nhập Cảnh
                  </h2>
                  <p className="text-xs font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Chọn quốc tịch hộ chiếu và quốc gia điểm đến để xem điều kiện nhập cảnh mới nhất.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12 md:items-end">
                <div className="md:col-span-5">
                  <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#3d5b8c]">
                    Quốc tịch của bạn
                  </label>
                  <div className="relative flex items-center">
                    <IdentificationCard
                      size={17}
                      weight="fill"
                      className="pointer-events-none absolute left-3.5 text-blue-600"
                    />
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full rounded-xl border border-blue-200 bg-white py-3 pl-10 pr-4 text-xs font-bold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                    >
                      {NATIONALITIES.map((nat) => (
                        <option key={nat.code} value={nat.code}>
                          {nat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#3d5b8c]">
                    Quốc gia điểm đến
                  </label>
                  <div className="relative flex items-center">
                    <GlobeHemisphereEast
                      size={17}
                      weight="fill"
                      className="pointer-events-none absolute left-3.5 text-blue-600"
                    />
                    <select
                      value={destinationCode}
                      onChange={(e) => setDestinationCode(e.target.value)}
                      className="w-full rounded-xl border border-blue-200 bg-white py-3 pl-10 pr-4 text-xs font-bold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                    >
                      {DESTINATIONS.map((dest) => (
                        <option key={dest.code} value={dest.code}>
                          {dest.name} — {dest.statusLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-1.5 py-3 text-xs font-extrabold text-white transition hover:opacity-95"
                    style={{
                      background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                      boxShadow: "0 8px 18px rgba(13, 94, 215, 0.28)",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <MagnifyingGlass size={15} weight="bold" />
                    Kiểm tra
                  </button>
                </div>
              </div>
            </form>

            {/* Real-World Visa Lookup Result Panel */}
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-50 pb-4">
                <div>
                  <p className="text-xs font-bold text-[#556f96]" style={{ margin: "0 0 4px 0" }}>
                    Kết quả tra cứu: <strong>{checkedNationality.name}</strong> →{" "}
                    <strong className="text-[#0b5ed7]">{checkedDestination.name}</strong>
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold"
                      style={statusBadgeStyle}
                    >
                      {checkedDestination.statusType === "exempt" ? (
                        <CheckCircle size={15} weight="fill" />
                      ) : (
                        <WarningCircle size={15} weight="fill" />
                      )}
                      {checkedDestination.statusLabel}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Khu vực: {checkedDestination.region}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openConsultModal(`Hỗ trợ thủ tục nhập cảnh ${checkedDestination.name}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-[#0b4fd0] transition hover:bg-blue-100"
                  style={{
                    background: "#eef6ff",
                    border: "1px solid #c5ddfc",
                    borderRadius: 9999,
                    cursor: "pointer",
                  }}
                >
                  Nhận hỗ trợ hồ sơ cho tuyến này
                  <ArrowRight size={13} weight="bold" />
                </button>
              </div>

              {/* 4 Key Info Pills */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-[#f7faff] p-3.5" style={{ border: "1px solid #e4effd" }}>
                  <p className="text-[11px] font-bold text-[#5a749b]" style={{ margin: 0 }}>
                    Thời gian lưu trú
                  </p>
                  <p className="mt-1 text-xs font-black text-[#092152]" style={{ margin: "4px 0 0 0" }}>
                    {checkedDestination.stayLimit}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f7faff] p-3.5" style={{ border: "1px solid #e4effd" }}>
                  <p className="text-[11px] font-bold text-[#5a749b]" style={{ margin: 0 }}>
                    Thời gian xử lý dự kiến
                  </p>
                  <p className="mt-1 text-xs font-black text-[#092152]" style={{ margin: "4px 0 0 0" }}>
                    {checkedDestination.processingTime}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f7faff] p-3.5" style={{ border: "1px solid #e4effd" }}>
                  <p className="text-[11px] font-bold text-[#5a749b]" style={{ margin: 0 }}>
                    Yêu cầu hộ chiếu
                  </p>
                  <p className="mt-1 text-xs font-black text-[#092152]" style={{ margin: "4px 0 0 0" }}>
                    {checkedDestination.passportValidity}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f7faff] p-3.5" style={{ border: "1px solid #e4effd" }}>
                  <p className="text-[11px] font-bold text-[#5a749b]" style={{ margin: 0 }}>
                    Chi phí tham khảo
                  </p>
                  <p className="mt-1 text-xs font-black text-[#0b4fd0]" style={{ margin: "4px 0 0 0" }}>
                    {checkedDestination.fee}
                  </p>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="mt-4 rounded-2xl bg-[#fbfdff] p-4" style={{ border: "1px solid #e4effd" }}>
                <p className="mb-2.5 text-xs font-extrabold text-[#092152]" style={{ margin: "0 0 10px 0" }}>
                  Hồ sơ & giấy tờ cần chuẩn bị khi nhập cảnh {checkedDestination.name}:
                </p>
                <ul className="space-y-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {checkedDestination.documents.map((doc, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs font-semibold text-[#2b4776]"
                    >
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 3-COLUMN ENTRY SUPPORT SERVICES */}
          <section aria-label="Dịch vụ hỗ trợ xuất nhập cảnh">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#092152]" style={{ margin: 0 }}>
                Dịch vụ hỗ trợ xuất nhập cảnh SkyLink
              </h2>
              <span className="text-xs font-bold text-[#4a658f]">
                Hỗ trợ tại sân bay & lãnh sự 24/7
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {ENTRY_SERVICES.map((srv) => {
                const Icon = srv.Icon;
                return (
                  <article
                    key={srv.id}
                    className="flex flex-col bg-white p-5 transition duration-300 hover:-translate-y-1"
                    style={{
                      borderRadius: 22,
                      border: "1px solid rgba(255,255,255,0.98)",
                      boxShadow: "0 12px 30px rgba(21, 64, 138, 0.09)",
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                      >
                        <Icon size={22} weight="fill" />
                      </span>
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-extrabold"
                        style={{ background: "#eef6ff", color: "#0b4fd0" }}
                      >
                        {srv.tag}
                      </span>
                    </div>

                    <h3
                      className="text-base font-black text-[#092152]"
                      style={{ margin: "0 0 6px 0" }}
                    >
                      {srv.title}
                    </h3>
                    <p
                      className="mb-5 flex-1 text-xs font-semibold leading-relaxed text-[#4f6891]"
                      style={{ margin: "0 0 18px 0" }}
                    >
                      {srv.subtitle}
                    </p>

                    <div className="flex items-center justify-between gap-2 border-t border-blue-50 pt-3.5">
                      <span className="text-sm font-black text-[#0b4fd0]">{srv.price}</span>
                      <button
                        type="button"
                        onClick={() => openConsultModal(srv.title)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                        style={{
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                          borderRadius: 9999,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Đăng ký
                        <ArrowRight size={13} weight="bold" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* BOTTOM OFFICIAL DISCLAIMER PILL */}
          <div className="mt-7 flex justify-center">
            <div
              className="inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold"
              style={{
                background: "rgba(255, 255, 255, 0.88)",
                color: "#294878",
                border: "1px solid rgba(255, 255, 255, 0.98)",
                boxShadow: "0 8px 22px rgba(21, 64, 138, 0.08)",
                borderRadius: 9999,
              }}
            >
              <Headset size={17} weight="fill" style={{ color: "#0b5ed7" }} />
              <span>
                Tư vấn Visa & Fast-Track 24/7:{" "}
                <strong className="font-black text-[#0b2559]">1900 1234</strong> • Quy định thị thực
                có thể thay đổi theo thông báo mới nhất của cơ quan xuất nhập cảnh.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* CONSULTATION & FAST-TRACK REQUEST MODAL */}
      {modalService && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{
            background: "rgba(9, 25, 58, 0.52)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setModalService(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="visa-modal-title"
            className="w-full overflow-hidden bg-white shadow-2xl"
            style={{
              maxWidth: 520,
              borderRadius: 24,
              border: "1px solid #dbe9fe",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative px-6 py-5 text-white"
              style={{
                background: "linear-gradient(120deg, #0a4bb8 0%, #1d75f2 100%)",
              }}
            >
              <button
                type="button"
                onClick={() => setModalService(null)}
                aria-label="Đóng hộp thoại"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center bg-white/20 text-white transition hover:bg-white/30"
                style={{ borderRadius: 9999, border: "none", cursor: "pointer" }}
              >
                <X size={16} weight="bold" />
              </button>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-extrabold">
                <ShieldCheck size={13} weight="fill" />
                SkyLink Global Visa Desk
              </span>
              <h2
                id="visa-modal-title"
                className="mt-2 text-lg font-black text-white"
                style={{ margin: "8px 0 4px 0" }}
              >
                {modalService}
              </h2>
              <p className="text-xs font-semibold text-blue-100" style={{ margin: 0 }}>
                Điểm đến đang chọn: {checkedDestination.name} ({checkedDestination.statusLabel})
              </p>
            </div>

            <div className="p-6">
              {submittedRequest ? (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={22} weight="fill" className="shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-black text-emerald-950" style={{ margin: 0 }}>
                        Đã tiếp nhận yêu cầu hỗ trợ!
                      </p>
                      <p
                        className="mt-1 text-xs font-semibold leading-relaxed text-emerald-800"
                        style={{ margin: "4px 0 0 0" }}
                      >
                        Mã hồ sơ: <strong>{submittedRequest.code}</strong>
                        <br />
                        Dịch vụ: <strong>{submittedRequest.service}</strong>
                        <br />
                        Chuyên viên Visa SkyLink sẽ liên hệ số{" "}
                        <strong>{submittedRequest.phone}</strong> trong vòng 15 phút để hướng dẫn
                        chi tiết.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalService(null)}
                      className="px-5 py-2 text-xs font-extrabold text-white"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Hoàn tất
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitConsult} className="space-y-3.5">
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 text-xs"
                    style={{
                      background: "#f0f7ff",
                      border: "1px solid #d5e7ff",
                      color: "#1e4280",
                    }}
                  >
                    <Info size={16} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
                    <span>
                      Chuyên viên kiểm tra miễn phí điều kiện hồ sơ trước khi nộp và hỗ trợ đặt lịch
                      ưu tiên theo ngày bay của bạn.
                    </span>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                      Họ và tên khách hàng
                    </label>
                    <div className="relative flex items-center">
                      <User
                        size={15}
                        className="pointer-events-none absolute left-3 text-blue-600"
                      />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full rounded-xl border border-blue-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Số điện thoại / Zalo
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0901 234 567"
                        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Email liên hệ
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@skylink.vn"
                        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                      Ngày dự kiến khởi hành
                    </label>
                    <div className="relative flex items-center">
                      <Clock
                        size={15}
                        className="pointer-events-none absolute left-3 text-blue-600"
                      />
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full rounded-xl border border-blue-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-[#102d63] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalService(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                      style={{
                        borderRadius: 9999,
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        boxShadow: "0 6px 16px rgba(11, 94, 215, 0.28)",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <CheckCircle size={15} weight="fill" />
                      Gửi yêu cầu hỗ trợ
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
