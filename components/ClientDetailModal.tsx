
import React, { useState } from 'react';
import { Client, Task } from '../types';
import { TRANSLATIONS } from '../constants';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  currency: string;
  language: 'ar' | 'en';
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, onClose, onAddTask, onToggleTask, onDeleteTask, currency, language }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPrice, setTaskPrice] = useState('');
  const t = TRANSLATIONS[language];

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
      <div className="bg-gray-50 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className={`${client.color} p-8 text-white relative flex-shrink-0`}>
          <button 
            onClick={onClose}
            className={`absolute ${language === 'ar' ? 'left-6' : 'right-6'} top-6 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all btn-active`}
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="flex items-end justify-between mt-4">
            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
              <p className="text-white text-opacity-70 text-sm font-bold uppercase tracking-widest mb-1">{t.clientDetails}</p>
              <h2 className="text-3xl font-extrabold">{client.name}</h2>
            </div>
            <div className={language === 'ar' ? 'text-left' : 'text-right'}>
              <p className="text-white text-opacity-70 text-xs font-bold uppercase mb-1">{t.totalEarned}</p>
              <p className="text-2xl font-black">{currency}{totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Add Task Form */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-plus-circle text-indigo-500"></i>
              {t.addTask}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text"
                placeholder={t.taskTitlePlaceholder}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <div className="relative w-full md:w-32">
                 <input 
                    type="number"
                    placeholder={t.price}
                    value={taskPrice}
                    onChange={(e) => setTaskPrice(e.target.value)}
                    className={`w-full ${language === 'ar' ? 'pl-8 pr-4' : 'pr-8 pl-4'} py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold`}
                  />
                  <span className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 font-bold`}>$</span>
              </div>
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md btn-active"
              >
                {t.add}
              </button>
            </form>
          </section>

          {/* Tasks List */}
          <section className="pb-4">
             <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-gray-800">{t.tasks} ({client.tasks.length})</h3>
                <span className="text-xs font-bold text-gray-400">{completedCount} {t.completed}</span>
             </div>
             
             {client.tasks.length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                 <i className="fas fa-clipboard-list text-4xl mb-3 opacity-20"></i>
                 <p>{t.noTasks}</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {[...client.tasks].reverse().map(task => (
                   <div 
                    key={task.id} 
                    className={`bg-white p-4 rounded-2xl border flex items-center justify-between transition-all group ${task.isCompleted ? 'border-green-100 bg-green-50 bg-opacity-30' : 'border-gray-100 shadow-sm'}`}
                   >
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => onToggleTask(task.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${task.isCompleted ? 'bg-green-500 text-white border-green-500' : 'border-2 border-gray-200 bg-white hover:border-indigo-300'}`}
                        >
                          {task.isCompleted && <i className="fas fa-check text-xs"></i>}
                        </button>
                        <div>
                          <p className={`font-bold transition-all text-sm md:text-base ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {task.title}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {new Date(task.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className={`font-black text-sm md:text-base ${task.isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                          {currency}{task.price.toLocaleString()}
                        </span>
                        <button 
                          onClick={() => onDeleteTask(task.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all btn-active"
                          title={t.deleteTask}
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                     </div>
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
