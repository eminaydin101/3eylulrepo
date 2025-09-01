import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { success, error } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            error('E-posta adresi zorunludur');
            return;
        }

        setLoading(true);
        try {
            await api.forgotPassword({ email });
            setSent(true);
            success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
        } catch (err) {
            error('Bir hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                {!sent ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🔐</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                                Şifrenizi mi unuttunuz?
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    E-posta Adresi
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200"
                                    placeholder="ornek@email.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Gönderiliyor...</span>
                                    </div>
                                ) : (
                                    '📧 Sıfırlama Bağlantısı Gönder'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                ← Giriş sayfasına dön
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                            E-posta Gönderildi!
                        </h2>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                            <p className="text-green-800 dark:text-green-300 text-sm">
                                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik. 
                                E-posta kutunuzu (spam klasörünü de) kontrol edin.
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => setSent(false)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                🔄 Tekrar Gönder
                            </button>
                            <Link
                                to="/login"
                                className="block w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-4 rounded-lg transition-colors text-center"
                            >
                                ← Giriş sayfasına dön
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;