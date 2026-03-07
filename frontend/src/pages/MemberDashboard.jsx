import { useState, useEffect } from 'react';
import { FiPieChart, FiDollarSign, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { savingsApi } from '../services/api';
import { loansApi } from '../services/api';
import { repaymentsApi } from '../services/api';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [loanBalance, setLoanBalance] = useState(0);
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [repaymentHistory, setRepaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const memberId = user?.id ?? user?.memberId;
        if (!memberId) {
            setLoading(false);
            return;
        }
        const [savingsRes, loansRes, repayRes] = await Promise.allSettled([
          savingsApi.getByMember(memberId),
          loansApi.getAll(),
          repaymentsApi.getAll(),
        ]);
        const savingsList = savingsRes.status === 'fulfilled' && Array.isArray(savingsRes.value)
          ? savingsRes.value
          : savingsRes.status === 'fulfilled' && savingsRes.value?.savings
          ? savingsRes.value.savings
          : [];
        const mySavings = savingsList.filter((s) => (s.memberId ?? s.member?.id) === memberId);
        const totalSavings = mySavings.reduce((s, i) => s + Number(i.amount || 0), 0);
        setSavingsBalance(totalSavings);
        setSavingsHistory(mySavings.slice(-10).reverse());

        const loansList = loansRes.status === 'fulfilled' && Array.isArray(loansRes.value) ? loansRes.value : [];
        const myLoans = loansList.filter((l) => (l.memberId ?? l.member?.id) === memberId);
        const totalPrincipal = myLoans.reduce((s, l) => s + Number(l.principal ?? l.loanAmount ?? 0), 0);
        const repList = repayRes.status === 'fulfilled' && Array.isArray(repRes.value) ? repRes.value : [];
        const myRepayments = repList.filter((r) => myLoans.some((l) => l.id === r.loanId));
        const totalRepaid = myRepayments.reduce((s, r) => s + Number(r.amount || 0), 0);
        setLoanBalance(Math.max(0, totalPrincipal - totalRepaid));
        setRepaymentHistory(myRepayments.slice(-10).reverse());
      } catch {
        setSavingsBalance(0);
        setLoanBalance(0);
        setSavingsHistory([]);
        setRepaymentHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, user?.memberId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      <p className="text-gray-500">Welcome, {user?.name ?? 'Member'}. Here is your savings and loan summary.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#C4B5FD] text-[#7C3AED]">
              <FiPieChart size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Personal savings balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(savingsBalance)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#A78BFA] text-white">
              <FiDollarSign size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding loan balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(loanBalance)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="text-[#7C3AED]" size={24} />
          <h2 className="text-lg font-bold text-gray-900">Loan progress</h2>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7C3AED] rounded-full transition-all duration-500"
            style={{ width: loanBalance === 0 ? '100%' : '30%' }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">Keep up with repayments to clear your loan.</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <FiPieChart className="text-[#7C3AED]" size={20} />
            <h2 className="font-bold text-gray-900">Savings history</h2>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <Th>Date</Th>
                <Th>Amount</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {savingsHistory.length === 0 ? (
                <TableRow>
                  <Td colSpan={2} className="text-center py-6 text-gray-500">No savings yet.</Td>
                </TableRow>
              ) : (
                savingsHistory.map((s) => (
                  <TableRow key={s.id}>
                    <Td>{formatDate(s.dateRecorded ?? s.date)}</Td>
                    <Td className="font-semibold">{formatCurrency(s.amount)}</Td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <FiCalendar className="text-[#7C3AED]" size={20} />
            <h2 className="font-bold text-gray-900">Payment history</h2>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <Th>Date</Th>
                <Th>Amount</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {repaymentHistory.length === 0 ? (
                <TableRow>
                  <Td colSpan={2} className="text-center py-6 text-gray-500">No repayments yet.</Td>
                </TableRow>
              ) : (
                repaymentHistory.map((r) => (
                  <TableRow key={r.id}>
                    <Td>{formatDate(r.paymentDate ?? r.date)}</Td>
                    <Td className="font-semibold">{formatCurrency(r.amount)}</Td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
