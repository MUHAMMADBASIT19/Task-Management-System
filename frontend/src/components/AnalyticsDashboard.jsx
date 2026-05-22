import React, { useState, useEffect } from 'react';
import { 
  getAnalyticsOverview, 
  getAnalyticsTrends 
} from '../services/api';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Loader2
} from 'lucide-react';

const COLORS = ['#94a3b8', '#6366f1', '#10b981']; // Slate (Pending), Indigo (In Progress), Emerald (Completed)

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewRes, trendsRes] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsTrends()
        ]);
        setOverview(overviewRes.data);
        setTrends(trendsRes.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-semibold animate-pulse">Analyzing task database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-[24px] text-center text-red-600 max-w-lg mx-auto mt-10">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="font-bold mb-2">Error Loading Analytics</p>
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  // Prep data for status breakdown pie chart
  const pieData = [
    { name: 'Pending', value: overview?.Pending || 0 },
    { name: 'In Progress', value: overview?.['In Progress'] || 0 },
    { name: 'Completed', value: overview?.Completed || 0 }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={32} />
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm mt-1">
            Data-driven insights into your team's task performance and trends
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[28px] p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <TrendingUp className="absolute right-6 top-6 opacity-20 w-12 h-12" />
          <p className="text-white/80 font-bold uppercase text-xs tracking-wider">Total Tasks</p>
          <p className="text-5xl font-black mt-4 leading-none">{overview?.Total || 0}</p>
          <div className="mt-8 flex items-center gap-1.5 text-xs font-bold bg-white/15 px-3 py-1 rounded-full w-max">
            <span>Overall tasks managed</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-800 rounded-[28px] p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
              <Clock className="text-slate-400" size={24} />
            </div>
            <span className="text-[12px] font-bold text-slate-400 dark:text-slate-500">Awaiting Action</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Pending</p>
          <p className="text-4xl font-extrabold text-slate-800 dark:text-white mt-3">{overview?.Pending || 0}</p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-[28px] p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl">
              <Clock className="text-indigo-500" size={24} />
            </div>
            <span className="text-[12px] font-bold text-indigo-400 dark:text-indigo-400/80">Active</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">In Progress</p>
          <p className="text-4xl font-extrabold text-slate-800 dark:text-white mt-3">{overview?.['In Progress'] || 0}</p>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-800 rounded-[28px] p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl">
              <CheckCircle2 className="text-emerald-500" size={24} />
            </div>
            <span className="text-[12px] font-bold text-emerald-400 dark:text-emerald-400/80">Finished</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Completed</p>
          <p className="text-4xl font-extrabold text-slate-800 dark:text-white mt-3">{overview?.Completed || 0}</p>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area Chart (2/3 width on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[32px] p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Task Performance Trends</h3>
          
          {trends.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <p className="text-slate-400 font-semibold text-sm">No trend data available. Start creating and completing tasks!</p>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      border: '1px solid #f1f5f9',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Area name="Completed Tasks" type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                  <Area name="Overdue Tasks" type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOverdue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Breakdown Pie Chart (1/3 width on desktop) */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Status Breakdown</h3>
          
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl min-h-[200px]">
              <p className="text-slate-400 font-semibold text-sm text-center px-4">No tasks found. Get started by creating your first task!</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-around">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => {
                        // Map status names to colors
                        let colorIndex = 0;
                        if (entry.name === 'In Progress') colorIndex = 1;
                        if (entry.name === 'Completed') colorIndex = 2;
                        return <Cell key={`cell-${index}`} fill={COLORS[colorIndex]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="space-y-3 mt-4">
                {pieData.map((entry, index) => {
                  let colorIndex = 0;
                  if (entry.name === 'In Progress') colorIndex = 1;
                  if (entry.name === 'Completed') colorIndex = 2;
                  
                  const percentage = overview?.Total 
                    ? Math.round((entry.value / overview.Total) * 100) 
                    : 0;

                  return (
                    <div key={entry.name} className="flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[colorIndex] }}></span>
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-semibold text-slate-400 dark:text-slate-500">
                        {entry.value} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
