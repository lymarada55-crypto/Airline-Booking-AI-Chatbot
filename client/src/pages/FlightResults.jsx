import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  useLocation,
  useNavigate,
  useSearchParams as useReactSearchParams,
} from "react-router-dom";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowsLeftRight,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  MapPinLine,
  Minus,
  Plus,
  Robot,
  Tag,
  Users,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import FlightCard from "../components/flight/FlightCard";
import FlightFilterSidebar from "../components/flight/FlightFilterSidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RescheduleModal from "../components/RescheduleModal";
import SkyDatePicker from "../components/SkyDatePicker";
import SkyAirportPicker from "../components/SkyAirportPicker";

const HERO_FLIGHT_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const FLIGHTS_PER_PAGE = 6;

const getTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function FlightResults() {
  const [urlSearchParams, setUrlSearchParams] = useReactSearchParams();
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchWarning, setSearchWarning] = useState("");
  const [filters, setFilters] = useState({
    sort: "price_asc",
    times: [],
    maxPrice: 10000000,
  });

  const [searchParams, setSearchParams] = useState({
    departure: "",
    arrival: "",
    date: "",
    returnDate: "",
    tripType: "one-way",
    cabinClass: "Phổ thông",
    passengers: { adults: 1, children: 0 },
  });

  const [passengerMenuOpen, setPassengerMenuOpen] = useState(false);
  const passengerMenuRef = useRef(null);

  const [bookingStage, setBookingStage] = useState("outbound");
  const [outboundFlight, setOutboundFlight] = useState(null);

  // Reschedule mode states
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedNewFlight, setSelectedNewFlight] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const todayStr = getTodayString();

  // Real pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Close passenger dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        passengerMenuRef.current &&
        !passengerMenuRef.current.contains(event.target)
      ) {
        setPassengerMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load airport list
  useEffect(() => {
    axios
      .get("/api/airports")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setAirports(list);
      })
      .catch((err) => {
        console.error("Failed to load airports:", err);
        setAirports([]);
      });
  }, []);

  useEffect(() => {
    // Reschedule mode
    if (location.state?.rescheduleBooking) {
      setRescheduleMode(true);
      setRescheduleBooking(location.state.rescheduleBooking);

      const booking = location.state.rescheduleBooking;
      const flight = booking.flight;

      const params = {
        departure: flight.departure_airport?.code || "",
        arrival: flight.arrival_airport?.code || "",
        date: flight.departure_time
          ? new Date(flight.departure_time).toISOString().slice(0, 10)
          : "",
        returnDate: "",
        tripType: "one-way",
        cabinClass: "Phổ thông",
        passengers: { adults: 1, children: 0 },
      };
      setSearchParams(params);
      fetchFlights(params);
      return;
    }

    // Read from URL query params
    const fromParam =
      urlSearchParams.get("from") || urlSearchParams.get("departure");
    const toParam = urlSearchParams.get("to") || urlSearchParams.get("arrival");
    const dateParam = urlSearchParams.get("date");
    const returnDateParam =
      urlSearchParams.get("returnDate") || urlSearchParams.get("return_date");
    const tripTypeParam =
      urlSearchParams.get("trip_type") ||
      urlSearchParams.get("tripType") ||
      "one-way";

    if (fromParam || toParam || dateParam) {
      const urlParams = {
        departure: fromParam || "",
        arrival: toParam || "",
        date: dateParam || "",
        returnDate: returnDateParam || "",
        tripType: tripTypeParam.replace("_", "-"),
        cabinClass: "Phổ thông",
        passengers: { adults: 1, children: 0 },
      };
      setSearchParams(urlParams);
      localStorage.setItem("search_params", JSON.stringify(urlParams));
      fetchFlights(urlParams);
      return;
    }

    // Read from localStorage
    const stored = localStorage.getItem("search_params");
    let parsed = null;
    try {
      parsed = stored ? JSON.parse(stored) : null;
    } catch {
      parsed = null;
    }
    if (parsed) {
      const normalized = {
        departure: parsed.departure || "",
        arrival: parsed.arrival || "",
        date: parsed.date || "",
        returnDate: parsed.returnDate || "",
        tripType: (parsed.tripType || "one-way").replace("_", "-"),
        cabinClass: parsed.cabinClass || "Phổ thông",
        passengers: {
          adults: Math.max(1, Number(parsed.passengers?.adults || 1)),
          children: Math.max(0, Number(parsed.passengers?.children || 0)),
        },
      };
      setSearchParams(normalized);
      fetchFlights(normalized);
    } else {
      fetchFlights(null);
    }
  }, [location.search]);

  const fetchFlights = async (params) => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const queryParts = [];
      if (params?.departure)
        queryParts.push(`from=${encodeURIComponent(params.departure)}`);
      if (params?.arrival)
        queryParts.push(`to=${encodeURIComponent(params.arrival)}`);
      if (params?.date)
        queryParts.push(`date=${encodeURIComponent(params.date)}`);

      if (params?.tripType) {
        const backendTripType = params.tripType.replace("-", "_");
        queryParts.push(`trip_type=${encodeURIComponent(backendTripType)}`);
      }

      const queryString =
        queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const response = await axios.get(`/api/flights${queryString}`);
      const flightList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      setFlights(flightList);
      setError(null);
    } catch {
      setError("Không thể tải danh sách chuyến bay. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySearch = (e) => {
    e?.preventDefault();
    setSearchWarning("");
    setPassengerMenuOpen(false);

    if (
      searchParams.departure &&
      searchParams.arrival &&
      searchParams.departure === searchParams.arrival
    ) {
      setSearchWarning("Điểm đi và điểm đến không được trùng nhau. Vui lòng chọn lại.");
      return;
    }

    if (
      searchParams.tripType === "round-trip" &&
      searchParams.date &&
      searchParams.returnDate &&
      searchParams.returnDate < searchParams.date
    ) {
      setSearchWarning("Ngày về không thể sớm hơn ngày đi. Vui lòng kiểm tra lại.");
      return;
    }

    setBookingStage("outbound");
    setOutboundFlight(null);
    localStorage.setItem("search_params", JSON.stringify(searchParams));

    const newParams = new URLSearchParams();
    if (searchParams.departure) newParams.set("from", searchParams.departure);
    if (searchParams.arrival) newParams.set("to", searchParams.arrival);
    if (searchParams.date) newParams.set("date", searchParams.date);
    if (searchParams.tripType === "round-trip" && searchParams.returnDate) {
      newParams.set("returnDate", searchParams.returnDate);
    }
    if (searchParams.tripType) {
      newParams.set("trip_type", searchParams.tripType.replace("-", "_"));
    }
    setUrlSearchParams(newParams);

    fetchFlights(searchParams);
  };

  const handleSwapAirports = () => {
    setSearchWarning("");
    setSearchParams((prev) => ({
      ...prev,
      departure: prev.arrival,
      arrival: prev.departure,
    }));
  };

  const handleFilterChange = (newFilters) => {
    setCurrentPage(1);
    if (newFilters.clearAll) {
      setFilters({ sort: "price_asc", times: [], maxPrice: 10000000 });
      return;
    }
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const updatePassengerCount = (field, delta) => {
    setSearchParams((prev) => {
      const current = prev.passengers || { adults: 1, children: 0 };
      const nextVal =
        field === "adults"
          ? Math.max(1, Math.min(9, (current.adults || 1) + delta))
          : Math.max(0, Math.min(6, (current.children || 0) + delta));
      return {
        ...prev,
        passengers: {
          ...current,
          [field]: nextVal,
        },
      };
    });
  };

  const handleSelectFlight = (flight) => {
    if (rescheduleMode && rescheduleBooking) {
      setSelectedNewFlight(flight);
      calculateReschedulefee(flight);
      return;
    }

    localStorage.setItem("search_params", JSON.stringify(searchParams));

    if (searchParams?.tripType === "round-trip" && bookingStage === "outbound") {
      setOutboundFlight(flight);
      setBookingStage("return");

      const returnParams = {
        ...searchParams,
        departure: searchParams.arrival,
        arrival: searchParams.departure,
        date: searchParams.returnDate,
      };
      setSearchParams(returnParams);
      fetchFlights(returnParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (searchParams?.tripType === "round-trip") {
        localStorage.setItem(
          "selected_flights",
          JSON.stringify([outboundFlight, flight])
        );
      } else {
        localStorage.setItem("selected_flights", JSON.stringify([flight]));
      }
      localStorage.removeItem("selected_flight");
      navigate("/seat-selection");
    }
  };

  const calculateReschedulefee = async (newFlight) => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");
      const res = await axios.post(
        `/api/bookings/${rescheduleBooking.id}/reschedule`,
        { new_flight_id: newFlight.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === "success") {
        setRescheduleData({
          oldBooking: rescheduleBooking,
          newFlight: newFlight,
          reschedule_fee: res.data.data.reschedule_fee,
          original_amount: res.data.data.original_amount,
        });
        setShowRescheduleModal(true);
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRescheduleConfirm = async () => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");
      const paymentAmount = rescheduleData.reschedule_fee;

      if (paymentAmount > 0) {
        localStorage.setItem(
          "reschedule_payment_data",
          JSON.stringify({
            bookingId: rescheduleData.oldBooking.id,
            newFlightId: rescheduleData.newFlight.id,
            amount: paymentAmount,
            type: "reschedule",
          })
        );
        navigate("/payment", {
          state: {
            amount: paymentAmount,
            bookingId: rescheduleData.oldBooking.id,
            newFlightId: rescheduleData.newFlight.id,
            type: "reschedule",
          },
        });
      } else {
        const res = await axios.post(
          `/api/bookings/${rescheduleData.oldBooking.id}/pay-reschedule`,
          {
            new_flight_id: rescheduleData.newFlight.id,
            payment_method: "vnpay",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "success") {
          alert("Đổi chuyến bay thành công!");
          navigate("/my-bookings");
        }
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
      setShowRescheduleModal(false);
    }
  };

  const getFilteredAndSortedFlights = () => {
    let result = Array.isArray(flights) ? [...flights] : [];

    // Filter by price
    if (filters.maxPrice) {
      result = result.filter(
        (f) => parseFloat(f.display_price || f.base_price) <= filters.maxPrice
      );
    }

    // Filter by departure times
    if (filters.times?.length > 0) {
      result = result.filter((f) => {
        const hour = new Date(f.departure_time).getHours();
        if (filters.times.includes("morning") && hour >= 6 && hour < 12)
          return true;
        if (filters.times.includes("afternoon") && hour >= 12 && hour < 18)
          return true;
        if (filters.times.includes("evening") && hour >= 18 && hour < 24)
          return true;
        return false;
      });
    }

    // Filter by airlines
    if (filters.airlines?.length > 0) {
      result = result.filter((f) => {
        const fn = (f.flight_number || "").toUpperCase();
        return filters.airlines.some((code) => {
          if (code === "VN")
            return fn.startsWith("VN") || fn.includes("VIETNAM");
          if (code === "VJ")
            return fn.startsWith("VJ") || fn.includes("VIETJET");
          if (code === "QH" || code === "FB")
            return (
              fn.startsWith("QH") ||
              fn.startsWith("FB") ||
              fn.includes("BAMBOO")
            );
          if (code === "SKY")
            return (
              fn.startsWith("SK") ||
              fn.startsWith("SL") ||
              (!fn.startsWith("VN") &&
                !fn.startsWith("VJ") &&
                !fn.startsWith("QH") &&
                !fn.startsWith("FB"))
            );
          return false;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      if (filters.sort === "price_asc") {
        const priceA = parseFloat(a.display_price || a.base_price);
        const priceB = parseFloat(b.display_price || b.base_price);
        return priceA - priceB;
      }
      if (filters.sort === "duration_asc") {
        const durA = new Date(a.arrival_time) - new Date(a.departure_time);
        const durB = new Date(b.arrival_time) - new Date(b.departure_time);
        return durA - durB;
      }
      if (filters.sort === "time_asc") {
        return new Date(a.departure_time) - new Date(b.departure_time);
      }
      return 0;
    });

    return result;
  };

  const displayedFlights = getFilteredAndSortedFlights();

  const cheapestFlight = displayedFlights.reduce((best, f) => {
    const p = Number(f.display_price || f.base_price || 0);
    if (!best || p < Number(best.display_price || best.base_price || Infinity)) return f;
    return best;
  }, null);

  const fastestFlight = displayedFlights.reduce((best, f) => {
    const d = new Date(f.arrival_time) - new Date(f.departure_time);
    const bestD = best ? new Date(best.arrival_time) - new Date(best.departure_time) : Infinity;
    if (d > 0 && d < bestD) return f;
    return best;
  }, null);

  const earliestFlight = displayedFlights.reduce((best, f) => {
    const t = new Date(f.departure_time).getTime();
    const bestT = best ? new Date(best.departure_time).getTime() : Infinity;
    if (!Number.isNaN(t) && t < bestT) return f;
    return best;
  }, null);

  const formatShortDurEn = (f) => {
    if (!f?.departure_time || !f?.arrival_time) return "—";
    const ms = new Date(f.arrival_time) - new Date(f.departure_time);
    if (Number.isNaN(ms) || ms <= 0) return "—";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
  };

  const formatVndCompact = (val) => {
    if (!val) return "—";
    return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(val)))} VND`;
  };

  const formatStripDayEn = (iso) => {
    const parts = String(iso).split("-").map(Number);
    if (parts.length !== 3) return iso;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]}`;
  };

  const activeDateStr = searchParams.date || getTodayString();
  const dateStripDays = (() => {
    const parts = activeDateStr.split("-").map(Number);
    const base =
      parts.length === 3
        ? new Date(parts[0], parts[1] - 1, parts[2])
        : new Date();
    const todayFloor = new Date();
    todayFloor.setHours(0, 0, 0, 0);
    const arr = [];
    for (let offset = -2; offset <= 2; offset += 1) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const iso = `${y}-${m}-${day}`;
      arr.push({
        iso,
        label: formatStripDayEn(iso),
        disabled: d < todayFloor,
      });
    }
    return arr;
  })();

  const handleQuickDateSelect = (nextIso) => {
    if (!nextIso || nextIso === activeDateStr) return;
    const updated = { ...searchParams, date: nextIso };
    setSearchParams(updated);
    localStorage.setItem("search_params", JSON.stringify(updated));
    const newParams = new URLSearchParams();
    if (updated.departure) newParams.set("from", updated.departure);
    if (updated.arrival) newParams.set("to", updated.arrival);
    newParams.set("date", nextIso);
    if (updated.tripType === "round-trip" && updated.returnDate) {
      newParams.set("returnDate", updated.returnDate);
    }
    if (updated.tripType) {
      newParams.set("trip_type", updated.tripType.replace("-", "_"));
    }
    setUrlSearchParams(newParams);
    fetchFlights(updated);
  };

  const shiftStripDate = (delta) => {
    const parts = activeDateStr.split("-").map(Number);
    const d = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();
    d.setDate(d.getDate() + delta);
    const todayFloor = new Date();
    todayFloor.setHours(0, 0, 0, 0);
    if (d < todayFloor) return;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    handleQuickDateSelect(iso);
  };
  const totalPages = Math.max(
    1,
    Math.ceil(displayedFlights.length / FLIGHTS_PER_PAGE)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedFlights = displayedFlights.slice(
    (safeCurrentPage - 1) * FLIGHTS_PER_PAGE,
    safeCurrentPage * FLIGHTS_PER_PAGE
  );

  // Compact windowed pagination (e.g. 1 ... 4 5 6 ... 700) — never overflows horizontally!
  const getVisiblePageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    if (start > 2) pages.push("...");
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };
  const visiblePageNumbers = getVisiblePageNumbers();

  const totalPassengers =
    (searchParams.passengers?.adults || 1) +
    (searchParams.passengers?.children || 0);

  const routeSummaryText =
    searchParams.departure && searchParams.arrival
      ? `${searchParams.departure} ➔ ${searchParams.arrival}`
      : searchParams.departure
        ? `Khởi hành từ ${searchParams.departure}`
        : searchParams.arrival
          ? `Đến ${searchParams.arrival}`
          : "Tất cả chặng bay nội địa & quốc tế";

  const dateSummaryText = searchParams.date
    ? new Date(`${searchParams.date}T00:00:00`).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Tất cả ngày khởi hành";

  return (
    <div
      className="relative min-h-screen font-sans text-slate-900"
      style={{
        background:
          "linear-gradient(180deg, #b8dcff 0%, #dceeff 24%, #eef6ff 60%, #d6eaff 100%)",
      }}
    >
      <Navbar />

      {/* 1. HERO HEADER BANNER (Synced 5-Star SkyLink Style) */}
      <div className="relative z-30 pb-10 pt-22">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: 330 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.84) 46%, rgba(225,241,255,0.20) 100%)",
            }}
          />
          <img
            src={HERO_FLIGHT_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 32%",
              opacity: 0.9,
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 34%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 34%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 92,
              background:
                "linear-gradient(180deg, rgba(220,238,255,0) 0%, #dceeff 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-3 inline-flex items-center gap-2 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-[#16428b] shadow-sm transition hover:bg-white"
            style={{
              border: "1px solid rgba(255,255,255,0.96)",
              borderRadius: 9999,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Quay lại trang chủ</span>
          </button>

          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em]"
                style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
              >
                <AirplaneTilt size={15} weight="fill" />
                SKYLINK AIRLINES • ĐẶT VÉ TRỰC TUYẾN
              </p>
              <h1
                className="font-black tracking-tight"
                style={{
                  fontSize: "clamp(1.95rem, 3.4vw, 2.7rem)",
                  color: "#091e47",
                  lineHeight: 1.12,
                  margin: "0 0 6px 0",
                }}
              >
                {rescheduleMode ? "Chọn chuyến bay mới để đổi vé" : "Tìm kiếm chuyến bay"}
              </h1>
              <p className="text-xs font-semibold text-[#2d4b7a] sm:text-sm" style={{ margin: 0 }}>
                Chặng bay: <strong className="text-[#092152]">{routeSummaryText}</strong> • Ngày:{" "}
                <strong className="text-[#092152]">{dateSummaryText}</strong> •{" "}
                <strong className="text-[#0b5ed7]">
                  {totalPassengers} hành khách ({searchParams.cabinClass || "Phổ thông"})
                </strong>
              </p>
            </div>
          </div>

          {/* Compact 1-Row Floating Search Bar matching Traveloka mockup */}
          <form
            onSubmit={handleApplySearch}
            className="bg-white/95 px-4 py-3.5 shadow-lg"
            style={{
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.98)",
              boxShadow: "0 14px 34px rgba(20, 62, 132, 0.11)",
              backdropFilter: "blur(12px)",
            }}
          >
            {searchWarning && (
              <div
                role="alert"
                className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700"
                style={{ border: "1px solid #fecdd3" }}
              >
                <WarningCircle size={15} weight="fill" />
                <span>{searchWarning}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
              {/* Origin + Overlapping Swap + Destination */}
              <div className="relative flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="min-w-0 flex-1">
                  <SkyAirportPicker
                    compact
                    label="From"
                    placeholder="From city / airport"
                    variant="departure"
                    allowClear
                    airports={airports}
                    value={searchParams.departure}
                    disabledCode={searchParams.arrival}
                    onChange={(code) => {
                      setSearchWarning("");
                      setSearchParams((prev) => ({
                        ...prev,
                        departure: code,
                      }));
                    }}
                  />
                </div>

                {/* Overlapping Light-Blue Circular Swap Button */}
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="z-10 mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:brightness-95 sm:-mx-4"
                  style={{
                    background: "#dff0ff",
                    border: "2px solid #ffffff",
                    cursor: "pointer",
                  }}
                  title="Swap origin & destination"
                  aria-label="Đổi chiều bay"
                >
                  <ArrowsLeftRight size={14} weight="bold" />
                </button>

                <div className="min-w-0 flex-1">
                  <SkyAirportPicker
                    compact
                    label="To"
                    placeholder="To city / airport"
                    variant="arrival"
                    allowClear
                    airports={airports}
                    value={searchParams.arrival}
                    disabledCode={searchParams.departure}
                    onChange={(code) => {
                      setSearchWarning("");
                      setSearchParams((prev) => ({
                        ...prev,
                        arrival: code,
                      }));
                    }}
                  />
                </div>
              </div>

              {/* Departure Date Pill */}
              <div
                className="flex items-center bg-white px-2.5 lg:w-[170px] lg:shrink-0"
                style={{
                  borderRadius: 12,
                  border: "1px solid #d5e2f2",
                  height: 44,
                }}
              >
                <SkyDatePicker
                  value={searchParams.date}
                  min={todayStr}
                  placeholder="Depart date"
                  onChange={(val) => {
                    setSearchWarning("");
                    setSearchParams((prev) => ({
                      ...prev,
                      date: val,
                      returnDate:
                        prev.returnDate && val && prev.returnDate < val
                          ? val
                          : prev.returnDate,
                    }));
                  }}
                />
              </div>

              {/* Optional Return Date Pill with circular Clear 'x' */}
              <div
                className="flex items-center justify-between gap-1 bg-white px-2.5 lg:w-[178px] lg:shrink-0"
                style={{
                  borderRadius: 12,
                  border: "1px solid #d5e2f2",
                  height: 44,
                }}
              >
                {searchParams.tripType === "round-trip" ? (
                  <>
                    <div className="min-w-0 flex-1">
                      <SkyDatePicker
                        value={searchParams.returnDate}
                        min={searchParams.date || todayStr}
                        placeholder="Return date"
                        align="right"
                        onChange={(val) => {
                          setSearchWarning("");
                          setSearchParams((prev) => ({
                            ...prev,
                            returnDate: val,
                          }));
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSearchParams((prev) => ({
                          ...prev,
                          tripType: "one-way",
                          returnDate: "",
                        }))
                      }
                      aria-label="Remove return date"
                      title="One-way flight"
                      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-600 transition hover:bg-blue-200"
                      style={{ background: "#dff0ff", border: "none" }}
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const base = searchParams.date || todayStr;
                      const d = new Date(`${base}T00:00:00`);
                      d.setDate(d.getDate() + 2);
                      const retIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                      setSearchParams((prev) => ({
                        ...prev,
                        tripType: "round-trip",
                        returnDate: retIso,
                      }));
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 bg-transparent text-left font-semibold text-slate-400 hover:text-blue-600"
                    style={{ border: "none", fontSize: 13 }}
                  >
                    <CalendarBlank size={17} weight="duotone" className="shrink-0 text-slate-400" />
                    <span className="truncate">+ Return date</span>
                  </button>
                )}
              </div>

              {/* Compact Passenger & Cabin Class Pill */}
              <div ref={passengerMenuRef} className="relative lg:w-[188px] lg:shrink-0">
                <button
                  type="button"
                  onClick={() => setPassengerMenuOpen((v) => !v)}
                  className="flex w-full cursor-pointer items-center justify-between gap-1.5 bg-white px-3 text-left transition hover:border-blue-300"
                  style={{
                    borderRadius: 12,
                    border: passengerMenuOpen ? "1.5px solid #1d75f2" : "1px solid #d5e2f2",
                    height: 44,
                  }}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 font-bold text-[#091e47]" style={{ fontSize: 13 }}>
                    <Users size={17} weight="duotone" className="shrink-0 text-slate-600" />
                    <span className="truncate">
                      {totalPassengers} passenger(s) ·{" "}
                      {(searchParams.cabinClass || "Phổ thông") === "Thương gia"
                        ? "Business"
                        : "Economy"}
                    </span>
                  </span>
                </button>

                {passengerMenuOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-72 bg-white p-4 shadow-2xl"
                    style={{
                      borderRadius: 20,
                      border: "1px solid #dbe8fc",
                      boxShadow: "0 18px 40px rgba(15, 52, 114, 0.16)",
                    }}
                  >
                    <p className="mb-3 text-xs font-black text-[#092152]" style={{ margin: "0 0 10px 0" }}>
                      Passengers &amp; Cabin Class
                    </p>

                    <div className="space-y-3 border-b border-blue-50 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                            Adults (Người lớn)
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400" style={{ margin: 0 }}>
                            12+ years
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => updatePassengerCount("adults", -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700"
                            style={{ cursor: "pointer" }}
                          >
                            <Minus size={12} weight="bold" />
                          </button>
                          <span className="w-5 text-center text-xs font-black text-[#092152]">
                            {searchParams.passengers?.adults || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => updatePassengerCount("adults", 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700"
                            style={{ cursor: "pointer" }}
                          >
                            <Plus size={12} weight="bold" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                            Children (Trẻ em)
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400" style={{ margin: 0 }}>
                            2 – 11 years
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => updatePassengerCount("children", -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700"
                            style={{ cursor: "pointer" }}
                          >
                            <Minus size={12} weight="bold" />
                          </button>
                          <span className="w-5 text-center text-xs font-black text-[#092152]">
                            {searchParams.passengers?.children || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => updatePassengerCount("children", 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700"
                            style={{ cursor: "pointer" }}
                          >
                            <Plus size={12} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="mb-2 text-[11px] font-extrabold text-[#5a749b]" style={{ margin: "0 0 8px 0" }}>
                        Cabin Class
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { val: "Phổ thông", label: "Economy" },
                          { val: "Thương gia", label: "Business" },
                        ].map((cabin) => {
                          const active =
                            (searchParams.cabinClass || "Phổ thông") === cabin.val;
                          return (
                            <button
                              key={cabin.val}
                              type="button"
                              onClick={() =>
                                setSearchParams((prev) => ({
                                  ...prev,
                                  cabinClass: cabin.val,
                                }))
                              }
                              className="rounded-xl py-2 text-xs font-extrabold transition"
                              style={
                                active
                                  ? {
                                      background: "#ebf4ff",
                                      color: "#0b4fd0",
                                      border: "1.5px solid #1d75f2",
                                      cursor: "pointer",
                                    }
                                  : {
                                      background: "#f8fafc",
                                      color: "#475569",
                                      border: "1px solid #e2e8f0",
                                      cursor: "pointer",
                                    }
                              }
                            >
                              {cabin.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPassengerMenuOpen(false)}
                      className="mt-3 w-full py-2 text-xs font-extrabold text-white"
                      style={{
                        background:
                          "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Search Pill CTA Button matching mockup */}
              <button
                type="submit"
                className="shrink-0 cursor-pointer font-extrabold transition hover:brightness-95"
                style={{
                  background: "#dff0ff",
                  color: "#026aa7",
                  borderRadius: 9999,
                  border: "none",
                  height: 44,
                  padding: "0 20px",
                  fontSize: 13.5,
                  whiteSpace: "nowrap",
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID (Filter Sidebar + Flight Results List) */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-7 px-4 pb-24 pt-2 sm:px-6 md:flex-row lg:px-8">
        {/* Left: Sticky Filter Sidebar */}
        <FlightFilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          allFlights={flights}
        />

        {/* Right: Flight List & Real Pagination */}
        <div className="min-w-0 w-full flex-1 space-y-4">
          {/* Round-trip Step Progress Banner */}
          {searchParams?.tripType === "round-trip" && (
            <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-white/95 p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {bookingStage === "outbound" ? "1/2" : "2/2"}
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#092152]" style={{ margin: 0 }}>
                    {bookingStage === "outbound"
                      ? "BƯỚC 1: CHỌN CHUYẾN BAY CHIỀU ĐI"
                      : "BƯỚC 2: CHỌN CHUYẾN BAY CHIỀU VỀ"}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#47628a]" style={{ margin: "2px 0 0 0" }}>
                    {bookingStage === "outbound"
                      ? `Chặng đi: ${routeSummaryText}`
                      : `Chặng về: ${searchParams.departure || "---"} ➔ ${searchParams.arrival || "---"} (Đã chọn chiều đi: ${outboundFlight?.flight_number || "SkyLink"})`}
                  </p>
                </div>
              </div>
              {bookingStage === "return" && (
                <button
                  type="button"
                  onClick={() => {
                    setBookingStage("outbound");
                    setOutboundFlight(null);
                    fetchFlights(searchParams);
                  }}
                  className="shrink-0 cursor-pointer text-xs font-extrabold text-blue-600 underline hover:text-blue-800"
                >
                  ← Chọn lại chiều đi
                </button>
              )}
            </div>
          )}

          {/* Traveloka-Style Date Price Strip + 3-Tab Sort Bar */}
          <div
            className="overflow-hidden bg-white shadow-xs"
            style={{ borderRadius: 22, border: "1px solid #dbe7fb" }}
          >
            {/* Header Row: Depart Route + Promos Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-[#091e47]" style={{ fontSize: 15 }}>
                  Depart: {routeSummaryText}
                </span>
                <span
                  className="bg-blue-50 px-2.5 py-0.5 font-bold text-blue-700"
                  style={{ borderRadius: 9999, fontSize: 11.5 }}
                >
                  {displayedFlights.length} flights
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/promotions")}
                className="inline-flex cursor-pointer items-center gap-1.5 bg-white px-3.5 py-1.5 font-bold text-[#091e47] transition hover:bg-blue-50"
                style={{
                  borderRadius: 9999,
                  border: "1px solid #cbd5e1",
                  fontSize: 12,
                }}
              >
                <Tag size={14} weight="duotone" className="text-blue-600" />
                <span>Promos</span>
              </button>
            </div>

            {/* 5-Day Horizontal Date Strip */}
            <div className="flex items-center border-b border-slate-100 px-2 py-2">
              <button
                type="button"
                onClick={() => shiftStripDate(-1)}
                aria-label="Previous day"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                style={{ border: "none" }}
              >
                <CaretLeft size={16} weight="bold" />
              </button>

              <div className="grid flex-1 grid-cols-3 gap-1.5 sm:grid-cols-5">
                {dateStripDays.map((d) => {
                  const isActive = d.iso === activeDateStr;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      disabled={d.disabled}
                      onClick={() => handleQuickDateSelect(d.iso)}
                      className="cursor-pointer px-2 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        borderRadius: 12,
                        border: "none",
                        background: isActive ? "#ebf5ff" : "transparent",
                      }}
                    >
                      <div
                        className="font-bold"
                        style={{
                          fontSize: 12,
                          color: isActive ? "#0284c7" : "#475569",
                        }}
                      >
                        {d.label}
                      </div>
                      <div
                        className="mt-0.5 truncate font-extrabold"
                        style={{
                          fontSize: 11.5,
                          color: isActive ? "#0369a1" : "#059669",
                        }}
                      >
                        {isActive && cheapestFlight
                          ? formatVndCompact(cheapestFlight.display_price || cheapestFlight.base_price)
                          : "Xem giá"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => shiftStripDate(1)}
                aria-label="Next day"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                style={{ border: "none" }}
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>

            {/* 3-Tab Sort Bar matching Traveloka mockup */}
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                {
                  id: "price_asc",
                  title: "Lowest price",
                  sub: cheapestFlight
                    ? `${formatVndCompact(cheapestFlight.display_price || cheapestFlight.base_price)} · ${formatShortDurEn(cheapestFlight)}`
                    : "Giá thấp nhất",
                },
                {
                  id: "duration_asc",
                  title: "Shortest duration",
                  sub: fastestFlight
                    ? `${formatVndCompact(fastestFlight.display_price || fastestFlight.base_price)} · ${formatShortDurEn(fastestFlight)}`
                    : "Bay nhanh nhất",
                },
                {
                  id: "time_asc",
                  title: "Earliest departure",
                  sub: earliestFlight
                    ? (() => {
                        const dt = new Date(String(earliestFlight.departure_time || "").replace(" ", "T"));
                        if (Number.isNaN(dt.getTime())) return "Cất cánh sớm nhất";
                        return `Cất cánh ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
                      })()
                    : "Cất cánh sớm nhất",
                },
              ].map((tab) => {
                const active = filters.sort === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleFilterChange({ sort: tab.id })}
                    className="cursor-pointer px-3 py-3 text-center transition hover:bg-slate-50"
                    style={{
                      background: active ? "#f8fbff" : "#ffffff",
                      border: "none",
                      borderBottom: active ? "3px solid #0284c7" : "3px solid transparent",
                    }}
                  >
                    <div
                      className="font-extrabold"
                      style={{ fontSize: 13, color: active ? "#0284c7" : "#0f172a" }}
                    >
                      {tab.title}
                    </div>
                    <div
                      className="mt-0.5 truncate font-semibold text-slate-500"
                      style={{ fontSize: 11 }}
                    >
                      {tab.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/90 py-20 text-slate-500">
              <MagnifyingGlass
                className="animate-spin text-blue-600"
                size={34}
              />
              <p className="text-xs font-bold">Đang tìm kiếm chuyến bay phù hợp...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 py-14 text-center">
              <p className="text-sm font-bold text-rose-700">{error}</p>
            </div>
          ) : displayedFlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-xs">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <AirplaneTilt size={28} weight="duotone" />
              </span>
              <p className="text-sm font-black text-[#092152]">
                Không tìm thấy chuyến bay nào phù hợp
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Thử đổi ngày khởi hành hoặc xóa bộ lọc giá/khung giờ để xem thêm chuyến bay khác.
              </p>
              <button
                type="button"
                onClick={() => handleFilterChange({ clearAll: true })}
                className="mt-4 px-5 py-2 text-xs font-extrabold text-white"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <ul className="flex w-full flex-col gap-4" style={{ padding: 0, margin: 0 }}>
              {paginatedFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  isCheapest={cheapestFlight?.id === flight.id}
                  isFastest={fastestFlight?.id === flight.id}
                  cabinClass={searchParams.cabinClass}
                  onSelect={handleSelectFlight}
                />
              ))}
            </ul>
          )}

          {/* Real Dynamic Windowed Pagination (Always fits cleanly on 1 row) */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                  window.scrollTo({ top: 320, behavior: "smooth" });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-bold text-[#163d7a] hover:bg-blue-50 disabled:opacity-40"
                style={{ cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer" }}
              >
                ‹
              </button>
              {visiblePageNumbers.map((pageNum, idx) =>
                pageNum === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-7 items-center justify-center text-xs font-bold text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 320, behavior: "smooth" });
                    }}
                    className="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-extrabold transition"
                    style={
                      safeCurrentPage === pageNum
                        ? {
                            background:
                              "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            border: "none",
                            cursor: "pointer",
                          }
                        : {
                            background: "#ffffff",
                            color: "#163d7a",
                            border: "1px solid #cde0fc",
                            cursor: "pointer",
                          }
                    }
                  >
                    {pageNum}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 320, behavior: "smooth" });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-bold text-[#163d7a] hover:bg-blue-50 disabled:opacity-40"
                style={{
                  cursor:
                    safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                }}
              >
                ›
              </button>
            </div>
          )}

          {/* Clean Inline Support Banner (No longer floats over flight cards) */}
          <div className="pt-4">
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-full bg-white/90 px-5 py-2.5 text-xs shadow-sm"
              style={{ border: "1px solid #c9defc" }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <p className="truncate font-semibold text-slate-700" style={{ margin: 0 }}>
                  <strong className="text-blue-600">Bạn cần hỗ trợ?</strong> SkyAI luôn sẵn sàng
                  24/7 tư vấn chuyến bay phù hợp nhất.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/support")}
                className="inline-flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-extrabold text-white shadow-xs transition hover:opacity-95"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Robot size={14} weight="bold" />
                <span>Chat với SkyAI</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        data={rescheduleData}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleRescheduleConfirm}
      />
    </div>
  );
}
