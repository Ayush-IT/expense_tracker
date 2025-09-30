import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { useUserAuth } from '../../hooks/useUserAuth';
import AddBillForm from '../../components/Bills/AddBillForm';
import BillList from '../../components/Bills/BillList';
import DeleteAlert from '../../components/DeleteAlert';

export default function Bills() {
  useUserAuth();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all | upcoming | due_today | overdue | paused | paid

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState({ show: false, data: null });
  const [openDelete, setOpenDelete] = useState({ show: false, data: null });

  const fetchBills = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const url = filter === 'all' ? API_PATHS.BILLS.LIST : `${API_PATHS.BILLS.LIST}?status=${filter}`;
      const res = await axiosInstance.get(url);
      setBills(res?.data?.data || []);
    } catch (e) {
      console.error('Failed to fetch bills:', e);
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleAddBill = async (payload) => {
    try {
      await axiosInstance.post(API_PATHS.BILLS.CREATE, payload);
      toast.success('Bill added');
      setOpenAddModal(false);
      fetchBills();
    } catch (e) {
      console.error('Failed to add bill:', e);
      toast.error('Failed to add bill');
    }
  };

  const handleUpdateBill = async (payload) => {
    if (!openEditModal.data) return;
    try {
      await axiosInstance.put(API_PATHS.BILLS.UPDATE(openEditModal.data._id), payload);
      toast.success('Bill updated');
      setOpenEditModal({ show: false, data: null });
      fetchBills();
    } catch (e) {
      console.error('Failed to update bill:', e);
      toast.error('Failed to update bill');
    }
  };

  const handleDelete = async () => {
    if (!openDelete.data) return;
    try {
      await axiosInstance.delete(API_PATHS.BILLS.DELETE(openDelete.data._id || openDelete.data));
      toast.success('Bill deleted');
      setOpenDelete({ show: false, data: null });
      fetchBills();
    } catch (e) {
      console.error('Failed to delete bill:', e);
      toast.error('Failed to delete bill');
    }
  };

  const handlePay = async (bill) => {
    try {
      await axiosInstance.post(API_PATHS.BILLS.PAY(bill._id));
      toast.success('Bill marked as paid');
      fetchBills();
    } catch (e) {
      console.error('Failed to pay bill:', e);
      toast.error('Failed to mark as paid');
    }
  };

  const handlePause = async (bill) => {
    try {
      await axiosInstance.post(API_PATHS.BILLS.PAUSE(bill._id));
      toast.success('Bill paused');
      fetchBills();
    } catch (e) {
      console.error('Failed to pause bill:', e);
      toast.error('Failed to pause');
    }
  };

  const handleResume = async (bill) => {
    try {
      await axiosInstance.post(API_PATHS.BILLS.RESUME(bill._id));
      toast.success('Bill resumed');
      fetchBills();
    } catch (e) {
      console.error('Failed to resume bill:', e);
      toast.error('Failed to resume');
    }
  };

  const normalizedEditData = openEditModal.data
    ? {
        ...openEditModal.data,
        dueDate: openEditModal.data?.dueDate ? new Date(openEditModal.data.dueDate).toISOString().slice(0, 10) : '',
        remindDaysBefore: Array.isArray(openEditModal.data.remindDaysBefore)
          ? openEditModal.data.remindDaysBefore.join(',')
          : openEditModal.data.remindDaysBefore,
      }
    : null;

  return (
    <DashboardLayout activeMenu='Bills'>
      <div className='my-5 mx-auto max-w-7xl px-3 md:px-4'>
        <div className='bg-white rounded-xl shadow p-4 md:p-5 mb-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='text-sm text-gray-600'>Filter:</span>
            {/* Mobile: dropdown */}
            <div className='w-full sm:w-auto sm:hidden'>
              <select
                className='w-full border rounded-lg px-3 py-2 text-sm'
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {['all','upcoming','due_today','overdue','paused','paid'].map((f) => (
                  <option key={f} value={f}>{f.replace('_',' ')}</option>
                ))}
              </select>
            </div>

            {/* Desktop: pill buttons */}
            <div className='hidden sm:flex items-center gap-2'>
              {['all','upcoming','due_today','overdue','paused','paid'].map((f) => (
                <button
                  key={f}
                  className={`px-3 py-1.5 rounded-full border text-sm ${filter===f ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setFilter(f)}
                >
                  {f.replace('_',' ')}
                </button>
              ))}
            </div>

            <div className='ml-auto'>
              <button className='bg-blue-600 text-white px-3 py-2 rounded-lg text-sm' onClick={() => setOpenAddModal(true)}>Add Bill</button>
            </div>
          </div>
        </div>

        <BillList
          bills={bills}
          loading={loading}
          onAdd={() => setOpenAddModal(true)}
          onEdit={(b) => setOpenEditModal({ show: true, data: b })}
          onDelete={(b) => setOpenDelete({ show: true, data: b })}
          onPay={handlePay}
          onPause={handlePause}
          onResume={handleResume}
        />

        <Modal isOpen={openAddModal} onClose={() => setOpenAddModal(false)} title='Add Bill'>
          <AddBillForm onAddBill={handleAddBill} />
        </Modal>

        <Modal isOpen={openEditModal.show} onClose={() => setOpenEditModal({ show: false, data: null })} title='Edit Bill'>
          <AddBillForm initialValues={normalizedEditData} onSubmit={handleUpdateBill} submitLabel='Save Changes' />
        </Modal>

        <Modal isOpen={openDelete.show} onClose={() => setOpenDelete({ show: false, data: null })} title='Delete Bill'>
          <DeleteAlert content='Are you sure you want to delete this bill?' onDelete={handleDelete} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
