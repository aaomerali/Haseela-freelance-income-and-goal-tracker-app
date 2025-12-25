
import React, { useState } from 'react';

interface GoalModalProps {
  currentGoal: number;
  onSave: (amount: number) => void;
  onClose: () => void;
  isFirstGoal: boolean;
}

const GoalModal: React.FC<GoalModalProps> = ({ currentGoal, onSave, onClose, isFirstGoal }) => {
  const [amount, setAmount] = useState(currentGoal > 0 ? currentGoal.toString() : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!isNaN(num) && num > 0) {
      onSave(num);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-bullseye text-indigo-600 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isFirstGoal ? 'حدد هدفك المالي لهذا الشهر' : 'تعديل الهدف المالي'}
          </h2>
          <p className="text-gray-500 mt-2">كم تريد أن تجني في هذا الشهر؟</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-300">$</span>
            <input 
              autoFocus
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-6 py-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white text-3xl font-bold text-center transition-all outline-none"
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {!isFirstGoal && (
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
            )}
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              {isFirstGoal ? 'بدء التتبع' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
