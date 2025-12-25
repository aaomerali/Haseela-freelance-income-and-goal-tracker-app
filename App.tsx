
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Client, Task, MonthlyGoal, AppState } from './types';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import History from './components/History';
import Reports from './components/Reports';
import GoalModal from './components/GoalModal';
import ClientDetailModal from './components/ClientDetailModal';

const App: React.FC = () => {
  const STORAGE_KEY = 'freelance_pro_data_v3';

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse storage", e);
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 1200);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setLastSaved(new Date());
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
      id: crypto.randomUUID(),
      name,
      tasks: [],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setState(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setState(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== clientId) }));
  }, []);

  const addTask = useCallback((clientId: string, task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
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
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `haseela_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          const importedState = JSON.parse(content);
          if (importedState.clients && importedState.goals) {
            if (confirm('هل أنت متأكد؟ سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة.')) {
              setState(importedState);
              setShowSettings(false);
            }
          } else {
            alert('ملف غير صالح.');
          }
        } catch (err) {
          alert('خطأ في قراءة الملف.');
        }
      }
    };
    fileReader.readAsText(files[0]);
  };

  const selectedClient = state.clients.find(c => c.id === selectedClientId);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
           <i className="fas fa-coins text-5xl"></i>
        </div>
        <h1 className="text-4xl font-bold mb-2">حصيلة</h1>
        <p className="text-indigo-200 text-sm font-bold mb-8">يتم تحميل بياناتك...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 safe-top safe-bottom">
      <header className="sticky top-0 z-30 bg-gray-50 bg-opacity-80 backdrop-filter backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">
            <i className="fas fa-coins"></i>
          </div>
          <span className="font-extrabold text-gray-800 text-xl">حصيلة</span>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-50 flex items-center justify-center text-gray-400 btn-active"
        >
          <i className="fas fa-cog"></i>
        </button>
      </header>

      <main className="flex-1 pb-32">
        <div className="max-w-md mx-auto px-5 pt-6">
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-8 shadow-2xl">
             <div className="flex justify-between items-start mb-8">
                <button onClick={() => setShowSettings(false)} className="text-gray-400 p-2"><i className="fas fa-times"></i></button>
                <h2 className="text-xl font-bold text-gray-800">إدارة البيانات</h2>
             </div>
             <div className="space-y-6">
                <button onClick={exportData} className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl btn-active">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <i className="fas fa-download text-indigo-500"></i>
                        <span className="text-sm font-bold text-gray-700">تصدير النسخة الاحتياطية</span>
                    </div>
                </button>
                <label className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl btn-active cursor-pointer">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <i className="fas fa-upload text-yellow-500"></i>
                        <span className="text-sm font-bold text-gray-700">استيراد بيانات</span>
                    </div>
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
                <button onClick={() => { if(confirm('حذف كل البيانات؟')) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-500 text-sm font-bold">مسح شامل</button>
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
  <button onClick={onClick} className={`flex flex-col items-center space-y-1 transition-all btn-active ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
