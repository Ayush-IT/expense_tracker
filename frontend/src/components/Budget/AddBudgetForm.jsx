import React, { useState } from 'react';

const monthOptions = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const current = new Date();

const AddBudgetForm = ({ onCreate, categories = [], initialValues, submitLabel = 'Create Budget' }) => {
  const [form, setForm] = useState({
    category: initialValues?.category ?? 'ALL',
    month: initialValues?.month ?? current.getMonth() + 1,
    year: initialValues?.year ?? current.getFullYear(),
    amount: initialValues?.amount ?? '',
    thresholdPercent: initialValues?.thresholdPercent ?? 80,
  });
  const [customCategory, setCustomCategory] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCategory = form.category === '__custom__'
      ? (customCategory.trim() || 'ALL')
      : (form.category.trim() || 'ALL');
    onCreate?.({
      category: finalCategory,
      month: Number(form.month),
      year: Number(form.year),
      amount: Number(form.amount),
      thresholdPercent: Number(form.thresholdPercent) || 80,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="category"
          className="w-full border border-gray-300 rounded px-3 py-3 text-sm"
          value={form.category}
          onChange={handleChange}
        >
          <option value="ALL">ALL (Overall)</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="__custom__">Custom…</option>
        </select>
        {form.category === '__custom__' && (
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-2"
            placeholder="Enter custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Month</label>
          <select
            name="month"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.month}
            onChange={handleChange}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <input
            type="number"
            name="year"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.year}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.amount}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Threshold %</label>
          <input
            type="number"
            name="thresholdPercent"
            min="1"
            max="100"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.thresholdPercent}
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary w-full py-3">{submitLabel}</button>
    </form>
  );
};

export default AddBudgetForm;
