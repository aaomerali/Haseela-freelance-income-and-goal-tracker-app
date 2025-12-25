
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">أهلاً بك 👋</h2>
          <p className="text-gray-400 text-sm">ملخص شهر {MONTH_NAMES_AR[currentMonth - 1]}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <i className="fas fa-shield-alt text-lg"></i>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-indigo-100 text-sm font-bold mb-1 uppercase">الرصيد المحقق</p>
          <h3 className="text-5xl font-extrabold mb-6 tracking-tighter">{state.currency}{monthEarnings.toLocaleString()}</h3>
          <div className="w-full bg-indigo-700 bg-opacity-50 h-3 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="flex justify-between w-full text-xs font-bold text-indigo-100">
             <span>الهدف: {state.currency}{currentGoal?.targetAmount.toLocaleString() || 0}</span>
             <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">{progressPercentage}%</span>
          </div>
        </div>
        <button onClick={onSetGoalClick} className="absolute top-6 left-6 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center btn-active">
          <i className="fas fa-pencil-alt text-xs"></i>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
            <i className="fas fa-check-circle"></i>
          </div>
          <span className="text-gray-400 text-xs font-bold">المنجزة</span>
          <span className="block text-xl font-bold text-gray-800">
            {state.clients.reduce((acc, c) => acc + c.tasks.filter(t => t.isCompleted).length, 0)}
          </span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-3">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <span className="text-gray-400 text-xs font-bold">الجارية</span>
          <span className="block text-xl font-bold text-gray-800">
            {state.clients.reduce((acc, c) => acc + c.tasks.filter(t => !t.isCompleted).length, 0)}
          </span>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-2">أفضل العملاء</h3>
        <div className="space-y-3">
          {totalClientsEarnings.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm text-gray-400">لا يوجد بيانات</div>
          ) : (
            totalClientsEarnings.slice(0, 4).map(client => (
              <div key={client.id} onClick={() => onClientClick(client.id)} className="bg-white p-4 rounded-3xl border border-gray-50 flex items-center justify-between shadow-sm btn-active cursor-pointer">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className={`w-12 h-12 ${client.color} rounded-2xl flex items-center justify-center text-white text-lg shadow-sm`}>
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{client.name}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase">{client.tasks.length} مهام</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-lg font-bold text-gray-900">{state.currency}{client.totalEarned.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
