import React, { useEffect, useState } from 'react'
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddExpenseForm = ({ onAddExpense, onSubmit, initialValues, submitLabel }) => {
    const [income, setIncome] = useState({
        category: '',
        amount: '',
        date: '',
        icon: '',
    });

    useEffect(() => {
        if (initialValues) {
            setIncome({
                category: initialValues.category || '',
                amount: initialValues.amount ?? '',
                date: initialValues.date || '',
                icon: initialValues.icon || '',
            });
        }
    }, [initialValues]);

    const handleChange = (key, value) => {
        setIncome(prev => ({
            ...prev,
            [key]: value
        }));
    };
  return (
    <div>
      <EmojiPickerPopup
        icon={income.icon}
        onSelect={(selectedIcon) => handleChange('icon', selectedIcon)}
      />    

      <Input
        value={income.category}
        onChange={(e) => handleChange('category', e.target.value)}
        label="Category"
        placeholder='Rent, Groceries, etc.'
        type='text'
      />

      <Input
        value={income.amount}
        onChange={(e) => handleChange('amount', e.target.value)}
        label="Amount"
        placeholder='Enter Amount'
        type='number'
      />

      <Input
        value={income.date}
        onChange={(e) => handleChange('date', e.target.value)}
        label="Date"
        placeholder='Enter Date'
        type='date'
      />

      <div className='flex justify-end mt-6'>
        <button
          type='button'
          className='add-btn add-btn-fill'
          onClick={() => (onSubmit ? onSubmit(income) : onAddExpense && onAddExpense(income))}
        >
          {submitLabel || 'Add Expense'}
        </button>
      </div>
    </div>
  )
}

export default AddExpenseForm
