import React, { useState } from 'react';
import { LuCalendar, LuDollarSign, LuTarget, LuTags, LuCircleHelp } from 'react-icons/lu';


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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <LuTags className="text-blue-500" />
          Category
        </label>
        <select
          name="category"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
          value={form.category}
          onChange={handleChange}
        >
          <option value="ALL">ALL (Overall Budget)</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="__custom__">Custom Category...</option>
        </select>
        {form.category === '__custom__' && (
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            placeholder="Enter custom category name"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}
      </div>

      {/* Month and Year Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <LuCalendar className="text-green-500" />
            Month
          </label>
          <select
            name="month"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
            value={form.month}
            onChange={handleChange}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <LuCalendar className="text-green-500" />
            Year
          </label>
          <input
            type="number"
            name="year"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
            value={form.year}
            onChange={handleChange}
            min={current.getFullYear() - 5}
            max={current.getFullYear() + 5}
          />
        </div>
      </div>

      {/* Amount and Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <LuDollarSign className="text-purple-500" />
            Budget Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="amount"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <LuTarget className="text-orange-500" />
            Alert Threshold
          </label>
          <div className="relative">
            <input
              type="number"
              name="thresholdPercent"
              min="1"
              max="100"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
              value={form.thresholdPercent}
              onChange={handleChange}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <LuCircleHelp className="text-orange-400" />
            You'll be notified when spending reaches this percentage
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default AddBudgetForm;
