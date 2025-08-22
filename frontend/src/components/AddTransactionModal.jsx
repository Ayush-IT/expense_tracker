import React, { useState } from 'react';
import Modal from './Modal';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import EmojiPickerPopup from './EmojiPickerPopup';
import Input from './Inputs/Input';
import toast from 'react-hot-toast';

const todayDate = () => new Date().toISOString().slice(0, 10);

const AddTransactionModal = ({ isOpen, onClose, defaultType = 'expense', onSuccess }) => {
  const [type, setType] = useState(defaultType);
  const [form, setForm] = useState({
    source: '', // for income
    category: '', // for expense
    amount: '',
    date: todayDate(),
    icon: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fieldLabels = {
    source: 'Income Source',
    category: 'Category',
    amount: 'Amount',
    date: 'Date',
  };

  const handleBlur = (key) => {
    const val = form[key];
    if (!val || String(val).trim() === '') {
      toast.error(`${fieldLabels[key] || 'Field'} is required`);
    }
  };

  const reset = () => {
    setForm({ source: '', category: '', amount: '', date: todayDate(), icon: '' });
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // validate required fields
    const required = type === 'income' ? ['source', 'amount', 'date'] : ['category', 'amount', 'date'];
    for (const k of required) {
      if (!form[k] || String(form[k]).trim() === '' || (k === 'amount' && Number(form.amount) <= 0)) {
        toast.error(`${fieldLabels[k] || 'Field'} is required`);
        return;
      }
    }
    setLoading(true);
    try {
      if (type === 'expense') {
        const payload = {
          category: form.category || 'General',
          amount: Number(form.amount),
          date: form.date || new Date(),
          icon: form.icon || '',
        };
  await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, payload);
      } else {
        const payload = {
          source: form.source || 'Income',
          amount: Number(form.amount),
          date: form.date || new Date(),
          icon: form.icon || '',
        };
  await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, payload);
      }

      reset();
      // show toast messages similar to AddIncome/AddExpense forms
      if (type === 'income') {
        toast.success('Income added');
      } else {
        toast.success('Expense added');
      }
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.error('Failed to add transaction', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add New Transaction`}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 rounded ${type === 'expense' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 rounded ${type === 'income' ? 'bg-black text-white' : 'bg-gray-100'}`}>
            Income
          </button>
        </div>

        {/* Emoji / Icon picker */}
        <EmojiPickerPopup icon={form.icon} onSelect={(ic) => handleChange('icon', ic)} />

        <form onSubmit={handleSubmit} className="space-y-3">
          {type === 'income' ? (
            <>
              <Input
                value={form.source}
                onChange={(e) => handleChange('source', e.target.value)}
                onBlur={() => handleBlur('source')}
                label="Income Source"
                placeholder="Freelance, Salary, etc."
              />
            </>
          ) : (
            <>
              <Input
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                onBlur={() => handleBlur('category')}
                label="Category"
                placeholder="Rent, Groceries, etc."
                type="text"
              />
            </>
          )}

          <Input
            value={form.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            onBlur={() => handleBlur('amount')}
            label="Amount"
            placeholder={type === 'income' ? 'Enter Income Amount' : 'Enter Amount'}
            type="number"
          />

          <Input
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            onBlur={() => handleBlur('date')}
            label={type === 'income' ? 'Income Date' : 'Date'}
            placeholder='Enter Date'
            type='date'
          />

          <div className='flex justify-end mt-6'>
            <button
              type='button'
              className='add-btn add-btn-fill'
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Adding...' : type === 'income' ? 'Add Income' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTransactionModal;
