
import React, { useState } from 'react';
import { Client, Task } from '../types';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onToggleTask: (taskId: string) => void;
  currency: string;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, onClose, onAddTask, onToggleTask, currency }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPrice, setTaskPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim() && taskPrice) {
      onAddTask({
        title: taskTitle.trim(),
        price: parseFloat(taskPrice)
      });
      setTaskTitle('');
      setTaskPrice('');
    }
  };

  const completedCount = client.tasks.filter(t => t.isCompleted).length;
  const totalEarned = client.tasks.filter(t => t.isCompleted).reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 w-full max-w-2xl max-h-screen overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className={`${client.color} p-8 text-white relative`}>
          <button 
            onClick={onClose}
            className="absolute left-6 top-6 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="flex items-end justify-between mt-4">
            <div>
              <p className="text-white text-opacity-70 text-sm font-bold uppercase tracking-widest mb-1">تفاصيل العميل</p>
              <h2 className="text-3xl font-extrabold">{client.name}</h2>
            </div>
            <div className="text-right text-white">
              <p className="text-white text-opacity-70 text-xs font-bold uppercase mb-1">إجمالي المحصل</p>
              <p className="text-2xl font-black">{currency}{totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Add Task Form */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-plus-circle text-indigo-500"></i>
              إضافة مهمة جديدة
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text"
                placeholder="عنوان المهمة..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right"
              />
              <div className="relative w-full md:w-32">
                 <input 
                    type="number"
                    placeholder="السعر"
                    value={taskPrice}
                    onChange={(e) => setTaskPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">$</span>
              </div>
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md btn-active"
              >
                إضافة
              </button>
            </form>
          </section>

          {/* Tasks List */}
          <section>
             <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-gray-800">قائمة المهام ({client.tasks.length})</h3>
                <span className="text-xs font-bold text-gray-400">{completedCount} مكتملة</span>
             </div>
             
             {client.tasks.length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                 <i className="fas fa-clipboard-list text-4xl mb-3 opacity-20"></i>
                 <p>لا يوجد مهام لهذا العميل بعد</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {[...client.tasks].reverse().map(task => (
                   <div 
                    key={task.id} 
                    className={`bg-white p-4 rounded-2xl border flex items-center justify-between transition-all ${task.isCompleted ? 'border-green-100 bg-green-50 bg-opacity-30' : 'border-gray-100'}`}
                   >
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => onToggleTask(task.id)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-all ${task.isCompleted ? 'bg-green-500 text-white border-green-500' : 'border-2 border-gray-200'}`}
                        >
                          {task.isCompleted && <i className="fas fa-check text-xs"></i>}
                        </button>
                        <div>
                          <p className={`font-bold transition-all ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(task.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                     </div>
                     <span className={`font-black ${task.isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                       {currency}{task.price.toLocaleString()}
                     </span>
                   </div>
                 ))}
               </div>
             )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
