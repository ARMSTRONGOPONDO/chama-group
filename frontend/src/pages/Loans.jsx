import { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiEye } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput, FormSelect } from '../components/ui/FormInput';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { loansApi } from '../services/api';
import { membersApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  REPAID: 'bg-gray-100 text-gray-800',
};

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoan, setDetailLoan] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState({
    memberId: '',
    loanAmount: '',
    interestRate: '10',
    loanDate: today,
    termMonths: '12',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loansRes, membersRes] = await Promise.allSettled([
        loansApi.getAll(),
        membersApi.getAll(),
      ]);
      const loansList = loansRes.status === 'fulfilled' && Array.isArray(loansRes.value)
        ? loansRes.value
        : [];
      const membersList = membersRes.status === 'fulfilled' && Array.isArray(membersRes.value)
        ? membersRes.value
        : membersRes.status === 'fulfilled' && membersRes.value?.members
        ? membersRes.value.members
        : [];
      setLoans(loansList);
      setMembers(membersList);
    } catch (e) {
      setError(e.message || 'Failed to load loans.');
      setLoans([]);
      setMembers([]);
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
      await loansApi.create({
        memberId: formData.memberId,
        principal: Number(formData.loanAmount),
        interestRatePct: Number(formData.interestRate),
        termMonths: Number(formData.termMonths),
        loanDate: formData.loanDate,
      });
      setSuccess('Loan application submitted.');
      setModalOpen(false);
      setFormData({ memberId: '', loanAmount: '', interestRate: '10', loanDate: today, termMonths: '12' });
      loadData();
    } catch (e) {
      setError(e.message || 'Failed to submit loan.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusClass = (status) => statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
        <Button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2">
          <FiPlus size={18} /> New Loan
        </Button>
      </div>
      {error && <Alert type="error" onDismiss={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert type="success" onDismiss={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card padding={false}>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No loans recorded yet.</div>
        ) : (
          <>
            <div className="sm:hidden space-y-3 p-4">
              {loans.map((loan) => (
                <div key={loan.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Member</p>
                      <p className="font-semibold text-gray-900">{loan.member?.name ?? loan.memberName ?? loan.memberId}</p>
                      {loan.member?.memberNumber && <p className="text-xs text-gray-400">{loan.member.memberNumber}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(loan.status)}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <span>Amount</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(loan.principal ?? loan.loanAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>Interest</span>
                    <span>{loan.interestRatePct ?? loan.interestRate ?? 0}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>Date</span>
                    <span>{formatDate(loan.loanDate ?? loan.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailLoan(loan)}
                    className="mt-4 w-full px-3 py-2 rounded-xl bg-[#F8F7FF] text-[#7C3AED] font-semibold text-sm"
                  >
                    View details
                  </button>
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
              <Table>
                <TableHead>
                  <TableRow>
                    <Th>Member</Th>
                    <Th>Amount</Th>
                    <Th>Interest</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <Td>
                        <div className="font-medium">{loan.member?.name ?? loan.memberName ?? loan.memberId}</div>
                        {loan.member?.memberNumber && <div className="text-xs text-gray-500">{loan.member.memberNumber}</div>}
                      </Td>
                      <Td className="font-semibold">{formatCurrency(loan.principal ?? loan.loanAmount)}</Td>
                      <Td>{loan.interestRatePct ?? loan.interestRate ?? 0}%</Td>
                      <Td>{formatDate(loan.loanDate ?? loan.createdAt)}</Td>
                      <Td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(loan.status)}`}>
                          {loan.status}
                        </span>
                      </Td>
                      <Td className="text-right">
                        <button
                          type="button"
                          onClick={() => setDetailLoan(loan)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-[#F8F7FF] hover:text-[#7C3AED] transition-smooth"
                          title="View details"
                        >
                          <FiEye size={16} />
                        </button>
                      </Td>
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
        title="New Loan Application"
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="loan-form" loading={submitLoading}>Submit</Button>
          </>
        }
      >
        <form id="loan-form" onSubmit={handleSubmit} className="space-y-4">
          <FormSelect
            label="Member"
            value={formData.memberId}
            onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
            required
          >
            <option value="">Select member...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.memberName || m.name}</option>
            ))}
          </FormSelect>
          <FormInput
            label="Loan Amount (KSh)"
            type="number"
            min="1"
            value={formData.loanAmount}
            onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
            required
          />
          <FormInput
            label="Interest Rate (%)"
            type="number"
            min="0"
            step="0.1"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
          />
          <FormInput
            label="Term (months)"
            type="number"
            min="1"
            value={formData.termMonths}
            onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
          />
          <FormInput
            label="Loan Date"
            type="date"
            value={formData.loanDate}
            onChange={(e) => setFormData({ ...formData, loanDate: e.target.value })}
            required
            min={today}
          />
        </form>
      </Modal>

      {detailLoan && (
        <Modal
          isOpen={!!detailLoan}
          onClose={() => setDetailLoan(null)}
          title="Loan Details"
          footer={<Button onClick={() => setDetailLoan(null)}>Close</Button>}
        >
          <div className="space-y-3 text-sm">
            <p><span className="font-medium text-gray-500">Member:</span> {detailLoan.member?.name ?? detailLoan.memberName}</p>
            <p><span className="font-medium text-gray-500">Principal:</span> {formatCurrency(detailLoan.principal ?? detailLoan.loanAmount)}</p>
            <p><span className="font-medium text-gray-500">Interest:</span> {detailLoan.interestRatePct ?? detailLoan.interestRate}%</p>
            <p><span className="font-medium text-gray-500">Date:</span> {formatDate(detailLoan.loanDate ?? detailLoan.createdAt)}</p>
            <p><span className="font-medium text-gray-500">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(detailLoan.status)}`}>{detailLoan.status}</span>
            </p>
            {detailLoan.repaymentSchedule && (
              <p><span className="font-medium text-gray-500">Repayment schedule:</span> See Repayments page.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
