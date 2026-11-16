import { createElement } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Airplane,
  ArrowRight,
  CheckCircle,
  ClipboardText,
  IdentificationCard,
  Info,
  ShieldCheck,
  SuitcaseRolling,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const guides = {
  baggage: {
    eyebrow: "Hành lý",
    title: "Chuẩn bị hành lý đúng quy định",
    description: "Nắm rõ thông tin hành lý trước chuyến đi để làm thủ tục thuận tiện và tránh phát sinh tại sân bay.",
    Icon: SuitcaseRolling,
    sections: [
      {
        title: "Hành lý xách tay",
        body: "Kiểm tra số kiện, khối lượng và kích thước được phép mang lên khoang cabin trên vé hoặc website của hãng khai thác chuyến bay. Đặt giấy tờ, thuốc cá nhân và vật dụng cần thiết trong hành lý xách tay.",
        points: ["Đo cả tay cầm, bánh xe và túi phụ khi kiểm tra kích thước.", "Không để vật sắc nhọn hoặc vật bị hạn chế trong hành lý cabin.", "Đồ uống và chất lỏng có thể chịu giới hạn riêng, nhất là trên chặng quốc tế."],
      },
      {
        title: "Hành lý ký gửi",
        body: "Hành lý ký gửi phụ thuộc hạng vé, chặng bay và hãng hàng không. Xem quyền lợi hành lý trong xác nhận đặt chỗ; nếu cần mua thêm, hãy thực hiện trước giờ khởi hành theo hướng dẫn của hãng.",
        points: ["Cân hành lý trước khi đến sân bay để tránh vượt mức.", "Gắn thẻ tên và thông tin liên lạc bên ngoài vali.", "Không ký gửi tiền mặt, giấy tờ quan trọng, đồ dễ vỡ hoặc vật có giá trị cao."],
      },
      {
        title: "Vật phẩm đặc biệt và hàng hạn chế",
        body: "Pin dự phòng, thiết bị điện tử, chất dễ cháy, bình khí, chất lỏng và dụng cụ thể thao có thể có quy định riêng. Hãy hỏi hãng khai thác trước khi đóng gói nếu chưa chắc chắn về một vật phẩm.",
        points: ["Pin dự phòng thường cần mang trong cabin và phải bảo vệ đầu cực.", "Không mang vật phẩm nguy hiểm hoặc bị pháp luật cấm lên máy bay.", "Khai báo trước với hãng nếu mang theo thiết bị y tế đặc biệt."],
      },
    ],
  },
  documents: {
    eyebrow: "Giấy tờ",
    title: "Giấy tờ cần chuẩn bị trước chuyến bay",
    description: "Dùng checklist này để rà soát giấy tờ của từng hành khách trước khi ra sân bay.",
    Icon: IdentificationCard,
    sections: [
      {
        title: "Chuyến bay nội địa",
        body: "Chuẩn bị giấy tờ định danh bản gốc, còn giá trị sử dụng và phù hợp với hành khách. Loại giấy tờ được chấp nhận có thể khác theo độ tuổi và quy định hiện hành.",
        points: ["Đối chiếu họ tên trên giấy tờ với thông tin vé.", "Trẻ em cần giấy tờ phù hợp với độ tuổi; kiểm tra yêu cầu riêng khi đi cùng người giám hộ.", "Nếu giấy tờ bị mất hoặc hư hỏng, liên hệ hãng và cơ quan có thẩm quyền trước ngày bay."],
      },
      {
        title: "Chuyến bay quốc tế",
        body: "Kiểm tra hộ chiếu, thị thực và các giấy tờ nhập cảnh theo yêu cầu của điểm đến và quốc gia quá cảnh. Quy định phụ thuộc quốc tịch, hành trình và thời gian lưu trú.",
        points: ["Kiểm tra hạn hộ chiếu theo yêu cầu của điểm đến.", "Xác nhận visa, giấy phép nhập cảnh hoặc giấy tờ bổ sung nếu cần.", "Lưu bản sao giấy tờ riêng với bản gốc và chuẩn bị vé khứ hồi hoặc thông tin lưu trú khi được yêu cầu."],
      },
      {
        title: "Thông tin trên vé và đặt chỗ",
        body: "Tên hành khách trên vé cần khớp với giấy tờ xuất trình. Nếu phát hiện sai thông tin, hãy liên hệ hãng hoặc nơi mua vé sớm để được hướng dẫn chỉnh sửa.",
        points: ["Mang mã đặt chỗ và thông tin chuyến bay.", "Kiểm tra ngày, giờ, sân bay đi và sân bay đến.", "Chuẩn bị giấy tờ riêng cho từng hành khách, kể cả trẻ nhỏ."],
      },
    ],
  },
  procedures: {
    eyebrow: "Thủ tục sân bay",
    title: "Các bước làm thủ tục tại sân bay",
    description: "Từ check-in đến cửa khởi hành, hãy dành đủ thời gian và theo dõi thông báo của hãng.",
    Icon: ClipboardText,
    sections: [
      {
        title: "Trước khi đến sân bay",
        body: "Kiểm tra giờ khởi hành, nhà ga, quầy làm thủ tục và thời gian có mặt được ghi trên vé hoặc thông báo của hãng.",
        points: ["Làm check-in trực tuyến nếu chuyến bay và hãng hỗ trợ.", "Chuẩn bị giấy tờ tùy thân và mã đặt chỗ.", "Kiểm tra trước quy định hành lý và vật phẩm hạn chế."],
      },
      {
        title: "Tại quầy và khu vực an ninh",
        body: "Xuất trình giấy tờ để làm thủ tục, gửi hành lý nếu có, sau đó đi qua kiểm tra an ninh và xuất cảnh theo hướng dẫn tại sân bay.",
        points: ["Kiểm tra thẻ lên máy bay và thông tin cửa khởi hành.", "Để riêng vật dụng cần lấy ra khi soi chiếu theo hướng dẫn nhân viên.", "Hành khách bay quốc tế cần hoàn tất thủ tục xuất cảnh."],
      },
      {
        title: "Tại cửa khởi hành",
        body: "Có mặt tại cửa lên máy bay đúng thời gian, theo dõi màn hình thông tin và nghe thông báo vì cửa hoặc giờ khởi hành có thể thay đổi.",
        points: ["Giữ thẻ lên máy bay và giấy tờ trong tầm tay.", "Tuân thủ thứ tự lên máy bay và hướng dẫn của nhân viên.", "Nếu cần hỗ trợ đặc biệt, báo cho hãng càng sớm càng tốt."],
      },
    ],
  },
};

const guideLinks = [
  { key: "baggage", label: "Quy định hành lý", Icon: SuitcaseRolling },
  { key: "documents", label: "Giấy tờ cần chuẩn bị", Icon: IdentificationCard },
  { key: "procedures", label: "Thủ tục tại sân bay", Icon: ClipboardText },
];

export default function FlightGuide() {
  const { topic = "baggage" } = useParams();
  const guide = guides[topic] || guides.baggage;
  const GuideIcon = guide.Icon;

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-7 lg:px-10">
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#102451] via-[#17458a] to-[#087e9a] px-6 py-9 text-white shadow-xl shadow-blue-950/10 sm:px-10 sm:py-12">
          <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-24 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-100">
              <Airplane size={15} weight="fill" /> Cẩm nang bay SkyLink
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{guide.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-50 sm:text-base">{guide.description}</p>
          </div>
          <div className="absolute bottom-5 right-6 hidden h-28 w-28 items-center justify-center rounded-[28px] border border-white/15 bg-white/10 text-cyan-100 sm:flex">
            <GuideIcon size={56} weight="duotone" />
          </div>
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
          <nav aria-label="Danh mục cẩm nang bay" className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Nội dung cẩm nang</p>
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {guideLinks.map(({ key, label, Icon }) => {
                const isActive = topic === key;
                return (
                  <Link
                    key={key}
                    to={`/flight-guide/${key}`}
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
              <p className="text-xs font-bold text-slate-700">Cần làm thủ tục ngay?</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Mở trang check-in để tra cứu và làm thủ tục trực tuyến.</p>
              <Link to="/check-in" className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-blue-700 hover:text-blue-900">
                Check-in trực tuyến <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </nav>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <GuideIcon size={20} weight="duotone" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-700">{guide.eyebrow}</p>
                <h2 className="text-lg font-black text-[#12264f]">Thông tin cần biết</h2>
              </div>
            </div>

            <div className="space-y-4">
              {guide.sections.map((section, index) => (
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
                Quy định hành lý, giấy tờ và thời gian làm thủ tục có thể khác theo hãng khai thác, loại vé, hành trình và quy định tại điểm đến. Hãy kiểm tra xác nhận đặt chỗ và nguồn thông tin chính thức trước ngày bay.
              </p>
            </aside>

            <div className="mt-5 flex flex-col gap-3 rounded-3xl bg-[#12264f] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="font-extrabold">Bạn cần hỗ trợ thêm?</h2>
                <p className="mt-1 text-sm text-blue-100">Liên hệ đội ngũ SkyLink nếu cần hướng dẫn cho hành trình của bạn.</p>
              </div>
              <Link to="/support" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#17336f] transition hover:bg-blue-50">
                Đến trung tâm hỗ trợ <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
