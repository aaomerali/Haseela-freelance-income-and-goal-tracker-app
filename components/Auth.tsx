
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TRANSLATIONS } from '../constants';

interface AuthProps {
  language: 'ar' | 'en';
  onToggleLanguage: () => void;
}

const Auth: React.FC<AuthProps> = ({ language, onToggleLanguage }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const t = TRANSLATIONS[language];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(language === 'ar' ? 'تم إرسال بريد تأكيد، يرجى التحقق من بريدك.' : 'Confirmation email sent, please check your inbox.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage(error.message || (language === 'ar' ? 'حدث خطأ ما' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 animate-fade-in ${language === 'ar' ? 'font-tajawal' : ''}`}>
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
        
        {/* زر تبديل اللغة */}
        <button 
          onClick={onToggleLanguage}
          className={`absolute top-6 ${language === 'ar' ? 'left-6' : 'right-6'} px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 btn-active flex items-center gap-2`}
        >
          <i className="fas fa-globe"></i>
          {language === 'ar' ? 'English' : 'العربية'}
        </button>

        <div className="flex flex-col items-center mb-10 mt-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 shadow-lg">
            <i className="fas fa-coins"></i>
          </div>
          <h1 className="text-3xl font-black text-gray-900">{t.appName}</h1>
          <p className="text-gray-400 font-bold mt-2 text-center text-sm">{t.appTagline}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className={`block text-[10px] font-bold text-gray-400 uppercase mb-2 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input 
              type="email" 
              className={`w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={`block text-[10px] font-bold text-gray-400 uppercase mb-2 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <input 
              type="password" 
              className={`w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
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
            {loading ? '...' : (isSignUp ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account') : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In'))}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-center text-xs font-bold ${message.includes('error') || message.includes('خطأ') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            className="text-indigo-600 font-bold text-sm hover:underline"
          >
            {isSignUp 
              ? (language === 'ar' ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Sign in') 
              : (language === 'ar' ? 'ليس لديك حساب؟ اشترك الآن' : 'No account yet? Sign up')}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
        {t.appName} &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default Auth;
