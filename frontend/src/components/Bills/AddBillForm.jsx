import React, { useEffect, useMemo, useState } from 'react';

const defaultValues = {
  title: '',
  vendor: '',
  amount: '',
  dueDate: '',
  notes: '',
  category: '',
  // recurrence
  isRecurring: false,
  recurrenceType: 'none',
  customIntervalDays: '',
  recurUntil: '',
  // reminders
  remindersEnabled: true,
  remindDaysBefore: '7,3,1', // comma-separated in UI
  remindAtHourLocal: 9,
  timezone: 'Asia/Kolkata',
};

export default function AddBillForm({ initialValues, onAddBill, onSubmit, submitLabel = 'Add Bill' }) {
  const init = useMemo(() => ({ ...defaultValues, ...normalizeInitial(initialValues) }), [initialValues]);
  const [form, setForm] = useState(init);
  const browserTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata', []);

  useEffect(() => {
    setForm(init);
  }, [init]);

  function normalizeInitial(values) {
    if (!values) return {};
    const v = { ...values };
    if (v.dueDate) {
      try { v.dueDate = new Date(v.dueDate).toISOString().slice(0,10); } catch (err) { /* ignore invalid date */ void err; }
    }
    if (Array.isArray(v.remindDaysBefore)) {
      v.remindDaysBefore = v.remindDaysBefore.join(',');
    }
    if (typeof v.isRecurring !== 'boolean') v.isRecurring = Boolean(v.isRecurring);
    if (!v.recurrenceType) v.recurrenceType = v.isRecurring ? 'monthly' : 'none';
    return v;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isRecurring' && !checked ? { recurrenceType: 'none', customIntervalDays: '' } : {}),
      ...(name === 'recurrenceType' && value !== 'custom' ? { customIntervalDays: '' } : {}),
    }));
  };

  const commonTimezones = [
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Singapore',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles',
    'Australia/Sydney',
    'UTC',
  ];

  const localTimePreview = useMemo(() => {
    try {
      const fmt = new Intl.DateTimeFormat('en-IN', { timeZone: form.timezone || 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
      return fmt.format(new Date());
    } catch {
      return '';
    }
  }, [form.timezone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      vendor: form.vendor?.trim(),
      amount: Number(form.amount),
      dueDate: form.dueDate,
      notes: form.notes?.trim(),
      category: form.category?.trim(),
      // recurrence mapping
      isRecurring: Boolean(form.isRecurring) && form.recurrenceType !== 'none',
      recurrenceType: form.isRecurring ? form.recurrenceType : 'none',
      customIntervalDays: form.isRecurring && form.recurrenceType === 'custom' ? (form.customIntervalDays ? Number(form.customIntervalDays) : null) : null,
      recurUntil: form.recurUntil || null,
      // reminders
      remindersEnabled: Boolean(form.remindersEnabled),
      remindDaysBefore: (form.remindDaysBefore || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n)),
      remindAtHourLocal: Number(form.remindAtHourLocal),
      timezone: form.timezone || 'Asia/Kolkata',
    };

    if (onSubmit) return onSubmit(payload);
    if (onAddBill) return onAddBill(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vendor</label>
          <input name="vendor" value={form.vendor} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" min="0" name="amount" value={form.amount} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input name="category" value={form.category} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
          <span>Make this recurring</span>
        </label>
        {form.isRecurring && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Recurrence Type</label>
              <select name="recurrenceType" value={form.recurrenceType} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom (days)</option>
                <option value="none">None</option>
              </select>
            </div>
            {form.recurrenceType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Interval (days)</label>
                <input type="number" min="1" name="customIntervalDays" value={form.customIntervalDays} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Repeat Until</label>
              <input type="date" name="recurUntil" value={form.recurUntil} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-4">
        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" name="remindersEnabled" checked={form.remindersEnabled} onChange={handleChange} />
          <span>Enable reminders</span>
        </label>
        {form.remindersEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Days Before (comma sep)</label>
              <input name="remindDaysBefore" value={form.remindDaysBefore} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="7,3,1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remind Hour (local 0-23)</label>
              <input type="number" min="0" max="23" name="remindAtHourLocal" value={form.remindAtHourLocal} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-500 mt-1">Reminders will be sent at this hour in the selected timezone.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select name="timezone" value={form.timezone} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[form.timezone, ...commonTimezones].filter((v, i, arr) => arr.indexOf(v) === i).map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => setForm((p) => ({ ...p, timezone: browserTz }))} className="text-xs text-blue-600 hover:underline">Use browser timezone ({browserTz})</button>
                <span className="text-xs text-gray-500">Local time now: {localTimePreview || '—'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
