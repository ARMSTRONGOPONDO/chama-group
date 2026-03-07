import { useState, useEffect } from 'react';
import { FiPieChart, FiPlus } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput, FormSelect } from '../components/ui/FormInput';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { savingsApi } from '../services/api';
import { membersApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function Savings() {
  const [savings, setSavings] = useState([]);
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, byMember: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState({ memberId: '', amount: '', dateRecorded: today, transactionId: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [savingsRes, membersRes] = await Promise.allSettled([
        savingsApi.getAll(),
        membersApi.getAll(),
      ]);
      const savingsList = savingsRes.status === 'fulfilled' && Array.isArray(savingsRes.value)
        ? savingsRes.value
        : savingsRes.status === 'fulfilled' && savingsRes.value?.savings
        ? savingsRes.value.savings
        : [];
      const membersList = membersRes.status === 'fulfilled' && Array.isArray(membersRes.value)
        ? membersRes.value
        : membersRes.status === 'fulfilled' && membersRes.value?.members
        ? membersRes.value.members
        : [];
      setSavings(savingsList);
      setMembers(membersList);
      const total = savingsList.reduce((s, i) => s + Number(i.amount || 0), 0);
      const byMember = {};
      savingsList.forEach((i) => {
        const id = i.memberId ?? i.member?.id;
        const name = i.memberName ?? i.member?.name ?? 'Unknown';
        if (!byMember[id]) byMember[id] = { memberId: id, memberName: name, total: 0 };
        byMember[id].total += Number(i.amount || 0);
      });
      setSummary({ total, byMember: Object.values(byMember) });
    } catch (e) {
      setError(e.message || 'Failed to load savings.');
      setSavings([]);
      setMembers([]);
      setSummary({ total: 0, byMember: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await savingsApi.create({
        memberId: formData.memberId,
        amount: Number(formData.amount),
        dateRecorded: formData.dateRecorded,
        transactionId: formData.transactionId || undefined,
      });
      setSuccess('Savings recorded successfully.');
      setModalOpen(false);
      setFormData({ memberId: '', amount: '', dateRecorded: today, transactionId: '' });
      loadData();
    } catch (e) {
      setError(e.message || 'Failed to record savings.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Savings</h1>
        <Button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2">
          <FiPlus size={18} /> Record Deposit
        </Button>
      </div>
      {error && <Alert type="error" onDismiss={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert type="success" onDismiss={() => setSuccess('')} dismissible>{success}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#C4B5FD] text-[#7C3AED]">
              <FiPieChart size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Group Savings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500 mb-2">Savings by member (top 5)</p>
          <ul className="space-y-2">
            {summary.byMember
              .sort((a, b) => b.total - a.total)
              .slice(0, 5)
              .map((m) => (
                <li key={m.memberId} className="flex justify-between text-sm">
                  <span className="text-gray-700">{m.memberName}</span>
                  <span className="font-semibold">{formatCurrency(m.total)}</span>
                </li>
              ))}
            {summary.byMember.length === 0 && <li className="text-gray-400 text-sm">No data yet</li>}
          </ul>
        </Card>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Savings History</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : savings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No savings recorded yet.</div>
        ) : (
          <>
            <div className="sm:hidden space-y-3 p-4">
              {savings.map((s) => (
                <div key={s.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Date</span>
                    <span>{formatDate(s.dateRecorded)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-base font-semibold text-gray-900">
                    <span>{s.memberName ?? s.member?.name ?? s.memberId}</span>
                    <span>{formatCurrency(s.amount)}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                    <span>Ref</span>
                    <span className="font-mono">{s.transactionId || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
              <Table>
                <TableHead>
                  <TableRow>
                    <Th>Date</Th>
                    <Th>Member</Th>
                    <Th>Amount</Th>
                    <Th>Ref</Th>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savings.map((s) => (
                    <TableRow key={s.id}>
                      <Td>{formatDate(s.dateRecorded)}</Td>
                      <Td>{s.memberName ?? s.member?.name ?? s.memberId}</Td>
                      <Td className="font-semibold">{formatCurrency(s.amount)}</Td>
                      <Td className="font-mono text-xs">{s.transactionId || '—'}</Td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Savings Deposit"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="savings-form" loading={submitLoading}>Record</Button>
          </>
        }
      >
        <form id="savings-form" onSubmit={handleSubmit} className="space-y-4">
          <FormSelect
            label="Member"
            value={formData.memberId}
            onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
            required
          >
            <option value="">Select member...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.memberName || m.name} ({m.memberNumber || m.id})</option>
            ))}
          </FormSelect>
          <FormInput
            label="Amount (KSh)"
            type="number"
            min="1"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
           <FormInput
             label="Date"
             type="date"
             value={formData.dateRecorded}
             onChange={(e) => setFormData({ ...formData, dateRecorded: e.target.value })}
             required
             min={today}
           />
          <FormInput
            label="Transaction Ref (optional)"
            value={formData.transactionId}
            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
            placeholder="e.g. M-PESA code"
          />
        </form>
      </Modal>
    </div>
  );
}
