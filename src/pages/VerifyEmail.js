import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { success, error } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [isValidToken, setIsValidToken] = useState(true);

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                setIsValidToken(false);
                setLoading(false);
                return;
            }

            try {
                await api.verifyEmail({ token });
                setVerified(true);
                success('E-posta adresiniz başarıyla doğrulandı');
                
                // 3 saniye sonra login sayfasına yönlendir
                setTimeout(() => {
                    navigate('/login?message=email_verified');
                }, 3000);
            } catch (err) {
                error('E-posta doğrulama hatası: ' + (err.response?.data?.message || err.message));
                setIsValidToken(false);
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams, navigate, success, error]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">E-posta Doğrulanıyor</h2>
                    <p className="text-slate-600">Lütfen bekleyin...</p>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Geçersiz Doğrulama</h2>
                    <p className="text-slate-600 mb-6">
                        Bu doğrulama bağlantısı geçersiz veya süresi dolmuş.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Giriş Sayfasına Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                    E-posta Doğrulandı!
                </h2>
                <p className="text-slate-600 mb-6">
                    E-posta adresiniz başarıyla doğrulandı. Artık sisteme giriş yapabilirsiniz.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800 text-sm">
                        🎉 Hoş geldiniz! Hesabınız aktif hale getirildi.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="text-sm text-slate-500">
                        Otomatik yönlendiriliyor... (3 saniye)
                    </div>
                    <button
                        onClick={() => navigate('/login?message=email_verified')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        🔑 Giriş Sayfasına Git
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;