import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiEye } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput, FormSelect } from '../components/ui/FormInput';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { membersApi } from '../services/api';
import { formatDate } from '../utils/helpers';

const emptyMember = {
  memberName: '',
  phoneNumber: '',
  nationalId: '',
  dateJoined: new Date().toISOString().slice(0, 10),
  memberNumber: '',
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyMember);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [viewProfile, setViewProfile] = useState(null);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await membersApi.getAll();
      setMembers(Array.isArray(data) ? data : data?.members ?? []);
    } catch (e) {
      setError(e.message || 'Failed to load members.');
      setMembers([
        { id: 1, memberName: 'Jane Wanjiku', phoneNumber: '+254712345678', nationalId: '12345678', dateJoined: '2024-01-15', memberNumber: 'CHM-001' },
        { id: 2, memberName: 'John Kamau', phoneNumber: '+254723456789', nationalId: '23456789', dateJoined: '2024-02-20', memberNumber: 'CHM-002' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch =
      !search ||
      [m.memberName, m.name, m.phoneNumber, m.phone, m.memberNumber, m.nationalId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await membersApi.create({
        name: formData.memberName || formData.name,
        phone: formData.phoneNumber || formData.phone,
        nationalId: formData.nationalId,
        dateJoined: formData.dateJoined,
        memberNumber: formData.memberNumber,
      });
      setSuccess('Member added successfully.');
      setModalOpen(false);
      setFormData(emptyMember);
      loadMembers();
    } catch (e) {
      setError(e.message || 'Failed to add member.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEdit = (m) => {
    setFormData({
      memberName: m.memberName || m.name,
      phoneNumber: m.phoneNumber || m.phone,
      nationalId: m.nationalId,
      dateJoined: (m.dateJoined || m.dateJoined).slice?.(0, 10) || m.dateJoined,
      memberNumber: m.memberNumber,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <Button onClick={() => { setFormData(emptyMember); setModalOpen(true); }} className="inline-flex items-center gap-2">
          <FiPlus size={18} /> Add Member
        </Button>
      </div>
      {error && <Alert type="error" onDismiss={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert type="success" onDismiss={() => setSuccess('')} dismissible>{success}</Alert>}
      <Card padding={false}>
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] outline-none"
            />
          </div>
          <FormSelect value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FormSelect>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Member No</Th>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>National ID</Th>
              <Th>Date Joined</Th>
              <Th className="text-right">Actions</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <Td colSpan={6} className="text-center py-8 text-gray-500">Loading...</Td>
                </TableRow>
              ))
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  <Td className="font-mono text-xs">{m.memberNumber || '—'}</Td>
                  <Td className="font-medium">{m.memberName || m.name}</Td>
                  <Td>{m.phoneNumber || m.phone}</Td>
                  <Td>{m.nationalId || '—'}</Td>
                  <Td>{formatDate(m.dateJoined)}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewProfile(m)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-[#F8F7FF] hover:text-[#7C3AED] transition-smooth"
                        title="View profile"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-[#F8F7FF] hover:text-[#7C3AED] transition-smooth"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                  </Td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Member"
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="member-form" loading={submitLoading}>Save Member</Button>
          </>
        }
      >
        <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Member Number"
            value={formData.memberNumber}
            onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
            placeholder="e.g. CHM-001"
          />
          <FormInput
            label="Member Name"
            value={formData.memberName}
            onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
            placeholder="Full name"
            required
          />
          <FormInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+254..."
            required
          />
          <FormInput
            label="National ID"
            value={formData.nationalId}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            placeholder="National ID"
          />
          <FormInput
            label="Date Joined"
            type="date"
            value={formData.dateJoined}
            onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
            required
          />
        </form>
      </Modal>

      {viewProfile && (
        <Modal
          isOpen={!!viewProfile}
          onClose={() => setViewProfile(null)}
          title="Member Profile"
          footer={<Button onClick={() => setViewProfile(null)}>Close</Button>}
        >
          <div className="space-y-3 text-sm">
            <p><span className="font-medium text-gray-500">Name:</span> {viewProfile.memberName || viewProfile.name}</p>
            <p><span className="font-medium text-gray-500">Phone:</span> {viewProfile.phoneNumber || viewProfile.phone}</p>
            <p><span className="font-medium text-gray-500">Member No:</span> {viewProfile.memberNumber || '—'}</p>
            <p><span className="font-medium text-gray-500">National ID:</span> {viewProfile.nationalId || '—'}</p>
            <p><span className="font-medium text-gray-500">Date Joined:</span> {formatDate(viewProfile.dateJoined)}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
