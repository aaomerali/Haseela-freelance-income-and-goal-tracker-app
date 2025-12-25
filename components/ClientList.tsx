
import React, { useState } from 'react';
import { Client } from '../types';

interface ClientListProps {
  clients: Client[];
  onAddClient: (name: string) => void;
  onClientClick: (id: string) => void;
  onDeleteClient: (id: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onAddClient, onClientClick, onDeleteClient }) => {
  const [newClientName, setNewClientName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim()) {
      onAddClient(newClientName.trim());
      setNewClientName('');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة العملاء</h2>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input 
            type="text"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="أدخل اسم العميل الجديد هنا..."
            className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 font-medium placeholder:text-slate-400 outline-none transition-all text-right"
          />
          <button 
            type="submit"
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 btn-active"
          >
            إضافة
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-slate-300 text-3xl"></i>
            </div>
            <p className="text-slate-400 font-bold">لا يوجد عملاء مضافين بعد</p>
            <p className="text-slate-300 text-sm mt-1">ابدأ بإضافة أول عميل لك أعلاه</p>
          </div>
        ) : (
          clients.map(client => {
            const completedCount = client.tasks.filter(t => t.isCompleted).length;
            const totalTasks = client.tasks.length;
            const earned = client.tasks.filter(t => t.isCompleted).reduce((sum, t) => sum + t.price, 0);

            return (
              <div key={client.id} className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${client.color} flex items-center justify-center text-white text-xl shadow-lg shadow-opacity-20`}>
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if(confirm('هل أنت متأكد من حذف هذا العميل؟ ستفقد جميع مهامه.')) {
                            onDeleteClient(client.id);
                        }
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                  >
                    <i className="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
                
                <h3 className="text-xl font-black text-slate-800 mb-1 leading-tight">{client.name}</h3>
                <p className="text-xs text-slate-400 font-bold mb-6">{totalTasks} مهام إجمالية</p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-400">الإنجاز</span>
                    <span className="text-emerald-500">{totalTasks > 0 ? Math.round((completedCount/totalTasks)*100) : 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-l from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
                      style={{ width: `${totalTasks > 0 ? (completedCount/totalTasks)*100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">المحقق</p>
                      <p className="text-xl font-black text-slate-900">${earned.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => onClientClick(client.id)}
                      className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all active:scale-95"
                    >
                      إدارة المهام
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientList;
