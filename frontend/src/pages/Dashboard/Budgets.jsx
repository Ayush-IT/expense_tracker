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
import { LuPlus, LuCalendar, LuTrendingUp, LuCircleHelp, LuPenTool, LuTrash2, LuDownload } from 'react-icons/lu';

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
    try {
      await axiosInstance.put(API_PATHS.BUDGET.UPDATE(openEdit.data._id), {
        amount,
        thresholdPercent,
      });
      setOpenEdit({ show: false, data: null });
      toast.success('Budget updated');
      fetchBudgets();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to update budget';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(API_PATHS.BUDGET.DELETE(openDelete.id));
      setOpenDelete({ show: false, id: null });
      toast.success('Budget deleted');
      fetchBudgets();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete budget';
      toast.error(msg);
    }
  };

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum - 1];
  };

  const getTotalBudget = () => budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const getTotalSpent = () => budgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);
  const getTotalRemaining = () => getTotalBudget() - getTotalSpent();

  return (
    <DashboardLayout activeMenu='Budgets'>
      <div className="my-6 mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Management</h1>
            <p className="text-gray-600">Track and manage your monthly spending limits</p>
          </div>
          <button
            className="btn-primary flex items-center gap-2 px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            onClick={() => setOpenCreate(true)}
          >
            <LuPlus className="text-lg" />
            Add Budget
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Budget</p>
                <p className="text-2xl font-bold text-blue-900">${getTotalBudget().toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <LuTrendingUp className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-green-900">${getTotalSpent().toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <LuTrendingUp className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Remaining</p>
                <p className="text-2xl font-bold text-purple-900">${getTotalRemaining().toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <LuCircleHelp className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Month/Year Selector */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LuCalendar className="text-blue-500 text-xl" />
              <h3 className="text-lg font-semibold text-gray-900">Select Period</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{getMonthName(m)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={now.getFullYear() - 5}
                  max={now.getFullYear() + 5}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Budgets List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-medium text-sm text-gray-700">
            <div className="col-span-3">Category</div>
            <div className="col-span-2 text-right">Budget</div>
            <div className="col-span-2 text-right">Spent</div>
            <div className="col-span-2 text-right">Remaining</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Empty State */}
          {budgets.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LuCircleHelp className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">No budgets found</p>
              <p className="text-gray-400 text-sm">Create your first budget for {getMonthName(month)} {year}</p>
            </div>
          )}

          {/* Budget Items */}
          {budgets.map((b) => (
            <React.Fragment key={b._id}>
              {/* Desktop Row */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{b.category.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-gray-900">{b.category}</span>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-semibold text-gray-900">${Number(b.amount).toFixed(2)}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-gray-700">${Number(b.spent || 0).toFixed(2)}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className={`font-medium ${Number(b.amount) - Number(b.spent || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.max(0, Number(b.amount) - Number(b.spent || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar percent={b.progressPercent} showLabel={false} />
                  </div>
                  <span className={`text-sm font-medium w-12 text-right ${b.progressPercent >= 100 ? 'text-red-600' :
                    b.progressPercent >= 80 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                    {b.progressPercent}%
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => openEditBudget(b)}
                    title="Edit Budget"
                  >
                    <LuPenTool size={16} />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={() => openDeleteBudget(b._id)}
                    title="Delete Budget"
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Mobile Card */}
              <div className="md:hidden p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{b.category.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{b.category}</h4>
                      <p className="text-sm text-gray-500">{getMonthName(b.month)} {b.year}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      onClick={() => openEditBudget(b)}
                    >
                      <LuPenTool size={16} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      onClick={() => openDeleteBudget(b._id)}
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Budget</div>
                    <div className="font-semibold text-gray-900">${Number(b.amount).toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Spent</div>
                    <div className="font-semibold text-gray-900">${Number(b.spent || 0).toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Remaining</div>
                    <div className={`font-semibold ${Number(b.amount) - Number(b.spent || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${Math.max(0, Number(b.amount) - Number(b.spent || 0)).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Progress</div>
                    <div className="w-full mt-1">
                      <ProgressBar percent={b.progressPercent} showLabel={false} size="small" />
                    </div>
                    <div className={`text-xs font-medium mt-1 text-center ${b.progressPercent >= 100 ? 'text-red-600' :
                      b.progressPercent >= 80 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                      {b.progressPercent}%
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create New Budget">
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
          content="Are you sure you want to delete this budget? This action cannot be undone."
          onDelete={handleDelete}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Budgets;
