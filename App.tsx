
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

  // Auto-save effect
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
    const newClient: Client = {
      id: crypto.randomUUID(),
      name,
      tasks: [],
      color: `bg-${['indigo', 'violet', 'emerald', 'amber', 'rose', 'cyan'][Math.floor(Math.random() * 6)]}-500`
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

  // Data Management Functions
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
        <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6 animate-bounce">
           <i className="fas fa-coins text-5xl"></i>
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tight">حصيلة</h1>
        <p className="text-indigo-200 text-sm font-bold mb-8">يتم تحميل بياناتك المخزنة محلياً...</p>
        <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white w-1/2 animate-[loading_1.5s_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 safe-top safe-bottom">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">
            <i className="fas fa-coins"></i>
          </div>
          <span className="font-black text-slate-800 tracking-tight text-xl">حصيلة</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="hidden xs:flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-[9px] font-bold">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
               محفوظ داخلياً
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-50 flex items-center justify-center text-slate-400 btn-active"
            >
              <i className="fas fa-cog"></i>
            </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 pb-32">
        <div className="max-w-md mx-auto px-5 pt-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              state={state} 
              onClientClick={setSelectedClientId}
              onSetGoalClick={() => setShowGoalModal(true)}
            />
          )}
          {activeTab === 'clients' && (
            <ClientList 
              clients={state.clients} 
              onAddClient={addClient}
              onClientClick={setSelectedClientId}
              onDeleteClient={deleteClient}
            />
          )}
          {activeTab === 'history' && (
            <History state={state} />
          )}
          {activeTab === 'reports' && (
            <Reports state={state} />
          )}
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-100 px-6 pb-safe flex justify-between items-center h-20 z-40">
        <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="fa-home" label="الرئيسية" />
        <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon="fa-users" label="العملاء" />
        <div className="relative -top-6">
          <button onClick={() => setActiveTab('clients')} className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center text-white btn-active">
            <i className="fas fa-plus text-xl"></i>
          </button>
        </div>
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon="fa-calendar-alt" label="الأرشيف" />
        <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon="fa-chart-line" label="تقارير" />
      </nav>

      {/* Settings / Data Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
             <div className="flex justify-between items-start mb-8">
                <button onClick={() => setShowSettings(false)} className="text-slate-400 p-2"><i className="fas fa-times"></i></button>
                <h2 className="text-xl font-black text-slate-800">إدارة البيانات</h2>
             </div>

             <div className="space-y-6">
                <section>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">التخزين الداخلي</h3>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                            <i className="fas fa-database"></i>
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-700">حالة التخزين</p>
                            <p className="text-[10px] text-emerald-500 font-bold">نشط ومؤمن محلياً</p>
                         </div>
                      </div>
                      <div className="text-left">
                         <p className="text-[10px] text-slate-400 font-bold uppercase">آخر مزامنة</p>
                         <p className="text-[10px] text-slate-600 font-bold">{lastSaved?.toLocaleTimeString('ar-EG')}</p>
                      </div>
                   </div>
                </section>

                <section className="grid grid-cols-1 gap-3">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">النسخ الاحتياطي</h3>
                   <button 
                    onClick={exportData}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all btn-active"
                   >
                      <div className="flex items-center gap-3">
                        <i className="fas fa-download text-indigo-500"></i>
                        <span className="text-sm font-bold text-slate-700">تصدير بيانات "حصيلة"</span>
                      </div>
                      <i className="fas fa-chevron-left text-[10px] text-slate-300"></i>
                   </button>
                   
                   <label className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all btn-active cursor-pointer">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-upload text-amber-500"></i>
                        <span className="text-sm font-bold text-slate-700">استيراد نسخة سابقة</span>
                      </div>
                      <input type="file" accept=".json" onChange={importData} className="hidden" />
                      <i className="fas fa-chevron-left text-[10px] text-slate-300"></i>
                   </label>
                </section>

                <button 
                  onClick={() => {
                    if(confirm('سيتم حذف كل البيانات وإعادة تشغيل التطبيق. هل أنت متأكد؟')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full py-4 text-rose-500 text-sm font-bold hover:bg-rose-50 rounded-2xl transition-all"
                >
                  مسح كافة البيانات نهائياً
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showGoalModal && (
        <GoalModal 
          currentGoal={currentGoal?.targetAmount || 0}
          onSave={setGoal}
          onClose={() => currentGoal && setShowGoalModal(false)}
          isFirstGoal={!currentGoal}
        />
      )}

      {selectedClient && (
        <ClientDetailModal 
          client={selectedClient}
          onClose={() => setSelectedClientId(null)}
          onAddTask={(task) => addTask(selectedClient.id, task)}
          onToggleTask={(taskId) => toggleTask(selectedClient.id, taskId)}
          currency={state.currency}
        />
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 btn-active ${
      active ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[10px] font-bold">{label}</span>
    {active && <div className="w-1 h-1 bg-indigo-600 rounded-full"></div>}
  </button>
);

export default App;
