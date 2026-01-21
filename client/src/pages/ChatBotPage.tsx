import { Card } from "@/components/ui/card";
import { Clock, AlertCircle, User, Wand2, Sparkles } from "lucide-react";
import ChatbotCore from "@/components/ChatbotCore";

export default function ChatBotPage() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 dark:from-blue-700 dark:via-cyan-700 dark:to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors">
              <Wand2 className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Dento - مساعدك الطبي الذكي
            </h1>
          </div>
          <p className="text-blue-100">
            متاح 24/7 للإجابة عن جميع أسئلتك بذكاء
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <Card className="flex-1 m-6 flex flex-col overflow-hidden">
          <ChatbotCore language="ar" className="flex-1" />
        </Card>
      </div>

      {/* Info Bar */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 px-6 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>الخدمة متاحة 24 ساعة</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span>للحالات الطارئة: 101</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <User className="w-4 h-4 text-blue-600" />
            <span>فريق الدعم جاهز</span>
          </div>
        </div>
      </div>
    </div>
  );
}
