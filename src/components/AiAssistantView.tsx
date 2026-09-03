import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { FinancialSnapshot, DayForecast, Transaction } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

interface AiAssistantViewProps {
  snapshot: FinancialSnapshot;
  forecast: DayForecast[];
  transactions: Transaction[];
  initialPrompt?: string;
  aiInsights: Array<{
    id: string;
    title: string;
    text: string;
    category: string;
    badge: string;
    type: string;
  }>;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  snapshot,
  forecast,
  transactions,
  initialPrompt,
  aiInsights,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `שלום! אני היועץ הפיננסי החכם של FinOS.
אני מנתח את נתוני התזרים, החשבונות, חיובי האשראי וההוצאות שלך בזמן אמת.
כרגע יש לך ₪${snapshot.realAvailableMoney.toLocaleString()} כסף פנוי אמיתי, והחודש צפוי להסתיים ביתרה של ₪${snapshot.projectedEndOfMonthBalance.toLocaleString()}.

במה אוכל לסייע לך היום? תוכל לשאול אותי שאלות כמו:
• "איך החודש שלי נראה?"
• "אני יכול לקנות עכשיו מחשב ב-3,500 ₪?"
• "איפה אני יכול לחסוך 1,000 ₪ החודש?"
• "כמה הוצאתי על מסעדות וסופר?"`,
      time: 'עכשיו',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      // Call backend AI endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          financialContext: {
            snapshot,
            recentTransactionsCount: transactions.length,
          },
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'מצטער, חלה שגיאה בעיבוד התשובה.';

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('AI chat request failed:', err);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `ניתוח תזרימי מקומי: לפי הנתונים שלך, סך הכסף הפנוי האמיתי עומד על ₪${snapshot.realAvailableMoney.toLocaleString()}. סיום החודש צפוי לעמוד על ₪${snapshot.projectedEndOfMonthBalance.toLocaleString()}. אם ברצונך לבצע רכישה גדולה, מומלץ לבדוק אותה בסימולטור "מה יקרה אם".`,
        time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'איך החודש שלי נראה ואיך הוא יסתיים?',
    'אני יכול לקנות עכשיו משהו ב-3,500 ₪?',
    'איפה אפשר לחסוך 1,000 ₪ בהוצאות?',
    'כמה כסף באמת פנוי לי כרגע?',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#00B894]" />
            <span>יועץ פיננסי אישי מבוסס AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            תובנות חכמות, המלצות לחיסכון ומענה מיידי על שאלות תזרימיות
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side: AI Insights Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
            <h2 className="text-sm font-bold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#FDCB6E]" />
              <span>תובנות אוטומטיות שזוהו</span>
            </h2>

            <div className="space-y-3">
              {aiInsights.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636] text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#2D3436] dark:text-white">{item.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] font-semibold">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.text}</p>
                  <button
                    onClick={() => handleSend(item.text)}
                    className="mt-2 text-[#00B894] hover:text-[#00A383] font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>שאל לגבי תובנה זו</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Quick Questions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
            <h3 className="text-xs font-bold text-[#2D3436] dark:text-white mb-2">
              שאלות מהירות לדוגמה:
            </h3>
            <div className="space-y-1.5">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-right p-2 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] hover:bg-[#EBF7F5] dark:hover:bg-[#00B894]/20 text-xs text-[#2D3436] dark:text-gray-300 hover:text-[#00B894] dark:hover:text-[#00B894] transition-colors border border-[#E1E8E7] dark:border-[#2D3636]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Chat Window (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[640px] rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between bg-[#F4F7F6]/50 dark:bg-[#191D1E]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00B894] flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#2D3436] dark:text-white flex items-center gap-1.5">
                  <span>עוזר AI פיננסי</span>
                  <span className="w-2 h-2 rounded-full bg-[#00B894] inline-block animate-pulse"></span>
                </div>
                <div className="text-[10px] text-gray-400">
                  מחובר לנתוני העו״ש, האשראי והתזרים של המשפחה
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'reset',
                    sender: 'assistant',
                    text: 'השיחה אופסה. כיצד אוכל לעזור לך כעת?',
                    time: 'עכשיו',
                  },
                ])
              }
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#191D1E] transition-colors"
              title="נקה שיחה"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-[#2D3436] text-white dark:bg-slate-700'
                        : 'bg-[#00B894] text-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#00B894] text-white rounded-tr-none'
                        : 'bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-gray-200 rounded-tl-none border border-[#E1E8E7] dark:border-[#2D3636]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className={`text-[9px] mt-1.5 text-left ${
                        isUser ? 'text-[#EBF7F5]' : 'text-gray-400'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00B894] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#F4F7F6] dark:bg-[#191D1E] rounded-2xl rounded-tl-none px-4 py-3 text-xs border border-[#E1E8E7] dark:border-[#2D3636] flex items-center gap-1.5 text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B894] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B894] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B894] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="mr-1">מנתח נתוני תזרים והוצאות...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-[#E1E8E7] dark:border-[#2D3636] flex gap-2 bg-[#F4F7F6]/50 dark:bg-[#191D1E]/50"
          >
            <input
              type="text"
              placeholder="שאל כל שאלה על החשבונות, התקציב או התזרים..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-white dark:bg-[#191D1E] text-xs text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] disabled:opacity-50 text-white font-bold flex items-center gap-1 text-xs transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span>שלח</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
