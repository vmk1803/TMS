"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { getAllOrders } from "../../orders/manageAllOrders/services/getAllOrderService";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-md text-xs">
        <p className="text-gray-700 font-medium">
          Orders:{" "}
          <span className="text-green-600 font-semibold">
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const TotalOrdersChart = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>(
    MONTH_LABELS.map((name) => ({ name, orders: 0, highlight: false }))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const list: string[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      list.push(String(y));
    }
    return list;
  }, [currentYear]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const filters = {
          created_from: `${selectedYear}-01-01`,
          created_to: `${selectedYear}-12-31`,
        };

        const res = await getAllOrders(1, 100000, filters);
        const items = Array.isArray(res) ? res : res?.data || [];

        const monthlyCounts = new Array(12).fill(0);

        items.forEach((order: any) => {
          const createdAt = order?.created_at;
          if (!createdAt) return;
          const d = new Date(createdAt);
          if (isNaN(d.getTime())) return;
          if (d.getFullYear() !== Number(selectedYear)) return;
          const monthIndex = d.getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyCounts[monthIndex] += 1;
          }
        });

        const maxCount = Math.max(...monthlyCounts, 0);
        const chartData = MONTH_LABELS.map((name, index) => ({
          name,
          orders: monthlyCounts[index],
          highlight: maxCount > 0 && monthlyCounts[index] === maxCount,
        }));

        if (!active) return;
        setData(chartData);
        setTotalOrders(monthlyCounts.reduce((sum, val) => sum + val, 0));
      } catch (e) {
        if (!active) return;
        setData(
          MONTH_LABELS.map((name) => ({ name, orders: 0, highlight: false }))
        );
        setTotalOrders(0);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [selectedYear]);

  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800 text-[16px]">
          Total Orders: <span className="font-bold">{totalOrders}</span>
        </h4>

        {/* Custom Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            {selectedYear}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 p-2 w-28 bg-white border border-gray-100 rounded-2xl shadow-lg z-20">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm rounded-xl ${
                    selectedYear === year
                      ? "bg-green-100 text-green-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 13 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Bar
              dataKey="orders"
              radius={[8, 8, 8, 8]}
              barSize={20}
              shape={(props) => {
                const { x, y, width, height, payload } = props;
                const isHighlight = payload?.highlight;
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={8}
                    ry={8}
                    fill={isHighlight ? "#22C55E" : "#E5E7EB"}
                    style={{
                      filter: isHighlight
                        ? "drop-shadow(0px 4px 10px rgba(34, 197, 94, 0.3))"
                        : "none",
                      transition: "0.3s ease",
                    }}
                  />
                );
              }}
            >
              <LabelList
                dataKey="orders"
                position="top"
                className="fill-gray-800 text-[12px] font-medium"
                formatter={(value: number, _name: string, props: any) =>
                  props?.payload?.highlight ? `Orders: ${value}` : ""
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TotalOrdersChart;
