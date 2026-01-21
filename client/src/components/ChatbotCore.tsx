import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Upload, Bot, User, Loader2 } from "lucide-react";

type Message = {
    id: string;
    role: "user" | "bot";
    content: string;
    suggestedClinic?: string | null;
    timestamp: Date;
    image?: string;
};

type ChatbotCoreProps = {
    language?: "ar" | "en";
    patientName?: string;
    quickSymptoms?: Array<{ label: string; emoji: string }>;
    className?: string;
};

export default function ChatbotCore({
    language = "ar",
    patientName = "المريض",
    quickSymptoms = [
        { label: "ألم أسنان", emoji: "😣" },
        { label: "تسوس", emoji: "🦷" },
        { label: "تبييض", emoji: "✨" },
        { label: "تقويم", emoji: "📐" },
        { label: "زراعة", emoji: "🌱" },
        { label: "تنظيف", emoji: "🧹" },
    ],
    className = "",
}: ChatbotCoreProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "bot",
            content:
                language === "ar"
                    ? `مرحباً ${patientName}! أنا مساعدك الطبي الذكي. كيف يمكنني مساعدتك اليوم؟`
                    : `Hello ${patientName}! I'm your smart medical assistant. How can I help you today?`,
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || inputMessage;
        if (!textToSend.trim() && !fileInputRef.current?.files?.[0]) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            // Prepare conversation history (last 10 messages)
            const history = messages.slice(-10).map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    message: textToSend,
                    conversationHistory: history,
                    language,
                    image: null,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response:", errorText);
                console.error("Status:", response.status, response.statusText);
                throw new Error(`Failed to get response from AI: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: data.message,
                suggestedClinic: data.suggestedClinic,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error (full):", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content:
                    language === "ar"
                        ? `عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.\n\nتفاصيل الخطأ: ${error instanceof Error ? error.message : String(error)}`
                        : `Sorry, an error occurred. Please try again.\n\nError details: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickSymptom = (symptom: string) => {
        setInputMessage(symptom);
        setTimeout(() => handleSendMessage(symptom), 0);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target?.result as string;

            const userMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content:
                    language === "ar"
                        ? "قمت برفع صورة للفحص"
                        : "I uploaded an image for examination",
                image: imageData,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);

            try {
                const history = messages.slice(-10).map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                }));

                const response = await fetch("/api/ai/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        message:
                            language === "ar"
                                ? "يرجى تحليل هذه الصورة"
                                : "Please analyze this image",
                        conversationHistory: history,
                        language,
                        image: imageData,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to analyze image");
                }

                const data = await response.json();

                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "bot",
                    content: data.message,
                    suggestedClinic: data.suggestedClinic,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, botMessage]);
            } catch (error) {
                console.error("Image analysis error:", error);
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "bot",
                    content:
                        language === "ar"
                            ? "عذراً، حدث خطأ في تحليل الصورة."
                            : "Sorry, an error occurred while analyzing the image.",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {message.role === "bot" && (
                                <div className="flex-shrink-0">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                </div>
                            )}

                            <div
                                className={`max-w-[75%] ${message.role === "user" ? "order-first" : ""
                                    }`}
                            >
                                <div
                                    className={`rounded-lg p-3 ${message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                        }`}
                                >
                                    {message.image && (
                                        <img
                                            src={message.image}
                                            alt="Uploaded"
                                            className="rounded mb-2 max-w-full"
                                        />
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    {message.suggestedClinic && (
                                        <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                            {language === "ar" ? "العيادة المقترحة: " : "Suggested Clinic: "}
                                            {message.suggestedClinic}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 px-1">
                                    {message.timestamp.toLocaleTimeString(
                                        language === "ar" ? "ar-EG" : "en-US",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </p>
                            </div>

                            {message.role === "user" && (
                                <div className="flex-shrink-0">
                                    <div className="p-2 bg-primary rounded-full">
                                        <User className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-2 justify-start">
                            <div className="flex-shrink-0">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Quick Symptoms */}
            {messages.length === 1 && quickSymptoms.length > 0 && (
                <div className="px-4 py-3 border-t">
                    <div className="grid grid-cols-2 gap-2">
                        {quickSymptoms.map((symptom, idx) => (
                            <Button
                                key={idx}
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickSymptom(symptom.label)}
                                className="text-xs justify-start"
                                data-testid={`button-quick-symptom-${idx}`}
                            >
                                <span className="mr-1">{symptom.emoji}</span>
                                {symptom.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        data-testid="input-image-upload"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        data-testid="button-upload-image"
                    >
                        <Upload className="h-4 w-4" />
                    </Button>
                    <Input
                        placeholder={
                            language === "ar" ? "اكتب رسالتك..." : "Type your message..."
                        }
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                        disabled={isLoading}
                        data-testid="input-chatbot-message"
                    />
                    <Button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputMessage.trim()}
                        size="icon"
                        data-testid="button-send-message"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
