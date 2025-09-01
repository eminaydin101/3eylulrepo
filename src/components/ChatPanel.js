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
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-2 w-64 z-50">
            <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
                {emojis.map((emoji, index) => (
                    <button
                        key={index}
                        onClick={() => onEmojiSelect(emoji)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-lg"
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

    // Trending GIFs (mock data)
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
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-3 w-80 z-50">
            <div className="mb-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="GIF ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600 dark:text-slate-200"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        type="button"
                    >
                        🔍
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {loading ? (
                    <div className="col-span-2 text-center py-4 text-slate-500">
                        Aranıyor...
                    </div>
                ) : gifs.length > 0 ? (
                    gifs.map(gif => (
                        <button
                            key={gif.id}
                            onClick={() => onGifSelect(gif.url)}
                            className="rounded overflow-hidden hover:opacity-80 transition-opacity"
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

        // File size check (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            error('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return;
        }

        // Create a file URL for preview
        const fileName = file.name;
        
        // Send file message
        handleSendMessage(null, 'file', `📁 ${fileName}`);
        
        success(`${fileName} dosyası gönderildi`);
        e.target.value = ''; // Reset input
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
    };

    const renderMessage = (msg) => {
        const isOwn = msg.senderId === user.id;
        
        return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl relative ${isOwn 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-600 rounded-bl-md'
                }`}>
                    {msg.type === 'gif' ? (
                        <div className="mb-2">
                            <img 
                                src={msg.content} 
                                alt="GIF" 
                                className="max-w-full h-auto rounded-lg"
                                style={{ maxHeight: '200px' }}
                            />
                        </div>
                    ) : msg.type === 'file' ? (
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📎</span>
                            <span className="text-sm">{msg.content}</span>
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
        <div ref={chatPanelRef} className="fixed bottom-28 right-6 w-[650px] h-[80vh] max-w-[95vw] max-h-[85vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-40 border dark:border-slate-700">
            <div className="w-full h-full flex">
                {/* Contacts Sidebar */}
                <div className="w-2/5 border-r dark:border-slate-700 flex flex-col">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                        <h3 className="font-bold text-center text-slate-800 dark:text-slate-200">
                            💬 Kişiler ({allUsers.filter(u => u.id !== user.id).length})
                        </h3>
                        <button 
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
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
                                        className={`w-full text-left p-4 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${selectedUserId === contact.id ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {contactInitials}
                                            </div>
                                            {isOnline && (
                                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">
                                                    {contact.fullName}
                                                </span>
                                                {unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold min-w-[20px] text-center">
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
                            <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                    {selectedUser.fullName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedUser.fullName}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.role}</p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                                {filteredMessages.length === 0 ? (
                                    <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
                                        <div className="w-16 h-16 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            💬
                                        </div>
                                        <p>Henüz mesaj yok</p>
                                        <p className="text-xs">İlk mesajı gönderin!</p>
                                    </div>
                                ) : (
                                    filteredMessages.map(renderMessage)
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" 
                                            value={messageContent} 
                                            onChange={e => setMessageContent(e.target.value)} 
                                            className="w-full p-3 pr-16 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200" 
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
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        📤
                                    </button>
                                </form>
                                
                                {/* Media Controls */}
                                <div className="flex items-center gap-3 mt-3 relative">
                                    {/* Emoji Picker */}
                                    <div className="relative">
                                        <button 
                                            type="button"
                                            className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" 
                                            onClick={() => {
                                                setIsEmojiPickerOpen(!isEmojiPickerOpen);
                                                setIsGifPickerOpen(false);
                                            }}
                                            title="Emoji Ekle"
                                        >
                                            <span className="text-lg">😀</span>
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
                                            className="p-2 text-slate-500 hover:text-purple-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" 
                                            onClick={() => {
                                                setIsGifPickerOpen(!isGifPickerOpen);
                                                setIsEmojiPickerOpen(false);
                                            }}
                                            title="GIF Ekle"
                                        >
                                            <span className="text-lg">🎬</span>
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
                                        className="p-2 text-slate-500 hover:text-green-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" 
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Dosya Ekle"
                                    >
                                        <span className="text-lg">📎</span>
                                    </button>

                                    <div className="flex-1"></div>
                                    
                                    {/* Online Status */}
                                    <div className="text-xs text-slate-400">
                                        {onlineUsers.length} kişi çevrimiçi
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 p-6 text-center">
                            <div>
                                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                                    💬
                                </div>
                                <h3 className="font-semibold mb-2">Mesajlaşma</h3>
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