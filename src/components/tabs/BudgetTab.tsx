import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { ExpenseItem, ExpenseCategory } from '../../types/travel';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Plane,
  Train,
  Hotel,
  Utensils,
  Ticket,
  ShoppingBag,
  HeartPulse,
  Package,
  Trash2,
  Edit2,
  Calendar,
  X,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';

const EXPENSE_CATEGORIES: {
  id: ExpenseCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: 'flight', label: 'Vé máy bay', icon: <Plane className="w-3.5 h-3.5" />, color: '#B83A2E' },
  { id: 'transport', label: 'Di chuyển & Tàu xe', icon: <Train className="w-3.5 h-3.5" />, color: '#3B82F6' },
  { id: 'hotel', label: 'Khách sạn / Lưu trú', icon: <Hotel className="w-3.5 h-3.5" />, color: '#8B5CF6' },
  { id: 'food', label: 'Ăn uống ẩm thực', icon: <Utensils className="w-3.5 h-3.5" />, color: '#F59E0B' },
  { id: 'ticket', label: 'Vé tham quan', icon: <Ticket className="w-3.5 h-3.5" />, color: '#10B981' },
  { id: 'shopping', label: 'Mua sắm & Quà', icon: <ShoppingBag className="w-3.5 h-3.5" />, color: '#EC4899' },
  { id: 'personal', label: 'Chi phí cá nhân', icon: <HeartPulse className="w-3.5 h-3.5" />, color: '#06B6D4' },
  { id: 'other', label: 'Khoản chi khác', icon: <Package className="w-3.5 h-3.5" />, color: '#6B7280' },
];

export const BudgetTab: React.FC = () => {
  const {
    activeTrip,
    expenses,
    stats,
    formatCurrency,
    addExpense,
    updateExpense,
    deleteExpense,
    updateBudgetGoal,
    showToast,
  } = useTravel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(stats.totalBudget.toString());

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  if (!activeTrip) {
    return (
      <EmptyState
        icon="💰"
        title="Chưa có chuyến đi nào"
        description="Vui lòng tạo hoặc chọn một chuyến đi để quản lý ngân sách chi tiêu."
      />
    );
  }

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory('food');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    setAmount(exp.amount.toString());
    setDate(exp.date);
    setNote(exp.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      showToast('⚠️ Vui lòng nhập tên khoản chi và số tiền hợp lệ', 'warning');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title: title.trim(),
        category,
        amount: numAmount,
        date,
        note: note.trim() || undefined,
      });
    } else {
      addExpense({
        title: title.trim(),
        category,
        amount: numAmount,
        date,
        note: note.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const g = Number(tempGoal);
    if (isNaN(g) || g < 0) {
      showToast('⚠️ Số tiền ngân sách không hợp lệ', 'warning');
      return;
    }
    updateBudgetGoal(g);
    setIsEditingGoal(false);
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Group expenses by category for breakdown
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat.id)
      .reduce((sum, item) => sum + item.amount, 0);
    const percentage = stats.totalSpent > 0 ? Math.round((total / stats.totalSpent) * 100) : 0;
    return { ...cat, total, percentage };
  }).filter((c) => c.total > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="hanko-stamp text-xs px-1.5 py-0.5">予算</span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Quản lý ngân sách & Chi phí
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Kiểm soát chi tiêu, theo dõi số tiền đã chi và số dư còn lại trong chuyến đi
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-medium rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khoản chi</span>
        </button>
      </div>

      {/* Top 3 Metric Cards (Mục XV.3: Ngân sách dự kiến, Đã chi, Còn lại) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Ngân sách dự kiến */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs relative">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>Ngân sách dự kiến</span>
            <button
              onClick={() => {
                setTempGoal(stats.totalBudget.toString());
                setIsEditingGoal(!isEditingGoal);
              }}
              className="text-[#B83A2E] hover:underline text-[11px] font-medium"
            >
              {isEditingGoal ? 'Đóng' : 'Chỉnh sửa'}
            </button>
          </div>

          {isEditingGoal ? (
            <form onSubmit={handleSaveGoal} className="mt-1 flex gap-2">
              <input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm font-mono"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#1A2238] text-white rounded text-xs"
              >
                Lưu
              </button>
            </form>
          ) : (
            <div className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
              {formatCurrency(stats.totalBudget)}
            </div>
          )}
          <p className="text-[11px] text-stone-400 mt-1">Hạn mức kế hoạch đề ra</p>
        </div>

        {/* Card 2: Đã chi */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>Đã chi tiêu</span>
            <span className="font-mono font-bold text-stone-700">
              {stats.spentPercentage}% ngân sách
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-[#B83A2E] tabular-nums">
            {formatCurrency(stats.totalSpent)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Tổng cộng {expenses.length} khoản chi đã ghi nhận
          </p>
        </div>

        {/* Card 3: Còn lại */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>Số tiền còn lại</span>
            <span
              className={`text-[11px] font-bold ${
                stats.remainingBudget > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {stats.remainingBudget > 0 ? 'Trong hạn mức' : 'Vượt ngân sách'}
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            {formatCurrency(stats.remainingBudget)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Khả dụng cho các hoạt động tiếp theo</p>
        </div>
      </div>

      {/* Budget Category Proportion Bar & Breakdown */}
      {stats.totalSpent > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-base font-bold text-stone-900">
              Tỷ lệ chi tiêu theo nhóm chi phí
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              Tổng {formatCurrency(stats.totalSpent)}
            </span>
          </div>

          {/* Multi-segmented progress bar */}
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
            {categoryTotals.map((cat) => (
              <div
                key={cat.id}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
                title={`${cat.label}: ${cat.percentage}% (${formatCurrency(cat.total)})`}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              />
            ))}
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {categoryTotals.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <div className="text-xs font-medium text-stone-800 leading-tight">
                      {cat.label}
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono">
                      {cat.percentage}%
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-stone-900 text-right tabular-nums">
                  {formatCurrency(cat.total)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-editorial text-lg font-bold text-stone-900">
            Danh sách các khoản chi tiêu
          </h3>
          <span className="text-xs text-stone-500">
            {expenses.length} khoản chi
          </span>
        </div>

        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-28">Ngày</th>
                  <th className="py-3.5 px-4">Tên khoản chi</th>
                  <th className="py-3.5 px-4 w-36">Loại chi phí</th>
                  <th className="py-3.5 px-4 w-36 text-right">Số tiền</th>
                  <th className="py-3.5 px-4 w-20 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {expenses.map((item) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.id === item.category);
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-stone-600 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{formatDateDisplay(item.date)}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900 text-sm">
                          {item.title}
                        </div>
                        {item.note && (
                          <p className="text-stone-500 text-xs mt-0.5">{item.note}</p>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                          {cat?.icon}
                          <span>{cat?.label || item.category}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900 text-sm tabular-nums whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100"
                            title="Sửa khoản chi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100"
                            title="Xóa khoản chi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="💰"
            title="Chưa có khoản chi tiêu nào"
            description="Hãy ghi lại vé máy bay, tiền khách sạn, vé tàu Shinkansen hoặc chi phí ăn uống để kiểm soát tài chính."
            actionLabel="Thêm khoản chi"
            onAction={handleOpenAdd}
          />
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              {editingExpense ? 'Chỉnh sửa khoản chi' : 'Thêm khoản chi mới'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Ghi chép số tiền, loại phí và chi tiết chi tiêu trong chuyến đi
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Tên khoản chi <span className="text-[#B83A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Vé tàu Shinkansen chặng Tokyo - Kyoto"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Loại chi phí
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Số tiền (VNĐ) <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1800000"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Ngày chi tiêu
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Ghi chú thêm
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú vé hãng nào, thanh toán tiền mặt hay thẻ..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#B83A2E] hover:bg-[#96291F] rounded-lg"
                >
                  {editingExpense ? 'Lưu thay đổi' : 'Ghi nhận chi phí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Xóa khoản chi tiêu"
        message="Bạn có chắc chắn muốn xóa khoản chi này khỏi sổ ngân sách không?"
        confirmLabel="Xóa khoản chi"
        onConfirm={() => {
          if (deleteTargetId) deleteExpense(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
