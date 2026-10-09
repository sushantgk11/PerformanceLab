"use client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSettings } from "@/providers";
const palette = ["#198879", "#8bc9b0", "#f0b866", "#91a8ce", "#c4b5dc"];
export function RevenueChart({
  data,
}: {
  data: { name: string; revenue: number }[];
}) {
  const { settings } = useSettings();
  return (
    <div className="chart" aria-label="Revenue by day">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 8, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#198879" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#198879" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke={settings.theme === "dark" ? "#36433f" : "#edf0ed"}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="name"
            minTickGap={36}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8b938f", fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v) => `$${v / 1000}k`}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8b938f", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e3e8e5",
              color: "#202c28",
            }}
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Revenue",
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#198879"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function GrowthChart({
  data,
}: {
  data: { name: string; users: number }[];
}) {
  return (
    <div className="chart" aria-label="New users by day">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 0, left: -30, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#edf0ed"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="name"
            minTickGap={45}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8b938f", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8b938f", fontSize: 11 }}
          />
          <Tooltip contentStyle={{ borderRadius: 10, color: "#202c28" }} />
          <Bar
            dataKey="users"
            name="New users"
            fill="#8ec4ac"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function CategoryChart({
  data,
  currency = true,
}: {
  data: { name: string; value: number }[];
  currency?: boolean;
}) {
  return (
    <div className="category-chart">
      <div className="donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((row, i) => (
                <Cell
                  key={row.name}
                  fill={palette[i % palette.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                `${currency ? "$" : ""}${Math.round(Number(value)).toLocaleString()}`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        {data.map((row, i) => (
          <div key={row.name}>
            <span>
              <i style={{ background: palette[i % palette.length] }} />
              {row.name}
            </span>
            <strong>
              {currency ? "$" : ""}
              {Math.round(row.value).toLocaleString()}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
export function CountryChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 20, right: 24 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={95}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8b938f", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) =>
              `$${Math.round(Number(value)).toLocaleString()}`
            }
          />
          <Bar
            dataKey="value"
            name="Revenue"
            fill="#198879"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
