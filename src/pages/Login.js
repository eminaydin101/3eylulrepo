import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const { login, register } = useAuth();
    const { success, error } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [loginView, setLoginView] = useState('login'); // 'login' or 'signup'
    const [formError, setFormError] = useState('');

    // URL'den gelen mesajları kontrol et
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const message = params.get('message');
        if (message === 'password_reset_success') {
            success('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.');
        } else if (message === 'email_verified') {
            success('E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.');
        }
    }, [location, success]);

    // Form alanları için state'ler
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [hint, setHint] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            await login(email, password);
            // Başarılı girişten sonra App.js zaten MainLayout'a yönlendirecek
        } catch (err) {
            setFormError(err.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setFormError('');
        if (password.length < 6) {
            return setFormError('Şifre en az 6 karakter olmalıdır.');
        }
        if (!hint) {
            return setFormError('İpucu kelimesi boş bırakılamaz.');
        }
        try {
            await register({ fullName, email, password, hint });
            // Başarılı kayıttan sonra AuthContext bizi otomatik olarak içeri alacak
        } catch (err) {
            setFormError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
        }
    };

    // Stil sınıfları
    const inputStyle = "w-full px-4 py-3 mb-4 bg-slate-100 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonStyle = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300";
    const linkStyle = "text-blue-600 hover:text-blue-700 font-medium";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                {/* Logo/Brand Area */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-white font-bold">📋</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Süreç Yönetimi</h1>
                    <p className="text-slate-600 mt-1">Profesyonel süreç takip sistemi</p>
                </div>

                {formError && (
                    <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">
                        {formError}
                    </div>
                )}

                {loginView === 'login' && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Giriş Yap</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input 
                                    type="email" 
                                    placeholder="E-posta adresiniz" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className={inputStyle} 
                                    required 
                                />
                            </div>
                            <div>
                                <input 
                                    type="password" 
                                    placeholder="Şifreniz" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className={inputStyle} 
                                    required 
                                />
                            </div>
                            <button type="submit" className={buttonStyle}>
                                🔑 Giriş Yap
                            </button>
                        </form>

                        <div className="mt-6 space-y-3 text-center">
                            <Link to="/forgot-password" className={linkStyle}>
                                🔐 Şifrenizi mi unuttunuz?
                            </Link>
                            <div className="border-t pt-3">
                                <button 
                                    onClick={() => setLoginView('signup')}
                                    className="text-slate-600 hover:text-blue-600"
                                >
                                    Hesabınız yok mu? <span className={linkStyle}>Kaydolun</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {loginView === 'signup' && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Yeni Hesap</h2>
                        <form onSubmit={handleSignup} className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Ad Soyad" 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)} 
                                className={inputStyle} 
                                required 
                            />
                            <input 
                                type="email" 
                                placeholder="E-posta" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className={inputStyle} 
                                required 
                            />
                            <input 
                                type="password" 
                                placeholder="Şifre (en az 6 karakter)" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className={inputStyle} 
                                required 
                                minLength={6}
                            />
                            <input 
                                type="text" 
                                placeholder="Parola İpucu Kelimesi" 
                                value={hint} 
                                onChange={e => setHint(e.target.value)} 
                                className={inputStyle} 
                                required 
                            />
                            <button type="submit" className={buttonStyle}>
                                ✨ Hesap Oluştur
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button 
                                onClick={() => setLoginView('login')}
                                className="text-slate-600 hover:text-blue-600"
                            >
                                Zaten hesabınız var mı? <span className={linkStyle}>Giriş yapın</span>
                            </button>
                        </div>
                    </>
                )}

                {/* Demo Accounts Info */}
                <div className="mt-8 p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-semibold text-slate-700 mb-2 text-sm">🧪 Demo Hesapları:</h4>
                    <div className="text-xs text-slate-600 space-y-1">
                        <div><strong>Admin:</strong> admin1@test.com | Şifre: 123456</div>
                        <div><strong>Editor:</strong> editor1@test.com | Şifre: 123456</div>
                        <div><strong>Viewer:</strong> viewer1@test.com | Şifre: 123456</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;