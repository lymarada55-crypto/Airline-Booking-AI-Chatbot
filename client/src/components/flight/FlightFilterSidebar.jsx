import { useState } from "react";
import { Funnel } from "@phosphor-icons/react";

const VietnamAirlinesLogo = () => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#00557B] p-0.5">
    <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
      <path d="M20 6C20 6 22 13 25 15C28 17 34 18 34 18C34 18 28 20 25 23C22 26 20 34 20 34C20 34 18 26 15 23C12 20 6 18 6 18C6 18 12 17 15 15C18 13 20 6 20 6Z" fill="#F4B41A" />
    </svg>
  </div>
);

const SkyLinkLogo = () => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0b5ed7] text-[10px] font-black text-white">
    ✈
  </div>
);

const BambooLogo = () => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#006633] p-0.5">
    <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
      <path d="M12 28C14 20 20 14 28 10C24 18 18 24 12 28Z" fill="#FFFFFF" />
    </svg>
  </div>
);

const VietjetLogo = () => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ED1B24] p-0.5">
    <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
      <path d="M8 12L20 28L32 12" stroke="#FFF200" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </div>
);

function formatVnd(amount) {
  if (!amount || amount <= 0) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(amount))} VND`;
}

function getMinPrice(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  let min = Infinity;
  for (const f of list) {
    const p = Number(f.display_price || f.base_price || 0);
    if (p > 0 && p < min) min = p;
  }
  return min === Infinity ? null : min;
}

export default function FlightFilterSidebar({ filters, onFilterChange, allFlights = [] }) {
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || 10000000);
  const flightsList = Array.isArray(allFlights) ? allFlights : [];

  const getAirlineMatches = (code) =>
    flightsList.filter((f) => {
      const fn = (f.flight_number || "").toUpperCase();
      if (code === "VN") return fn.startsWith("VN") || fn.includes("VIETNAM");
      if (code === "VJ") return fn.startsWith("VJ") || fn.includes("VIETJET");
      if (code === "QH") return fn.startsWith("QH") || fn.startsWith("FB") || fn.includes("BAMBOO");
      if (code === "SKY") {
        return (
          fn.startsWith("SK") ||
          fn.startsWith("SL") ||
          (!fn.startsWith("VN") && !fn.startsWith("VJ") && !fn.startsWith("QH") && !fn.startsWith("FB"))
        );
      }
      return false;
    });

  const getAmenityMatches = (type) => {
    if (type === "direct") {
      return flightsList.filter((f) => f.stops === 0 || !f.transits || f.transits.length === 0);
    }
    if (type === "baggage") {
      return flightsList.filter((f) => !(f.flight_number || "").toUpperCase().startsWith("VJ"));
    }
    if (type === "flexible") {
      return flightsList.filter((f) => {
        const fn = (f.flight_number || "").toUpperCase();
        return fn.startsWith("VN") || fn.startsWith("SK") || fn.startsWith("SL");
      });
    }
    return [];
  };

  const countTimeSlot = (slotId) => {
    return flightsList.filter((f) => {
      const h = new Date(f.departure_time).getHours();
      if (slotId === "morning") return h >= 5 && h < 12;
      if (slotId === "afternoon") return h >= 12 && h < 18;
      if (slotId === "evening") return h >= 18 || h < 5;
      return false;
    }).length;
  };

  const recommendedItems = [
    { id: "direct", label: "Direct (Bay thẳng)", minPrice: getMinPrice(getAmenityMatches("direct")) },
    { id: "baggage", label: "Cabin & 23kg baggage", minPrice: getMinPrice(getAmenityMatches("baggage")) },
    { id: "flexible", label: "Flexible refund", minPrice: getMinPrice(getAmenityMatches("flexible")) },
  ];

  const airlines = [
    { id: "VN", name: "Vietnam Airlines", logo: <VietnamAirlinesLogo />, minPrice: getMinPrice(getAirlineMatches("VN")), count: getAirlineMatches("VN").length },
    { id: "QH", name: "Bamboo Airways", logo: <BambooLogo />, minPrice: getMinPrice(getAirlineMatches("QH")), count: getAirlineMatches("QH").length },
    { id: "VJ", name: "VietJet Air", logo: <VietjetLogo />, minPrice: getMinPrice(getAirlineMatches("VJ")), count: getAirlineMatches("VJ").length },
    { id: "SKY", name: "SkyLink Airlines", logo: <SkyLinkLogo />, minPrice: getMinPrice(getAirlineMatches("SKY")), count: getAirlineMatches("SKY").length },
  ];

  const timeSlots = [
    { id: "morning", label: "Morning (06:00 - 11:59)", count: countTimeSlot("morning") },
    { id: "afternoon", label: "Afternoon (12:00 - 17:59)", count: countTimeSlot("afternoon") },
    { id: "evening", label: "Evening (18:00 - 23:59)", count: countTimeSlot("evening") },
  ];

  return (
    <aside className="sticky top-24 z-10 w-full shrink-0 md:w-72">
      <div
        className="space-y-4 overflow-y-auto bg-white p-5 shadow-sm"
        style={{
          borderRadius: 22,
          border: "1px solid #dbe7fb",
          maxHeight: "calc(100vh - 110px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2
            className="flex items-center gap-2 font-black text-[#091e47]"
            style={{ margin: 0, fontSize: 14 }}
          >
            <Funnel size={17} className="text-blue-600" weight="bold" />
            Filter / Bộ lọc
          </h2>
          <button
            type="button"
            className="cursor-pointer bg-transparent font-bold text-blue-600 hover:underline"
            style={{ border: "none", fontSize: 12 }}
            onClick={() => {
              setMaxPrice(10000000);
              onFilterChange({ clearAll: true });
            }}
          >
            Reset
          </button>
        </div>

        {/* 1. Recommended (Traveloka-style with min price) */}
        <div className="space-y-2.5 border-b border-slate-100 pb-4">
          <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 13 }}>
            Recommended
          </h3>
          <div className="space-y-2">
            {recommendedItems.map((item) => (
              <label
                key={item.id}
                className="flex w-full cursor-pointer items-center justify-between gap-2 select-none"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-blue-300 accent-blue-600"
                    checked={filters.amenities?.includes(item.id) || false}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(filters.amenities || []), item.id]
                        : (filters.amenities || []).filter((x) => x !== item.id);
                      onFilterChange({ amenities: next });
                    }}
                  />
                  <span className="truncate font-semibold text-slate-700" style={{ fontSize: 12.5 }}>
                    {item.label}
                  </span>
                </div>
                {item.minPrice && (
                  <span className="shrink-0 font-semibold text-slate-400" style={{ fontSize: 11 }}>
                    {formatVnd(item.minPrice)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* 2. Airlines (with brand icon + min price underneath) */}
        <div className="space-y-2.5 border-b border-slate-100 pb-4">
          <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 13 }}>
            Airlines
          </h3>
          <div className="space-y-2.5">
            {airlines.map((al) => (
              <label
                key={al.id}
                className="flex w-full cursor-pointer items-start justify-between gap-2 select-none"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-blue-300 accent-blue-600"
                    checked={filters.airlines?.includes(al.id) || false}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(filters.airlines || []), al.id]
                        : (filters.airlines || []).filter((x) => x !== al.id);
                      onFilterChange({ airlines: next });
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {al.logo}
                      <span className="truncate font-bold text-slate-800" style={{ fontSize: 12.5 }}>
                        {al.name}
                      </span>
                    </div>
                    <span className="mt-0.5 block font-semibold text-slate-400" style={{ fontSize: 11 }}>
                      {al.minPrice ? formatVnd(al.minPrice) : `${al.count} flights`}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Departure Time */}
        <div className="space-y-2.5 border-b border-slate-100 pb-4">
          <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 13 }}>
            Departure Time
          </h3>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <label
                key={slot.id}
                className="flex w-full cursor-pointer items-center justify-between gap-2 select-none"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-blue-300 accent-blue-600"
                    checked={filters.times?.includes(slot.id) || false}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(filters.times || []), slot.id]
                        : (filters.times || []).filter((t) => t !== slot.id);
                      onFilterChange({ times: next });
                    }}
                  />
                  <span className="truncate font-semibold text-slate-700" style={{ fontSize: 12 }}>
                    {slot.label}
                  </span>
                </div>
                <span
                  className="shrink-0 bg-slate-50 px-2 py-0.5 font-bold text-slate-400"
                  style={{ borderRadius: 9999, fontSize: 11 }}
                >
                  {slot.count}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Price Range */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 13 }}>
              Max Price
            </h3>
            <span className="font-extrabold text-blue-600" style={{ fontSize: 12 }}>
              ≤ {formatVnd(maxPrice)}
            </span>
          </div>
          <input
            type="range"
            min="500000"
            max="10000000"
            step="500000"
            value={maxPrice}
            onChange={(e) => {
              const next = Number(e.target.value);
              setMaxPrice(next);
              onFilterChange({ maxPrice: next });
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
          />
        </div>
      </div>
    </aside>
  );
}
