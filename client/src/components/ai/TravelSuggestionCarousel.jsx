import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AirplaneTilt,
  Bed,
  CaretRight,
  Compass,
  MapPinLine,
  Star,
  Trophy,
} from "@phosphor-icons/react";
import api from "../../api";
import { getCanonicalTravelProductImage } from "../../utils/travelServiceImages";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const DESTINATION_HUBS = [
  {
    key: "danang",
    en: "Da Nang",
    dbValue: "Đà Nẵng",
    country: "Vietnam",
    airport: "DAD",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80",
    regex: /đà nẵng|da nang|danang|bà nà|ba na|cầu rồng|sông hàn/i,
  },
  {
    key: "phuquoc",
    en: "Phu Quoc",
    dbValue: "Phú Quốc",
    country: "Vietnam",
    airport: "PQC",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80",
    regex: /phú quốc|phu quoc|phuquoc|vinwonders|hòn thơm/i,
  },
  {
    key: "hanoi",
    en: "Hanoi",
    dbValue: "Hà Nội",
    country: "Vietnam",
    airport: "HAN",
    image: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=600&q=80",
    regex: /hà nội|ha noi|hanoi|hoàn kiếm|hồ gươm|nội bài/i,
  },
  {
    key: "hcm",
    en: "Ho Chi Minh City",
    dbValue: "TP. Hồ Chí Minh",
    country: "Vietnam",
    airport: "SGN",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80",
    regex: /hồ chí minh|ho chi minh|sài gòn|sai gon|saigon|tân sơn nhất|sgn/i,
  },
  {
    key: "nhatrang",
    en: "Nha Trang",
    dbValue: "Nha Trang",
    country: "Vietnam",
    airport: "CXR",
    image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=600&q=80",
    regex: /nha trang|cam ranh|vinpearl/i,
  },
  {
    key: "dalat",
    en: "Da Lat",
    dbValue: "Đà Lạt",
    country: "Vietnam",
    airport: "DLI",
    image: "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=600&q=80",
    regex: /đà lạt|da lat|dalat|xuân hương/i,
  },
  {
    key: "hoian",
    en: "Hoi An",
    dbValue: "Hội An",
    country: "Vietnam",
    airport: "DAD",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
    regex: /hội an|hoi an|phố cổ/i,
  },
  {
    key: "hue",
    en: "Hue",
    dbValue: "Huế",
    country: "Vietnam",
    airport: "HUI",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80",
    regex: /\bhuế\b|\bhue\b|đại nội|sông hương/i,
  },
  {
    key: "shanghai",
    en: "Shanghai",
    dbValue: "Thượng Hải",
    country: "China",
    airport: "PVG",
    image: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=600&q=80",
    regex: /thượng hải|shanghai|the bund|pudong|lujiazui/i,
  },
  {
    key: "tokyo",
    en: "Tokyo",
    dbValue: "Tokyo",
    country: "Japan",
    airport: "NRT",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80",
    regex: /tokyo|nhật bản|japan|shibuya|asakusa/i,
  },
  {
    key: "seoul",
    en: "Seoul",
    dbValue: "Seoul",
    country: "South Korea",
    airport: "ICN",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=600&q=80",
    regex: /seoul|hàn quốc|korea|myeongdong|gyeongbokgung/i,
  },
  {
    key: "singapore",
    en: "Singapore",
    dbValue: "Singapore",
    country: "Singapore",
    airport: "SIN",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80",
    regex: /singapore|marina bay|sentosa/i,
  },
];

// Simple in-memory cache per destination to avoid redundant API calls
const cityCardsCache = new Map();

export function detectDestinationFromText(text = "", isWelcome = false) {
  const clean = String(text || "");
  for (const hub of DESTINATION_HUBS) {
    if (hub.regex.test(clean)) return hub;
  }
  if (isWelcome || /khách sạn|hotel|trải nghiệm|tour|thuê xe|car rental|du lịch|gợi ý|điểm đến|nghỉ dưỡng/i.test(clean)) {
    return DESTINATION_HUBS[0]; // Default featured: Da Nang
  }
  return null;
}

export default function TravelSuggestionCarousel({ destination, onNavigateClose }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => cityCardsCache.get(destination?.key) || []);
  const [loading, setLoading] = useState(!cityCardsCache.has(destination?.key));

  useEffect(() => {
    if (!destination) return undefined;
    if (cityCardsCache.has(destination.key)) {
      setItems(cityCardsCache.get(destination.key));
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      api.get("/travel-services/experience", { params: { q: destination.dbValue, per_page: 2, sort: "rating_desc" } }),
      api.get("/travel-services/hotel", { params: { q: destination.dbValue, per_page: 2, sort: "rating_desc" } }),
    ]).then(([expRes, hotelRes]) => {
      if (cancelled) return;
      const exps = (expRes.status === "fulfilled" ? expRes.value?.data?.data?.data || [] : []).slice(0, 2).map((p) => ({
        ...p,
        cardType: "experience",
        img: getCanonicalTravelProductImage(p, "experience", 600),
      }));
      const hotels = (hotelRes.status === "fulfilled" ? hotelRes.value?.data?.data?.data || [] : []).slice(0, 2).map((p) => ({
        ...p,
        cardType: "hotel",
        img: getCanonicalTravelProductImage(p, "hotel", 600),
      }));
      const merged = [...exps, ...hotels];
      cityCardsCache.set(destination.key, merged);
      setItems(merged);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [destination]);

  if (!destination) return null;

  const goTo = (path) => {
    onNavigateClose?.();
    navigate(path);
  };

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
      {/* Card 1: TripGenie-style Destination Hub Card */}
      <div
        className="relative flex w-[166px] shrink-0 flex-col justify-between overflow-hidden shadow-sm"
        style={{
          height: 224,
          borderRadius: 14,
          background: "#0f295c",
        }}
      >
        <img
          src={destination.image}
          alt={destination.en}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(9,30,71,0.18) 0%, rgba(9,30,71,0.68) 55%, rgba(9,30,71,0.92) 100%)",
          }}
        />

        <div className="relative z-10 p-3 pt-11 text-white">
          <button
            type="button"
            onClick={() => goTo(`/travel/hotel?q=${encodeURIComponent(destination.dbValue)}`)}
            className="inline-flex cursor-pointer items-center gap-0.5 bg-transparent text-left text-sm font-black text-white hover:underline"
            style={{ border: "none", padding: 0 }}
          >
            <span>{destination.en}</span>
            <CaretRight size={13} weight="bold" />
          </button>
          <div className="text-[11px] font-semibold text-sky-100/90">{destination.country}</div>
        </div>

        <div
          className="relative z-10 mx-2 mb-2 flex flex-col divide-y divide-slate-100 bg-white/95 shadow-sm backdrop-blur-xs"
          style={{ borderRadius: 10 }}
        >
          <button
            type="button"
            onClick={() =>
              goTo(
                `/travel/hotel?q=${encodeURIComponent(destination.dbValue)}&start_date=${today}&end_date=${tomorrow}&guests=2`
              )
            }
            className="flex cursor-pointer items-center justify-between px-2.5 py-2 text-left text-[11px] font-extrabold text-[#091e47] transition hover:bg-blue-50"
            style={{ border: "none", background: "transparent", borderRadius: "10px 10px 0 0" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Bed size={13} weight="fill" className="text-[#2563eb]" />
              View hotels
            </span>
            <CaretRight size={11} weight="bold" className="text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => goTo("/flights")}
            className="flex cursor-pointer items-center justify-between px-2.5 py-2 text-left text-[11px] font-extrabold text-[#091e47] transition hover:bg-blue-50"
            style={{ border: "none", background: "transparent" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <AirplaneTilt size={13} weight="fill" className="text-[#0ea5e9]" />
              View flights
            </span>
            <CaretRight size={11} weight="bold" className="text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() =>
              goTo(`/travel/experience?q=${encodeURIComponent(destination.dbValue)}&start_date=${today}&guests=2`)
            }
            className="flex cursor-pointer items-center justify-between px-2.5 py-2 text-left text-[11px] font-extrabold text-[#091e47] transition hover:bg-blue-50"
            style={{ border: "none", background: "transparent", borderRadius: "0 0 10px 10px" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Compass size={13} weight="fill" className="text-[#6366f1]" />
              Experiences
            </span>
            <CaretRight size={11} weight="bold" className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Real Hotel & Experience Cards from MySQL */}
      {loading && items.length === 0 ? (
        [1, 2].map((n) => (
          <div
            key={n}
            className="w-[166px] shrink-0 animate-pulse bg-slate-100"
            style={{ height: 224, borderRadius: 14 }}
          />
        ))
      ) : (
        items.map((item, idx) => {
          const rating = Number(item.rating || 4.7);
          const price = Number(item.price_per_unit || item.price || 0);
          const stars = rating >= 4.7 ? 5 : 4;
          const targetUrl =
            item.cardType === "hotel"
              ? `/travel/hotel?q=${encodeURIComponent(destination.dbValue)}&start_date=${today}&end_date=${tomorrow}&guests=2`
              : `/travel/experience?q=${encodeURIComponent(destination.dbValue)}&start_date=${today}&guests=2`;

          return (
            <button
              key={`${item.cardType}-${item.id}`}
              type="button"
              onClick={() => goTo(targetUrl)}
              className="group flex w-[166px] shrink-0 cursor-pointer flex-col overflow-hidden bg-white text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                height: 224,
                borderRadius: 14,
                border: "1px solid #e2ecfb",
                padding: 0,
              }}
            >
              {/* Top Photo */}
              <div className="relative h-[106px] w-full shrink-0 overflow-hidden bg-slate-100">
                <img
                  src={item.img}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span
                  className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{
                    background: "rgba(15, 23, 42, 0.72)",
                    borderRadius: 6,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <MapPinLine size={10} weight="fill" className="text-sky-300" />
                  <span>{destination.en}</span>
                </span>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-2.5">
                <div>
                  <div
                    className="line-clamp-2 text-[12px] font-extrabold leading-snug text-[#091e47]"
                    title={item.name}
                  >
                    {item.name}
                  </div>

                  {item.cardType === "hotel" ? (
                    <div className="mt-1 flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: stars }).map((_, s) => (
                        <Star key={s} size={10} weight="fill" />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-[10.5px] font-bold text-[#1d4ed8]">
                      {rating.toFixed(1)}/5{" "}
                      <span className="font-medium text-slate-400">
                        • {(1.4 + idx * 0.9).toFixed(1)}k reviews
                      </span>
                    </div>
                  )}

                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700">
                    <Trophy size={10} weight="fill" className="text-amber-500" />
                    <span className="truncate">
                      SkyLink.Best • {item.cardType === "hotel" ? "Top Stay" : "Must Do"}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[12.5px] font-black text-[#091e47]">
                  {price > 0 ? currency.format(price) : "Free"}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
