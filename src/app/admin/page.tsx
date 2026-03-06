"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsData {
  totalConversions: number;
  totalVisitors: number;
  todayConversions: number;
  dailyTrend: { date: string; count: number }[];
  recentConversions: {
    id: number;
    filename: string;
    layoutType: string;
    sizeBytes: number;
    convertedAt: string;
  }[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const layoutBadge: Record<string, { bg: string; text: string; label: string }> = {
  slide: { bg: "bg-blue-100", text: "text-blue-700", label: "Slide" },
  page: { bg: "bg-green-100", text: "text-green-700", label: "Page" },
  tab: { bg: "bg-purple-100", text: "text-purple-700", label: "Tab" },
  unknown: { bg: "bg-gray-100", text: "text-gray-600", label: "Unknown" },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch {
      setError("통계 데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "총 변환",
      value: stats.totalConversions.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "총 방문자",
      value: stats.totalVisitors.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "오늘 변환",
      value: stats.todayConversions.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">서비스 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`${card.iconBg} ${card.iconColor} p-3 rounded-lg`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">일별 변환 추이</h2>
        {stats.dailyTrend.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.dailyTrend}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatChartDate}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [`${value}건`, "변환 수"]}
                />
                <Bar
                  dataKey="count"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
            데이터가 없습니다
          </div>
        )}
      </div>

      {/* Recent Conversions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">최근 변환</h2>
        </div>
        {stats.recentConversions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파일명
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    레이아웃
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    크기
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    변환일시
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentConversions.map((conv) => {
                  const badge = layoutBadge[conv.layoutType] || layoutBadge.unknown;
                  return (
                    <tr key={conv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-900 font-medium">
                        <div className="max-w-xs truncate">{conv.filename}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {formatFileSize(conv.sizeBytes)}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {formatDate(conv.convertedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            아직 변환 기록이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
