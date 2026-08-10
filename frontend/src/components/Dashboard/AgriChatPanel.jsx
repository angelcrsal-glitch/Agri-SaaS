
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Thermometer, Droplets, AlertTriangle, History, MessageSquare, CheckCircle, Clock, Paperclip, Image as ImageIcon, Trash2 } from 'lucide-react';

import { useField } from '../../context/FieldContext';

const AgriChatPanel = ({ field, onClose }) => {
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'history'
    const { chatHistory: messages, setChatHistory: setMessages } = useField();
    // const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Only initialize if history is empty
        if (messages.length === 0) {
            const riskScore = field?.analysis_data?.risk_score || 0;
            const initialMessage = {
                id: Date.now(),
                sender: 'ai',
                text: field
                    ? `Hello! I'm tracking ${field.name}. Current risk is ${riskScore}. Ask me for a recommendation.`
                    : `Hello! I'm your AgriSaaS AI Assistant. Select a field on the map to get specific analysis, or ask me general questions here.`
            };
            setMessages([initialMessage]);
        }
    }, [field]); // Removed messages dependency to prevent loops, and logic checks length anyway.
    // UseEffect dependency on 'field' allows re-init if field changes and we decided to clear history (which we aren't doing automatically here, but if we wanted to, we'd need to clear messages first).
    // For now, simple persistence check.

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, activeTab]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: inputValue
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = inputValue;
        setInputValue('');

        // Prepare context for AI
        const context = {
            name: field?.name || "General",
            crop: field?.crop_type || "Unknown",
            risk: field?.analysis_data?.risk_score || 0,
            moisture: field?.analysis_data?.moisture || 0,
            temp: field?.analysis_data?.temp || 0
        };

        try {
            const formData = new FormData();
            formData.append('message', inputValue);
            formData.append('context', JSON.stringify(context));

            if (selectedImage) {
                formData.append('file', selectedImage);

                // Add user message with image preview to chat immediately
                const userMsg = {
                    id: Date.now(),
                    sender: 'user',
                    text: inputValue,
                    image: URL.createObjectURL(selectedImage)
                };
                // We need to handle this manually since standard flow adds text only
                // Actually, let's just let the standard flow add text, and we modify how messages are rendered?
                // Or easier: update the messages state here for User, then clear input.
                // But the existing code adds user message via ... wait, existing code ONLY adds AI message?
                // Ah, I missed where User message is added.
                // Looking at the code, it seems I missed the User message addition in previous logical steps or it's implicitly handled?
                // Let's check the lines I'm replacing...

                // Wait, I don't see setMessages for USER in the previous code block I read. 
                // Line 48-52 in the file view (which is cached/old) show:
                // const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
                // setMessages(prev => [...prev, userMsg]);

                // So I should replicate that but with image support.
            }

            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                // body is formData, Content-Type header not set (browser sets it with boundary for multipart)
                body: formData,
            });

            // Clear image after sending
            setSelectedImage(null);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch response');
            }

            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.response
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Error fetching AI response:', error);
            const errorMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "I'm having trouble reaching the server. Please try again."
            };
        } finally {
            // Clear image state so it doesn't get stuck in preview
            setSelectedImage(null);
            // Crucial: Reset the hidden file input element value so we can select the same file again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Removed: if (!field) return null; because we want to show it even without a field

    const riskScore = field?.analysis_data?.risk_score || 0;
    let riskColor = 'text-green-500';
    if (riskScore > 70) riskColor = 'text-red-500';
    else if (riskScore > 40) riskColor = 'text-yellow-500';

    // Mock History Data
    const historyEvents = [
        {
            id: 1,
            date: 'Today',
            title: 'Critical Alert: Moisture 15%',
            status: 'Unresolved',
            type: 'alert',
            color: 'text-red-500',
            borderColor: 'border-red-500'
        },
        {
            id: 2,
            date: 'Feb 1',
            title: 'Irrigation Applied',
            status: 'Confirmed by user',
            type: 'success',
            color: 'text-emerald-500',
            borderColor: 'border-emerald-500'
        },
        {
            id: 3,
            date: 'Jan 28',
            title: 'Warning: High Temp Forecast',
            status: 'System Alert',
            type: 'warning',
            color: 'text-amber-500',
            borderColor: 'border-amber-500'
        }
    ];

    return (
        <div className="h-full w-full bg-slate-950 flex flex-col">

            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div>
                    <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <span>{field ? '🌱' : '🤖'}</span> {field ? `Monitoring: ${field.name}` : 'AgriSaaS AI Agent'}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/30">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'chat' ? 'text-emerald-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }`}
                >
                    <MessageSquare size={16} />
                    AI Assistant
                    {activeTab === 'chat' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'history' ? 'text-emerald-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }`}
                >
                    <History size={16} />
                    Field History
                    {activeTab === 'history' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
                    )}
                </button>
            </div>

            {/* Data Context (Always Visible or just for chat? Prompt said "Just below header", let's keep it for Chat mainly, or both. 
          If I keep it for both, it pushes content down. Let's put it inside Chat tab for cleaner vertical space in History?
          Actually, checking context while looking at history is useful. Let's keep it global for now, below tabs.) 
       */}
            {/* Decision: Put inside 'chat' tab to maximize space for history, OR keep global.
           Prompt said: "Data Context: Just below the header". 
           If I follow "Tabs at the top", it implies Header -> Tabs -> Content.
           Let's put Data Context INSIDE the AI Assistant tab to match the flow "Chat with AI about THIS context".
           History has its own context (events).
       */}

            <div className="flex-1 overflow-hidden flex flex-col relative">

                {/* VIEW: Chat */}
                {activeTab === 'chat' && (
                    <>
                        {/* Data Context - Only if field is selected */}
                        {field && (
                            <div className="p-4 grid grid-cols-3 gap-2 border-b border-slate-800 bg-slate-800/20 shrink-0">
                                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <AlertTriangle size={16} className={riskColor} />
                                    <span className={`text-xs font-bold mt-1 ${riskColor}`}>{riskScore} Risk</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <Droplets size={16} className="text-blue-400" />
                                    <span className="text-xs font-bold mt-1 text-slate-200">
                                        {field.analysis_data?.moisture || 'N/A'}%
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <Thermometer size={16} className="text-orange-400" />
                                    <span className="text-xs font-bold mt-1 text-slate-200">
                                        {field.analysis_data?.temp || 'N/A'}°
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm border ${msg.sender === 'user'
                                            ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-50 rounded-tr-sm'
                                            : 'bg-slate-800/80 border-slate-700 text-slate-200 rounded-tl-sm'
                                            }`}
                                    >
                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="Uploaded"
                                                className="mb-2 max-w-full rounded-lg border border-white/10"
                                            />
                                        )}
                                        {msg.text && <p>{msg.text}</p>}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
                            <div className="flex flex-col gap-2">
                                {selectedImage && (
                                    <div className="relative inline-block w-fit">
                                        <img
                                            src={URL.createObjectURL(selectedImage)}
                                            alt="Preview"
                                            className="h-16 w-auto rounded-lg border border-slate-700 object-cover"
                                        />
                                        <button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute -top-1 -right-1 bg-slate-800 text-slate-400 rounded-full p-0.5 border border-slate-700 hover:text-white"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setSelectedImage(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Ask about this field..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() && !selectedImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* VIEW: History */}
                {activeTab === 'history' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Activity Timeline</h3>
                        <div className="relative border-l border-slate-800 ml-3 space-y-8">
                            {field ? (
                                historyEvents.map((event) => (
                                    <div key={event.id} className="relative pl-8">
                                        {/* Dot */}
                                        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${event.type === 'alert' ? 'bg-red-500' :
                                            event.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`}></div>

                                        <span className="text-xs font-mono text-slate-500 mb-1 block">{event.date}</span>
                                        <div className={`p-3 rounded-xl border bg-slate-800/30 ${event.type === 'alert' ? 'border-red-500/20' :
                                            event.type === 'success' ? 'border-emerald-500/20' : 'border-amber-500/20'
                                            }`}>
                                            <h4 className={`text-sm font-semibold mb-1 ${event.color}`}>{event.title}</h4>
                                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                                {event.type === 'success' ? <CheckCircle size={12} /> :
                                                    event.type === 'alert' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                                                {event.status}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full pt-10 text-slate-500 space-y-4">
                                    <History size={48} className="text-slate-700" />
                                    <p className="text-center text-sm px-8">Select a saved field from the left sidebar to view its historical analysis logs.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AgriChatPanel;
