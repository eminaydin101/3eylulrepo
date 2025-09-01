import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { success, error } = useToast();
    
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(true);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setIsValidToken(false);
            error('Geçersiz sıfırlama bağlantısı');
        }
    }, [searchParams, error]);

    const validatePassword = (password) => {
        if (password.length < 6) {
            return 'Şifre en az 6 karakter olmalıdır';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            error(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            error('Şifreler eşleşmiyor');
            return;
        }

        setLoading(true);
        try {
            await api.resetPassword({ token, newPassword });
            success('Şifreniz başarıyla güncellendi');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            error('Şifre sıfırlama hatası: ' + (err.response?.data?.message || err.message));
            if (err.response?.status === 400) {
                setIsValidToken(false);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                        Geçersiz Bağlantı
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. 
                        Lütfen yeni bir sıfırlama talebinde bulunun.
                    </p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        🔐 Şifre Sıfırlama Talebi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        Yeni Şifre Belirle
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Hesabınız için yeni ve güvenli bir şifre oluşturun.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Yeni Şifre
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:text-slate-200"
                            placeholder="En az 6 karakter"
                            required
                            minLength={6}
                        />
                        {newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={newPassword.length >= 6 ? 'text-green-600' : 'text-red-600'}>
                                        {newPassword.length >= 6 ? '✅' : '❌'} En az 6 karakter
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Şifre Tekrarı
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:text-slate-200"
                            placeholder="Şifrenizi tekrar girin"
                            required
                        />
                        {confirmPassword && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}>
                                        {newPassword === confirmPassword ? '✅' : '❌'} Şifreler eşleşiyor
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            🛡️ Güvenli Şifre Önerileri:
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• En az 8 karakter kullanın</li>
                            <li>• Büyük ve küçük harfleri karıştırın</li>
                            <li>• Sayılar ve özel karakterler ekleyin</li>
                            <li>• Kişisel bilgilerinizi kullanmayın</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Güncelleniyor...</span>
                            </div>
                        ) : (
                            '🔐 Şifremi Güncelle'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        ← Giriş sayfasına dön
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;