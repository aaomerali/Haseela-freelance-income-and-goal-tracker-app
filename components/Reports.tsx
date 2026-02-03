
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { TRANSLATIONS } from '../constants';

interface ReportsProps {
  state: AppState;
}

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const t = TRANSLATIONS[state.language];

  const totalIncomeAllTime = useMemo(() => {
    let total = 0;
    state.clients.forEach(c => {
      c.tasks.forEach(t => {
        if (t.isCompleted) total += t.price;
      });
    });
    return total;
  }, [state.clients]);

  const avgMonthly = useMemo(() => {
    if (state.goals.length === 0) return 0;
    return totalIncomeAllTime / state.goals.length;
  }, [totalIncomeAllTime, state.goals]);

  const clientDistribution = useMemo(() => {
    const data = state.clients.map(c => {
      const earned = c.tasks.filter(t => t.isCompleted).reduce((sum, t) => sum + t.price, 0);
      return { name: c.name, earned, color: c.color };
    }).filter(d => d.earned > 0).sort((a, b) => b.earned - a.earned);
    return data;
  }, [state.clients]);

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      let earned = 0;
      state.clients.forEach(c => {
        c.tasks.forEach(t => {
          if (t.isCompleted && t.completedAt) {
            const compDate = new Date(t.completedAt);
            if (compDate.getMonth() + 1 === m && compDate.getFullYear() === y) {
              earned += t.price;
            }
          }
        });
      });
      months.push({ label: t.months[m - 1], earned });
    }
    return months;
  }, [state.clients, t]);

  const maxEarned = Math.max(...monthlyData.map(m => m.earned), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900">{t.performanceReports} 📈</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">{t.totalIncome}</p>
          <p className="text-2xl font-black text-indigo-600">{state.currency}{totalIncomeAllTime.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">{t.monthlyAvg}</p>
          <p className="text-2xl font-black text-green-500">{state.currency}{Math.round(avgMonthly).toLocaleString()}</p>
        </div>
      </div>

      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-800 mb-8">{t.last6Months}</h3>
        <div className="flex items-end justify-between h-40 gap-2">
          {monthlyData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full flex justify-center items-end h-full">
                <div 
                  className={`w-full max-w-xs rounded-t-lg transition-all duration-1000 ${idx === 5 ? 'bg-indigo-600' : 'bg-indigo-100'}`}
                  style={{ height: `${(data.earned / maxEarned) * 100}%`, minHeight: '4px' }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 mt-3">{data.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-800 mb-6">{t.incomeDistribution}</h3>
        {clientDistribution.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">...</p>
        ) : (
          <div className="space-y-4">
            {clientDistribution.map((client, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">{client.name}</span>
                  <span className="text-gray-500 font-medium">
                    {state.currency}{client.earned.toLocaleString()} ({Math.round((client.earned / totalIncomeAllTime) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${client.color} rounded-full`}
                    style={{ width: `${(client.earned / totalIncomeAllTime) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
        <div className="flex items-center gap-3 mb-2">
          <i className="fas fa-magic text-indigo-500"></i>
          <h4 className="font-black text-indigo-900 text-sm">{t.smartAnalysis}</h4>
        </div>
        <p className="text-indigo-700 text-xs leading-relaxed">
          {clientDistribution.length > 0 ? (
             state.language === 'ar' 
             ? `العميل "${clientDistribution[0].name}" هو المصدر الأساسي لدخلك حالياً، يمثل ${Math.round((clientDistribution[0].earned / totalIncomeAllTime) * 100)}% من إجمالي أرباحك.`
             : `Client "${clientDistribution[0].name}" is currently your primary source of income, representing ${Math.round((clientDistribution[0].earned / totalIncomeAllTime) * 100)}% of your total earnings.`
          ) : (
            "..."
          )}
        </p>
      </div>
    </div>
  );
};

export default Reports;
