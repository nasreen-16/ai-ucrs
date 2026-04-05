import { BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface Analytics {
  total: number;
  high: number;
  medium: number;
  low: number;
  pending: number;
  byType: { type: string; count: number }[];
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6'];

export function AnalyticsPanel({ analytics }: { analytics: Analytics }) {
  const priorityData = [
    { name: 'High', value: analytics.high, color: '#ef4444' },
    { name: 'Medium', value: analytics.medium, color: '#f59e0b' },
    { name: 'Low', value: analytics.low, color: '#22c55e' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" /> Analytics
      </h3>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Total', value: analytics.total, color: 'text-primary' },
          { label: 'Critical', value: analytics.high, color: 'text-destructive' },
          { label: 'Pending', value: analytics.pending, color: 'text-warning' },
          { label: 'Resolved', value: analytics.total - analytics.pending, color: 'text-safe' },
        ].map(s => (
          <div key={s.label} className="glass-card !p-3 text-center">
            <p className={`text-lg font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-body text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Priority distribution */}
      <div className="glass-card !p-3">
        <p className="text-[10px] font-body text-muted-foreground mb-2 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> Priority Distribution
        </p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                dataKey="value"
                stroke="none"
              >
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-3 mt-1">
          {priorityData.map(d => (
            <span key={d.name} className="text-[10px] font-body flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
            </span>
          ))}
        </div>
      </div>

      {/* By type chart */}
      <div className="glass-card !p-3">
        <p className="text-[10px] font-body text-muted-foreground mb-2">Requests by Type</p>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.byType} barSize={16}>
              <XAxis dataKey="type" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {analytics.byType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
