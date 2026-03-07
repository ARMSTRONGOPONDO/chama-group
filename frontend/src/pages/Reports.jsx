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
        else setSummary({ totalSavings: 380000, totalLoans: 460000, loansRepaid: 200000, interestEarned: 52000 });
        if (growthRes.status === 'fulfilled' && Array.isArray(growthRes.value)) setSavingsGrowth(growthRes.value);
        else setSavingsGrowth([
          { month: 'Jan', total: 120000 },
          { month: 'Feb', total: 180000 },
          { month: 'Mar', total: 220000 },
          { month: 'Apr', total: 250000 },
          { month: 'May', total: 310000 },
          { month: 'Jun', total: 380000 },
        ]);
        if (loansRes.status === 'fulfilled' && Array.isArray(loansRes.value)) setLoansIssued(loansRes.value);
        else setLoansIssued([
          { month: 'Jan', amount: 50000 },
          { month: 'Feb', amount: 80000 },
          { month: 'Mar', amount: 60000 },
          { month: 'Apr', amount: 90000 },
          { month: 'May', amount: 70000 },
          { month: 'Jun', amount: 110000 },
        ]);
        if (breakdownRes.status === 'fulfilled' && Array.isArray(breakdownRes.value)) setMemberBreakdown(breakdownRes.value);
        else setMemberBreakdown([
          { name: 'Jane W.', value: 85000 },
          { name: 'John K.', value: 72000 },
          { name: 'Mary N.', value: 68000 },
          { name: 'Peter O.', value: 55000 },
          { name: 'Others', value: 100000 },
        ]);
      } catch (e) {
        setError(e.message || 'Failed to load reports.');
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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      {error && <Alert type="info" onDismiss={() => setError(null)} dismissible>Using sample data. {error}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total group savings</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.totalSavings ?? summary?.totalGroupSavings ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Loans issued</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.totalLoans ?? summary?.loansIssued ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Loans repaid</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.loansRepaid ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Interest earned</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.interestEarned ?? summary?.interest ?? 0)}</p>
        </Card>
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
