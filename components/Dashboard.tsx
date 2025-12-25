
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { MONTH_NAMES_AR } from '../constants';

interface DashboardProps {
  state: AppState;
  onClientClick: (id: string) => void;
  onSetGoalClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onClientClick, onSetGoalClick }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const currentGoal = useMemo(() => {
    return state.goals.find(g => g.month === currentMonth && g.year === currentYear);
  }, [state.goals, currentMonth, currentYear]);

  const monthEarnings = useMemo(() => {
    let total = 0;
    state.clients.forEach(client => {
      client.tasks.forEach(task => {
        if (task.isCompleted && task.completedAt) {
          const completedDate = new Date(task.completedAt);
          if (completedDate.getMonth() + 1 === currentMonth && completedDate.getFullYear() === currentYear) {
            total += task.price;
          }
        }
      });
    });
    return total;
  }, [state.clients, currentMonth, currentYear]);

  const totalClientsEarnings = useMemo(() => {
    return state.clients.map(client => {
      const earned = client.tasks
        .filter(t => t.isCompleted)
        .reduce((sum, t) => sum + t.price, 0);
      return { ...client, totalEarned: earned };
    }).sort((a, b) => b.totalEarned - a.totalEarned);
  }, [state.clients]);

  const progressPercentage = currentGoal 
    ? Math.min(Math.round((monthEarnings / currentGoal.targetAmount) * 100), 100)
    : 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      {/* Greetings */}
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-900">أهلاً بك 👋</h2>
          <p className="text-slate-400 text-sm font-medium">ملخص شهر {MONTH_NAMES_AR[currentMonth - 1]}</p>
        </div>
        <div className="flex flex-col items-end">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-1">
              <i className="fas fa-shield-alt text-lg"></i>
            </div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">بياناتك آمنة محلياً</span>
        </div>
      </div>

      {/* Main Visual Progress Card */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-indigo-100 text-sm font-bold mb-1 uppercase tracking-wider">الرصيد المحقق</p>
          <h3 className="text-5xl font-black mb-6 tracking-tighter">{state.currency}{monthEarnings.toLocaleString()}</h3>
          
          <div className="w-full bg-indigo-700/50 h-3 rounded-full overflow-hidden mb-4 border border-white/5">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between w-full text-[10px] font-black text-indigo-100 uppercase tracking-wide">
             <span>الهدف: {state.currency}{currentGoal?.targetAmount.toLocaleString() || 0}</span>
             <span className="bg-white/20 px-3 py-1 rounded-full">{progressPercentage}%</span>
          </div>
        </div>

        <button 
          onClick={onSetGoalClick}
          className="absolute top-6 left-6 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all btn-active"
        >
          <i className="fas fa-pencil-alt text-xs"></i>
        </button>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <i className="fas fa-check-circle"></i>
          </div>
          <span className="text-slate-400 text-xs font-bold">المهام المنجزة</span>
          <span className="text-xl font-black text-slate-800">
            {state.clients.reduce((acc, c) => acc + c.tasks.filter(t => t.isCompleted).length, 0)}
          </span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col shadow-sm">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <span className="text-slate-400 text-xs font-bold">المهام الجارية</span>
          <span className="text-xl font-black text-slate-800">
            {state.clients.reduce((acc, c) => acc + c.tasks.filter(t => !t.isCompleted).length, 0)}
          </span>
        </div>
      </div>

      {/* Recent Clients Scroll */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black text-slate-800">أفضل العملاء</h3>
          <button className="text-indigo-600 text-xs font-bold">عرض الكل</button>
        </div>
        
        <div className="space-y-3">
          {totalClientsEarnings.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
              <p className="text-slate-400 text-sm font-medium">ابدأ بإضافة عملاء لتظهر بياناتهم هنا</p>
            </div>
          ) : (
            totalClientsEarnings.slice(0, 4).map(client => (
              <div 
                key={client.id}
                onClick={() => onClientClick(client.id)}
                className="bg-white p-4 rounded-3xl border border-slate-50 flex items-center justify-between shadow-sm btn-active cursor-pointer"
              >
                <div className="flex items-center gap-4 text-right">
                  <div className={`w-12 h-12 ${client.color} rounded-2xl flex items-center justify-center text-white text-lg`}>
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{client.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{client.tasks.length} مهام</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-slate-900">{state.currency}{client.totalEarned.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Security Info */}
      <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex items-start gap-4">
        <div className="text-emerald-500 mt-1">
          <i className="fas fa-lock"></i>
        </div>
        <p className="text-emerald-800 text-[11px] leading-relaxed font-bold">
          خصوصية بياناتك أولويتنا: يتم تخزين كافة بياناتك ومبالغك المالية محلياً على هاتفك فقط، ولا يتم إرسالها لأي خوادم خارجية.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
