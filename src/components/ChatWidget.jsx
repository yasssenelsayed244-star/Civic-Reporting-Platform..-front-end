import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { MessageCircle, X, Send, Bot, User, Mic, MicOff, Sparkles } from 'lucide-react';

export default function ChatWidget() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: t('chat.welcome') }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEnd = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = document.documentElement.lang === 'ar' ? 'ar-EG' : 'en-US';
        recognitionRef.current.start();
      }
    }
  };

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { data } = await chatAPI.send(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: data.data.response }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'عذراً، أواجه صعوبة في الاتصال بالخادم حالياً. 😔\nيرجى المحاولة مرة أخرى لاحقاً.' 
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-accent-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <MessageCircle size={26} className="group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary-400"></span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up backdrop-blur-xl">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-card)] border-b border-[var(--border-light)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-md relative">
                <Bot size={20} className="text-white" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-[var(--bg-card)]"></span>
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1.5">
                  {t('chat.title')}
                  <Sparkles size={12} className="text-amber-500" />
                </h3>
                <span className="text-xs text-[var(--text-secondary)] font-medium">AI Assistant</span>
              </div>
            </div>
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors" 
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-[var(--bg-body)]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]' : 'bg-gradient-to-br from-primary-500 to-accent-600 text-white'}`}>
                  {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div 
                  dir="auto"
                  className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-br-sm' 
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-bl-sm'
                }`}>
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>{line}<br/></span>
                  ))}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-end gap-2.5 self-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={14} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] rounded-bl-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-light)] shrink-0">
            <div className="relative flex items-center bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
              <input
                dir="auto"
                className="w-full bg-transparent border-none py-3 pl-4 pr-2 text-sm text-[var(--text-primary)] focus:outline-none"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
              />
              <div className="flex items-center gap-1 pr-2">
                {window.SpeechRecognition || window.webkitSpeechRecognition ? (
                  <button
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isListening ? 'bg-red-500/10 text-red-500' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'}`}
                    onClick={toggleListening}
                    title="Voice Input"
                  >
                    {isListening ? <Mic size={16} className="animate-pulse" /> : <MicOff size={16} />}
                  </button>
                ) : null}
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                >
                  <Send size={14} className={!input.trim() || loading ? '' : 'translate-x-[1px] -translate-y-[1px]'} />
                </button>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-[var(--text-tertiary)] font-medium">Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
