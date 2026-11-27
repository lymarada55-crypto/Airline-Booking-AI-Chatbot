import { useEffect, useMemo, useRef, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  Heart,
  MapPinLine,
  Minus,
  Plus,
  Star,
  X,
} from "@phosphor-icons/react";

const CITY_COORDS = {
  "quy nhơn": { lat: 13.7829, lng: 109.2196, label: "Quy Nhơn" },
  "đà nẵng": { lat: 16.0544, lng: 108.2022, label: "Đà Nẵng" },
  "hà nội": { lat: 21.0285, lng: 105.8542, label: "Hà Nội" },
  "tp. hồ chí minh": { lat: 10.7769, lng: 106.7009, label: "TP. Hồ Chí Minh" },
  "hồ chí minh": { lat: 10.7769, lng: 106.7009, label: "Hồ Chí Minh" },
  "nha trang": { lat: 12.2388, lng: 109.1967, label: "Nha Trang" },
  "phú quốc": { lat: 10.2899, lng: 103.984, label: "Phú Quốc" },
  "đà lạt": { lat: 11.9404, lng: 108.4583, label: "Đà Lạt" },
  "huế": { lat: 16.4637, lng: 107.5909, label: "Huế" },
  "hội an": { lat: 15.8801, lng: 108.338, label: "Hội An" },
  "hải phòng": { lat: 20.8449, lng: 106.6881, label: "Hải Phòng" },
  "cần thơ": { lat: 10.0452, lng: 105.7469, label: "Cần Thơ" },
  "thượng hải": { lat: 31.2304, lng: 121.4737, label: "Thượng Hải" },
  "shanghai": { lat: 31.2304, lng: 121.4737, label: "Shanghai" },
  "seoul": { lat: 37.5665, lng: 126.978, label: "Seoul" },
  "tokyo": { lat: 35.6762, lng: 139.6503, label: "Tokyo" },
  "singapore": { lat: 1.2834, lng: 103.8607, label: "Singapore" },
  "kuala lumpur": { lat: 3.139, lng: 101.6869, label: "Kuala Lumpur" },
  "quảng châu": { lat: 23.1291, lng: 113.2644, label: "Quảng Châu" },
  "bắc kinh": { lat: 39.9042, lng: 116.4074, label: "Bắc Kinh" },
  "đài bắc": { lat: 25.033, lng: 121.5654, label: "Đài Bắc" },
  "sydney": { lat: -33.8688, lng: 151.2093, label: "Sydney" },
  "manila": { lat: 14.5995, lng: 120.9842, label: "Manila" },
};

function getBaseCoord(cityRaw = "") {
  const lower = String(cityRaw || "").toLowerCase();
  for (const [key, val] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key)) return val;
  }
  return CITY_COORDS["đà nẵng"];
}

// Deterministic pseudo-random offset around city center so pins spread naturally
function getHotelCoord(hotel, idx) {
  const base = getBaseCoord(hotel.city);
  const seed = Number(hotel.id || idx + 1) * 9301 + 49297;
  const angle = ((seed % 360) * Math.PI) / 180;
  const radius = 0.008 + ((seed % 100) / 100) * 0.042;
  return {
    lat: base.lat + Math.sin(angle) * radius * 0.72,
    lng: base.lng + Math.cos(angle) * radius,
  };
}

// Standard Web Mercator projection helpers (256px tiles)
function latLngToWorld(lat, lng, zoom) {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldToLatLng(x, y, zoom) {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

function formatShortPrice(vnd) {
  const num = Number(vnd || 0);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2).replace(/\.?0+$/, "")}Tr ₫`;
  }
  return `${Math.round(num / 1000)}K ₫`;
}

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function HotelMapModal({
  hotels = [],
  initialCity = "",
  favorites = [],
  toggleFavorite,
  onSelectHotel,
  onClose,
}) {
  // Unique cities from the hotels list for bottom quick-jump pills
  const cityGroups = useMemo(() => {
    const map = new Map();
    hotels.forEach((h) => {
      if (!h.city) return;
      map.set(h.city, (map.get(h.city) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([city, count]) => ({ city, count }));
  }, [hotels]);

  const defaultCity = initialCity || cityGroups[0]?.city || "Quy Nhơn";
  const [activeCity, setActiveCity] = useState(defaultCity);
  const [quickFilter, setQuickFilter] = useState("all"); // all | budget | star5 | great9
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  const initialCenter = getBaseCoord(defaultCity);
  const [center, setCenter] = useState({ lat: initialCenter.lat, lng: initialCenter.lng });
  const [zoom, setZoom] = useState(12);
  const [mapSize, setMapSize] = useState({ width: 1000, height: 700 });

  const mapContainerRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        setMapSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  const jumpToCity = (cityName) => {
    setActiveCity(cityName);
    setSelectedHotelId(null);
    const coord = getBaseCoord(cityName);
    setCenter({ lat: coord.lat, lng: coord.lng });
    setZoom(12);
  };

  // Filtered hotels for the active city (or all if none match)
  const visibleHotels = useMemo(() => {
    let list = activeCity
      ? hotels.filter((h) => String(h.city || "").toLowerCase().includes(activeCity.toLowerCase()))
      : hotels;
    if (list.length === 0) list = hotels.slice(0, 24);

    if (quickFilter === "budget") list = list.filter((h) => Number(h.price || 0) <= 2500000);
    if (quickFilter === "star5") list = list.filter((h) => h.stars === 5);
    if (quickFilter === "great9") list = list.filter((h) => h.score10 >= 9.0);

    return list.slice(0, 28).map((h, idx) => ({
      ...h,
      coord: getHotelCoord(h, idx),
    }));
  }, [hotels, activeCity, quickFilter]);

  const selectedHotel = useMemo(
    () => visibleHotels.find((h) => h.id === selectedHotelId) || null,
    [visibleHotels, selectedHotelId]
  );

  // Compute visible OpenStreetMap tiles
  const centerWorld = latLngToWorld(center.lat, center.lng, zoom);
  const tiles = useMemo(() => {
    const halfW = mapSize.width / 2;
    const halfH = mapSize.height / 2;
    const minTileX = Math.floor((centerWorld.x - halfW) / 256);
    const maxTileX = Math.floor((centerWorld.x + halfW) / 256);
    const minTileY = Math.floor((centerWorld.y - halfH) / 256);
    const maxTileY = Math.floor((centerWorld.y + halfH) / 256);
    const maxIndex = Math.pow(2, zoom);

    const arr = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        if (ty < 0 || ty >= maxIndex) continue;
        const wrappedX = ((tx % maxIndex) + maxIndex) % maxIndex;
        arr.push({
          key: `${zoom}-${tx}-${ty}`,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${ty}.png`,
          left: tx * 256 - centerWorld.x + halfW,
          top: ty * 256 - centerWorld.y + halfH,
        });
      }
    }
    return arr;
  }, [centerWorld.x, centerWorld.y, mapSize.width, mapSize.height, zoom]);

  // Drag-to-pan handlers
  const handlePointerDown = (e) => {
    if (e.target.closest("button")) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWorldX: centerWorld.x,
      startWorldY: centerWorld.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const next = worldToLatLng(
      dragRef.current.startWorldX - dx,
      dragRef.current.startWorldY - dy,
      zoom
    );
    setCenter({
      lat: Math.max(-80, Math.min(80, next.lat)),
      lng: next.lng,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex flex-col bg-[#e8f1fb]"
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Hotel Map"
    >
      {/* Full-Screen Interactive Map Surface */}
      <div
        ref={mapContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative flex-1 cursor-grab overflow-hidden select-none active:cursor-grabbing"
      >
        {/* Real OpenStreetMap Tiles */}
        <div className="pointer-events-none absolute inset-0">
          {tiles.map((t) => (
            <img
              key={t.key}
              src={t.url}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: t.left,
                top: t.top,
                width: 256,
                height: 256,
              }}
            />
          ))}
        </div>

        {/* Floating Price Pins on Map */}
        {visibleHotels.map((hotel) => {
          const w = latLngToWorld(hotel.coord.lat, hotel.coord.lng, zoom);
          const left = w.x - centerWorld.x + mapSize.width / 2;
          const top = w.y - centerWorld.y + mapSize.height / 2;

          if (left < -80 || left > mapSize.width + 80 || top < -40 || top > mapSize.height + 40) {
            return null;
          }

          const isActive = selectedHotelId === hotel.id || hoveredId === hotel.id;

          return (
            <button
              key={hotel.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotelId(hotel.id);
                setCenter(hotel.coord);
              }}
              onMouseEnter={() => setHoveredId(hotel.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer font-extrabold transition-transform"
              style={{
                left,
                top,
                zIndex: isActive ? 40 : 20,
                transform: `translate(-50%, -100%) scale(${isActive ? 1.12 : 1})`,
                background: isActive
                  ? "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)"
                  : "#ffffff",
                color: isActive ? "#ffffff" : "#0b5ed7",
                border: isActive ? "2px solid #ffffff" : "1.5px solid #0b5ed7",
                borderRadius: 9999,
                padding: "4px 10px",
                fontSize: 11.5,
                whiteSpace: "nowrap",
                boxShadow: isActive
                  ? "0 8px 20px rgba(29, 78, 216, 0.42)"
                  : "0 4px 12px rgba(15, 23, 42, 0.18)",
              }}
            >
              {formatShortPrice(hotel.price)}
            </button>
          );
        })}

        {/* Top-Right Close Map Button matching Mockup */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-50 inline-flex cursor-pointer items-center gap-2 bg-white px-4 py-2.5 text-xs font-extrabold text-[#091e47] shadow-lg transition hover:bg-slate-50"
          style={{ borderRadius: 12, border: "1px solid #dbe7fb" }}
        >
          <span>Close map</span>
          <X size={15} weight="bold" />
        </button>

        {/* Left Floating Scrollable Hotel List Drawer matching Mockup */}
        <div
          className="absolute bottom-5 left-5 top-5 z-40 flex items-start transition-all duration-200"
          style={{ pointerEvents: "none" }}
        >
          {drawerOpen && (
            <div
              className="flex h-full w-[385px] max-w-[calc(100vw-60px)] flex-col overflow-hidden bg-white shadow-2xl"
              style={{
                borderRadius: 20,
                border: "1px solid #dbe7fb",
                pointerEvents: "auto",
              }}
            >
              {/* Drawer Header + Quick Filter Pills */}
              <div className="border-b border-slate-100 p-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-black text-[#091e47]">
                    {visibleHotels.length} stays in {activeCity}
                  </span>
                  <span className="text-[11px] font-bold text-[#0b5ed7]">SkyLink Map</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "All" },
                    { id: "budget", label: "≤ 2.5Tr ₫" },
                    { id: "star5", label: "5 ★" },
                    { id: "great9", label: "Great 9+" },
                  ].map((f) => {
                    const active = quickFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setQuickFilter(f.id)}
                        className="cursor-pointer px-3 py-1 text-[11px] font-extrabold transition"
                        style={{
                          borderRadius: 9999,
                          background: active ? "#eff6ff" : "#f8fafc",
                          color: active ? "#0b5ed7" : "#475569",
                          border: active ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                        }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Hotel Cards inside Drawer */}
              <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
                {visibleHotels.map((hotel) => {
                  const isSelected = selectedHotelId === hotel.id;
                  const isFav = favorites.includes(hotel.id);
                  return (
                    <div
                      key={hotel.id}
                      onMouseEnter={() => setHoveredId(hotel.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        setSelectedHotelId(hotel.id);
                        setCenter(hotel.coord);
                      }}
                      className="flex cursor-pointer gap-3 rounded-2xl p-2.5 transition"
                      style={{
                        border: isSelected ? "2px solid #1d64f2" : "1px solid #e2ecfb",
                        background: isSelected ? "#f4f8ff" : "#ffffff",
                      }}
                    >
                      <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={hotel.imageUrl}
                          alt={hotel.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(hotel.id);
                          }}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/95"
                          style={{ border: "none", padding: 0 }}
                        >
                          <Heart
                            size={12}
                            weight={isFav ? "fill" : "bold"}
                            className={isFav ? "text-rose-500" : "text-slate-500"}
                          />
                        </button>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="line-clamp-2 text-xs font-black text-[#091e47]">
                            {hotel.name}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className="rounded-md px-1.5 py-0.5 text-[10px] font-black text-white"
                              style={{ background: "#0b5ed7" }}
                            >
                              {hotel.score10}/10
                            </span>
                            <span className="text-[10.5px] font-extrabold text-[#0b5ed7]">
                              {hotel.scoreLabel}
                            </span>
                            <span className="inline-flex text-amber-400">
                              {Array.from({ length: hotel.stars }).map((_, i) => (
                                <Star key={i} size={10} weight="fill" />
                              ))}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-end justify-between gap-2">
                          <div>
                            <span className="block text-[10px] font-semibold text-slate-400 line-through">
                              {currency.format(hotel.originalPrice)}
                            </span>
                            <span className="text-sm font-black text-[#0b5ed7]">
                              {currency.format(hotel.price)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectHotel(hotel);
                            }}
                            className="cursor-pointer px-2.5 py-1 text-[11px] font-extrabold text-white"
                            style={{
                              background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                              borderRadius: 8,
                              border: "none",
                            }}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapse / Expand Drawer Handle matching Mockup */}
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Collapse hotel list" : "Expand hotel list"}
            className="mt-44 flex h-12 w-7 cursor-pointer items-center justify-center bg-white text-slate-600 shadow-lg hover:text-[#0b5ed7]"
            style={{
              pointerEvents: "auto",
              borderRadius: "0 10px 10px 0",
              border: "1px solid #dbe7fb",
              borderLeft: "none",
            }}
          >
            {drawerOpen ? <CaretLeft size={16} weight="bold" /> : <CaretRight size={16} weight="bold" />}
          </button>
        </div>

        {/* Selected Hotel Floating Preview Card (Bottom-Center above Area Pills) */}
        {selectedHotel && (
          <div
            className="absolute bottom-20 left-1/2 z-50 flex w-[395px] max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3.5 bg-white p-3.5 shadow-2xl"
            style={{ borderRadius: 18, border: "1.5px solid #93c5fd" }}
          >
            <img
              src={selectedHotel.imageUrl}
              alt={selectedHotel.name}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-[#091e47]">
                {selectedHotel.name}
              </div>
              <div className="mt-0.5 text-[11px] font-bold text-[#0b5ed7]">
                {selectedHotel.score10}/10 {selectedHotel.scoreLabel} • {selectedHotel.city}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm font-black text-[#0b5ed7]" style={{ whiteSpace: "nowrap" }}>
                  {currency.format(selectedHotel.price)}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectHotel(selectedHotel)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 px-3.5 py-1.5 text-[11px] font-extrabold text-white"
                  style={{
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                    borderRadius: 9999,
                    border: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>Check Availability</span>
                  <CaretRight size={11} weight="bold" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedHotelId(null)}
              className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-white shadow-md"
              style={{ border: "none", padding: 0 }}
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        )}

        {/* Bottom Area / City Quick-Jump Pills matching Mockup */}
        <div
          className="absolute bottom-5 right-20 z-40 flex max-w-[calc(100vw-480px)] items-center gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {cityGroups.slice(0, 8).map(({ city }) => {
            const active = activeCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => jumpToCity(city)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold shadow-md transition"
                style={{
                  borderRadius: 9999,
                  background: active
                    ? "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)"
                    : "#ffffff",
                  color: active ? "#ffffff" : "#091e47",
                  border: active ? "none" : "1px solid #dbe7fb",
                  whiteSpace: "nowrap",
                }}
              >
                <MapPinLine size={14} weight="fill" />
                <span>{city}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom-Right Zoom + / - Controls matching Mockup */}
        <div
          className="absolute bottom-5 right-5 z-50 flex flex-col overflow-hidden bg-white shadow-lg"
          style={{ borderRadius: 12, border: "1px solid #dbe7fb" }}
        >
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(16, z + 1))}
            aria-label="Zoom in"
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[#091e47] transition hover:bg-blue-50"
            style={{ background: "transparent", border: "none", borderBottom: "1px solid #e2e8f0" }}
          >
            <Plus size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(9, z - 1))}
            aria-label="Zoom out"
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[#091e47] transition hover:bg-blue-50"
            style={{ background: "transparent", border: "none" }}
          >
            <Minus size={16} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
