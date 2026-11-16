import { createElement } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Airplane,
  ArrowRight,
  CheckCircle,
  ClipboardText,
  Info,
  ShieldCheck,
  Wrench,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const safetyPages = {
  policy: {
    eyebrow: "Chính sách an toàn",
    title: "An toàn là ưu tiên trong mọi quyết định",
    description: "Các nguyên tắc an toàn định hướng cách SkyLink xây dựng quy trình, đào tạo và cải tiến hoạt động khai thác.",
    Icon: ShieldCheck,
    sections: [
      {
        title: "Ưu tiên an toàn",
        body: "An toàn hành khách và nhân viên được đặt lên trước lịch trình và các mục tiêu thương mại. Khi có vấn đề cần đánh giá, hoạt động liên quan phải được xem xét và xử lý trước khi tiếp tục.",
        points: [
          "Tuân thủ yêu cầu của cơ quan quản lý hàng không và quy trình khai thác được phê duyệt.",
          "Không bỏ qua cảnh báo hoặc sai lệch có thể ảnh hưởng đến an toàn.",
          "Cung cấp hướng dẫn rõ ràng để nhân viên và hành khách biết cách báo cáo vấn đề.",
        ],
      },
      {
        title: "Nhận diện và quản lý rủi ro",
        body: "Các mối nguy được nhận diện, đánh giá và theo dõi để giảm thiểu rủi ro. Thông tin an toàn cần được xem xét kịp thời và sử dụng để phòng ngừa sự cố tái diễn.",
        points: [
          "Khuyến khích báo cáo nguy cơ, sự cố và tình huống suýt xảy ra.",
          "Đánh giá rủi ro trước khi thay đổi quy trình hoặc đưa thiết bị vào khai thác.",
          "Theo dõi biện pháp khắc phục và cập nhật quy trình khi cần thiết.",
        ],
      },
      {
        title: "Đào tạo và văn hóa an toàn",
        body: "An toàn là trách nhiệm chung. Nhân sự cần được đào tạo phù hợp với nhiệm vụ, hiểu giới hạn thẩm quyền và có thể nêu quan ngại an toàn theo kênh báo cáo.",
        points: [
          "Duy trì đào tạo ban đầu và định kỳ theo vị trí công việc.",
          "Phối hợp giữa khai thác, kỹ thuật, mặt đất và các đơn vị liên quan.",
          "Rút kinh nghiệm từ dữ liệu và sự kiện để cải tiến liên tục.",
        ],
      },
    ],
  },
  maintenance: {
    eyebrow: "Cam kết bảo dưỡng",
    title: "Bảo dưỡng có kế hoạch, kiểm soát và lưu hồ sơ",
    description: "Nguyên tắc bảo dưỡng hướng tới duy trì tình trạng đủ điều kiện khai thác theo yêu cầu áp dụng và tài liệu kỹ thuật được phê chuẩn.",
    Icon: Wrench,
    sections: [
      {
        title: "Thực hiện theo chương trình bảo dưỡng",
        body: "Công việc bảo dưỡng cần được lập kế hoạch và thực hiện theo chương trình áp dụng cho từng loại tàu bay, chỉ dẫn kỹ thuật được phê chuẩn và yêu cầu của nhà chức trách.",
        points: [
          "Theo dõi lịch bảo dưỡng định kỳ và các giới hạn khai thác liên quan.",
          "Đánh giá chỉ dẫn kỹ thuật và yêu cầu bắt buộc từ nhà chức trách.",
          "Sử dụng quy trình, tài liệu và cấu hình kỹ thuật phù hợp với tàu bay.",
        ],
      },
      {
        title: "Nhân sự đủ thẩm quyền và kiểm soát chất lượng",
        body: "Công việc kỹ thuật phải do nhân sự có năng lực và thẩm quyền phù hợp thực hiện hoặc giám sát, với bước kiểm tra cần thiết trước khi xác nhận hoàn thành.",
        points: [
          "Phân công công việc theo năng lực, phạm vi ủy quyền và yêu cầu chuyên môn.",
          "Kiểm tra độc lập hoặc kiểm tra bổ sung khi quy trình yêu cầu.",
          "Ghi nhận tồn tại, hành động xử lý và kết quả kiểm tra một cách đầy đủ.",
        ],
      },
      {
        title: "Chỉ khai thác khi đáp ứng điều kiện",
        body: "Nếu phát hiện bất thường có thể ảnh hưởng đến an toàn hoặc tình trạng đủ điều kiện khai thác, vấn đề phải được đánh giá theo quy trình kỹ thuật. Tàu bay chỉ được đưa vào khai thác khi các điều kiện áp dụng đã được đáp ứng và xác nhận bởi người có thẩm quyền.",
        points: [
          "Ghi nhận và xử lý lỗi theo tài liệu kỹ thuật cùng quy định áp dụng.",
          "Không tự ý bỏ qua hoặc đóng lỗi ngoài thẩm quyền.",
          "Lưu hồ sơ bảo dưỡng để hỗ trợ truy xuất và giám sát tuân thủ.",
        ],
      },
    ],
  },
};

const safetyLinks = [
  { key: "policy", label: "Chính sách an toàn", Icon: ShieldCheck },
  { key: "maintenance", label: "Cam kết bảo dưỡng", Icon: Wrench },
];

export default function FlightSafety() {
  const { topic = "policy" } = useParams();
  const page = safetyPages[topic] || safetyPages.policy;
  const PageIcon = page.Icon;

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-7 lg:px-10">
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#102451] via-[#17458a] to-[#087e9a] px-6 py-9 text-white shadow-xl shadow-blue-950/10 sm:px-10 sm:py-12">
          <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-24 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-100">
              <Airplane size={15} weight="fill" /> SkyLink · An toàn bay
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{page.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-50 sm:text-base">{page.description}</p>
          </div>
          <div className="absolute bottom-5 right-6 hidden h-28 w-28 items-center justify-center rounded-[28px] border border-white/15 bg-white/10 text-cyan-100 sm:flex">
            {createElement(PageIcon, { size: 56, weight: "duotone" })}
          </div>
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
          <nav aria-label="Danh mục an toàn bay" className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">An toàn bay</p>
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {safetyLinks.map(({ key, label, Icon }) => {
                const isActive = topic === key;
                return (
                  <Link
                    key={key}
                    to={`/flight-safety/${key}`}
                    className={`inline-flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition lg:w-full ${
                      isActive ? "bg-blue-50 text-blue-800 ring-1 ring-blue-100" : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                    }`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {createElement(Icon, { size: 19, weight: "duotone" })}
                    </span>
                    {label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 hidden rounded-2xl bg-slate-50 p-4 lg:block">
              <p className="text-xs font-bold text-slate-700">Cần hỗ trợ cho chuyến bay?</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Liên hệ đội ngũ hỗ trợ nếu bạn có câu hỏi về hành trình.</p>
              <Link to="/support" className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-blue-700 hover:text-blue-900">
                Trung tâm hỗ trợ <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </nav>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                {createElement(PageIcon, { size: 20, weight: "duotone" })}
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-700">{page.eyebrow}</p>
                <h2 className="text-lg font-black text-[#12264f]">Nguyên tắc & cam kết</h2>
              </div>
            </div>

            <div className="space-y-4">
              {page.sections.map((section, index) => (
                <article key={section.title} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-extrabold text-[#17294f]">{section.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.body}</p>
                      <ul className="mt-4 space-y-2.5">
                        {section.points.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                            <CheckCircle size={17} weight="fill" className="mt-0.5 shrink-0 text-emerald-500" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-900">
              <Info size={19} weight="fill" className="mt-0.5 shrink-0 text-amber-600" />
              <p>
                Trang này mô tả các nguyên tắc an toàn và bảo dưỡng ở mức thông tin chung; không thay thế tài liệu khai thác được phê chuẩn, yêu cầu của nhà chức trách hoặc hồ sơ bảo dưỡng của từng tàu bay.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
