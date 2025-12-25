
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('تم إرسال بريد تأكيد، يرجى التحقق من بريدك.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage(error.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 animate-fade-in">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 shadow-lg">
            <i className="fas fa-coins"></i>
          </div>
          <h1 className="text-3xl font-black text-gray-900">حصيلة</h1>
          <p className="text-gray-400 font-bold mt-2">نظم أرباحك في سحابة آمنة</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 mr-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-right"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 mr-1">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-right"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all btn-active disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : (isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول')}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-center text-sm font-bold ${message.includes('خطأ') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 font-bold text-sm hover:underline"
          >
            {isSignUp ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ اشترك الآن'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
