import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import { HiSparkles, HiX } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import chatbotAvatar from '../assets/chatbot-avatar.svg';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', content: 'Xin chào! Tôi là trợ lý ảo Ozic House. Tôi có thể giúp gì cho bạn?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAutoPromptTyping, setIsAutoPromptTyping] = useState(false);
    const [hasLocationPromptSent, setHasLocationPromptSent] = useState(false);
    const [showGreetingBubble, setShowGreetingBubble] = useState(() => {
        return localStorage.getItem('ozic_chatbot_greeting_hidden') !== 'true';
    });
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (showGreetingBubble || localStorage.getItem('ozic_chatbot_greeting_hidden') === 'true') return;

        const timer = setTimeout(() => {
            setShowGreetingBubble(true);
        }, 12000);

        return () => clearTimeout(timer);
    }, [showGreetingBubble]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [chatHistory, isOpen]);

    useEffect(() => {
        if (!isOpen || hasLocationPromptSent) return;

        const showTypingTimer = setTimeout(() => {
            setIsAutoPromptTyping(true);
        }, 2000);

        const sendPromptTimer = setTimeout(() => {
            setIsAutoPromptTyping(false);
            setChatHistory(prev => [
                ...prev,
                { role: 'ai', content: 'Bạn cần tìm phòng ở tỉnh/thành phố, quận/huyện hay phường/xã nào?' }
            ]);
            setHasLocationPromptSent(true);
        }, 3200);

        return () => {
            clearTimeout(showTypingTimer);
            clearTimeout(sendPromptTimer);
        };
    }, [isOpen, hasLocationPromptSent]);

    const formatMessage = (text) => {
        if (!text) return '';
        
        // Regex for links: /phong-tro/[ID] or /phong-tro/ID
        const linkRegex = /\/phong-tro\/\[?(\d+)\]?/g;
        // Regex for bold: **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        
        const parts = [];
        let lastIndex = 0;
        
        // Match both and sort by index
        const matches = [];
        let match;
        
        while ((match = linkRegex.exec(text)) !== null) {
            matches.push({ type: 'link', index: match.index, length: match[0].length, content: match[0], roomId: match[1] });
        }
        
        linkRegex.lastIndex = 0; // Reset
        while ((match = boldRegex.exec(text)) !== null) {
            matches.push({ type: 'bold', index: match.index, length: match[0].length, content: match[1] });
        }
        boldRegex.lastIndex = 0; // Reset

        matches.sort((a, b) => a.index - b.index);

        matches.forEach((m, i) => {
            if (m.index > lastIndex) {
                let segment = text.substring(lastIndex, m.index);
                // Xóa bỏ các ký tự phân cách dư thừa thường xuất hiện giữa các link (dấu gạch, dấu hai chấm, xuống dòng)
                segment = segment.replace(/^[\s\-\:\.\,]+|[\s\-\:\.\,]+$/g, '');
                if (segment.trim()) {
                    parts.push(segment);
                }
            }
            
            if (m.type === 'link') {
                lastIndex = m.index + m.length;
                return;
            } else {
                parts.push(
                    <strong key={`bold-${i}`} className="font-extrabold text-blue-900 bg-yellow-100 px-1 rounded mx-0.5">
                        {m.content}
                    </strong>
                );
            }
            lastIndex = m.index + m.length;
        });

        if (lastIndex < text.length) {
            let finalSegment = text.substring(lastIndex);
            finalSegment = finalSegment.replace(/^[\s\-\:\.\,]+|[\s\-\:\.\,]+$/g, '');
            if (finalSegment.trim()) {
                parts.push(finalSegment);
            }
        }

        return parts.length > 0 ? parts : (text.includes('/phong-tro/') ? '' : text);
    };

    const sendMessageText = async (rawMessage) => {
        const userMsg = String(rawMessage || '').trim();
        if (!userMsg || isLoading) return;

        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const apiHistory = chatHistory
                .filter((_, index) => index !== 0) // Skip first AI greeting
                .map(h => ({
                    role: h.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: h.content }]
                }));

            const res = await axios.post('/api/ai/chat', {
                message: userMsg,
                history: apiHistory
            }, {
                withCredentials: true
            });

            const aiReply = res.data.reply;
            const suggestedRooms = res.data.suggestedRooms || [];
            
            // Extract Room IDs from reply
            const mentionedIds = [];
            const idRegex = /\/phong-tro\/\[?(\d+)\]?/g;
            let m;
            while ((m = idRegex.exec(aiReply)) !== null) {
                mentionedIds.push(parseInt(m[1]));
            }

            // Find matching room details
            const matchedRooms = suggestedRooms.filter(r => mentionedIds.includes(r.ID_Phong));

            setChatHistory(prev => [
                ...prev,
                { role: 'ai', content: aiReply, rooms: matchedRooms }
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            setChatHistory(prev => [
                ...prev,
                { role: 'ai', content: 'Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại sau nhé!' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;
        const userMsg = message;
        setMessage('');
        await sendMessageText(userMsg);
    };

    const quickGreeting = 'Chào bạn! OZIC HOUSE rất vui được hỗ trợ bạn.';
    const suggestedQuestions = [
        'Dưới 2 triệu',
        'Dưới 3 triệu',
        'Dưới 4 triệu',
        'Dưới 5 triệu'
    ];

    if (!isOpen) {
        return (
            <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-1">
                {showGreetingBubble && (
                    <div className="relative max-w-[260px] mb-1">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-full bg-white text-gray-800 text-sm leading-relaxed px-4 py-3 rounded-2xl shadow-lg border border-gray-100 text-left hover:shadow-xl transition-shadow"
                            aria-label="Mở trợ lý AI từ lời chào"
                        >
                            {quickGreeting}
                        </button>
                        <div className="absolute -bottom-2 right-7 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45"></div>
                        <div className="absolute -bottom-5 right-[34px] w-1 h-4 bg-white border-x border-gray-100 rounded-full"></div>
                        <button
                            onClick={() => {
                                setShowGreetingBubble(false);
                                localStorage.setItem('ozic_chatbot_greeting_hidden', 'true');
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center shadow hover:bg-gray-700 transition-colors"
                            aria-label="Đóng lời chào"
                        >
                            <HiX className="text-sm" />
                        </button>
                    </div>
                )}

                <button 
                    onClick={() => setIsOpen(true)}
                    className={`w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 animate-bounce border border-blue-100 ${showGreetingBubble ? 'mt-3' : ''}`}
                    aria-label="Mở trợ lý AI"
                >
                    <img src={chatbotAvatar} alt="AI Chatbot" className="w-14 h-14 rounded-full object-cover" />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
            <div className="bg-white rounded-2xl shadow-2xl w-[350px] md:w-[400px] h-[500px] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center text-white shadow-lg shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <HiSparkles className="text-xl text-yellow-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">OZIC HOUSE</h3>
                            <p className="text-xs text-blue-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Đang trực tuyến
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { 
                            setIsOpen(false); 
                            if (localStorage.getItem('ozic_chatbot_greeting_hidden') !== 'true') {
                                setShowGreetingBubble(true);
                            }
                        }} 
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <HiX className="text-xl" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }`}>
                                {msg.role === 'ai' ? formatMessage(msg.content) : msg.content}
                            </div>
                            
                            {msg.role === 'ai' && msg.rooms && msg.rooms.length > 0 && (
                                <div className="mt-3 flex flex-col gap-2 w-full max-w-[85%]">
                                    {msg.rooms.map(room => (
                                        <Link 
                                            key={room.ID_Phong}
                                            to={`/phong-tro/${room.ID_Phong}`}
                                            className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                                        >
                                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                                                {room.AnhDaiDien ? (
                                                    <img 
                                                        src={room.AnhDaiDien.startsWith('http') 
                                                            ? room.AnhDaiDien 
                                                            : `${room.AnhDaiDien.startsWith('/') ? '' : '/'}${room.AnhDaiDien}`} 
                                                        alt={room.TieuDe}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">🖼️</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-[11px] text-gray-800 truncate line-clamp-1 group-hover:text-blue-600">
                                                    {room.TieuDe}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-blue-600 font-bold text-xs">
                                                        {room.Gia?.toLocaleString('vi-VN')}đ
                                                    </span>
                                                    <span className="text-gray-400 text-[10px]">• {room.DienTich}m²</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 truncate">{room.TenQuanHuyen}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {(isLoading || isAutoPromptTyping) && (
                        <div className="flex justify-start">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t shrink-0">
                    <div className="mb-3 flex flex-nowrap gap-2 overflow-x-auto scrollbar-thin pb-1">
                        {suggestedQuestions.map((question) => (
                            <button
                                key={question}
                                type="button"
                                onClick={() => sendMessageText(question)}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập câu hỏi..."
                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button 
                            type="submit"
                            disabled={!message.trim() || isLoading}
                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-200"
                        >
                            <FaPaperPlane size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIChatbot;
