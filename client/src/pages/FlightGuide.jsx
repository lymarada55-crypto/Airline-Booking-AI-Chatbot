import { createElement, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ClipboardText,
  Clock,
  Headset,
  IdentificationCard,
  Info,
  ShieldCheck,
  SuitcaseRolling,
  WarningCircle,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_GUIDE_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const GUIDES = {
  baggage: {
    eyebrow: "CẨM NANG BAY • QUY ĐỊNH HÀNH LÝ",
    title: "Chuẩn bị hành lý đúng quy định",
    description:
      "Nắm rõ tiêu chuẩn cân nặng, kích thước hành lý xách tay, ký gửi và vật phẩm hạn chế để làm thủ tục nhanh chóng, không phát sinh phí tại sân bay.",
    Icon: SuitcaseRolling,
    quickFacts: [
      { label: "Xách tay Phổ thông", value: "07 kg + 01 túi nhỏ", note: "Tổng kích thước ≤ 115 cm" },
      { label: "Xách tay Thương gia", value: "18 kg (02 kiện)", note: "Mỗi kiện ≤ 10 kg" },
      { label: "Ký gửi tiêu chuẩn", value: "23 kg / kiện", note: "Tối đa 32 kg / kiện nặng" },
      { label: "Pin sạc dự phòng", value: "Chỉ mang xách tay", note: "Dung lượng ≤ 100Wh" },
    ],
    sections: [
      {
        title: "Hành lý xách tay (Cabin Baggage)",
        body: "Hành lý xách tay phải đặt vừa khoang chứa phía trên hoặc dưới ghế trước. Luôn giữ giấy tờ tùy thân, thuốc men, tiền mặt và thiết bị điện tử trong hành lý xách tay.",
        points: [
          "Kích thước tối đa mỗi kiện xách tay: 56 × 36 × 23 cm (tính cả bánh xe và tay cầm).",
          "Chất lỏng trên chặng quốc tế: mỗi chai/lọ không quá 100ml, đặt gọn trong 01 túi zip trong suốt dung tích tối đa 1 lít.",
          "Tuyệt đối không để dao kéo, vật sắc nhọn, bật lửa hoặc bình xịt áp suất lớn trong hành lý xách tay.",
        ],
      },
      {
        title: "Hành lý ký gửi (Checked Baggage)",
        body: "Định mức hành lý ký gửi phụ thuộc vào hạng vé (Economy Lite, Economy Classic, Business). Nếu cần mang thêm hành lý, bạn nên mua trước giờ bay ít nhất 6 giờ để tiết kiệm đến 50% so với mua tại quầy.",
        points: [
          "Cân hành lý tại nhà trước khi ra sân bay; mỗi kiện ký gửi tiêu chuẩn không vượt quá 23 kg (tối đa 32 kg đối với kiện đặc biệt).",
          "Gắn thẻ tên, số điện thoại và gỡ bỏ các mã vạch hành lý của chuyến bay cũ trước khi ký gửi.",
          "Không để tiền mặt, trang sức, laptop, hộ chiếu hoặc đồ dễ vỡ trong hành lý ký gửi.",
        ],
      },
      {
        title: "Vật phẩm đặc biệt & Hàng hóa hạn chế",
        body: "Pin lithium, thiết bị y tế, xe đẩy em bé, bộ gậy golf hoặc nhạc cụ có quy chuẩn vận chuyển riêng theo quy định an toàn bay ICAO/IATA.",
        points: [
          "Pin sạc dự phòng dưới 100Wh (khoảng 27.000 mAh) bắt buộc mang theo hành lý xách tay, không được ký gửi và phải bọc bảo vệ đầu cực.",
          "Xe đẩy trẻ em gấp gọn được hỗ trợ gửi miễn phí tại cửa lên máy bay.",
          "Thiết bị y tế cá nhân (máy trợ thở, ống tiêm insulin...) cần mang kèm giấy xác nhận của bác sĩ.",
        ],
      },
    ],
  },
  documents: {
    eyebrow: "CẨM NANG BAY • GIẤY TỜ TÙY THÂN",
    title: "Giấy tờ cần chuẩn bị trước chuyến bay",
    description:
      "Rà soát đầy đủ giấy tờ định danh hợp lệ cho người lớn, trẻ em và chuyến bay quốc tế để đảm bảo hành trình suôn sẻ từ quầy check-in đến cửa khởi hành.",
    Icon: IdentificationCard,
    quickFacts: [
      { label: "Bay Nội địa (≥14 tuổi)", value: "CCCD / VNeID mức 2", note: "Hoặc Hộ chiếu / GPLX" },
      { label: "Trẻ em (<14 tuổi)", value: "Giấy khai sinh gốc", note: "Hoặc bản sao trích lục" },
      { label: "Bay Quốc tế", value: "Hộ chiếu ≥ 6 tháng", note: "Kèm Visa / E-Visa nếu cần" },
      { label: "Khớp thông tin vé", value: "Trùng khớp 100%", note: "Họ tên như trên giấy tờ" },
    ],
    sections: [
      {
        title: "Chuyến bay nội địa Việt Nam",
        body: "Hành khách cần xuất trình giấy tờ tùy thân bản gốc còn hạn sử dụng, hình ảnh rõ nét. Tài khoản định danh điện tử VNeID mức độ 2 hiện được chấp nhận rộng rãi tại tất cả các sân bay nội địa.",
        points: [
          "Hành khách từ đủ 14 tuổi trở lên: CCCD gắn chip, Tài khoản VNeID mức độ 2, Hộ chiếu hoặc Giấy phép lái xe bản gốc.",
          "Trẻ em dưới 14 tuổi: Giấy khai sinh bản gốc hoặc bản sao trích lục (trẻ dưới 1 tháng tuổi có thể dùng Giấy chứng sinh).",
          "Nếu mất giấy tờ sát ngày bay, cần xin Giấy xác nhận nhân thân có dán ảnh đóng dấu giáp lai của công an địa phương (còn hạn 30 ngày).",
        ],
      },
      {
        title: "Chuyến bay quốc tế & Quá cảnh",
        body: "Ngoài hộ chiếu hợp lệ, hành khách bay quốc tế cần kiểm tra kỹ yêu cầu thị thực (Visa), tờ khai nhập cảnh điện tử và quy định quá cảnh của quốc gia điểm đến.",
        points: [
          "Hộ chiếu gốc phải còn thời hạn tối thiểu 06 tháng tính từ ngày nhập cảnh và còn ít nhất 02 trang trắng.",
          "Chuẩn bị Visa / E-Visa (Hàn Quốc, Nhật Bản, Úc, Schengen...) hoặc khai báo e-Arrival (Singapore, Malaysia, Campuchia) trước giờ bay.",
          "Mang sẵn xác nhận vé máy bay khứ hồi, đặt phòng khách sạn và bảo hiểm du lịch quốc tế nếu hải quan yêu cầu xuất trình.",
        ],
      },
      {
        title: "Kiểm tra thông tin trên vé & Mã đặt chỗ (PNR)",
        body: "Họ và tên in trên vé phải khớp chính xác với thứ tự và chính tả trên CCCD/Hộ chiếu. Phát hiện sai sót cần báo ngay cho SkyLink để hỗ trợ điều chỉnh sớm.",
        points: [
          "Lưu sẵn Mã đặt chỗ (PNR) hoặc Thẻ lên máy bay điện tử trên điện thoại.",
          "Kiểm tra đúng ngày bay, giờ khởi hành (định dạng 24h) và nhà ga đi (T1 nội địa / T2 quốc tế).",
          "Liên hệ Hotline 1900 1234 nếu cần điều chỉnh sai chính tả tên hành khách trước giờ bay.",
        ],
      },
    ],
  },
  procedures: {
    eyebrow: "CẨM NANG BAY • THỦ TỤC SÂN BAY",
    title: "Các bước làm thủ tục tại sân bay",
    description:
      "Quy trình 4 bước chuẩn quốc tế từ Check-in trực tuyến, gửi hành lý, soi chiếu an ninh đến cửa khởi hành giúp bạn chủ động thời gian tối đa.",
    Icon: ClipboardText,
    quickFacts: [
      { label: "Check-in trực tuyến", value: "Trước 24h – 2h", note: "Mở trên website SkyLink" },
      { label: "Có mặt (Nội địa)", value: "Trước 90 phút", note: "Đóng quầy trước 40 phút" },
      { label: "Có mặt (Quốc tế)", value: "Trước 180 phút", note: "Đóng quầy trước 50 phút" },
      { label: "Đóng cửa lên tàu bay", value: "Trước 15 phút", note: "Theo giờ ghi trên Boarding Pass" },
    ],
    sections: [
      {
        title: "Bước 1: Check-in trực tuyến & Chuẩn bị trước khi ra sân bay",
        body: "Làm thủ tục trực tuyến (Online Check-in) giúp bạn chọn trước chỗ ngồi yêu thích và bỏ qua hàng chờ dài tại quầy nếu không có hành lý ký gửi.",
        points: [
          "Đăng ký suất ăn đặc biệt (nếu có nhu cầu) trước giờ khởi hành tối thiểu 24 giờ.",
          "Làm Online Check-in trong khung từ 24 giờ đến 2 giờ trước giờ bay tại trang Check-in SkyLink.",
          "Có mặt tại sân bay trước 90 phút (chặng nội địa) hoặc 180 phút (chặng quốc tế).",
        ],
      },
      {
        title: "Bước 2: Gửi hành lý & Soi chiếu an ninh",
        body: "Hành khách có hành lý ký gửi đến quầy Drop-off của SkyLink để cân và nhận thẻ hành lý, sau đó di chuyển vào khu vực kiểm tra an ninh.",
        points: [
          "Kiểm tra kỹ số cửa khởi hành (Gate), số ghế và giờ lên máy bay (Boarding Time) trên thẻ lên máy bay.",
          "Lấy riêng laptop, pin sạc dự phòng, áo khoác, thắt lưng và vật kim loại ra khay khi qua cổng soi chiếu an ninh.",
          "Hành khách bay quốc tế hoàn tất thủ tục xuất cảnh tại khu vực Công an cửa khẩu sau khi qua quầy check-in.",
        ],
      },
      {
        title: "Bước 3: Có mặt tại cửa khởi hành (Boarding Gate)",
        body: "Cửa khởi hành có thể thay đổi linh hoạt theo điều phối sân bay. Hãy luôn quan sát màn hình điện tử và lắng nghe loa thông báo.",
        points: [
          "Có mặt tại cửa khởi hành ít nhất 30–40 phút trước giờ cất cánh; cửa lên máy bay đóng trước giờ bay 15 phút.",
          "Chuẩn bị sẵn Thẻ lên máy bay (Boarding Pass) và CCCD/Hộ chiếu trên tay để quét nhanh.",
          "Ưu tiên lên máy bay trước đối với hành khách Thương gia, hội viên SkyClub VIP, người cao tuổi và gia đình có trẻ nhỏ.",
        ],
      },
    ],
  },
};

const GUIDE_TABS = [
  { key: "baggage", label: "Quy định hành lý", Icon: SuitcaseRolling },
  { key: "documents", label: "Giấy tờ cần chuẩn bị", Icon: IdentificationCard },
  { key: "procedures", label: "Thủ tục tại sân bay", Icon: ClipboardText },
];

const PRE_FLIGHT_CHECKLIST = [
  "CCCD gắn chip / VNeID mức 2 hoặc Hộ chiếu còn hạn ≥ 6 tháng",
  "Mã đặt chỗ (PNR) / Thẻ lên máy bay điện tử đã lưu sẵn",
  "Hành lý xách tay ≤ 7kg, pin dự phòng để trong hành lý xách tay",
  "Đã đăng ký suất ăn đặc biệt (nếu cần) trước giờ bay 24 giờ",
];

export default function FlightGuide() {
  const { topic = "baggage" } = useParams();
  const activeKey = GUIDES[topic] ? topic : "baggage";
  const guide = GUIDES[activeKey];
  const GuideIcon = guide.Icon;

  const [checkedItems, setCheckedItems] = useState({});

  const toggleChecklist = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

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
          style={{ height: 325 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.84) 46%, rgba(225,241,255,0.20) 100%)",
            }}
          />
          <img
            src={HERO_GUIDE_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 32%",
              opacity: 0.9,
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
              <div style={{ maxWidth: 580 }}>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  <AirplaneTilt size={15} weight="fill" />
                  {guide.eyebrow}
                </p>
                <motion.h1
                  key={activeKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(1.95rem, 3.4vw, 2.75rem)",
                    color: "#091e47",
                    lineHeight: 1.14,
                    margin: "0 0 8px 0",
                  }}
                >
                  {guide.title}
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  {guide.description}
                </p>
              </div>

              {/* Quick Topic Switcher Pills (Single crisp horizontal row) */}
              <nav
                aria-label="Chuyển chủ đề cẩm nang bay"
                className="inline-flex shrink-0 flex-wrap items-center gap-1 p-1.5 lg:flex-nowrap"
                style={{
                  background: "rgba(255, 255, 255, 0.94)",
                  border: "1px solid rgba(255, 255, 255, 0.98)",
                  boxShadow: "0 10px 26px rgba(18, 60, 130, 0.10)",
                  borderRadius: 9999,
                }}
              >
                {GUIDE_TABS.map(({ key, label, Icon }) => {
                  const isActive = activeKey === key;
                  return (
                    <Link
                      key={key}
                      to={`/flight-guide/${key}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold transition"
                      style={
                        isActive
                          ? {
                              background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                              color: "#ffffff",
                              borderRadius: 9999,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }
                          : {
                              background: "transparent",
                              color: "#1e3f77",
                              borderRadius: 9999,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }
                      }
                    >
                      {createElement(Icon, { size: 15, weight: "fill" })}
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          {/* 4 QUICK REFERENCE STATS BAR */}
          <section
            aria-label="Thông số quan trọng cần nhớ"
            className="mb-7"
            style={{
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
              borderRadius: 20,
              padding: "14px 20px",
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {guide.quickFacts.map((fact, idx) => (
                <div
                  key={fact.label}
                  className={idx > 0 ? "lg:border-l lg:border-blue-100 lg:pl-4" : ""}
                >
                  <p className="text-[11px] font-bold text-[#5a749b]" style={{ margin: 0 }}>
                    {fact.label}
                  </p>
                  <p className="mt-0.5 text-sm font-black text-[#0b4fd0]" style={{ margin: "2px 0 0 0" }}>
                    {fact.value}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500" style={{ margin: "2px 0 0 0" }}>
                    {fact.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* MAIN CONTENT: LEFT DETAILED GUIDE CARDS + RIGHT CHECKLIST & SHORTCUTS */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 8 Columns: Detailed Sections */}
            <div className="space-y-4 lg:col-span-8">
              {guide.sections.map((section, index) => (
                <article
                  key={section.title}
                  className="bg-white p-5 sm:p-6"
                  style={{
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.98)",
                    boxShadow: "0 12px 30px rgba(20, 62, 132, 0.08)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black"
                      style={{
                        background: "linear-gradient(135deg, #eaf3ff 0%, #dbeafe 100%)",
                        color: "#0b4fd0",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2
                        className="text-base font-black text-[#092152] sm:text-lg"
                        style={{ margin: "0 0 6px 0" }}
                      >
                        {section.title}
                      </h2>
                      <p
                        className="text-xs font-medium leading-relaxed text-[#47628a] sm:text-[13px]"
                        style={{ margin: "0 0 14px 0" }}
                      >
                        {section.body}
                      </p>
                      <ul
                        className="space-y-2.5"
                        style={{ listStyle: "none", padding: 0, margin: 0 }}
                      >
                        {section.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2.5 rounded-xl bg-[#f7faff] px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-[#1d3969]"
                            style={{ border: "1px solid #e6f0fe" }}
                          >
                            <CheckCircle
                              size={16}
                              weight="fill"
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Right 4 Columns: Interactive Pre-Flight Checklist & Quick Links */}
            <aside className="space-y-5 lg:col-span-4">
              {/* Interactive Pre-flight Checklist */}
              <div
                className="bg-white p-5"
                style={{
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.98)",
                  boxShadow: "0 12px 30px rgba(20, 62, 132, 0.08)",
                }}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                  >
                    <GuideIcon size={20} weight="fill" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[#092152]" style={{ margin: 0 }}>
                      Checklist trước giờ bay
                    </h3>
                    <p className="text-[11px] font-semibold text-[#5a749b]" style={{ margin: 0 }}>
                      Tích chọn để rà soát nhanh trước khi đi
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {PRE_FLIGHT_CHECKLIST.map((item, idx) => {
                    const checked = !!checkedItems[idx];
                    return (
                      <label
                        key={item}
                        className="cursor-pointer rounded-xl p-3 text-xs font-semibold transition"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          background: checked ? "#ecfdf5" : "#f8fbff",
                          border: checked ? "1px solid #a7f3d0" : "1px solid #e4effd",
                          color: checked ? "#065f46" : "#1e3a6d",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChecklist(idx)}
                          style={{
                            width: 16,
                            height: 16,
                            marginTop: 2,
                            flexShrink: 0,
                            accentColor: "#16a34a",
                          }}
                        />
                        <span className={checked ? "line-through opacity-80" : ""}>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quick Online Check-in CTA Card */}
              <div
                className="p-5 text-white"
                style={{
                  borderRadius: 24,
                  background: "linear-gradient(135deg, #09255e 0%, #0b52c4 60%, #1d78f0 100%)",
                  boxShadow: "0 14px 32px rgba(13, 94, 215, 0.24)",
                }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold">
                  <Clock size={13} weight="fill" />
                  Mở trước 24 giờ bay
                </span>
                <h3 className="mt-3 text-base font-black text-white" style={{ margin: "10px 0 6px 0" }}>
                  Sẵn sàng làm thủ tục trực tuyến?
                </h3>
                <p className="text-xs font-medium leading-relaxed text-blue-100" style={{ margin: "0 0 16px 0" }}>
                  Check-in online ngay để chọn chỗ ngồi trước và nhận Thẻ lên máy bay điện tử không
                  cần xếp hàng tại quầy.
                </p>
                <Link
                  to="/check-in"
                  className="inline-flex w-full items-center justify-center gap-1.5 bg-white py-2.5 text-xs font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                  style={{ borderRadius: 9999, textDecoration: "none" }}
                >
                  <span>Check-in trực tuyến ngay</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>

              {/* Safety & Support Links */}
              <div
                className="bg-white p-5"
                style={{
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.98)",
                  boxShadow: "0 12px 30px rgba(20, 62, 132, 0.08)",
                }}
              >
                <p className="mb-3 flex items-center gap-2 text-xs font-black text-[#092152]" style={{ margin: "0 0 10px 0" }}>
                  <Info size={16} weight="fill" className="text-blue-600" />
                  Liên kết hữu ích khác
                </p>
                <div className="space-y-2 text-xs font-bold">
                  <Link
                    to="/flight-safety/policy"
                    className="flex items-center justify-between rounded-xl bg-[#f7faff] px-3.5 py-2.5 text-[#173a78] transition hover:bg-blue-50"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck size={15} weight="fill" className="text-blue-600" />
                      Chính sách An toàn bay
                    </span>
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                  <Link
                    to="/services/meals"
                    className="flex items-center justify-between rounded-xl bg-[#f7faff] px-3.5 py-2.5 text-[#173a78] transition hover:bg-blue-50"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <WarningCircle size={15} weight="fill" className="text-blue-600" />
                      Đăng ký Suất ăn đặc biệt (Miễn phí)
                    </span>
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                  <Link
                    to="/support"
                    className="flex items-center justify-between rounded-xl bg-[#f7faff] px-3.5 py-2.5 text-[#173a78] transition hover:bg-blue-50"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Headset size={15} weight="fill" className="text-blue-600" />
                      Trung tâm Hỗ trợ 24/7
                    </span>
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
