import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api";
import {
  AirplaneLanding,
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  CalendarBlank,
  CarProfile,
  CaretDown,
  CheckCircle,
  Clock,
  Heart,
  Key,
  MapPinLine,
  PhoneCall,
  ShieldCheck,
  Snowflake,
  Star,
  SuitcaseRolling,
  ThumbsUp,
  Ticket,
  User,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

const HERO_CAR_BG_URL =
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85";

const AIRPORTS = [
  {
    code: "HAN",
    name: "Sân bay Nội Bài (HAN)",
    shortName: "Sân bay Nội Bài",
    city: "Hà Nội",
    destinations: [
      "Quận Hoàn Kiếm (Phố cổ / Hồ Gươm)",
      "Quận Ba Đình – Lăng Bác",
      "Quận Tây Hồ – Khu đô thị Ciputra",
      "Quận Cầu Giấy – Trung tâm Hội nghị Quốc gia",
      "Quận Đống Đa / Hai Bà Trưng",
      "Khu vực Mỹ Đình – Nam Từ Liêm",
      "Vinhomes Ocean Park / Gia Lâm",
    ],
  },
  {
    code: "SGN",
    name: "Tân Sơn Nhất (SGN)",
    shortName: "Tân Sơn Nhất",
    city: "TP. Hồ Chí Minh",
    destinations: [
      "Quận 1 (Chợ Bến Thành / Phố đi bộ Nguyễn Huệ)",
      "Quận 3 – Trung tâm thành phố",
      "Quận 7 – Khu đô thị Phú Mỹ Hưng",
      "TP. Thủ Đức – Thảo Điền / Vinhomes Grand Park",
      "Quận Bình Thạnh – Landmark 81",
      "Quận 5 / Quận 10",
      "Khu vực Vũng Tàu / Biên Hòa (Liên tỉnh)",
    ],
  },
  {
    code: "DAD",
    name: "Đà Nẵng (DAD)",
    shortName: "Sân bay Đà Nẵng",
    city: "Đà Nẵng",
    destinations: [
      "Trung tâm Quận Hải Châu – Cầu Rồng",
      "Bãi biển Mỹ Khê – Quận Sơn Trà",
      "Bán đảo Sơn Trà / InterContinental",
      "Ngũ Hành Sơn – Khu resort ven biển",
      "Phố cổ Hội An (Quảng Nam)",
      "Khu du lịch Bà Nà Hills",
    ],
  },
  {
    code: "CXR",
    name: "Cam Ranh - Nha Trang (CXR)",
    shortName: "Sân bay Cam Ranh",
    city: "Nha Trang",
    destinations: [
      "Trung tâm TP. Nha Trang – Đường Trần Phú",
      "Khu resort Bãi Dài – Cam Lâm",
      "Cảng Vinpearl / Đảo Hòn Tre",
      "Khu vực Hòn Chồng – Phạm Văn Đồng",
      "Bến tàu du lịch Nha Trang",
      "Ninh Hòa / Dốc Lết (Liên tỉnh)",
    ],
  },
  {
    code: "PQC",
    name: "Phú Quốc (PQC)",
    shortName: "Sân bay Phú Quốc",
    city: "Phú Quốc",
    destinations: [
      "Trung tâm Dương Đông – Chợ đêm Phú Quốc",
      "Bãi Trường – Khu tổ hợp resort ven biển",
      "Grand World / VinWonders Bắc Đảo",
      "Thị trấn Hoàng Hôn (Sunset Town) – Nam Đảo",
      "Bãi Kem / Mũi Ông Đội",
      "Bãi Sao – An Thới",
    ],
  },
];

const TRANSFER_VEHICLES = [
  {
    id: "camry-4",
    name: "Toyota Camry",
    category: "Sedan 4 chỗ",
    subtitleHighlight: "Xe sedan cao cấp",
    subtitleRest: " – 4 chỗ",
    rating: "4.8",
    reviews: "2.5k đánh giá",
    seats: "4 chỗ",
    luggage: "2 vali",
    ac: "Điều hòa",
    price: 700000,
    badge: { label: "Cao cấp", bg: "#0b5ed7", color: "#ffffff", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=85",
    description: "Sedan hạng D sang trọng, nội thất da êm ái, tài xế đón tận sảnh ga đến kèm bảng tên.",
  },
  {
    id: "fortuner-7",
    name: "Toyota Fortuner",
    category: "SUV 7 chỗ",
    subtitleHighlight: "SUV mạnh mẽ",
    subtitleRest: " – 7 chỗ",
    rating: "4.7",
    reviews: "1.8k đánh giá",
    seats: "7 chỗ",
    luggage: "4 vali",
    ac: "Điều hòa",
    price: 1000000,
    badge: { label: "Tiện lợi", bg: "#16a34a", color: "#ffffff", Icon: ThumbsUp },
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=85",
    description: "SUV 7 chỗ gầm cao rộng rãi cho gia đình và nhóm công tác, khoang hành lý chứa gọn 4 vali cỡ lớn.",
  },
  {
    id: "starex-16",
    name: "Hyundai Starex",
    category: "Van / Limousine",
    subtitleHighlight: "Xe van rộng rãi",
    subtitleRest: " – 16 chỗ",
    rating: "4.9",
    reviews: "1.2k đánh giá",
    seats: "16 chỗ",
    luggage: "6 vali",
    ac: "Điều hòa",
    price: 1500000,
    badge: { label: "Cho đoàn", bg: "#7c3aed", color: "#ffffff", Icon: UsersThree },
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=85",
    description: "Xe du lịch 16 chỗ đời mới chuyên đưa đón đoàn khách, gia đình đông người và hành lý cồng kềnh.",
  },
  {
    id: "vios-4",
    name: "Toyota Vios",
    category: "Sedan 4 chỗ",
    subtitleHighlight: "Xe sedan tiết kiệm",
    subtitleRest: " – 4 chỗ",
    rating: "4.7",
    reviews: "3.4k đánh giá",
    seats: "4 chỗ",
    luggage: "2 vali",
    ac: "Điều hòa",
    price: 380000,
    badge: { label: "Tiết kiệm", bg: "#059669", color: "#ffffff", Icon: ThumbsUp },
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=85",
    description: "Lựa chọn kinh tế, di chuyển linh hoạt và nhanh chóng từ sân bay về trung tâm thành phố.",
  },
  {
    id: "accent-4",
    name: "Hyundai Accent",
    category: "Sedan 4 chỗ",
    subtitleHighlight: "Xe đô thị êm ái",
    subtitleRest: " – 4 chỗ",
    rating: "4.6",
    reviews: "2.1k đánh giá",
    seats: "4 chỗ",
    luggage: "2 vali",
    ac: "Điều hòa",
    price: 360000,
    badge: { label: "Phổ biến", bg: "#1d78f0", color: "#ffffff", Icon: ThumbsUp },
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=85",
    description: "Xe 4 chỗ đời mới sạch sẽ, cốp rộng để vừa 2 vali lớn, phù hợp khách công tác cá nhân.",
  },
  {
    id: "civic-4",
    name: "Honda Civic",
    category: "Sedan 4 chỗ",
    subtitleHighlight: "Sedan thể thao",
    subtitleRest: " – 4 chỗ",
    rating: "4.8",
    reviews: "1.6k đánh giá",
    seats: "4 chỗ",
    luggage: "2 vali",
    ac: "Điều hòa",
    price: 520000,
    badge: { label: "Phổ biến", bg: "#1d78f0", color: "#ffffff", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=85",
    description: "Khoang lái yên tĩnh, vận hành mượt mà trên cao tốc sân bay, hỗ trợ nước uống miễn phí.",
  },
  {
    id: "mazda6-4",
    name: "Mazda 6 Premium",
    category: "Sedan 4 chỗ",
    subtitleHighlight: "Sedan doanh nhân",
    subtitleRest: " – 4 chỗ",
    rating: "4.8",
    reviews: "1.4k đánh giá",
    seats: "4 chỗ",
    luggage: "3 vali",
    ac: "Điều hòa",
    price: 680000,
    badge: { label: "Cao cấp", bg: "#0b5ed7", color: "#ffffff", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=85",
    description: "Thiết kế lịch lãm, nội thất da Nappa êm ái dành cho khách hàng doanh nhân và đối tác.",
  },
  {
    id: "mercedes-e300",
    name: "Mercedes-Benz E300",
    category: "VIP Luxury",
    subtitleHighlight: "Xe sang thương gia",
    subtitleRest: " – 4 chỗ",
    rating: "4.9",
    reviews: "980 đánh giá",
    seats: "4 chỗ",
    luggage: "3 vali",
    ac: "Điều hòa",
    price: 1650000,
    badge: { label: "VIP", bg: "#1e293b", color: "#fde68a", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=85",
    description: "Đưa đón hạng Thương gia chuẩn 5 sao, tài xế mặc vest đón tận cửa ga đến với bảng tên riêng.",
  },
  {
    id: "bmw-530i",
    name: "BMW 530i M Sport",
    category: "VIP Luxury",
    subtitleHighlight: "Sedan hạng sang",
    subtitleRest: " – 4 chỗ",
    rating: "4.9",
    reviews: "840 đánh giá",
    seats: "4 chỗ",
    luggage: "3 vali",
    ac: "Điều hòa",
    price: 1750000,
    badge: { label: "VIP", bg: "#1e293b", color: "#fde68a", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=85",
    description: "Trải nghiệm di chuyển đẳng cấp, cách âm tuyệt đối, có sẵn Wi-Fi tốc độ cao trên xe.",
  },
  {
    id: "vinfast-vf8",
    name: "VinFast VF 8 Plus",
    category: "SUV 7 chỗ",
    subtitleHighlight: "SUV điện êm ái",
    subtitleRest: " – 5 chỗ",
    rating: "4.8",
    reviews: "1.9k đánh giá",
    seats: "5 chỗ",
    luggage: "3 vali",
    ac: "Điều hòa",
    price: 620000,
    badge: { label: "Xe điện", bg: "#0d9488", color: "#ffffff", Icon: ThumbsUp },
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=85",
    description: "Xe điện không tiếng ồn, không mùi xăng, thân thiện môi trường cho hành trình thư thái.",
  },
  {
    id: "corolla-cross",
    name: "Toyota Corolla Cross",
    category: "SUV 7 chỗ",
    subtitleHighlight: "Crossover linh hoạt",
    subtitleRest: " – 5 chỗ",
    rating: "4.8",
    reviews: "2.3k đánh giá",
    seats: "5 chỗ",
    luggage: "3 vali",
    ac: "Điều hòa",
    price: 580000,
    badge: { label: "Tiện lợi", bg: "#16a34a", color: "#ffffff", Icon: ThumbsUp },
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=85",
    description: "Gầm cao thoáng đãng, không gian hàng ghế sau rộng rãi, rất được ưa chuộng trên tuyến sân bay.",
  },
  {
    id: "innova-cross",
    name: "Toyota Innova Cross",
    category: "SUV 7 chỗ",
    subtitleHighlight: "MPV gia đình",
    subtitleRest: " – 7 chỗ",
    rating: "4.8",
    reviews: "2.7k đánh giá",
    seats: "7 chỗ",
    luggage: "4 vali",
    ac: "Điều hòa",
    price: 780000,
    badge: { label: "Gia đình", bg: "#ea580c", color: "#ffffff", Icon: UsersThree },
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=900&q=85",
    description: "Khoang cabin 7 chỗ rộng rãi, điều hòa 2 dàn lạnh sâu, lý tưởng cho gia đình có trẻ nhỏ.",
  },
  {
    id: "xpander-7",
    name: "Mitsubishi Xpander",
    category: "SUV 7 chỗ",
    subtitleHighlight: "MPV tiết kiệm",
    subtitleRest: " – 7 chỗ",
    rating: "4.7",
    reviews: "2.9k đánh giá",
    seats: "7 chỗ",
    luggage: "4 vali",
    ac: "Điều hòa",
    price: 690000,
    badge: { label: "Tiết kiệm", bg: "#059669", color: "#ffffff", Icon: ThumbsUp },
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=85",
    description: "Xe 7 chỗ giá hợp lý, chứa hành lý gọn gàng cho nhóm bạn hoặc gia đình 4–6 người.",
  },
  {
    id: "santafe-7",
    name: "Hyundai Santa Fe",
    category: "SUV 7 chỗ",
    subtitleHighlight: "SUV cao cấp",
    subtitleRest: " – 7 chỗ",
    rating: "4.9",
    reviews: "1.5k đánh giá",
    seats: "7 chỗ",
    luggage: "4 vali",
    ac: "Điều hòa",
    price: 1050000,
    badge: { label: "Cao cấp", bg: "#0b5ed7", color: "#ffffff", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=85",
    description: "SUV 7 chỗ cao cấp với ghế da chỉnh điện và cửa sổ trời toàn cảnh, vận hành êm ái.",
  },
  {
    id: "carnival-7",
    name: "Kia Carnival Signature",
    category: "VIP Luxury",
    subtitleHighlight: "MPV thương gia",
    subtitleRest: " – 7 chỗ",
    rating: "4.9",
    reviews: "2.0k đánh giá",
    seats: "7 chỗ",
    luggage: "5 vali",
    ac: "Điều hòa",
    price: 1350000,
    badge: { label: "Thương gia", bg: "#7c3aed", color: "#ffffff", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1570733577524-3a047079e80d?auto=format&fit=crop&w=900&q=85",
    description: "Ghế cơ trưởng hạng thương gia có bệ đỡ chân, cửa trượt điện tiện lợi khi đón tại sân bay.",
  },
  {
    id: "everest-7",
    name: "Ford Everest Titanium",
    category: "SUV 7 chỗ",
    subtitleHighlight: "SUV đường trường",
    subtitleRest: " – 7 chỗ",
    rating: "4.8",
    reviews: "1.3k đánh giá",
    seats: "7 chỗ",
    luggage: "4 vali",
    ac: "Điều hòa",
    price: 1100000,
    badge: { label: "Tiện lợi", bg: "#16a34a", color: "#ffffff", Icon: ThumbsUp },
    image: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=900&q=85",
    description: "Khung gầm chắc chắn, cực kỳ an toàn cho các tuyến đưa đón sân bay đi liên tỉnh xa.",
  },
  {
    id: "lexus-es250",
    name: "Lexus ES 250",
    category: "VIP Luxury",
    subtitleHighlight: "Sedan siêu êm",
    subtitleRest: " – 4 chỗ",
    rating: "5.0",
    reviews: "620 đánh giá",
    seats: "4 chỗ",
    luggage: "3 vali",
    ac: "Điều hòa",
    price: 1950000,
    badge: { label: "VIP", bg: "#1e293b", color: "#fde68a", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85",
    description: "Chuẩn mực yên tĩnh và sang trọng bậc nhất cho khách VIP, ngoại giao đoàn và lãnh đạo.",
  },
  {
    id: "dcar-limousine-9",
    name: "DCar Limousine VIP",
    category: "Van / Limousine",
    subtitleHighlight: "Limousine ghế massage",
    subtitleRest: " – 9 chỗ",
    rating: "4.9",
    reviews: "1.7k đánh giá",
    seats: "9 chỗ",
    luggage: "6 vali",
    ac: "Điều hòa",
    price: 1850000,
    badge: { label: "Limousine", bg: "#7c3aed", color: "#ffffff", Icon: ShieldCheck },
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=85",
    description: "Khoang hạng thương gia 9 ghế massage bọc da, TV giải trí, cổng sạc USB và Wi-Fi riêng.",
  },
  {
    id: "ford-transit-16",
    name: "Ford Transit Luxury",
    category: "Van / Limousine",
    subtitleHighlight: "Xe đoàn tiêu chuẩn",
    subtitleRest: " – 16 chỗ",
    rating: "4.8",
    reviews: "1.9k đánh giá",
    seats: "16 chỗ",
    luggage: "8 vali",
    ac: "Điều hòa",
    price: 1450000,
    badge: { label: "Cho đoàn", bg: "#7c3aed", color: "#ffffff", Icon: UsersThree },
    image: "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=900&q=85",
    description: "Xe 16 chỗ phổ biến nhất cho đoàn du lịch, công ty đi hội nghị và đưa đón sân bay trọn gói.",
  },
  {
    id: "solati-16",
    name: "Hyundai Solati",
    category: "Van / Limousine",
    subtitleHighlight: "Xe 16 chỗ trần cao",
    subtitleRest: " – 16 chỗ",
    rating: "4.9",
    reviews: "1.1k đánh giá",
    seats: "16 chỗ",
    luggage: "10 vali",
    ac: "Điều hòa",
    price: 1650000,
    badge: { label: "Cho đoàn", bg: "#7c3aed", color: "#ffffff", Icon: UsersThree },
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=85",
    description: "Trần cao thoáng rộng, lối đi thoải mái và khoang hành lý lớn phù hợp đoàn có nhiều vali.",
  },
  {
    id: "universe-29",
    name: "Hyundai County / Limo",
    category: "Van / Limousine",
    subtitleHighlight: "Xe đoàn lớn cao cấp",
    subtitleRest: " – 29 chỗ",
    rating: "4.8",
    reviews: "760 đánh giá",
    seats: "29 chỗ",
    luggage: "20 vali",
    ac: "Điều hòa",
    price: 2400000,
    badge: { label: "Đoàn lớn", bg: "#0b5ed7", color: "#ffffff", Icon: UsersThree },
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=85",
    description: "Chuyên phục vụ đoàn doanh nghiệp, đoàn khách du lịch lớn đón trả thẳng tại bãi đỗ sân bay.",
  },
];

const VEHICLE_CATEGORIES = [
  "Tất cả",
  "Sedan 4 chỗ",
  "SUV 7 chỗ",
  "VIP Luxury",
  "Van / Limousine",
];

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function AirportTransfer() {
  const navigate = useNavigate();
  const [selectedAirport, setSelectedAirport] = useState(AIRPORTS[0]);
  const [airportDropdownOpen, setAirportDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [favorites, setFavorites] = useState({});

  const visibleVehicles =
    activeCategory === "Tất cả"
      ? TRANSFER_VEHICLES
      : TRANSFER_VEHICLES.filter((v) => v.category === activeCategory);

  // Booking Modal State (Book by PNR or selected vehicle)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(TRANSFER_VEHICLES[0]);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [pnrCode, setPnrCode] = useState("");
  const [pickupAddress, setPickupAddress] = useState(AIRPORTS[0].destinations[0]);
  const [customPickupAddress, setCustomPickupAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [contactPhone, setContactPhone] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  useEffect(() => {
    setPickupAddress(selectedAirport.destinations[0]);
    setCustomPickupAddress("");
  }, [selectedAirport]);

  useEffect(() => {
    if (!modalOpen) return;
    const token =
      localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      setBookings([]);
      return;
    }

    let cancelled = false;
    setLoadingBookings(true);
    api
      .get("/bookings")
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const active = list.filter((b) => b.status !== "cancelled");
        setBookings(active);
        if (active[0]?.pnr_code && !pnrCode) {
          setPnrCode(active[0].pnr_code);
        }
      })
      .catch(() => {
        if (!cancelled) setBookings([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBookings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [modalOpen]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openBookingModal = (vehicle = TRANSFER_VEHICLES[0]) => {
    setSelectedVehicle(vehicle);
    setBookingConfirmed(null);
    setModalOpen(true);
  };

  const handleConfirmTransfer = (e) => {
    e.preventDefault();
    const resolvedPickup =
      pickupAddress === "__custom__"
        ? customPickupAddress.trim() || `Trung tâm ${selectedAirport.city}`
        : pickupAddress || selectedAirport.destinations[0];
    const code = `TRF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const record = {
      code,
      vehicleName: selectedVehicle.name,
      price: selectedVehicle.price,
      airport: selectedAirport.name,
      pnr: pnrCode.trim() || "Đặt độc lập",
      pickupAddress: resolvedPickup,
      pickupTime,
      contactPhone: contactPhone.trim() || "1900 1234",
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("skylink_airport_transfers") || "[]");
      localStorage.setItem("skylink_airport_transfers", JSON.stringify([record, ...existing]));
    } catch {
      // ignore storage errors
    }
    setBookingConfirmed(record);
  };

  return (
    <div
      className="min-h-screen font-sans text-slate-900"
      style={{
        background:
          "linear-gradient(180deg, #b8dcff 0%, #dceeff 28%, #eef6ff 65%, #d6eaff 100%)",
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
                "linear-gradient(90deg, rgba(190,224,255,0.96) 0%, rgba(212,235,255,0.84) 45%, rgba(225,241,255,0.18) 100%)",
            }}
          />
          <img
            src={HERO_CAR_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 48%",
              opacity: 0.92,
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

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              {/* Left Title Block */}
              <div style={{ maxWidth: 420 }}>
                <p
                  className="text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  SKYLINK TRAVEL
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(2.1rem, 3.6vw, 2.9rem)",
                    color: "#091e47",
                    lineHeight: 1.12,
                    margin: "0 0 8px 0",
                  }}
                >
                  Đưa Đón Sân Bay
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  Di chuyển dễ dàng – Hành trình trọn vẹn
                </p>
              </div>

              {/* Center-Right Stacked Action Buttons (matching mockup) */}
              <div
                className="flex flex-col gap-2.5 lg:mr-auto lg:ml-6"
                style={{ width: "100%", maxWidth: 345 }}
              >
                <button
                  type="button"
                  onClick={() => openBookingModal(TRANSFER_VEHICLES[0])}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(90deg, #0a58ca 0%, #1d75f2 100%)",
                    boxShadow: "0 10px 24px rgba(13, 97, 225, 0.34)",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.22)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Ticket size={17} weight="fill" style={{ flexShrink: 0 }} />
                  <span>Đặt lịch đón theo mã chuyến bay (PNR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/travel/car")}
                  className="inline-flex items-center justify-between gap-2.5 px-4 py-2.5 text-xs font-extrabold transition hover:bg-white"
                  style={{
                    background: "rgba(255, 255, 255, 0.94)",
                    color: "#0b2b66",
                    border: "1px solid #c9defc",
                    boxShadow: "0 6px 16px rgba(18, 60, 128, 0.08)",
                    borderRadius: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Key size={16} weight="fill" style={{ color: "#0b57d0" }} />
                    <span>Thuê xe tự lái</span>
                  </span>
                  <ArrowRight size={15} weight="bold" style={{ color: "#0b57d0" }} />
                </button>
              </div>
            </div>
          </header>

          {/* FLOATING AIRPORT SELECTOR & 4 VALUE PILLARS BAR */}
          <section
            aria-label="Chọn sân bay và quyền lợi đưa đón"
            className="relative z-30 mb-7"
            style={{
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.10)",
              backdropFilter: "blur(14px)",
              borderRadius: 20,
              padding: "14px 20px",
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-center">
              {/* Airport Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAirportDropdownOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-2 text-left transition"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "2px 4px",
                    cursor: "pointer",
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                    >
                      <AirplaneLanding size={20} weight="fill" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-extrabold text-[#0b2559] sm:text-[13px]">
                        {selectedAirport.shortName}
                      </span>
                      <span className="block text-[11px] font-bold text-[#4a658f]">
                        ({selectedAirport.code})
                      </span>
                    </span>
                  </span>
                  <CaretDown
                    size={16}
                    weight="bold"
                    style={{
                      color: "#1e3f77",
                      transform: airportDropdownOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {/* Dropdown Menu (matching the clean floating card in the mockup) */}
                {airportDropdownOpen && (
                  <div
                    className="absolute left-0 top-full z-50 mt-3 w-full min-w-[230px] overflow-hidden bg-white p-2 shadow-xl"
                    style={{
                      borderRadius: 16,
                      border: "1px solid #dbe8fc",
                      boxShadow: "0 18px 40px rgba(15, 52, 114, 0.16)",
                    }}
                  >
                    {AIRPORTS.map((airport) => {
                      const active = airport.code === selectedAirport.code;
                      return (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => {
                            setSelectedAirport(airport);
                            setAirportDropdownOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition"
                          style={{
                            background: active ? "#ebf4ff" : "transparent",
                            color: active ? "#0b4fd0" : "#1e3a6d",
                            cursor: "pointer",
                            border: "none",
                          }}
                        >
                          <span>{airport.name}</span>
                          {active && (
                            <CheckCircle size={15} weight="fill" style={{ color: "#0b5ed7" }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pillar 1 */}
              <div className="flex items-center gap-3 lg:border-l lg:border-blue-100 lg:pl-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <ShieldCheck size={20} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Miễn phí chờ 60 phút
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Khi chuyến bay trễ
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="flex items-center gap-3 lg:border-l lg:border-blue-100 lg:pl-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <CarProfile size={20} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Đưa đón tận nơi
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Nội thành & liên tỉnh
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="flex items-center gap-3 lg:border-l lg:border-blue-100 lg:pl-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <ShieldCheck size={20} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Tài xế chuyên nghiệp
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    An toàn – đúng giờ
                  </p>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="flex items-center gap-3 lg:border-l lg:border-blue-100 lg:pl-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#fff7e6", color: "#f59e0b" }}
                >
                  <Star size={20} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Đánh giá{" "}
                    <span style={{ color: "#0b5ed7" }}>4.8/5</span>
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    từ hơn 10.000 khách
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CATEGORY FILTER PILLS FOR 21 VEHICLES */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {VEHICLE_CATEGORIES.map((cat) => {
                const count =
                  cat === "Tất cả"
                    ? TRANSFER_VEHICLES.length
                    : TRANSFER_VEHICLES.filter((v) => v.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className="px-4 py-2 text-xs font-extrabold transition"
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            boxShadow: "0 6px 16px rgba(13, 97, 225, 0.28)",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                          }
                        : {
                            background: "rgba(255, 255, 255, 0.88)",
                            color: "#1e3f77",
                            border: "1px solid #d4e4fb",
                            borderRadius: 9999,
                            cursor: "pointer",
                          }
                    }
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-[#355586]">
              Hiển thị <strong>{visibleVehicles.length}</strong> / {TRANSFER_VEHICLES.length} dòng xe tại{" "}
              <strong className="text-[#0b5ed7]">{selectedAirport.shortName}</strong>
            </span>
          </div>

          {/* 3-COLUMN VEHICLE CARDS GRID (21 vehicles total) */}
          <section aria-label="Danh sách xe đưa đón sân bay">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {visibleVehicles.map((vehicle, index) => {
                const BadgeIcon = vehicle.badge.Icon;
                const isFav = !!favorites[vehicle.id];

                return (
                  <motion.article
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1"
                    style={{
                      background: "#ffffff",
                      borderRadius: 24,
                      border: "1px solid rgba(255, 255, 255, 0.98)",
                      boxShadow: "0 14px 34px rgba(21, 64, 138, 0.10)",
                    }}
                  >
                    {/* Card Image Top */}
                    <div className="relative overflow-hidden" style={{ height: 215 }}>
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(10,25,55,0.12) 0%, rgba(10,25,55,0) 45%, rgba(10,25,55,0.14) 100%)",
                        }}
                      />

                      {/* Top-Left Category Badge */}
                      <span
                        className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold shadow-sm"
                        style={{
                          background: vehicle.badge.bg,
                          color: vehicle.badge.color,
                          borderRadius: 9999,
                        }}
                      >
                        <BadgeIcon size={14} weight="fill" />
                        {vehicle.badge.label}
                      </span>

                      {/* Top-Right Heart Button */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(vehicle.id)}
                        aria-label={`Yêu thích ${vehicle.name}`}
                        className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center bg-white/90 shadow-sm transition hover:bg-white"
                        style={{
                          borderRadius: 9999,
                          border: "none",
                          cursor: "pointer",
                          color: isFav ? "#ef4444" : "#334155",
                        }}
                      >
                        <Heart size={18} weight={isFav ? "fill" : "bold"} />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h2
                        className="font-black tracking-tight"
                        style={{
                          fontSize: "1.22rem",
                          color: "#092152",
                          margin: "0 0 3px 0",
                        }}
                      >
                        {vehicle.name}
                      </h2>

                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#4e678f", margin: "0 0 8px 0" }}
                      >
                        <span style={{ color: "#d97706", fontWeight: 700 }}>
                          {vehicle.subtitleHighlight}
                        </span>
                        {vehicle.subtitleRest}
                      </p>

                      {/* Rating Row */}
                      <div className="mb-2.5 flex items-center gap-1.5 text-xs">
                        <Star size={14} weight="fill" style={{ color: "#f59e0b" }} />
                        <strong className="font-black text-[#092152]">{vehicle.rating}</strong>
                        <span className="font-medium text-slate-500">({vehicle.reviews})</span>
                      </div>

                      {/* Specs Row: Seats | Luggage | AC */}
                      <div
                        className="mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-b border-blue-50 pb-3.5 text-xs font-bold"
                        style={{ color: "#34517f" }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <UsersThree size={14} weight="fill" style={{ color: "#4f80c7" }} />
                          {vehicle.seats}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <SuitcaseRolling size={14} weight="fill" style={{ color: "#4f80c7" }} />
                          {vehicle.luggage}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Snowflake size={14} weight="bold" style={{ color: "#4f80c7" }} />
                          {vehicle.ac}
                        </span>
                      </div>

                      {/* Bottom Row: Price on Left + Solid Blue Pill "Đặt ngay ->" on Right */}
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-1 whitespace-nowrap">
                          <span
                            className="font-black tracking-tight"
                            style={{ fontSize: "1.12rem", color: "#092152" }}
                          >
                            {currency.format(vehicle.price)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            / chuyến
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openBookingModal(vehicle)}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                          style={{
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                            boxShadow: "0 8px 18px rgba(13, 94, 215, 0.30)",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <CalendarBlank size={13} weight="bold" />
                          <span>Đặt ngay</span>
                          <ArrowRight size={12} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* BOTTOM HOTLINE STRIP */}
          <div className="mt-8 flex justify-center">
            <a
              href="tel:19001234"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition hover:bg-white"
              style={{
                background: "rgba(255, 255, 255, 0.86)",
                color: "#1e3f77",
                border: "1px solid rgba(255, 255, 255, 0.98)",
                boxShadow: "0 8px 22px rgba(21, 64, 138, 0.08)",
                borderRadius: 9999,
                textDecoration: "none",
              }}
            >
              <PhoneCall size={16} weight="fill" style={{ color: "#0b5ed7" }} />
              <span>
                Hỗ trợ điều xe sân bay 24/7:{" "}
                <strong className="font-black text-[#0b2559]">1900 1234</strong> • Sân bay đang
                chọn: <strong className="text-[#0b5ed7]">{selectedAirport.name}</strong>
              </span>
            </a>
          </div>
        </div>
      </main>

      {/* AIRPORT TRANSFER BOOKING MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{
            background: "rgba(9, 25, 58, 0.52)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-modal-title"
            className="w-full overflow-hidden bg-white shadow-2xl"
            style={{
              maxWidth: 540,
              borderRadius: 24,
              border: "1px solid #dbe9fe",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div className="relative" style={{ height: 145 }}>
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,28,64,0.18) 0%, rgba(10,28,64,0.82) 100%)",
                }}
              />
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Đóng hộp thoại"
                className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                style={{ borderRadius: 9999, border: "none", cursor: "pointer" }}
              >
                <X size={18} weight="bold" />
              </button>

              <div className="absolute bottom-3.5 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-white"
                    style={{ background: "rgba(11, 94, 215, 0.9)" }}
                  >
                    <AirplaneTilt size={12} weight="fill" />
                    {selectedAirport.name}
                  </span>
                  <h2
                    id="transfer-modal-title"
                    className="mt-1 text-xl font-black text-white"
                    style={{ margin: "4px 0 0 0" }}
                  >
                    Đặt xe {selectedVehicle.name}
                  </h2>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
                  style={{ background: "#ffffff", color: "#0b4fd0" }}
                >
                  {currency.format(selectedVehicle.price)} / chuyến
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {bookingConfirmed ? (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={22} weight="fill" className="shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-black text-emerald-900" style={{ margin: 0 }}>
                        Đã tiếp nhận lịch đưa đón sân bay!
                      </p>
                      <p
                        className="mt-1 text-xs font-semibold text-emerald-800"
                        style={{ margin: "4px 0 0 0" }}
                      >
                        Mã điều xe: <strong>{bookingConfirmed.code}</strong> • Xe:{" "}
                        <strong>{bookingConfirmed.vehicleName}</strong> tại{" "}
                        <strong>{bookingConfirmed.airport}</strong> (PNR:{" "}
                        <strong>{bookingConfirmed.pnr}</strong>). Tài xế sẽ liên hệ trước giờ hạ
                        cánh 30 phút và miễn phí chờ 60 phút nếu chuyến bay trễ.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
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
                <form onSubmit={handleConfirmTransfer} className="space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-[#102d63]">
                      Chọn dòng xe ({TRANSFER_VEHICLES.length} dòng xe)
                    </label>
                    <select
                      value={selectedVehicle.id}
                      onChange={(e) => {
                        const found = TRANSFER_VEHICLES.find((v) => v.id === e.target.value);
                        if (found) setSelectedVehicle(found);
                      }}
                      className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#102d63] focus:border-blue-500 focus:outline-none"
                    >
                      {TRANSFER_VEHICLES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.seats}) – {currency.format(v.price)} / chuyến
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Mã đặt chỗ chuyến bay (PNR)
                      </label>
                      {bookings.length > 0 ? (
                        <select
                          value={pnrCode}
                          onChange={(e) => setPnrCode(e.target.value)}
                          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        >
                          {bookings.map((b) => (
                            <option key={b.id} value={b.pnr_code}>
                              {b.pnr_code} • {b.flight?.flight_number || "SkyLink"}
                            </option>
                          ))}
                          <option value="">Không gắn PNR (Đặt lẻ)</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={pnrCode}
                          onChange={(e) => setPnrCode(e.target.value)}
                          placeholder={loadingBookings ? "Đang tải..." : "VD: SLK2587HN (nếu có)"}
                          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Giờ đón dự kiến
                      </label>
                      <div className="relative flex items-center">
                        <Clock
                          size={15}
                          className="pointer-events-none absolute left-3 text-blue-600"
                        />
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full rounded-xl border border-blue-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Điểm đón / trả khách ({selectedAirport.city})
                      </label>
                      <div className="relative flex items-center">
                        <MapPinLine
                          size={15}
                          className="pointer-events-none absolute left-3 text-blue-600"
                        />
                        <select
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          className="w-full rounded-xl border border-blue-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        >
                          {selectedAirport.destinations.map((dest) => (
                            <option key={dest} value={dest}>
                              {dest}
                            </option>
                          ))}
                          <option value="__custom__">Địa chỉ cụ thể khác (tự nhập)...</option>
                        </select>
                      </div>
                      {pickupAddress === "__custom__" && (
                        <input
                          type="text"
                          required
                          value={customPickupAddress}
                          onChange={(e) => setCustomPickupAddress(e.target.value)}
                          placeholder={`Nhập số nhà, khách sạn tại ${selectedAirport.city}...`}
                          className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Số điện thoại liên hệ
                      </label>
                      <div className="relative flex items-center">
                        <User
                          size={15}
                          className="pointer-events-none absolute left-3 text-blue-600"
                        />
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="VD: 0901 234 567"
                          className="w-full rounded-xl border border-blue-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
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
                      Xác nhận đặt xe đón
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
