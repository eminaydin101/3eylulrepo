const nodemailer = require('nodemailer');

// Email konfigürasyonu - .env dosyasından alınacak
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const sendProcessNotification = async (to, subject, processData, type) => {
    if (!process.env.SMTP_USER) {
        console.log('Email servisi yapılandırılmamış, bildirim gönderilemiyor');
        return;
    }

    const transporter = createTransporter();
    
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .process-info { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; }
                .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
                .priority-high { border-left: 4px solid #ef4444; }
                .priority-medium { border-left: 4px solid #f59e0b; }
                .priority-normal { border-left: 4px solid #3b82f6; }
                .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Süreç Yönetimi Bildirimi</h1>
                </div>
                <div class="content">
                    <h2>${subject}</h2>
                    <div class="process-info priority-${processData.oncelikDuzeyi?.toLowerCase() || 'normal'}">
                        <h3>Süreç Bilgileri</h3>
                        <p><strong>ID:</strong> ${processData.id}</p>
                        <p><strong>Başlık:</strong> ${processData.baslik}</p>
                        <p><strong>Firma:</strong> ${processData.firma}</p>
                        <p><strong>Kategori:</strong> ${processData.kategori}</p>
                        <p><strong>Durum:</strong> ${processData.durum}</p>
                        <p><strong>Öncelik:</strong> ${processData.oncelikDuzeyi}</p>
                        ${processData.sonrakiKontrolTarihi ? `<p><strong>Sonraki Kontrol:</strong> ${processData.sonrakiKontrolTarihi}</p>` : ''}
                        ${processData.sorumlular ? `<p><strong>Sorumlular:</strong> ${processData.sorumlular.join(', ')}</p>` : ''}
                    </div>
                    ${processData.mevcutDurum ? `
                        <div class="process-info">
                            <h4>Mevcut Durum:</h4>
                            <p>${processData.mevcutDurum}</p>
                        </div>
                    ` : ''}
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
                        Süreç Yönetimi Sistemine Git
                    </a>
                </div>
                <div class="footer">
                    <p>Bu bir otomatik bildirimdir. Lütfen yanıtlamayın.</p>
                    <p>Süreç Yönetimi Sistemi - ${new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Süreç Yönetimi" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: htmlTemplate
        });
        console.log('Email gönderildi:', to, subject);
    } catch (error) {
        console.error('Email gönderme hatası:', error);
    }
};

const sendPasswordResetEmail = async (to, fullName, resetToken) => {
    if (!process.env.SMTP_USER) {
        console.log('Email servisi yapılandırılmamış');
        return;
    }

    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
                .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
                .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Şifre Sıfırlama</h1>
                </div>
                <div class="content">
                    <h2>Merhaba ${fullName},</h2>
                    <p>Süreç Yönetimi hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
                    
                    <div class="warning">
                        <p><strong>⚠️ Önemli:</strong> Bu bağlantı sadece 15 dakika geçerlidir.</p>
                    </div>
                    
                    <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">
                        Eğer bu talep size ait değilse, bu emaili dikkate almayın. Şifreniz değiştirilmeyecektir.
                    </p>
                </div>
                <div class="footer">
                    <p>Bu bir otomatik emaildir. Lütfen yanıtlamayın.</p>
                    <p>Süreç Yönetimi Sistemi - ${new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Süreç Yönetimi" <${process.env.SMTP_USER}>`,
            to: to,
            subject: '🔐 Süreç Yönetimi - Şifre Sıfırlama',
            html: htmlTemplate
        });
    } catch (error) {
        throw error;
    }
};

const sendWelcomeEmail = async (to, fullName, verificationToken) => {
    if (!process.env.SMTP_USER) {
        console.log('Email servisi yapılandırılmamış');
        return;
    }

    const transporter = createTransporter();
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
                .welcome-box { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 15px 0; }
                .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Hoş Geldiniz!</h1>
                </div>
                <div class="content">
                    <h2>Merhaba ${fullName},</h2>
                    <p>Süreç Yönetimi sistemine hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
                    
                    <div class="welcome-box">
                        <h3>📋 Neler Yapabilirsiniz?</h3>
                        <ul>
                            <li>✅ Süreçlerinizi takip edebilirsiniz</li>
                            <li>📊 Detaylı raporlar görüntüleyebilirsiniz</li>
                            <li>💬 Ekip üyeleriyle mesajlaşabilirsiniz</li>
                            <li>📁 Dosyalarınızı yönetebilirsiniz</li>
                        </ul>
                    </div>
                    
                    <p>Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekmektedir:</p>
                    
                    <div style="text-align: center;">
                        <a href="${verifyUrl}" class="button">E-posta Adresimi Doğrula</a>
                    </div>
                    
                    <p>Herhangi bir sorunuz varsa, lütfen destek ekibiyle iletişime geçin.</p>
                </div>
                <div class="footer">
                    <p>Bu bir otomatik emaildir. Lütfen yanıtlamayın.</p>
                    <p>Süreç Yönetimi Sistemi - ${new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Süreç Yönetimi" <${process.env.SMTP_USER}>`,
            to: to,
            subject: '🎉 Hoş Geldiniz - Süreç Yönetimi',
            html: htmlTemplate
        });
    } catch (error) {
        throw error;
    }
};

const sendBulkNotification = async (recipients, subject, processData) => {
    const promises = recipients.map(email => 
        sendProcessNotification(email, subject, processData, 'bulk')
    );
    
    try {
        await Promise.all(promises);
        console.log(`${recipients.length} kişiye bildirim gönderildi`);
    } catch (error) {
        console.error('Toplu email gönderme hatası:', error);
    }
};

module.exports = {
    sendProcessNotification,
    sendBulkNotification,
    sendPasswordResetEmail,
    sendWelcomeEmail
};