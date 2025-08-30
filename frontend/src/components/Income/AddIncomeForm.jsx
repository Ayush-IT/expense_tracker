import React, { useEffect, useState } from 'react'
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddIncomeForm = ({ onAddIncome, onSubmit, initialValues, submitLabel }) => {
    const [income, setIncome] = useState({
        source: '',
        amount: '',
        date: '',
        icon: '',
    });

    useEffect(() => {
        if (initialValues) {
            setIncome({
                source: initialValues.source || '',
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