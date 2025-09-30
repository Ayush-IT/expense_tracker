import React, { useEffect, useState } from 'react'
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddExpenseForm = ({ onAddExpense, onSubmit, initialValues, submitLabel }) => {
    const [expense, setExpense] = useState({
        category: '',
        amount: '',
        date: '',
        icon: '',
        isRecurring: false,
        recurrenceType: 'none', // 'none' | 'weekly' | 'monthly' | 'custom'
        customIntervalDays: '',
        recurUntil: '',
    });

    useEffect(() => {
        if (initialValues) {
            setExpense({
                category: initialValues.category || '',
                amount: initialValues.amount ?? '',
                date: initialValues.date || '',
                icon: initialValues.icon || '',
                isRecurring: !!initialValues.isRecurring,
                recurrenceType: initialValues.recurrenceType || 'none',
                customIntervalDays: initialValues.customIntervalDays ?? '',
                recurUntil: initialValues.recurUntil || '',
            });
        }
    }, [initialValues]);

    const handleChange = (key, value) => {
        setExpense(prev => ({
            ...prev,
            [key]: value
        }));
    };
  return (
    <div>
      <EmojiPickerPopup
        icon={expense.icon}
        onSelect={(selectedIcon) => handleChange('icon', selectedIcon)}
      />    

      <Input
        value={expense.category}
        onChange={(e) => handleChange('category', e.target.value)}
        label="Category"
        placeholder='Rent, Groceries, etc.'
        type='text'
      />

      <Input
        value={expense.amount}
        onChange={(e) => handleChange('amount', e.target.value)}
        label="Amount"
        placeholder='Enter Amount'
        type='number'
      />

      <Input
        value={expense.date}
        onChange={(e) => handleChange('date', e.target.value)}
        label="Date"
        placeholder='Enter Date'
        type='date'
      />

      {/* Recurrence controls */}
      <div className='mt-4 space-y-3'>
        <label className='flex items-center gap-2 text-sm'>
          <input
            type='checkbox'
            checked={!!expense.isRecurring && expense.recurrenceType !== 'none'}
            onChange={(e) => {
              const checked = e.target.checked;
              handleChange('isRecurring', checked);
              if (!checked) {
                handleChange('recurrenceType', 'none');
              } else if (expense.recurrenceType === 'none') {
                handleChange('recurrenceType', 'monthly');
              }
            }}
          />
          Make this a recurring expense
        </label>

        { (expense.isRecurring && expense.recurrenceType !== 'none') && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm mb-1'>Recurrence Type</label>
              <select
                className='w-full border rounded px-3 py-2'
                value={expense.recurrenceType}
                onChange={(e) => handleChange('recurrenceType', e.target.value)}
              >
                <option value='weekly'>Weekly</option>
                <option value='monthly'>Monthly</option>
                <option value='custom'>Custom (days)</option>
                <option value='none'>None</option>
              </select>
            </div>

            {expense.recurrenceType === 'custom' && (
              <Input
                value={expense.customIntervalDays}
                onChange={(e) => handleChange('customIntervalDays', e.target.value)}
                label='Custom Interval (days)'
                placeholder='e.g., 10'
                type='number'
              />
            )}

            <Input
              value={expense.recurUntil}
              onChange={(e) => handleChange('recurUntil', e.target.value)}
              label='Repeat Until (optional)'
              placeholder=''
              type='date'
            />
          </div>
        )}
      </div>

      <div className='flex justify-end mt-6'>
        <button
          type='button'
          className='add-btn add-btn-fill'
          onClick={() => (onSubmit ? onSubmit(expense) : onAddExpense && onAddExpense(expense))}
        >
          {submitLabel || 'Add Expense'}
        </button>
      </div>
    </div>
  )
}

export default AddExpenseForm
