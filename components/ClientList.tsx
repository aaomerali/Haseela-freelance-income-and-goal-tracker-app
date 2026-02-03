
import React, { useState } from 'react';
import { AppState } from '../types';
import { TRANSLATIONS } from '../constants';

interface ClientListProps {
  state: AppState;
  onAddClient: (name: string) => void;
  onClientClick: (id: string) => void;
  onDeleteClient: (id: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ state, onAddClient, onClientClick, onDeleteClient }) => {
  const [newClientName, setNewClientName] = useState('');
  const t = TRANSLATIONS[state.language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim()) {
      onAddClient(newClientName.trim());
      setNewClientName('');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t.clients}</h2>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className={`flex ${state.language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
          <input 
            type="text"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder={t.clientNamePlaceholder}
            className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 outline-none transition-all"
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg btn-active">{t.add}</button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {state.clients.length === 0 ? (
          <div className="py-20 text-center text-gray-300">
            <i className="fas fa-users text-5xl mb-4"></i>
            <p className="font-bold">{t.noClients}</p>
          </div>
        ) : (
          state.clients.map(client => {
            const totalTasks = client.tasks.length;
            const earned = client.tasks.filter(t => t.isCompleted).reduce((sum, t) => sum + t.price, 0);
            return (
              <div key={client.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${client.color} flex items-center justify-center text-white text-xl`}>
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <button onClick={() => onDeleteClient(client.id)} className="w-10 h-10 rounded-full text-gray-200 hover:text-red-500 transition-colors">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{client.name}</h3>
                <p className="text-xs text-gray-400 font-bold mb-6">{totalTasks} {t.tasks}</p>
                <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400 font-bold mb-1">{t.achievedBalance}</p>
                        <p className="text-xl font-bold text-gray-900">{state.currency}{earned.toLocaleString()}</p>
                      </div>
                      <button onClick={() => onClientClick(client.id)} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold btn-active">{t.manageTasks}</button>
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
