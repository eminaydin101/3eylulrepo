import React, { useState, useEffect, useMemo, useRef } from 'react';

const ChatPanel = ({ user, allUsers, onlineUsers, messages, socket, unreadCounts, onUserSelect }) => {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messageContent, setMessageContent] = useState("");
    const messagesEndRef = useRef(null);
    const selectedUser = allUsers.find(u => u.id === selectedUserId);

    const handleUserClick = (userId) => {
        setSelectedUserId(userId);
        onUserSelect(userId); // Okunmamış mesaj sayısını sıfırlamak için
    };

    const filteredMessages = useMemo(() => {
        if (!selectedUserId) return [];
        return (messages || []).filter(m =>
            (m.senderId === user.id && m.recipientId === selectedUserId) ||
            (m.senderId === selectedUserId && m.recipientId === user.id)
        );
    }, [messages, user.id, selectedUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageContent.trim() || !selectedUserId || !socket) return;
        socket.emit('send_message', { 
            senderId: user.id, 
            recipientId: selectedUserId, 
            content: messageContent,
            type: 'text'
        });
        setMessageContent("");
    };

    const MessageContent = ({ message }) => {
        return <p>{message.content}</p>;
    };

    return (
        <div className="fixed bottom-24 right-6 w-96 h-[60vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-40 border dark:border-slate-700">
            <div className="w-full h-full flex">
                <div className="w-1/3 border-r dark:border-slate-700 flex flex-col">
                    <h3 className="p-3 font-bold text-center border-b dark:border-slate-700 text-slate-800 dark:text-slate-200">Kişiler</h3>
                    <ul className="flex-1 overflow-y-auto">
                        {allUsers.filter(u => u.id !== user.id).map(contact => (
                            <li key={contact.id}>
                                <button onClick={() => handleUserClick(contact.id)} className={`w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-700 ${selectedUserId === contact.id ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{contact.fullName}</span>
                                        {(unreadCounts[contact.id] || 0) > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCounts[contact.id]}</span>}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-2/3 flex flex-col">
                    {selectedUser ? (
                        <>
                            <div className="p-3 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"><h3 className="font-bold text-center text-slate-800 dark:text-slate-200">{selectedUser.fullName}</h3></div>
                            <div className="flex-1 p-4 overflow-y-auto bg-slate-100 dark:bg-slate-900 space-y-4">
                                {filteredMessages.map(msg => ( <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}> <div className={`max-w-[80%] px-3 py-2 rounded-xl ${msg.senderId === user.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}> <MessageContent message={msg} /> </div> </div> ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-2 border-t dark:border-slate-700 flex gap-2">
                                <input type="text" value={messageContent} onChange={e => setMessageContent(e.target.value)} className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" placeholder="Mesajınızı yazın..." />
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Gönder</button>
                            </form>
                        </>
                    ) : ( <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">Konuşma seçin</div> )}
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;