
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Client, Task, MonthlyGoal, AppState } from './types';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import History from './components/History';
import Reports from './components/Reports';
import GoalModal from './components/GoalModal';
import ClientDetailModal from './components/ClientDetailModal';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const App: React.FC = () => {
  const STORAGE_KEY = 'haseela_app_data_v1';

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Storage parse failed", e);
      }
    }
    return {
      clients: [],
      goals: [],
      currency: '$'
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'history' | 'reports'>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentGoal = useMemo(() => {
    return state.goals.find(g => g.month === currentMonth && g.year === currentYear);
  }, [state.goals, currentMonth, currentYear]);

  useEffect(() => {
    if (isLoaded && !currentGoal && activeTab === 'dashboard') {
      setShowGoalModal(true);
    }
  }, [currentGoal, isLoaded, activeTab]);

  const addClient = useCallback((name: string) => {
    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
    const newClient: Client = {
      id: generateId(),
      name,
      tasks: [],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setState(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    if(confirm('هل تريد حذف هذا العميل وجميع مهامه؟')) {
      setState(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== clientId) }));
    }
  }, []);

  const addTask = useCallback((clientId: string, task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => 
        c.id === clientId ? { ...c, tasks: [...c.tasks, newTask] } : c
      )
    }));
  }, []);

  const toggleTask = useCallback((clientId: string, taskId: string) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => 
        c.id === clientId ? {
          ...c,
          tasks: c.tasks.map(t => 
            t.id === taskId ? { 
              ...t, 
              isCompleted: !t.isCompleted, 
              completedAt: !t.isCompleted ? new Date().toISOString() : undefined 
            } : t
          )
        } : c
      )
    }));
  }, []);

  const setGoal = useCallback((amount: number) => {
    const newGoal: MonthlyGoal = {
      month: currentMonth,
      year: currentYear,
      targetAmount: amount
    };
    setState(prev => {
      const otherGoals = prev.goals.filter(g => !(g.month === currentMonth && g.year === currentYear));
      return { ...prev, goals: [...otherGoals, newGoal] };
    });
    setShowGoalModal(false);
  }, [currentMonth, currentYear]);

  const exportData = () => {
    const dataStr = JSON.stringify(state);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `haseela_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.clients) {
          setState(data);
          alert('تم استيراد البيانات بنجاح');
        }
      } catch {
        alert('الملف غير صالح');
      }
    };
    reader.readAsText(file);
  };

  const selectedClient = state.clients.find(c => c.id === selectedClientId);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center text-white">
        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mb-4 animate-bounce">
           <i className="fas fa-coins text-4xl"></i>
        </div>
        <h1 className="text-3xl font-bold">حصيلة</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg px-6 py-4 flex justify-between items-center border-b border-gray-100 safe-top">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-coins text-xs"></i>
          </div>
          <span className="font-bold text-gray-800 text-lg">حصيلة</span>
        </div>
        <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 btn-active">
          <i className="fas fa-cog"></i>
        </button>
      </header>

      <main className="flex-1 pb-32">
        <div className="max-w-md mx-auto px-5 pt-6 animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard state={state} onClientClick={setSelectedClientId} onSetGoalClick={() => setShowGoalModal(true)} />}
          {activeTab === 'clients' && <ClientList clients={state.clients} onAddClient={addClient} onClientClick={setSelectedClientId} onDeleteClient={deleteClient} />}
          {activeTab === 'history' && <History state={state} />}
          {activeTab === 'reports' && <Reports state={state} />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-gray-100 px-6 pb-safe flex justify-between items-center h-20 z-40">
        <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="fa-home" label="الرئيسية" />
        <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon="fa-users" label="العملاء" />
        <div className="relative -top-6">
          <button onClick={() => setActiveTab('clients')} className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-white btn-active">
            <i className="fas fa-plus text-xl"></i>
          </button>
        </div>
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon="fa-calendar-alt" label="الأرشيف" />
        <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon="fa-chart-line" label="تقارير" />
      </nav>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 animate-fade-in">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">الإعدادات</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400"><i className="fas fa-times"></i></button>
             </div>
             <div className="space-y-4">
                <button onClick={exportData} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl btn-active">
                   <span className="font-bold">تصدير البيانات</span>
                   <i className="fas fa-download text-indigo-500"></i>
                </button>
                <label className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl btn-active cursor-pointer">
                   <span className="font-bold">استيراد البيانات</span>
                   <i className="fas fa-upload text-green-500"></i>
                   <input type="file" onChange={importData} className="hidden" />
                </label>
             </div>
          </div>
        </div>
      )}

      {showGoalModal && <GoalModal currentGoal={currentGoal?.targetAmount || 0} onSave={setGoal} onClose={() => setShowGoalModal(false)} isFirstGoal={!currentGoal} />}
      {selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setSelectedClientId(null)} onAddTask={(task) => addTask(selectedClient.id, task)} onToggleTask={(taskId) => toggleTask(selectedClient.id, taskId)} currency={state.currency} />}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center space-y-1 transition-all ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
