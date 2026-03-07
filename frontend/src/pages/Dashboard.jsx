import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { FiUsers, FiPieChart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { Card } from '../components/ui/Card';
import { ChartContainer } from '../components/ui/ChartContainer';
import { formatCurrency } from '../utils/helpers';
import { reportsApi } from '../services/api';
import { Alert } from '../components/ui/Alert';

const CHART_COLORS = ['#7C3AED', '#C4B5FD', '#A78BFA', '#8B5CF6', '#6D28D9'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalSavings: 0,
    activeLoans: 0,
    interestEarned: 0,
  });
  const [savingsData, setSavingsData] = useState([]);
  const [loansData, setLoansData] = useState([]);
  const [interestData, setInterestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summary, savingsGrowth, loansIssued, interestDist] = await Promise.allSettled([
          reportsApi.getSummary(),
          reportsApi.getSavingsGrowth(),
          reportsApi.getLoansIssued(),
          reportsApi.getInterestDistribution(),
        ]);
        if (summary.status === 'fulfilled' && summary.value) {
          const s = summary.value;
          setStats({
            totalMembers: s.totalMembers ?? s.members ?? 0,
            totalSavings: s.totalSavings ?? s.groupSavings ?? 0,
            activeLoans: s.activeLoans ?? s.loans ?? 0,
            interestEarned: s.interestEarned ?? s.interest ?? 0,
          });
        }
        if (savingsGrowth.status === 'fulfilled' && Array.isArray(savingsGrowth.value)) {
          setSavingsData(savingsGrowth.value);
        } else {
          setSavingsData([
            { month: 'Jan', amount: 120000 },
            { month: 'Feb', amount: 180000 },
            { month: 'Mar', amount: 220000 },
            { month: 'Apr', amount: 250000 },
            { month: 'May', amount: 310000 },
            { month: 'Jun', amount: 380000 },
          ]);
        }
        if (loansIssued.status === 'fulfilled' && Array.isArray(loansIssued.value)) {
          setLoansData(loansIssued.value);
        } else {
          setLoansData([
            { month: 'Jan', amount: 50000 },
            { month: 'Feb', amount: 80000 },
            { month: 'Mar', amount: 60000 },
            { month: 'Apr', amount: 90000 },
            { month: 'May', amount: 70000 },
            { month: 'Jun', amount: 110000 },
          ]);
        }
        if (interestDist.status === 'fulfilled' && Array.isArray(interestDist.value)) {
          setInterestData(interestDist.value);
        } else {
          setInterestData(
            [
              { name: 'Loan interest', value: 45000 },
              { name: 'Penalties', value: 5000 },
              { name: 'Other', value: 2000 },
            ].map((d) => ({ ...d, name: d.name, value: d.value }))
          );
        }
      } catch (e) {
        setError(e.message || 'Failed to load dashboard data.');
        setSavingsData([
          { month: 'Jan', amount: 120000 },
          { month: 'Feb', amount: 180000 },
          { month: 'Mar', amount: 220000 },
          { month: 'Apr', amount: 250000 },
          { month: 'May', amount: 310000 },
          { month: 'Jun', amount: 380000 },
        ]);
        setLoansData([
          { month: 'Jan', amount: 50000 },
          { month: 'Feb', amount: 80000 },
          { month: 'Mar', amount: 60000 },
          { month: 'Apr', amount: 90000 },
          { month: 'May', amount: 70000 },
          { month: 'Jun', amount: 110000 },
        ]);
        setInterestData([
          { name: 'Loan interest', value: 45 },
          { name: 'Penalties', value: 5 },
          { name: 'Other', value: 2 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Members', value: formatCurrency(stats.totalMembers, ''), icon: FiUsers, color: 'bg-[#7C3AED]' },
    { label: 'Total Group Savings', value: formatCurrency(stats.totalSavings), icon: FiPieChart, color: 'bg-[#C4B5FD]' },
    { label: 'Active Loans', value: formatCurrency(stats.activeLoans), icon: FiDollarSign, color: 'bg-[#A78BFA]' },
    { label: 'Interest Earned', value: formatCurrency(stats.interestEarned), icon: FiTrendingUp, color: 'bg-[#8B5CF6]' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      {error && (
        <Alert type="info" onDismiss={() => setError(null)} dismissible>
          Using sample data. Connect backend for live stats. {error}
        </Alert>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((item) => (
          <Card key={item.label} className="flex items-center gap-4">
            <div className={`p-3 rounded-xl text-white ${item.color}`}>
              <item.icon size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Savings growth" subtitle="Cumulative group savings">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(v) => `KSh ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Amount']} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#7C3AED" strokeWidth={2} name="Savings" dot={{ fill: '#7C3AED' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Loans issued" subtitle="Per month">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={loansData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(v) => `KSh ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Amount']} />
              <Bar dataKey="amount" fill="#7C3AED" radius={[8, 8, 0, 0]} name="Loans" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <ChartContainer title="Interest distribution" subtitle="By source">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={interestData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {interestData.map((_, i) => (
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
