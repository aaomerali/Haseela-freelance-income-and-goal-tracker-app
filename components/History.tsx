
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { TRANSLATIONS } from '../constants';

interface HistoryProps {
  state: AppState;
}

const History: React.FC<HistoryProps> = ({ state }) => {
  const t = TRANSLATIONS[state.language];
  const historyData = useMemo(() => {
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
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900">{t.archiveTitle}</h2>
      
      {historyData.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
          <i className="fas fa-folder-open text-5xl text-gray-200 mb-4"></i>
          <p className="text-gray-500">{t.noArchive}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyData.map((item, idx) => (
            <div key={`${item.year}-${item.month}`} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className={`flex items-center ${state.language === 'ar' ? 'gap-6' : 'gap-6'}`}>
                <div className="text-center bg-gray-50 px-4 py-2 rounded-xl min-w-[100px]">
                  <p className="text-xs text-gray-400 font-bold uppercase">{item.year}</p>
                  <p className="text-lg font-bold text-indigo-600">{t.months[item.month - 1]}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900">{state.currency}{item.earned.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">{t.achievedBalance}</span>
                  </div>
                  <p className="text-sm text-gray-500">{t.goal}: {state.currency}{item.targetAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end gap-2">
                 <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-6 rounded-full ${i < Math.round((item.earned / item.targetAmount) * 5) ? 'bg-green-400' : 'bg-gray-100'}`}
                      />
                    ))}
                 </div>
                 <span className={`text-xs font-bold ${item.earned >= item.targetAmount ? 'text-green-500' : 'text-gray-400'}`}>
                   {item.earned >= item.targetAmount ? t.targetReached : `${Math.round((item.earned/item.targetAmount)*100)}%`}
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
