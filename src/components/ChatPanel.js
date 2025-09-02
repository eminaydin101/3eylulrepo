import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

// Emoji picker component
const EmojiPicker = ({ onEmojiSelect, isOpen, onClose }) => {
    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '☝️', '✋', '🤚', '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔',
        '🔥', '⭐', '🌟', '💥', '💯', '💢', '💨', '👑', '🎉', '🎊'
    ];

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-full left-0 mb-2 glass rounded-2xl shadow-modern p-3 w-72 z-50 animate-slide-up">
            <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
                {emojis.map((emoji, index) => (
                    <button
                        key={index}
                        onClick={() => onEmojiSelect(emoji)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-xl transition-all duration-200 transform hover:scale-110"
                        type="button"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

// GIF Search Component
const GifPicker = ({ onGifSelect, isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);

    const trendingGifs = [
        { id: 1, url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Happy' },
        { id: 2, url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', title: 'Thumbs Up' },
        { id: 3, url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', title: 'Celebration' },
        { id: 4, url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif', title: 'Dancing' },
        { id: 5, url: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif', title: 'Wow' },
        { id: 6, url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', title: 'Love' }
    ];

    useEffect(() => {
        if (isOpen && !searchTerm) {
            setGifs(trendingGifs);
        }
    }, [isOpen]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setGifs(trendingGifs);
            return;
        }
        
        setLoading(true);
        setTimeout(() => {
            setGifs(trendingGifs.filter(gif => 
                gif.title.toLowerCase().includes(searchTerm.toLowerCase())
            ));
            setLoading(false);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-full left-0 mb-2 glass rounded-2xl shadow-modern p-4 w-80 z-50 animate-slide-up">
            <div className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="GIF ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="input-modern flex-1 text-sm"
                    />
                    <button
                        onClick={handleSearch}
                        className="btn-primary px-4 py-2 text-sm"
                        type="button"
                    >
                        🔍
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {loading ? (
                    <div className="col-span-2 text-center py-8">
                        <div className="spinner-modern mx-auto"></div>
                    </div>
                ) : gifs.length > 0 ? (
                    gifs.map(gif => (
                        <button
                            key={gif.id}
                            onClick={() => onGifSelect(gif.url)}
                            className="rounded-xl overflow-hidden hover:opacity-80 transition-all duration-200 transform hover:scale-105"
                            type="button"
                        >
                            <img 
                                src={gif.url} 
                                alt={gif.title}
                                className="w-full h-20 object-cover"
                            />
                        </button>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-4 text-slate-500">
                        GIF bulunamadı
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatPanel = ({ user, allUsers, onUserSelect, onClose }) => {
    const { onlineUsers, messages, socket, unreadCounts, markMessagesAsRead } = useData();
    const { success, error } = useToast();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messageContent, setMessageContent] = useState("");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const chatPanelRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (chatPanelRef.current && !chatPanelRef.current.contains(event.target)) {
                if (!event.target.closest('[data-chat-trigger="true"]')) {
                    if (onClose) {
                        onClose();
                    }
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const selectedUser = useMemo(() => allUsers.find(u => u.id === selectedUserId), [allUsers, selectedUserId]);

    const handleUserClick = (userId) => {
        setSelectedUserId(userId);
        if (unreadCounts[userId] > 0) {
            markMessagesAsRead(userId);
        }
        if (onUserSelect) onUserSelect(userId);
    };

    const filteredMessages = useMemo(() => {
        if (!selectedUserId) return [];
        return (messages || []).filter(m =>
            (m.senderId === user.id && m.recipientId === selectedUserId) ||
            (m.senderId === selectedUserId && m.recipientId === user.id)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [messages, user.id, selectedUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [filteredMessages]);

    const handleSendMessage = (e, messageType = 'text', content = null) => {
        e?.preventDefault();
        const finalContent = content || messageContent.trim();
        
        if (!finalContent || !selectedUserId || !socket) return;
        
        socket.emit('send_message', { 
            senderId: user.id, 
            recipientId: selectedUserId, 
            content: finalContent,
            type: messageType 
        });
        setMessageContent("");
        setIsEmojiPickerOpen(false);
        setIsGifPickerOpen(false);
    };

    const handleEmojiSelect = (emoji) => {
        setMessageContent(prev => prev + emoji);
        setIsEmojiPickerOpen(false);
    };

    const handleGifSelect = (gifUrl) => {
        handleSendMessage(null, 'gif', gifUrl);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            error('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return;
        }

        const fileName = file.name;
        handleSendMessage(null, 'file', `📁 ${fileName}`);
        success(`${fileName} dosyası gönderildi`);
        e.target.value = '';
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const istanbulTime = new Date(date.toLocaleString("en-US", {timeZone: "Europe/Istanbul"}));
        const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Istanbul"}));
        
        const diffInMinutes = Math.floor((now - istanbulTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return istanbulTime.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Europe/Istanbul'
        });
        
        if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
        
        const today = new Date().toDateString();
        const messageDate = istanbulTime.toDateString();
        
        if (messageDate === today) {
            return istanbulTime.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Europe/Istanbul'
            });
        }
        
        return istanbulTime.toLocaleDateString('tr-TR', {
            timeZone: 'Europe/Istanbul'
        }) + ' ' + istanbulTime.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Europe/Istanbul'
        });
    };

    const renderMessage = (msg) => {
        const isOwn = msg.senderId === user.id;
        
        return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl relative transition-all duration-300 hover:shadow-lg ${isOwn 
                    ? 'gradient-primary text-white rounded-br-md shadow-modern' 
                    : 'glass text-slate-800 dark:text-slate-200 shadow-modern rounded-bl-md border border-white/20 dark:border-slate-700/50'
                }`}>
                    {msg.type === 'gif' ? (
                        <div className="mb-2">
                            <img 
                                src={msg.content} 
                                alt="GIF" 
                                className="max-w-full h-auto rounded-xl shadow-lg"
                                style={{ maxHeight: '200px' }}
                            />
                        </div>
                    ) : msg.type === 'file' ? (
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">📎</span>
                            <span className="text-sm font-medium">{msg.content}</span>
                        </div>
                    ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                    <div className={`text-xs mt-2 ${isOwn 
                        ? 'text-blue-100' 
                        : 'text-slate-500 dark:text-slate-400'
                    } text-right`}>
                        {formatMessageTime(msg.timestamp)}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div ref={chatPanelRef} className="fixed bottom-28 right-6 w-[700px] h-[85vh] max-w-[95vw] max-h-[90vh] glass rounded-2xl shadow-modern flex flex-col z-40 border border-white/20 dark:border-slate-700/50 animate-slide-up">
            <div className="w-full h-full flex">
                {/* Contacts Sidebar */}
                <div className="w-2/5 border-r border-white/20 dark:border-slate-700/50 flex flex-col">
                    <div className="p-4 border-b border-white/20 dark:border-slate-700/50 gradient-secondary flex items-center justify-between rounded-tl-2xl">
                        <h3 className="font-bold text-center text-slate-800 dark:text-slate-200">
                            💬 Kişiler ({allUsers.filter(u => u.id !== user.id).length})
                        </h3>
                        <button 
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-200"
                        >
                            ✕
                        </button>
                    </div>
                    <ul className="flex-1 overflow-y-auto">
                        {allUsers.filter(u => u.id !== user.id).map(contact => {
                            const isOnline = onlineUsers.some(ou => ou.id === contact.id);
                            const contactInitials = (contact.fullName || '??').split(' ').map(n => n[0]).join('');
                            const unreadCount = unreadCounts[contact.id] || 0;
                            
                            return (
                                <li key={contact.id}>
                                    <button 
                                        onClick={() => handleUserClick(contact.id)} 
                                        className={`w-full text-left p-4 flex items-center gap-3 hover:bg-white/10 dark:hover:bg-slate-700/30 transition-all duration-200 ${selectedUserId === contact.id ? 'bg-blue-100/20 dark:bg-blue-900/20' : ''}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 gradient-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                                {contactInitials}
                                            </div>
                                            {isOnline && (
                                                <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 animate-pulse"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">
                                                    {contact.fullName}
                                                </span>
                                                {unreadCount > 0 && (
                                                    <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs rounded-full px-2 py-0.5 font-bold min-w-[20px] text-center animate-bounce shadow-lg">
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {contact.role}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Chat Area */}
                <div className="w-3/5 flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/20 dark:border-slate-700/50 gradient-secondary flex items-center gap-3 rounded-tr-2xl">
                                <div className="w-10 h-10 gradient-primary text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                                    {selectedUser.fullName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedUser.fullName}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.role}</p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 p-4 overflow-y-auto gradient-secondary">
                                {filteredMessages.length === 0 ? (
                                    <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
                                        <div className="w-20 h-20 gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center text-4xl animate-float">
                                            💬
                                        </div>
                                        <p className="font-semibold">Henüz mesaj yok</p>
                                        <p className="text-xs">İlk mesajı gönderin!</p>
                                    </div>
                                ) : (
                                    filteredMessages.map(renderMessage)
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-white/20 dark:border-slate-700/50 glass rounded-br-2xl">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" 
                                            value={messageContent} 
                                            onChange={e => setMessageContent(e.target.value)} 
                                            className="input-modern pr-16" 
                                            placeholder="Mesajınızı yazın..." 
                                            maxLength={500}
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                                            {messageContent.length}/500
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={!messageContent.trim()}
                                        className="btn-primary px-8 py-4 text-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                                        title="Mesaj Gönder"
                                    >
                                        🚀
                                    </button>
                                </form>
                                
                                {/* Media Controls */}
                                <div className="flex items-center gap-4 mt-4 relative">
                                    {/* Emoji Picker */}
                                    <div className="relative">
                                        <button 
                                            type="button"
                                            className="p-3 text-slate-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover-lift" 
                                            onClick={() => {
                                                setIsEmojiPickerOpen(!isEmojiPickerOpen);
                                                setIsGifPickerOpen(false);
                                            }}
                                            title="Emoji Ekle"
                                        >
                                            <span className="text-2xl">😀</span>
                                        </button>
                                        <EmojiPicker 
                                            isOpen={isEmojiPickerOpen}
                                            onEmojiSelect={handleEmojiSelect}
                                            onClose={() => setIsEmojiPickerOpen(false)}
                                        />
                                    </div>

                                    {/* GIF Picker */}
                                    <div className="relative">
                                        <button 
                                            type="button"
                                            className="p-3 text-slate-500 hover:text-purple-600 transition-all duration-200 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover-lift" 
                                            onClick={() => {
                                                setIsGifPickerOpen(!isGifPickerOpen);
                                                setIsEmojiPickerOpen(false);
                                            }}
                                            title="GIF Ekle"
                                        >
                                            <span className="text-2xl">🎬</span>
                                        </button>
                                        <GifPicker 
                                            isOpen={isGifPickerOpen}
                                            onGifSelect={handleGifSelect}
                                            onClose={() => setIsGifPickerOpen(false)}
                                        />
                                    </div>

                                    {/* File Upload */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                    />
                                    <button 
                                        type="button"
                                        className="p-3 text-slate-500 hover:text-green-600 transition-all duration-200 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover-lift" 
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Dosya Ekle"
                                    >
                                        <span className="text-2xl">📎</span>
                                    </button>

                                    <div className="flex-1"></div>
                                    
                                    {/* Online Status */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {onlineUsers.length} çevrimiçi
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 p-6 text-center gradient-secondary rounded-tr-2xl rounded-br-2xl">
                            <div>
                                <div className="w-24 h-24 gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center text-4xl animate-float">
                                    💬
                                </div>
                                <h3 className="font-semibold mb-2 text-lg">Mesajlaşma</h3>
                                <p className="text-sm">Konuşma başlatmak için soldaki listeden bir kişi seçin</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;