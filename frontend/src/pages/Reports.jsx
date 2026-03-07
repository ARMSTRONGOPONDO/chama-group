import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '../components/ui/ChartContainer';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../utils/helpers';
import { reportsApi } from '../services/api';
import { Alert } from '../components/ui/Alert';

const CHART_COLORS = ['#7C3AED', '#C4B5FD', '#A78BFA', '#8B5CF6', '#6D28D9'];

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [savingsGrowth, setSavingsGrowth] = useState([]);
  const [loansIssued, setLoansIssued] = useState([]);
  const [memberBreakdown, setMemberBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sumRes, growthRes, loansRes, breakdownRes] = await Promise.allSettled([
          reportsApi.getSummary(),
          reportsApi.getSavingsGrowth(),
          reportsApi.getLoansIssued(),
          reportsApi.getMemberBreakdown(),
        ]);
        if (sumRes.status === 'fulfilled' && sumRes.value) setSummary(sumRes.value);
        if (growthRes.status === 'fulfilled' && Array.isArray(growthRes.value)) setSavingsGrowth(growthRes.value);
        if (loansRes.status === 'fulfilled' && Array.isArray(loansRes.value)) setLoansIssued(loansRes.value);
        if (breakdownRes.status === 'fulfilled' && Array.isArray(breakdownRes.value)) setMemberBreakdown(breakdownRes.value);

        const firstError = [sumRes, growthRes, loansRes, breakdownRes].find(r => r.status === 'rejected');
        if (firstError) {
          setError(firstError.reason?.message || 'Failed to load some reports.');
        }
      } catch (e) {
        // This part is left intentionally blank as Promise.allSettled handles individual errors.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const statBlocks = [
    { label: 'Total Savings', value: formatCurrency(summary?.totalSavings ?? summary?.totalGroupSavings ?? 0) },
    { label: 'Loans Issued', value: formatCurrency(summary?.totalLoans ?? summary?.loansIssued ?? 0) },
    { label: 'Loans Repaid', value: formatCurrency(summary?.loansRepaid ?? 0) },
    { label: 'Interest Earned', value: formatCurrency(summary?.interestEarned ?? summary?.interest ?? 0) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      {error && <Alert type="error" onDismiss={() => setError(null)} dismissible>{error}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statBlocks.map((block) => (
          <Card key={block.label} className="text-center">
            <p className="text-sm text-gray-500">{block.label}</p>
            <p className="text-xl font-bold text-gray-900">{block.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Savings over time" subtitle="Cumulative group savings">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={savingsGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(v) => `KSh ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Total']} />
              <Line type="monotone" dataKey="total" stroke="#7C3AED" strokeWidth={2} name="Savings" dot={{ fill: '#7C3AED' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Loans issued by month">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={loansIssued}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(v) => `KSh ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Amount']} />
              <Bar dataKey="amount" fill="#7C3AED" radius={[8, 8, 0, 0]} name="Loans" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <ChartContainer title="Member savings breakdown">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={memberBreakdown}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
            >
              {memberBreakdown.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v)} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
