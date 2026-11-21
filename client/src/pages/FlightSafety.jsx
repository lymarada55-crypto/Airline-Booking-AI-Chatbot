import { createElement } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  Certificate,
  CheckCircle,
  ClipboardText,
  Gauge,
  Headset,
  Info,
  ShieldCheck,
  SuitcaseRolling,
  Wrench,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_SAFETY_BG_URL =
  "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=85";

const SAFETY_PAGES = {
  policy: {
    eyebrow: "AN TOÀN BAY • CHÍNH SÁCH AN TOÀN",
    title: "An toàn là ưu tiên trong mọi quyết định",
    description:
      "Hệ thống quản lý an toàn (SMS) theo chuẩn quốc tế ICAO & IOSA định hướng mọi quy trình khai thác, đào tạo tổ bay và kiểm soát rủi ro tại SkyLink Airlines.",
    Icon: ShieldCheck,
    quickMetrics: [
      { label: "Chứng chỉ quốc tế", value: "Chuẩn IOSA & ICAO", note: "Đánh giá định kỳ 2 năm/lần" },
      { label: "Hệ thống quản lý", value: "SMS 24/7", note: "Giám sát dữ liệu bay thời gian thực" },
      { label: "Đào tạo tổ bay", value: "100% đạt chuẩn", note: "Huấn luyện mô phỏng SIM định kỳ" },
      { label: "Chỉ số tin cậy", value: "99.8% an toàn", note: "Ưu tiên an toàn trên mọi lịch trình" },
    ],
    sections: [
      {
        title: "Ưu tiên an toàn tuyệt đối",
        body: "An toàn của hành khách và phi hành đoàn luôn được đặt lên trước mọi mục tiêu lịch trình hay thương mại. Mọi dấu hiệu bất thường đều được kiểm tra, đánh giá và xử lý triệt để trước khi tàu bay cất cánh.",
        points: [
          "Tuân thủ nghiêm ngặt quy định của Cục Hàng không Việt Nam (CAAV), ICAO và tiêu chuẩn IOSA.",
          "Không bỏ qua bất kỳ cảnh báo kỹ thuật hay sai lệch quy trình nào trong khai thác.",
          "Thiết lập đường dây báo cáo an toàn độc lập cho nhân sự và hành khách 24/7.",
        ],
      },
      {
        title: "Nhận diện & Quản lý rủi ro chủ động (SMS)",
        body: "SkyLink vận hành Hệ thống Quản lý An toàn (Safety Management System) giúp nhận diện mối nguy từ sớm, phân tích dữ liệu bay (FDA) và phòng ngừa sự cố trước khi xảy ra.",
        points: [
          "Khuyến khích văn hóa báo cáo tự nguyện không trừng phạt (Just Culture) đối với mọi nguy cơ tiềm ẩn.",
          "Đánh giá rủi ro an toàn (SRA) bắt buộc trước mỗi thay đổi đường bay, thiết bị hoặc quy trình mới.",
          "Theo dõi chặt chẽ biện pháp khắc phục và cập nhật tài liệu khai thác định kỳ.",
        ],
      },
      {
        title: "Đào tạo phi hành đoàn & Văn hóa an toàn",
        body: "Phi công, tiếp viên và nhân viên mặt đất đều trải qua chương trình huấn luyện khắt khe về xử lý tình huống khẩn cấp, y tế trên không và phối hợp tổ bay (CRM).",
        points: [
          "Phi công huấn luyện buồng lái mô phỏng (Full Flight Simulator) định kỳ 6 tháng/lần.",
          "Tiếp viên được cấp chứng chỉ sơ cứu y tế, thoát hiểm khẩn cấp và an ninh hàng không.",
          "Phối hợp nhịp nhàng giữa Trung tâm điều hành bay (OCC), kỹ thuật và phục vụ mặt đất.",
        ],
      },
    ],
  },
  maintenance: {
    eyebrow: "AN TOÀN BAY • CAM KẾT BẢO DƯỠNG",
    title: "Bảo dưỡng có kế hoạch, kiểm soát & lưu hồ sơ",
    description:
      "Đội tàu bay SkyLink được bảo dưỡng theo tiêu chuẩn nhà sản xuất Airbus / Boeing và kiểm tra nghiêm ngặt bởi kỹ sư có chứng chỉ trước mỗi chuyến bay.",
    Icon: Wrench,
    quickMetrics: [
      { label: "Chuẩn tổ chức bảo dưỡng", value: "VAR Part-145 / EASA", note: "Phê chuẩn quốc tế" },
      { label: "Kiểm tra trước bay", value: "100% chuyến bay", note: "Transit & Daily Check bắt buộc" },
      { label: "Bảo dưỡng định kỳ", value: "A / C / D Check", note: "Theo đúng giờ bay & chu kỳ hạ cánh" },
      { label: "Truy xuất hồ sơ", value: "100% số hóa", note: "Lưu trữ lịch sử từng linh kiện" },
    ],
    sections: [
      {
        title: "Thực hiện nghiêm ngặt theo chương trình bảo dưỡng",
        body: "Toàn bộ tàu bay được lập kế hoạch bảo dưỡng định kỳ (Line Maintenance & Base Maintenance) tuân thủ tài liệu kỹ thuật mới nhất của nhà sản xuất và chỉ lệnh khả phi bắt buộc (AD).",
        points: [
          "Kiểm tra kỹ thuật trước mỗi chuyến bay (Transit Check) và kiểm tra cuối ngày (Daily Check).",
          "Thực hiện bảo dưỡng định kỳ cấp độ A-Check, C-Check và đại tu D-Check đúng chu kỳ giờ bay.",
          "Sử dụng 100% phụ tùng, vật tư chính hãng có chứng chỉ xuất xứ hàng không (FAA 8130-3 / EASA Form 1).",
        ],
      },
      {
        title: "Đội ngũ kỹ sư đủ thẩm quyền & Kiểm soát chất lượng",
        body: "Mọi hạng mục kỹ thuật đều do kỹ sư hàng không có chứng chỉ CRS (Certificate of Release to Service) trực tiếp thực hiện và kiểm tra chéo độc lập.",
        points: [
          "Phân công kỹ sư đúng năng định loại tàu bay (Airbus A320/A321neo, Boeing 787...).",
          "Áp dụng quy trình kiểm tra kép (RII – Required Inspection Item) cho các hệ thống trọng yếu như động cơ, càng đáp, điều khiển bay.",
          "Đánh giá chất lượng độc lập (QA) định kỳ đối với mọi xưởng bảo dưỡng và nhà cung cấp.",
        ],
      },
      {
        title: "Chỉ khai thác khi đạt 100% tiêu chuẩn khả phi",
        body: "Bất kỳ bất thường kỹ thuật nào cũng phải được xử lý đúng quy định MEL/AMM. Tàu bay chỉ được ký lệnh cho phép cất cánh khi đạt đủ điều kiện an toàn tuyệt đối.",
        points: [
          "Kiên quyết dừng khai thác để xử lý dứt điểm nếu thiết bị không đạt ngưỡng an toàn quy định.",
          "Không tự ý bỏ qua hoặc đóng lỗi ngoài thẩm quyền được phê duyệt.",
          "Lưu trữ đầy đủ hồ sơ kỹ thuật số hóa phục vụ truy xuất nguồn gốc và thanh tra của nhà chức trách.",
        ],
      },
    ],
  },
};

const SAFETY_TABS = [
  { key: "policy", label: "Chính sách an toàn", Icon: ShieldCheck },
  { key: "maintenance", label: "Cam kết bảo dưỡng", Icon: Wrench },
];

const SAFETY_STANDARDS = [
  {
    code: "IOSA",
    title: "Chứng nhận An toàn Khai thác IATA",
    desc: "Bộ tiêu chuẩn đánh giá an toàn khai thác khắt khe nhất toàn cầu của Hiệp hội Vận tải Hàng không Quốc tế.",
  },
  {
    code: "SMS",
    title: "Hệ thống Quản lý An toàn ICAO",
    desc: "Phân tích dữ liệu bay chủ động, nhận diện sớm rủi ro và tối ưu hóa quy trình khai thác bay.",
  },
  {
    code: "Part-145",
    title: "Tổ chức Bảo dưỡng Tàu bay Chuẩn Quốc tế",
    desc: "Kiểm soát toàn diện chất lượng kỹ thuật, phụ tùng chính hãng và năng định kỹ sư hàng không.",
  },
];

export default function FlightSafety() {
  const { topic = "policy" } = useParams();
  const activeKey = SAFETY_PAGES[topic] ? topic : "policy";
  const page = SAFETY_PAGES[activeKey];
  const PageIcon = page.Icon;

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
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.85) 46%, rgba(225,241,255,0.22) 100%)",
            }}
          />
          <img
            src={HERO_SAFETY_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 42%",
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
              <div style={{ maxWidth: 590 }}>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  <AirplaneTilt size={15} weight="fill" />
                  {page.eyebrow}
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
                  {page.title}
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  {page.description}
                </p>
              </div>

              {/* Single-row Topic Switcher Pill */}
              <nav
                aria-label="Chuyển chuyên mục an toàn bay"
                className="inline-flex shrink-0 items-center gap-1 p-1.5"
                style={{
                  background: "rgba(255, 255, 255, 0.94)",
                  border: "1px solid rgba(255, 255, 255, 0.98)",
                  boxShadow: "0 10px 26px rgba(18, 60, 130, 0.10)",
                  borderRadius: 9999,
                }}
              >
                {SAFETY_TABS.map(({ key, label, Icon }) => {
                  const isActive = activeKey === key;
                  return (
                    <Link
                      key={key}
                      to={`/flight-safety/${key}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold transition"
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

          {/* 4 SAFETY METRICS BAR */}
          <section
            aria-label="Chỉ số và chứng nhận an toàn bay"
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
              {page.quickMetrics.map((metric, idx) => (
                <div
                  key={metric.label}
                  className={idx > 0 ? "lg:border-l lg:border-blue-100 lg:pl-4" : ""}
                >
                  <p className="text-[11px] font-bold text-[#5a749b]" style={{ margin: 0 }}>
                    {metric.label}
                  </p>
                  <p className="mt-0.5 text-sm font-black text-[#0b4fd0]" style={{ margin: "2px 0 0 0" }}>
                    {metric.value}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500" style={{ margin: "2px 0 0 0" }}>
                    {metric.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* MAIN CONTENT: LEFT DETAILED SAFETY PILLARS + RIGHT CERTIFICATIONS & SUPPORT */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 8 Columns: Detailed Sections */}
            <div className="space-y-4 lg:col-span-8">
              {page.sections.map((section, index) => (
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

            {/* Right 4 Columns: International Standards & Support */}
            <aside className="space-y-5 lg:col-span-4">
              {/* International Aviation Standards */}
              <div
                className="bg-white p-5"
                style={{
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.98)",
                  boxShadow: "0 12px 30px rgba(20, 62, 132, 0.08)",
                }}
              >
                <div className="mb-3.5 flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                  >
                    <Certificate size={20} weight="fill" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[#092152]" style={{ margin: 0 }}>
                      Tiêu chuẩn chứng nhận
                    </h3>
                    <p className="text-[11px] font-semibold text-[#5a749b]" style={{ margin: 0 }}>
                      Giám sát an toàn chuẩn quốc tế
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {SAFETY_STANDARDS.map((std) => (
                    <div
                      key={std.code}
                      className="rounded-xl bg-[#f8fbff] p-3"
                      style={{ border: "1px solid #e4effd" }}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-black text-white"
                          style={{ background: "#0b5ed7" }}
                        >
                          {std.code}
                        </span>
                        <span className="text-xs font-extrabold text-[#092152]">{std.title}</span>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed text-[#4f6891]" style={{ margin: 0 }}>
                        {std.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Commitment Banner Card */}
              <div
                className="p-5 text-white"
                style={{
                  borderRadius: 24,
                  background: "linear-gradient(135deg, #09255e 0%, #0b52c4 60%, #1d78f0 100%)",
                  boxShadow: "0 14px 32px rgba(13, 94, 215, 0.24)",
                }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold">
                  <Gauge size={13} weight="fill" />
                  An toàn là số 1
                </span>
                <h3 className="mt-3 text-base font-black text-white" style={{ margin: "10px 0 6px 0" }}>
                  Cần giải đáp về an toàn & hành trình?
                </h3>
                <p className="text-xs font-medium leading-relaxed text-blue-100" style={{ margin: "0 0 16px 0" }}>
                  Đội ngũ tư vấn SkyLink Care 24/7 luôn sẵn sàng hỗ trợ các yêu cầu đặc biệt về y
                  tế, hành lý nguy hiểm và an toàn bay.
                </p>
                <Link
                  to="/support"
                  className="inline-flex w-full items-center justify-center gap-1.5 bg-white py-2.5 text-xs font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                  style={{ borderRadius: 9999, textDecoration: "none" }}
                >
                  <Headset size={15} weight="fill" />
                  <span>Liên hệ Trung tâm Hỗ trợ</span>
                  <ArrowRight size={13} weight="bold" />
                </Link>
              </div>

              {/* Related Guide Links */}
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
                  Xem thêm Cẩm nang bay
                </p>
                <div className="space-y-2 text-xs font-bold">
                  <Link
                    to="/flight-guide/baggage"
                    className="flex items-center justify-between rounded-xl bg-[#f7faff] px-3.5 py-2.5 text-[#173a78] transition hover:bg-blue-50"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <SuitcaseRolling size={15} weight="fill" className="text-blue-600" />
                      Quy định hành lý & Pin dự phòng
                    </span>
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                  <Link
                    to="/flight-guide/procedures"
                    className="flex items-center justify-between rounded-xl bg-[#f7faff] px-3.5 py-2.5 text-[#173a78] transition hover:bg-blue-50"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <ClipboardText size={15} weight="fill" className="text-blue-600" />
                      Thủ tục & Soi chiếu an ninh sân bay
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
