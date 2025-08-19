import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import AddBudgetForm from '../../components/Budget/AddBudgetForm';
import ProgressBar from '../../components/Budget/ProgressBar';
import DeleteAlert from '../../components/DeleteAlert';

const Budgets = () => {
  useUserAuth();

  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState({ show: false, data: null });
  const [openDelete, setOpenDelete] = useState({ show: false, id: null });
  const [categories, setCategories] = useState([]);

  const fetchBudgets = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.BUDGET.GET(month, year));
      const data = res?.data?.data || [];
      setBudgets(data);

      // Show toasts for near/exceeded
      data.forEach((b) => {
        const p = Number(b.progressPercent || 0);
        if (p >= 100) {
          toast.error(`Budget exceeded: ${b.category} (${month}/${year})`);
        } else if (p >= (b.thresholdPercent || 80)) {
          toast(`Budget nearing: ${b.category} (${p}%)`, { icon: '⚠️' });
        }
      });
    } catch (e) {
      console.error('Failed to fetch budgets', e);
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (payload) => {
    // basic validation
    if (!payload.amount || Number(payload.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUDGET.CREATE, payload);
      setOpenCreate(false);
      toast.success('Budget created');
      // refresh with potential new month/year
      if (payload.month !== month || payload.year !== year) {
        setMonth(payload.month);
        setYear(payload.year);
        // fetch will happen via effect below
      } else {
        fetchBudgets();
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to create budget';
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  // Fetch categories from expenses once (or when needed)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
        const items = res?.data?.data || [];
        const unique = Array.from(new Set(items.map((i) => i.category))).filter(Boolean).sort();
        setCategories(unique);
      } catch (e) {
        // non-blocking
      }
    };
    fetchCategories();
  }, []);

  const openEditBudget = (b) => setOpenEdit({ show: true, data: b });
  const openDeleteBudget = (id) => setOpenDelete({ show: true, id });

  const handleUpdate = async ({ amount, thresholdPercent }) => {
    const b = openEdit.data;
    if (!b) return;
    if (!amount || Number(amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    try {
      await axiosInstance.put(API_PATHS.BUDGET.UPDATE(b._id), { amount, thresholdPercent });
      toast.success('Budget updated');
      setOpenEdit({ show: false, data: null });
      fetchBudgets();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to update budget';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    const id = openDelete.id;
    if (!id) return;
    try {
      await axiosInstance.delete(API_PATHS.BUDGET.DELETE(id));
      toast.success('Budget deleted');
      setOpenDelete({ show: false, id: null });
      fetchBudgets();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete budget';
      toast.error(msg);
    }
  };

  return (
    <DashboardLayout activeMenu='Budgets'>
      <div className="my-5 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Budgets</h2>
          <button className="btn-primary" onClick={() => setOpenCreate(true)}>Add Budget</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="bg-white rounded shadow divide-y">
          {/* Desktop / tablet table header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 font-medium text-sm text-gray-600">
            <div className="col-span-3">Category</div>
            <div className="col-span-2 text-right">Budget</div>
            <div className="col-span-2 text-right">Spent</div>
            <div className="col-span-2 text-right">Remaining</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {budgets.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">No budgets found for {month}/{year}.</div>
          )}

          {budgets.map((b) => (
            <React.Fragment key={b._id}>
              {/* Desktop / tablet row */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-center">
                <div className="col-span-3 text-sm font-medium">{b.category}</div>
                <div className="col-span-2 text-right text-sm">{Number(b.amount).toFixed(2)}</div>
                <div className="col-span-2 text-right text-sm">{Number(b.spent || 0).toFixed(2)}</div>
                <div className="col-span-2 text-right text-sm">{Math.max(0, Number(b.amount) - Number(b.spent || 0)).toFixed(2)}</div>
                <div className="col-span-2 flex items-center gap-2">
                  <ProgressBar percent={b.progressPercent} />
                  <span className="text-xs w-10 text-right">{b.progressPercent}%</span>
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                  <button className="text-blue-600 text-xs underline" onClick={() => openEditBudget(b)}>Edit</button>
                  <button className="text-red-600 text-xs underline" onClick={() => openDeleteBudget(b._id)}>Delete</button>
                </div>
              </div>

              {/* Mobile card */}
              <div className="md:hidden px-4 py-3 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">{b.category?.charAt(0) || 'B'}</div>
                      <div>
                        <div className="text-sm font-medium">{b.category}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{month}/{year}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-md text-blue-600 hover:bg-blue-50" onClick={() => openEditBudget(b)}>Edit</button>
                    <button className="p-2 rounded-md text-red-600 hover:bg-red-50" onClick={() => openDeleteBudget(b._id)}>Delete</button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-gray-400">Budget</div>
                    <div className="font-medium">{Number(b.amount).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Spent</div>
                    <div className="font-medium">{Number(b.spent || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Remaining</div>
                    <div className="font-medium">{Math.max(0, Number(b.amount) - Number(b.spent || 0)).toFixed(2)}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-400">Progress</div>
                    <div className="w-full max-w-[110px] mt-1 flex items-center gap-2">
                      <ProgressBar percent={b.progressPercent} />
                      <span className="text-xs">{b.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Add Budget">
        <AddBudgetForm onCreate={handleCreate} categories={categories} />
      </Modal>

      <Modal isOpen={openEdit.show} onClose={() => setOpenEdit({ show: false, data: null })} title="Edit Budget">
        {openEdit.data && (
          <AddBudgetForm
            categories={categories}
            initialValues={{
              category: openEdit.data.category,
              month: openEdit.data.month,
              year: openEdit.data.year,
              amount: openEdit.data.amount,
              thresholdPercent: openEdit.data.thresholdPercent,
            }}
            submitLabel="Update Budget"
            onCreate={({ amount, thresholdPercent }) => handleUpdate({ amount, thresholdPercent })}
          />
        )}
      </Modal>

      <Modal isOpen={openDelete.show} onClose={() => setOpenDelete({ show: false, id: null })} title="Delete Budget">
        <DeleteAlert
          content="Are you sure you want to delete this budget?"
          onDelete={handleDelete}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Budgets;
