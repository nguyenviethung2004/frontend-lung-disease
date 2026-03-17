"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Generate mock data for last 30 days
const generateData = () => {
  const data = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      trainings: Math.floor(Math.random() * 8) + 1, // Random 1 to 8
    });
  }
  return data;
};

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setData(generateData());
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { title: "Total Training Runs", value: "1,204" },
    { title: "Models Trained", value: "48" },
    { title: "Last Training", value: "2 hours ago" },
    { title: "Success Rate", value: "92%" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white shadow-xl">
          <p className="text-gray-400 text-xs mb-1 font-medium">{label}</p>
          <p className="text-blue-400 font-semibold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {payload[0].value} Trainings
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
            <dt className="text-sm font-medium text-gray-500">{stat.title}</dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</dd>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Training Activity (Last 30 Days)</h2>
        
        <div className="h-[350px] w-full relative">
          {isLoading ? (
            // Loading State (Skeleton)
            <div className="w-full h-full flex items-end gap-2 p-4 animate-pulse bg-gray-50 rounded-lg border-2 border-dashed border-gray-100">
               {/* Fixed heights to prevent hydration mismatch */}
               {[22, 53, 41, 67, 34, 45, 50, 24, 69, 58, 47, 72, 33, 56, 44, 76, 38, 59, 29, 61, 48, 71, 35, 63, 55, 42, 65, 31, 52, 28].map((h, i) => (
                 <div key={i} className="flex-1 bg-gray-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
               ))}
            </div>
          ) : data.length === 0 ? (
            // Empty State
            <div className="h-full w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              <span className="text-sm font-medium">Biểu đồ tổng quan số lần training sẽ hiển thị ở đây</span>
            </div>
          ) : (
            // Filled Chart
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrainings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  dy={10}
                  minTickGap={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  dx={-10}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="trainings" 
                  name="Trainings"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTrainings)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6', className: 'drop-shadow-md' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
