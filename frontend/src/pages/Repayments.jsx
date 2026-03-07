import { useState, useEffect } from 'react';
import { FiCreditCard, FiPlus } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput, FormSelect } from '../components/ui/FormInput';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { repaymentsApi } from '../services/api';
import { loansApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function Repayments() {
  const [repayments, setRepayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    loanId: '',
    amount: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    reference: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [repRes, loansRes] = await Promise.allSettled([
        repaymentsApi.getAll(),
        loansApi.getAll(),
      ]);
      const repList = repRes.status === 'fulfilled' && Array.isArray(repRes.value)
        ? repRes.value
        : repRes.status === 'fulfilled' && repRes.value?.repayments
        ? repRes.value.repayments
        : [];
      const loansList = loansRes.status === 'fulfilled' && Array.isArray(loansRes.value)
        ? loansRes.value
        : [];
      setRepayments(repList);
      setLoans(loansList.filter((l) => l.status === 'ACTIVE' || l.status === 'active'));
    } catch (e) {
      setError(e.message || 'Failed to load repayments.');
      setRepayments([]);
      setLoans([]);
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
      await repaymentsApi.create({
        loanId: formData.loanId,
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        reference: formData.reference || undefined,
      });
      setSuccess('Repayment recorded successfully.');
      setModalOpen(false);
      setFormData({ loanId: '', amount: '', paymentDate: new Date().toISOString().slice(0, 10), reference: '' });
      loadData();
    } catch (e) {
      setError(e.message || 'Failed to record repayment.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Repayments</h1>
        <Button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2">
          <FiPlus size={18} /> Record Repayment
        </Button>
      </div>
      {error && <Alert type="error" onDismiss={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert type="success" onDismiss={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-[#C4B5FD] text-[#7C3AED]">
            <FiCreditCard size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Repayment history</p>
            <p className="text-lg font-semibold text-gray-900">Track all loan repayments</p>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Date</Th>
              <Th>Loan / Member</Th>
              <Th>Amount</Th>
              <Th>Reference</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <Td colSpan={4} className="text-center py-8 text-gray-500">Loading...</Td>
              </TableRow>
            ) : repayments.length === 0 ? (
              <TableRow>
                <Td colSpan={4} className="text-center py-8 text-gray-500">No repayments yet.</Td>
              </TableRow>
            ) : (
              repayments.map((r) => (
                <TableRow key={r.id}>
                  <Td>{formatDate(r.paymentDate ?? r.date)}</Td>
                  <Td>{r.loan?.member?.name ?? r.memberName ?? r.loanId}</Td>
                  <Td className="font-semibold">{formatCurrency(r.amount)}</Td>
                  <Td className="font-mono text-xs">{r.reference ?? '—'}</Td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Repayment"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="repayment-form" loading={submitLoading}>Record</Button>
          </>
        }
      >
        <form id="repayment-form" onSubmit={handleSubmit} className="space-y-4">
          <FormSelect
            label="Loan"
            value={formData.loanId}
            onChange={(e) => setFormData({ ...formData, loanId: e.target.value })}
            required
          >
            <option value="">Select loan...</option>
            {loans.map((l) => (
              <option key={l.id} value={l.id}>
                {l.member?.name ?? l.memberName} - {formatCurrency(l.principal ?? l.loanAmount)}
              </option>
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
            label="Payment Date"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            required
          />
          <FormInput
            label="Reference (optional)"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="e.g. M-PESA code"
          />
        </form>
      </Modal>
    </div>
  );
}
