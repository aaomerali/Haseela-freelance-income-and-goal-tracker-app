
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Client, Task, MonthlyGoal, AppState } from './types';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import History from './components/History';
import Reports from './components/Reports';
import GoalModal from './components/GoalModal';
import ClientDetailModal from './components/ClientDetailModal';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [state, setState] = useState<AppState>({
    clients: [],
    goals: [],
    currency: '$'
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'history' | 'reports'>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setIsLoaded(false);
        setState({ clients: [], goals: [], currency: '$' });
        setShowSettings(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const { data } = await supabase
        .from('user_data')
        .select('state')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data && data.state) {
        setState(data.state);
      } else {
        const saved = localStorage.getItem('haseela_app_data_v1');
        if (saved) {
          const localState = JSON.parse(saved);
          setState(localState);
          syncToSupabase(localState);
        }
      }
    } catch (e) {
      console.error("Database fetch error:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const syncToSupabase = async (newState: AppState) => {
    if (!session?.user) return;
    try {
      await supabase.from('user_data').upsert({
        user_id: session.user.id,
        state: newState,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Sync error:", e);
    }
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      localStorage.setItem('haseela_app_data_v1', JSON.stringify(next));
      if (isLoaded) {
        syncToSupabase(next);
      }
      return next;
    });
  };

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
    updateState(prev => ({
      ...prev,
      clients: [...prev.clients, {
        id: generateId(),
        name,
        tasks: [],
        color: colors[Math.floor(Math.random() * colors.length)]
      }]
    }));
  }, [isLoaded]);

  const deleteClient = useCallback((clientId: string) => {
    if(window.confirm('هل تريد حذف هذا العميل؟')) {
      updateState(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== clientId) }));
    }
  }, [isLoaded]);

  const addTask = useCallback((clientId: string, task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    updateState(prev => ({
      ...prev,
      clients: prev.clients.map(c => 
        c.id === clientId ? { ...c, tasks: [...c.tasks, { ...task, id: generateId(), isCompleted: false, createdAt: new Date().toISOString() }] } : c
      )
    }));
  }, [isLoaded]);

  const deleteTask = useCallback((clientId: string, taskId: string) => {
    if(window.confirm('هل تريد حذف هذه المهمة؟')) {
      updateState(prev => ({
        ...prev,
        clients: prev.clients.map(c => 
          c.id === clientId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c
        )
      }));
    }
  }, [isLoaded]);

  const toggleTask = useCallback((clientId: string, taskId: string) => {
    updateState(prev => ({
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
  }, [isLoaded]);

  const setGoal = useCallback((amount: number) => {
    updateState(prev => {
      const otherGoals = prev.goals.filter(g => !(g.month === currentMonth && g.year === currentYear));
      return { ...prev, goals: [...otherGoals, { month: currentMonth, year: currentYear, targetAmount: amount }] };
    });
    setShowGoalModal(false);
  }, [currentMonth, currentYear, isLoaded]);

  const handleLogout = async () => {
    if (window.confirm('هل تريد الخروج فعلاً؟')) {
      try {
        setShowSettings(false);
        setSession(null); 
        localStorage.removeItem('haseela_app_data_v1');
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Sign out error:", err);
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center text-white">
        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mb-4 animate-pulse">
           <i className="fas fa-spinner fa-spin text-4xl"></i>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const selectedClient = state.clients.find(c => c.id === selectedClientId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg px-6 py-4 flex justify-between items-center border-b border-gray-100 safe-top">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-coins text-xs"></i>
          </div>
          <span className="font-bold text-gray-800 text-lg">حصيلة</span>
        </div>
        <button 
          onClick={() => setShowSettings(true)} 
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 btn-active"
        >
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
          <button onClick={() => { setActiveTab('clients'); setSelectedClientId(null); }} className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-white btn-active">
            <i className="fas fa-plus text-xl"></i>
          </button>
        </div>
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon="fa-calendar-alt" label="الأرشيف" />
        <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon="fa-chart-line" label="تقارير" />
      </nav>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-8 animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">الإعدادات</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 p-2 hover:bg-gray-50 rounded-full transition-colors"><i className="fas fa-times"></i></button>
             </div>
             <div className="space-y-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">الحساب المسجل</p>
                  <p className="font-bold text-gray-800 break-all">{session?.user?.email}</p>
                </div>
                <button type="button" onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-red-50 text-red-600 rounded-2xl btn-active border border-red-100"><span className="font-bold">تسجيل الخروج</span><i className="fas fa-sign-out-alt"></i></button>
                <div className="text-center"><p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">حصيلة v1.6.5</p></div>
             </div>
          </div>
        </div>
      )}

      {showGoalModal && <GoalModal currentGoal={currentGoal?.targetAmount || 0} onSave={setGoal} onClose={() => setShowGoalModal(false)} isFirstGoal={!currentGoal} />}
      {selectedClient && <ClientDetailModal 
        client={selectedClient} 
        onClose={() => setSelectedClientId(null)} 
        onAddTask={(task) => addTask(selectedClient.id, task)} 
        onToggleTask={(taskId) => toggleTask(selectedClient.id, taskId)}
        onDeleteTask={(taskId) => deleteTask(selectedClient.id, taskId)}
        currency={state.currency} 
      />}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center space-y-1 transition-all flex-1 ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
