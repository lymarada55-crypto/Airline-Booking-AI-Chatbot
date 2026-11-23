import { useEffect, useMemo, useState } from "react";
import {
  AirplaneTilt,
  ArrowClockwise,
  Calculator,
  ChartBar,
  CurrencyCircleDollar,
  DownloadSimple,
  MagnifyingGlass,
  TrendUp,
  Wallet,
} from "@phosphor-icons/react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const currencyFmt = new Intl.NumberFormat("vi-VN");

function formatMoneyVnd(val) {
  return `${currencyFmt.format(Math.round(Number(val || 0)))} ₫`;
}

function formatCompactVnd(val) {
  const n = Number(val || 0);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} Tỷ ₫`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Tr ₫`;
  return formatMoneyVnd(n);
}

// Realistic aviation operating cost ratios
const FLIGHT_COST_RATIO = 0.72; // 48% fuel/airport fees + 24% crew/maintenance/leasing
const TRAVEL_PARTNER_COST_RATIO = 0.68; // 68% partner settlement, 32% SkyLink commission

export default function Profits() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [routeRows, setRouteRows] = useState([]);
  const [breakdown, setBreakdown] = useState({
    flightRevenue: 0,
    travelRevenue: 0,
    flightPaidCount: 0,
    travelPaidCount: 0,
    totalRevenue: 0,
    totalCost: 0,
    netProfit: 0,
    marginPct: 0,
  });

  const fetchProfitData = async () => {
    setLoading(true);
    try {
      const [flightsRes, travelRes] = await Promise.allSettled([
        api.get("/admin/bookings"),
        api.get("/admin/travel-service-reservations", { params: { per_page: 200 } }),
      ]);

      const bookings =
        flightsRes.status === "fulfilled" && Array.isArray(flightsRes.value.data?.data)
          ? flightsRes.value.data.data
          : [];

      const travelRaw =
        travelRes.status === "fulfilled"
          ? travelRes.value.data?.data?.data || travelRes.value.data?.data || []
          : [];
      const travelList = Array.isArray(travelRaw) ? travelRaw : [];

      // 1. Real paid flight bookings aggregated by route
      const routeMap = new Map();
      let flightRevenue = 0;
      let flightPaidCount = 0;

      for (const b of bookings) {
        if (String(b.status || "").toLowerCase() !== "paid") continue;
        const amt = Number(b.total_amount ?? b.total_price ?? b.price ?? 0);
        flightRevenue += amt;
        flightPaidCount += 1;

        const dep = b.flight?.departure_airport || b.flight?.departureAirport || {};
        const arr = b.flight?.arrival_airport || b.flight?.arrivalAirport || {};
        const depCode = dep.code || "HAN";
        const arrCode = arr.code || "SGN";
        const depCity = dep.city || depCode;
        const arrCity = arr.city || arrCode;
        const routeKey = `${depCode} → ${arrCode}`;
        const ticketCount = Array.isArray(b.tickets) && b.tickets.length > 0 ? b.tickets.length : 1;

        const existing = routeMap.get(routeKey) || {
          routeCode: routeKey,
          routeFull: `${depCity} (${depCode}) → ${arrCity} (${arrCode})`,
          bookings: 0,
          tickets: 0,
          revenue: 0,
        };
        existing.bookings += 1;
        existing.tickets += ticketCount;
        existing.revenue += amt;
        routeMap.set(routeKey, existing);
      }

      // 2. Real paid travel service reservations
      let travelRevenue = 0;
      let travelPaidCount = 0;
      for (const r of travelList) {
        if (String(r.payment_status || "").toLowerCase() !== "paid") continue;
        travelRevenue += Number(r.total_price ?? 0);
        travelPaidCount += 1;
      }

      const flightCost = Math.round(flightRevenue * FLIGHT_COST_RATIO);
      const travelCost = Math.round(travelRevenue * TRAVEL_PARTNER_COST_RATIO);
      const totalRevenue = flightRevenue + travelRevenue;
      const totalCost = flightCost + travelCost;
      const netProfit = totalRevenue - totalCost;
      const marginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      setBreakdown({
        flightRevenue,
        travelRevenue,
        flightPaidCount,
        travelPaidCount,
        totalRevenue,
        totalCost,
        netProfit,
        marginPct,
      });

      const computedRoutes = Array.from(routeMap.values())
        .map((row) => {
          const cost = Math.round(row.revenue * FLIGHT_COST_RATIO);
          const profit = row.revenue - cost;
          const margin = row.revenue > 0 ? (profit / row.revenue) * 100 : 0;
          return { ...row, cost, profit, margin };
        })
        .sort((a, b) => b.revenue - a.revenue);

      setRouteRows(computedRoutes);
    } catch (err) {
      console.error("Failed to compute profits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitData();
  }, []);

  const filteredRoutes = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return routeRows;
    return routeRows.filter(
      (r) => r.routeCode.toLowerCase().includes(kw) || r.routeFull.toLowerCase().includes(kw)
    );
  }, [routeRows, search]);

  const topChartRoutes = useMemo(() => routeRows.slice(0, 6), [routeRows]);

  const chartData = useMemo(
    () => ({
      labels: topChartRoutes.map((r) => r.routeCode),
      datasets: [
        {
          label: "Doanh thu (Tr ₫)",
          data: topChartRoutes.map((r) => Number((r.revenue / 1_000_000).toFixed(2))),
          backgroundColor: "rgba(29, 117, 242, 0.85)",
          borderRadius: 8,
          barPercentage: 0.65,
        },
        {
          label: "Lợi nhuận ròng (Tr ₫)",
          data: topChartRoutes.map((r) => Number((r.profit / 1_000_000).toFixed(2))),
          backgroundColor: "rgba(16, 185, 129, 0.88)",
          borderRadius: 8,
          barPercentage: 0.65,
        },
      ],
    }),
    [topChartRoutes]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          font: { size: 12, weight: "600" },
          color: "#334155",
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} Tr ₫`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11.5, weight: "700" }, color: "#1e3a6b" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(203, 213, 225, 0.35)" },
        ticks: {
          font: { size: 11 },
          color: "#64748b",
          callback: (val) => `${val} Tr`,
        },
      },
    },
  };

  const handleExportCsv = () => {
    const header = ["Chặng bay,Số đơn,Số vé,Doanh thu (VND),Chi phí ước tính (VND),Lợi nhuận ròng (VND),Biên LN (%)"];
    const rows = filteredRoutes.map(
      (r) =>
        `"${r.routeFull}",${r.bookings},${r.tickets},${Math.round(r.revenue)},${Math.round(
          r.cost
        )},${Math.round(r.profit)},${r.margin.toFixed(1)}%`
    );
    const csv = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "skylink_profits_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const flightSharePct = breakdown.totalRevenue
    ? Math.round((breakdown.flightRevenue / breakdown.totalRevenue) * 100)
    : 0;
  const travelSharePct = breakdown.totalRevenue ? 100 - flightSharePct : 0;

  const kpiCards = [
    {
      label: "Tổng doanh thu thực tế",
      value: formatCompactVnd(breakdown.totalRevenue),
      sub: `${breakdown.flightPaidCount} vé bay • ${breakdown.travelPaidCount} dịch vụ`,
      icon: Wallet,
      iconBg: "#ebf3ff",
      iconColor: "#1d75f2",
    },
    {
      label: "Chi phí vận hành",
      value: formatCompactVnd(breakdown.totalCost),
      sub: "Nhiên liệu, sân bay & đối tác",
      icon: Calculator,
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
    },
    {
      label: "Lợi nhuận ròng",
      value: formatCompactVnd(breakdown.netProfit),
      sub: "Sau trừ chi phí khai thác",
      icon: CurrencyCircleDollar,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
      valueColor: "#059669",
    },
    {
      label: "Biên lợi nhuận",
      value: `${breakdown.marginPct.toFixed(1)}%`,
      sub: "Chuẩn ngành hàng không 25–30%",
      icon: TrendUp,
      iconBg: "#fff7ed",
      iconColor: "#f59e0b",
    },
  ];

  return (
    <div style={{ maxWidth: "1520px", margin: "0 auto", padding: "4px 0 16px 0" }}>
      {/* 1. HEADER ROW */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-white/95 text-blue-600 shadow-sm"
            style={{ borderRadius: 14, border: "1px solid #d5e6fc" }}
          >
            <TrendUp size={24} weight="duotone" />
          </div>
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.45rem, 2.2vw, 1.85rem)", color: "#091e47", margin: 0 }}
            >
              Doanh thu &amp; Lợi nhuận (Profits)
            </h1>
            <p className="mt-0.5 font-semibold text-[#234378]" style={{ margin: 0, fontSize: 13.5 }}>
              Phân tích hiệu quả tài chính theo đường bay &amp; dịch vụ phụ trợ từ dữ liệu thanh toán thực tế.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchProfitData}
            className="inline-flex cursor-pointer items-center gap-1.5 bg-white/95 font-extrabold text-[#123975] shadow-sm transition hover:bg-blue-50"
            style={{
              borderRadius: 9999,
              border: "1px solid #d5e6fc",
              padding: "9px 16px",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <ArrowClockwise size={15} weight="bold" className={loading ? "animate-spin text-blue-600" : "text-blue-600"} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex cursor-pointer items-center gap-2 font-extrabold text-white shadow-md transition hover:brightness-105"
            style={{
              background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
              borderRadius: 9999,
              border: "none",
              padding: "9px 18px",
              fontSize: 13,
              whiteSpace: "nowrap",
              boxShadow: "0 8px 20px rgba(13, 97, 225, 0.28)",
            }}
          >
            <DownloadSimple size={16} weight="bold" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* 2. 4 REAL DB KPI CARDS */}
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-3.5 bg-white/95 px-4 py-3.5 backdrop-blur-md transition hover:-translate-y-0.5"
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 10px 26px rgba(18, 60, 130, 0.08)",
              }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center"
                style={{
                  background: card.iconBg,
                  color: card.iconColor,
                  borderRadius: 9999,
                }}
              >
                <Icon size={24} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="font-bold text-[#476494]"
                  style={{ margin: 0, fontSize: 13, whiteSpace: "nowrap" }}
                >
                  {card.label}
                </p>
                <span
                  className="mt-1 block font-black leading-none"
                  style={{ fontSize: 23, color: card.valueColor || "#091e47" }}
                >
                  {card.value}
                </span>
                <p className="mt-1 truncate font-semibold text-slate-400" style={{ margin: 0, fontSize: 12 }}>
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. ANALYTICS ROW: BAR CHART + REVENUE MIX */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Top Routes Bar Chart */}
        <div
          className="bg-white p-5 lg:col-span-7"
          style={{
            borderRadius: 22,
            border: "1px solid #d5e6fc",
            boxShadow: "0 12px 30px rgba(18, 60, 130, 0.07)",
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ChartBar size={20} weight="duotone" className="text-blue-600" />
              <h2 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 15.5 }}>
                Top chặng bay sinh lời cao nhất
              </h2>
            </div>
            <span className="font-semibold text-slate-400" style={{ fontSize: 12 }}>
              Đơn vị: Triệu VNĐ
            </span>
          </div>
          <div style={{ height: 225 }}>
            {topChartRoutes.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="flex h-full items-center justify-center font-semibold text-slate-400" style={{ fontSize: 13 }}>
                Chưa có dữ liệu doanh thu chặng bay.
              </div>
            )}
          </div>
        </div>

        {/* Right: Revenue & Cost Structure */}
        <div
          className="flex flex-col justify-between bg-white p-5 lg:col-span-5"
          style={{
            borderRadius: 22,
            border: "1px solid #d5e6fc",
            boxShadow: "0 12px 30px rgba(18, 60, 130, 0.07)",
          }}
        >
          <div>
            <h2 className="mb-3 font-black text-[#091e47]" style={{ margin: "0 0 12px 0", fontSize: 15.5 }}>
              Cơ cấu nguồn thu &amp; Chi phí
            </h2>

            <div className="space-y-3.5" style={{ fontSize: 13 }}>
              <div>
                <div className="mb-1 flex items-center justify-between font-bold text-[#091e47]">
                  <span>Vé máy bay ({flightSharePct}%)</span>
                  <span>{formatMoneyVnd(breakdown.flightRevenue)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${flightSharePct}%`,
                      background: "linear-gradient(90deg, #0b5ed7 0%, #38bdf8 100%)",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between font-bold text-[#091e47]">
                  <span>Dịch vụ du lịch ({travelSharePct}%)</span>
                  <span>{formatMoneyVnd(breakdown.travelRevenue)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${travelSharePct}%`,
                      background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-4 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-3.5"
            style={{ fontSize: 12.5 }}
          >
            <p className="mb-1.5 font-extrabold text-[#123975]" style={{ margin: "0 0 6px 0" }}>
              Cơ sở ước tính chi phí hàng không:
            </p>
            <ul className="space-y-1 pl-4 font-semibold text-[#476494]" style={{ margin: 0 }}>
              <li>Khai thác bay: 72% (nhiên liệu, phí sân bay, tổ bay &amp; bảo dưỡng).</li>
              <li>Dịch vụ du lịch: 68% chi trả đối tác (32% hoa hồng SkyLink).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. ROUTE PROFITABILITY TABLE */}
      <div
        className="overflow-hidden bg-white"
        style={{
          borderRadius: 24,
          border: "1px solid #d5e6fc",
          boxShadow: "0 14px 36px rgba(18, 60, 130, 0.08)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <AirplaneTilt size={20} weight="duotone" className="text-blue-600" />
            <h2 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 15.5 }}>
              Hiệu quả lợi nhuận theo Chặng bay ({filteredRoutes.length} chặng)
            </h2>
          </div>

          <div
            className="flex items-center gap-2 bg-[#f8fbff] px-3.5 py-2"
            style={{ borderRadius: 9999, border: "1px solid #d5e6fc", minWidth: 235 }}
          >
            <input
              type="text"
              placeholder="Tìm mã sân bay, chặng bay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
              style={{ fontSize: 13 }}
            />
            <MagnifyingGlass size={16} className="shrink-0 text-blue-600" weight="bold" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b border-slate-100 bg-[#f8fbff] font-extrabold uppercase tracking-wider text-[#476494]"
                style={{ fontSize: 11.5 }}
              >
                <th className="px-3.5 py-3">Chặng bay</th>
                <th className="px-3.5 py-3">Đơn / Vé</th>
                <th className="px-3.5 py-3">Doanh thu gộp</th>
                <th className="px-3.5 py-3">Chi phí (72%)</th>
                <th className="px-3.5 py-3">Lợi nhuận ròng</th>
                <th className="px-3.5 py-3 text-right">Biên LN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Đang tổng hợp số liệu tài chính...
                  </td>
                </tr>
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center font-semibold text-slate-500" style={{ fontSize: 13.5 }}>
                    Chưa có chặng bay nào phát sinh doanh thu.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((row) => (
                  <tr
                    key={row.routeCode}
                    className="border-b border-slate-100/90 transition hover:bg-[#f7faff]"
                  >
                    <td className="px-3.5 py-3">
                      <div className="font-black text-[#091e47]" style={{ fontSize: 13.5 }}>
                        {row.routeCode}
                      </div>
                      <div
                        className="truncate font-medium text-slate-400"
                        style={{ maxWidth: 260, fontSize: 11.5 }}
                        title={row.routeFull}
                      >
                        {row.routeFull}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 font-bold text-[#163d7a]" style={{ fontSize: 13 }}>
                      {row.bookings} đơn{" "}
                      <span className="font-medium text-slate-400">({row.tickets} vé)</span>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 font-black text-[#091e47]" style={{ fontSize: 13 }}>
                      {formatMoneyVnd(row.revenue)}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 font-semibold text-rose-600" style={{ fontSize: 13 }}>
                      {formatMoneyVnd(row.cost)}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 font-black text-emerald-600" style={{ fontSize: 13 }}>
                      {formatMoneyVnd(row.profit)}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 text-right">
                      <span
                        className="inline-flex items-center px-2.5 py-1 font-bold"
                        style={{
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          borderRadius: 9999,
                          fontSize: 11.5,
                        }}
                      >
                        {row.margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
