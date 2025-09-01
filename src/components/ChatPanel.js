import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';

const AttachmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 10-6 0v4a1 1 0 102 0V7a1 1 0 112 0v4a3 3 0 11-6 0V7a5 5 0 0110 0v4a5 5 0 01-10 0V7a3 3 0 00-3-3z" clipRule="evenodd" /></svg>;
const EmojiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" /></svg>;

const ChatPanel = ({ user, allUsers, onUserSelect, onClose }) => {
    const { onlineUsers, messages, socket, unreadCounts, markMessagesAsRead } = useData();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messageContent, setMessageContent] = useState("");
    const messagesEndRef = useRef(null);
    const chatPanelRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (chatPanelRef.current && !chatPanelRef.current.contains(event.target)) {
                if (!event.target.closest('[title="Mesajlaşma"]')) {
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
        // Okunmamış mesaj sayısını sıfırla
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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageContent.trim() || !selectedUserId || !socket) return;
        socket.emit('send_message', { senderId: user.id, recipientId: selectedUserId, content: messageContent });
        setMessageContent("");
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Az önce';
        if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <div ref={chatPanelRef} className="fixed bottom-24 right-6 w-[500px] h-[65vh] max-w-[90vw] max-h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-40 border dark:border-slate-700">
            <div className="w-full h-full flex">
                <div className="w-2/5 border-r dark:border-slate-700 flex flex-col">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <h3 className="font-bold text-center text-slate-800 dark:text-slate-200">
                            Kişiler ({allUsers.filter(u => u.id !== user.id).length})
                        </h3>
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
                                        className={`w-full text-left p-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${selectedUserId === contact.id ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
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

                <div className="w-3/5 flex flex-col">
                    {selectedUser ? (
                        <>
                            <div className="p-3 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                    {selectedUser.fullName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedUser.fullName}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.role}</p>
                                </div>
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto bg-slate-100 dark:bg-slate-900 space-y-4">
                                {filteredMessages.length === 0 ? (
                                    <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
                                        <div className="w-16 h-16 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            💬
                                        </div>
                                        <p>Henüz mesaj yok</p>
                                        <p className="text-xs">İlk mesajı gönderin!</p>
                                    </div>
                                ) : (
                                    filteredMessages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] px-3 py-2 rounded-xl relative ${msg.senderId === user.id 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                                            }`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${msg.senderId === user.id 
                                                    ? 'text-blue-100' 
                                                    : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {formatMessageTime(msg.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-3 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={messageContent} 
                                        onChange={e => setMessageContent(e.target.value)} 
                                        className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200" 
                                        placeholder="Mesajınızı yazın..." 
                                        maxLength={500}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!messageContent.trim()}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Gönder
                                    </button>
                                </form>
                                <div className="flex items-center gap-2 mt-2">
                                    <button 
                                        className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" 
                                        onClick={() => alert('Emoji özelliği yakında!')}
                                        title="Emoji"
                                    >
                                        <EmojiIcon />
                                    </button>
                                    <button 
                                        className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" 
                                        onClick={() => alert('Dosya gönderme özelliği yakında!')}
                                        title="Dosya Ekle"
                                    >
                                        <AttachmentIcon />
                                    </button>
                                    <span className="text-xs text-slate-400 ml-auto">
                                        {messageContent.length}/500
                                    </span>
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