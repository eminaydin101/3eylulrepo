import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login, register } = useAuth();
    const [loginView, setLoginView] = useState('login'); // 'login' or 'signup'
    const [error, setError] = useState('');

    // Form alanları için state'ler
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [hint, setHint] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            // Başarılı girişten sonra App.js zaten MainLayout'a yönlendirecek
        } catch (err) {
            setError(err.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            return setError('Şifre en az 6 karakter olmalıdır.');
        }
        if (!hint) {
            return setError('İpucu kelimesi boş bırakılamaz.');
        }
        try {
            await register({ fullName, email, password, hint });
            // Başarılı kayıttan sonra AuthContext bizi otomatik olarak içeri alacak
        } catch (err) {
            setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
        }
    };

    // Stil sınıfları
    const inputStyle = "w-full px-4 py-3 mb-4 bg-slate-100 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonStyle = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300";
    const secondaryButtonStyle = "w-full text-center text-sm text-slate-600 hover:text-blue-600 mt-4";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-200 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{error}</p>}

                {loginView === 'login' && (
                    <>
                        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Giriş Yap</h2>
                        <form onSubmit={handleLogin}>
                            <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} required />
                            <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required />
                            <button type="submit" className={buttonStyle}>Giriş Yap</button>
                            <button type="button" onClick={() => { setLoginView('signup'); setError(''); }} className={secondaryButtonStyle}>Hesabınız yok mu? Kaydolun</button>
                        </form>
                    </>
                )}

                {loginView === 'signup' && (
                    <>
                        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Kaydol</h2>
                        <form onSubmit={handleSignup}>
                            <input type="text" placeholder="Ad Soyad" value={fullName} onChange={e => setFullName(e.target.value)} className={inputStyle} required />
                            <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} required />
                            <input type="password" placeholder="Şifre (en az 6 karakter)" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required />
                            <input type="text" placeholder="Parola İpucu Kelimesi" value={hint} onChange={e => setHint(e.target.value)} className={inputStyle} required />
                            <button type="submit" className={buttonStyle}>Kaydol</button>
                            <button type="button" onClick={() => { setLoginView('login'); setError(''); }} className={secondaryButtonStyle}>Zaten bir hesabınız var mı? Giriş yapın</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;