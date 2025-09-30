import React from 'react';

// Fully responsive Bill list. Desktop: table view. Mobile: card list.
export default function BillList({ bills = [], loading = false, onEdit, onDelete, onPay, onPause, onResume, onAdd }) {
  const formatAmount = (amt) => {
    if (amt === null || amt === undefined) return '-';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(amt));
    } catch {
      return Number(amt).toLocaleString();
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');

  const statusBadge = (status) => {
    const s = (status || 'upcoming').toLowerCase();
    const map = {
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      due_today: 'bg-amber-100 text-amber-700',
      paused: 'bg-gray-200 text-gray-700',
      upcoming: 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${map[s] || 'bg-gray-100 text-gray-700'}`}>{s.replace('_',' ')}</span>;
  };

  const Recurrence = ({ b }) => (
    <span className="text-xs capitalize">{b.isRecurring && b.recurrenceType !== 'none' ? b.recurrenceType : '—'}</span>
  );

  const isOverdue = (b) => {
    if (!b?.dueDate) return false;
    const today = new Date();
    const due = new Date(b.dueDate);
    // strip time
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    return b.status?.toLowerCase() !== 'paid' && due < today;
  };

  const EmptyState = () => (
    <div className="text-center py-10">
      <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">💳</div>
      <p className="text-gray-700 font-medium">No bills found</p>
      <p className="text-gray-500 text-sm mt-1">Create your first bill to start tracking payments and reminders.</p>
      {onAdd && (
        <button onClick={onAdd} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">Add Bill</button>
      )}
    </div>
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="py-3 pr-2">
          <div className="h-3 bg-gray-200 rounded w-24" />
        </td>
      ))}
    </tr>
  );

  const MobileSkeletonCard = () => (
    <div className="animate-pulse border rounded-lg p-4">
      <div className="h-4 bg-gray-200 w-1/2 rounded mb-2" />
      <div className="h-3 bg-gray-200 w-1/3 rounded mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
      <div className="h-8 bg-gray-200 rounded" />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-5">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <h2 className="text-lg font-semibold">Bills</h2>
        <div className="ml-auto">
          <button onClick={onAdd} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Add Bill</button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading && (
          <>
            <MobileSkeletonCard />
            <MobileSkeletonCard />
          </>
        )}
        {!loading && bills.length === 0 && <EmptyState />}
        {!loading && bills.map((b) => (
          <div key={b._id} className={`border rounded-lg p-4 ${isOverdue(b) ? 'border-red-200' : 'border-gray-200'}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{b.title}</h3>
                  {statusBadge(b.status)}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{b.vendor || '—'}</p>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${isOverdue(b) ? 'text-red-600' : 'text-gray-900'}`}>{formatAmount(b.amount)}</div>
                <div className="text-xs text-gray-500">Due: {formatDate(b.dueDate)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <Recurrence b={b} />
              <div className="flex flex-wrap gap-2 justify-end">
                <button onClick={() => onEdit?.(b)} className="px-3 py-1.5 border rounded-md text-sm">Edit</button>
                <button onClick={() => onDelete?.(b)} className="px-3 py-1.5 border rounded-md text-sm text-red-600">Delete</button>
                {b.status !== 'paid' && (
                  <button onClick={() => onPay?.(b)} className="px-3 py-1.5 border rounded-md text-sm text-green-700">Pay</button>
                )}
                {b.status !== 'paused' ? (
                  <button onClick={() => onPause?.(b)} className="px-3 py-1.5 border rounded-md text-sm">Pause</button>
                ) : (
                  <button onClick={() => onResume?.(b)} className="px-3 py-1.5 border rounded-md text-sm">Resume</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3 pr-2 font-medium text-gray-600">Title</th>
              <th className="py-3 pr-2 font-medium text-gray-600">Vendor</th>
              <th className="py-3 pr-2 font-medium text-gray-600">Amount</th>
              <th className="py-3 pr-2 font-medium text-gray-600">Due Date</th>
              <th className="py-3 pr-2 font-medium text-gray-600">Status</th>
              <th className="py-3 pr-2 font-medium text-gray-600">Recurring</th>
              <th className="py-3 pr-2 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}
            {!loading && bills.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8">
                  <EmptyState />
                </td>
              </tr>
            )}
            {!loading && bills.map((b) => (
              <tr key={b._id} className={`border-b ${isOverdue(b) ? 'bg-red-50/30' : ''}`}>
                <td className="py-2 pr-2">{b.title}</td>
                <td className="py-2 pr-2">{b.vendor || '-'}</td>
                <td className="py-2 pr-2">{formatAmount(b.amount)}</td>
                <td className={`py-2 pr-2 ${isOverdue(b) ? 'text-red-600 font-medium' : ''}`}>{formatDate(b.dueDate)}</td>
                <td className="py-2 pr-2">{statusBadge(b.status)}</td>
                <td className="py-2 pr-2"><Recurrence b={b} /></td>
                <td className="py-2 pr-2">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit?.(b)} className="px-3 py-1.5 border rounded-md">Edit</button>
                    <button onClick={() => onDelete?.(b)} className="px-3 py-1.5 border rounded-md text-red-600">Delete</button>
                    {b.status !== 'paid' && (
                      <button onClick={() => onPay?.(b)} className="px-3 py-1.5 border rounded-md text-green-700">Pay</button>
                    )}
                    {b.status !== 'paused' ? (
                      <button onClick={() => onPause?.(b)} className="px-3 py-1.5 border rounded-md">Pause</button>
                    ) : (
                      <button onClick={() => onResume?.(b)} className="px-3 py-1.5 border rounded-md">Resume</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
