import React, { useEffect, useState } from 'react'
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddIncomeForm = ({ onAddIncome, onSubmit, initialValues, submitLabel }) => {
    const [income, setIncome] = useState({
        source: '',
        amount: '',
        date: '',
        icon: '',
        isRecurring: false,
        recurrenceType: 'none',
        customIntervalDays: '',
        recurUntil: '',
    });

    useEffect(() => {
        if (initialValues) {
            setIncome({
                source: initialValues.source || '',
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
                value={income.source}
                onChange={(e) => handleChange('source', e.target.value)}
                label="Income Source"
                placeholder='Freelance, Salary, etc.'
            />

            <Input
                value={income.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                label="Amount"
                placeholder='Enter Income Amount'
                type='number'
            />

            <Input
                value={income.date}
                onChange={(e) => handleChange('date', e.target.value)}
                label="Income Date"
                placeholder='Enter Income Date'
                type='date'
            />

            {/* Recurrence controls */}
            <div className='mt-4 space-y-3'>
                <label className='flex items-center gap-2 text-sm'>
                    <input
                        type='checkbox'
                        checked={!!income.isRecurring && income.recurrenceType !== 'none'}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            handleChange('isRecurring', checked);
                            if (!checked) {
                                handleChange('recurrenceType', 'none');
                            } else if (income.recurrenceType === 'none') {
                                handleChange('recurrenceType', 'monthly');
                            }
                        }}
                    />
                    Make this a recurring income
                </label>

                {(income.isRecurring && income.recurrenceType !== 'none') && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-sm mb-1'>Recurrence Type</label>
                            <select
                                className='w-full border rounded px-3 py-2'
                                value={income.recurrenceType}
                                onChange={(e) => handleChange('recurrenceType', e.target.value)}
                            >
                                <option value='weekly'>Weekly</option>
                                <option value='monthly'>Monthly</option>
                                <option value='custom'>Custom (days)</option>
                                <option value='none'>None</option>
                            </select>
                        </div>

                        {income.recurrenceType === 'custom' && (
                            <Input
                                value={income.customIntervalDays}
                                onChange={(e) => handleChange('customIntervalDays', e.target.value)}
                                label='Custom Interval (days)'
                                placeholder='e.g., 10'
                                type='number'
                            />
                        )}

                        <Input
                            value={income.recurUntil}
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
                    onClick={() => (onSubmit ? onSubmit(income) : onAddIncome && onAddIncome(income))}
                >
                    {submitLabel || 'Add Income'}
                </button>
            </div>
        </div>
    );
};

export default AddIncomeForm;