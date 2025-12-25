
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { MONTH_NAMES_AR } from '../constants';

interface HistoryProps {
  state: AppState;
}

const History: React.FC<HistoryProps> = ({ state }) => {
  const historyData = useMemo(() => {
    // Sort goals by date descending
    const sortedGoals = [...state.goals].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    return sortedGoals.map(goal => {
      let earned = 0;
      state.clients.forEach(client => {
        client.tasks.forEach(task => {
          if (task.isCompleted && task.completedAt) {
            const date = new Date(task.completedAt);
            if (date.getMonth() + 1 === goal.month && date.getFullYear() === goal.year) {
              earned += task.price;
            }
          }
        });
      });
      return { ...goal, earned };
    });
  }, [state]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-slate-900">أرشيف الأرباح</h2>
      
      {historyData.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <i className="fas fa-folder-open text-5xl text-slate-200 mb-4"></i>
          <p className="text-slate-500">لا يوجد بيانات مؤرشفة حتى الآن.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyData.map((item, idx) => (
            <div key={`${item.year}-${item.month}`} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center bg-slate-50 px-4 py-2 rounded-xl min-w-[100px]">
                  <p className="text-xs text-slate-400 font-bold uppercase">{item.year}</p>
                  <p className="text-lg font-bold text-indigo-600">{MONTH_NAMES_AR[item.month - 1]}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-slate-900">${item.earned.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">محقق</span>
                  </div>
                  <p className="text-sm text-slate-500">الهدف: ${item.targetAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end gap-2">
                 <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-6 rounded-full ${i < Math.round((item.earned / item.targetAmount) * 5) ? 'bg-emerald-400' : 'bg-slate-100'}`}
                      />
                    ))}
                 </div>
                 <span className={`text-xs font-bold ${item.earned >= item.targetAmount ? 'text-emerald-500' : 'text-slate-400'}`}>
                   {item.earned >= item.targetAmount ? 'تم تحقيق الهدف ✓' : `${Math.round((item.earned/item.targetAmount)*100)}% من الهدف`}
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
