import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Upload,
  Image as ImageIcon,
  FileX,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Thermometer,
  Clock,
  Calendar,
  Activity,
  MessageSquare,
  Sparkles,
  X,
  Download,
  Share2,
  Printer,
  FileText,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  questionEn: string;
  type: "radio" | "text" | "scale";
  options?: { value: string; label: string; labelEn: string }[];
}

const clinicConditionMapping: Record<string, { clinicId: string; clinicName: string; clinicNameEn: string }> = {
  dental_caries: { clinicId: "conservative", clinicName: "العلاج التحفظي", clinicNameEn: "Conservative Treatment" },
  gingivitis: { clinicId: "gums", clinicName: "علاج اللثة", clinicNameEn: "Gum Treatment" },
  tooth_sensitivity: { clinicId: "conservative", clinicName: "العلاج التحفظي", clinicNameEn: "Conservative Treatment" },
  root_canal: { clinicId: "conservative", clinicName: "العلاج التحفظي", clinicNameEn: "Conservative Treatment" },
  extraction: { clinicId: "surgery", clinicName: "جراحة الفم", clinicNameEn: "Oral Surgery" },
  orthodontic: { clinicId: "orthodontics", clinicName: "تقويم الأسنان", clinicNameEn: "Orthodontics" },
  cosmetic: { clinicId: "cosmetic", clinicName: "تجميل الأسنان", clinicNameEn: "Cosmetic Dentistry" },
  implant: { clinicId: "implants", clinicName: "زراعة الأسنان", clinicNameEn: "Dental Implants" },
  pediatric: { clinicId: "pediatric", clinicName: "أسنان الأطفال", clinicNameEn: "Pediatric Dentistry" },
  periodontitis: { clinicId: "gums", clinicName: "علاج اللثة", clinicNameEn: "Gum Treatment" },
  dentures: { clinicId: "removable", clinicName: "التركيبات المتحركة", clinicNameEn: "Removable Prosthetics" },
  crowns: { clinicId: "fixed", clinicName: "التركيبات الثابتة", clinicNameEn: "Fixed Prosthetics" },
};

const diagnosisQuestions: Question[] = [
  {
    id: "pain_location",
    question: "أين تشعر بالألم؟",
    questionEn: "Where do you feel the pain?",
    type: "radio",
    options: [
      { value: "upper_right", label: "الفك العلوي الأيمن", labelEn: "Upper Right Jaw" },
      { value: "upper_left", label: "الفك العلوي الأيسر", labelEn: "Upper Left Jaw" },
      { value: "lower_right", label: "الفك السفلي الأيمن", labelEn: "Lower Right Jaw" },
      { value: "lower_left", label: "الفك السفلي الأيسر", labelEn: "Lower Left Jaw" },
      { value: "all", label: "الفم بالكامل", labelEn: "Entire Mouth" },
      { value: "gums", label: "اللثة فقط", labelEn: "Gums Only" },
      { value: "none", label: "لا يوجد ألم", labelEn: "No Pain" },
    ],
  },
  {
    id: "pain_type",
    question: "ما نوع الألم الذي تشعر به؟",
    questionEn: "What type of pain do you feel?",
    type: "radio",
    options: [
      { value: "sharp", label: "ألم حاد ومفاجئ", labelEn: "Sharp and Sudden" },
      { value: "dull", label: "ألم خفيف ومستمر", labelEn: "Dull and Continuous" },
      { value: "throbbing", label: "ألم نابض", labelEn: "Throbbing Pain" },
      { value: "sensitivity", label: "حساسية للبرودة/الحرارة", labelEn: "Cold/Heat Sensitivity" },
      { value: "pressure", label: "ألم عند الضغط أو المضغ", labelEn: "Pain When Pressing/Chewing" },
      { value: "night_pain", label: "ألم يزداد ليلاً", labelEn: "Pain Worsens at Night" },
    ],
  },
  {
    id: "pain_duration",
    question: "منذ متى وأنت تعاني من هذا الألم؟",
    questionEn: "How long have you been experiencing this pain?",
    type: "radio",
    options: [
      { value: "today", label: "اليوم فقط", labelEn: "Today Only" },
      { value: "days", label: "منذ عدة أيام", labelEn: "Several Days" },
      { value: "week", label: "منذ أسبوع", labelEn: "One Week" },
      { value: "weeks", label: "منذ عدة أسابيع", labelEn: "Several Weeks" },
      { value: "months", label: "منذ شهر أو أكثر", labelEn: "One Month or More" },
    ],
  },
  {
    id: "pain_intensity",
    question: "ما شدة الألم من 1 إلى 10؟",
    questionEn: "What is the pain intensity from 1 to 10?",
    type: "scale",
  },
  {
    id: "symptoms",
    question: "هل تعاني من أي من الأعراض التالية؟",
    questionEn: "Do you experience any of the following symptoms?",
    type: "radio",
    options: [
      { value: "bleeding", label: "نزيف في اللثة", labelEn: "Gum Bleeding" },
      { value: "swelling", label: "تورم في الوجه أو اللثة", labelEn: "Face or Gum Swelling" },
      { value: "bad_breath", label: "رائحة فم كريهة", labelEn: "Bad Breath" },
      { value: "loose_tooth", label: "أسنان متحركة", labelEn: "Loose Teeth" },
      { value: "discoloration", label: "تغير لون السن", labelEn: "Tooth Discoloration" },
      { value: "pus", label: "خراج أو صديد", labelEn: "Abscess or Pus" },
      { value: "none", label: "لا شيء مما سبق", labelEn: "None of the Above" },
    ],
  },
  {
    id: "oral_hygiene",
    question: "كم مرة تنظف أسنانك يومياً؟",
    questionEn: "How many times do you brush your teeth daily?",
    type: "radio",
    options: [
      { value: "rarely", label: "نادراً", labelEn: "Rarely" },
      { value: "once", label: "مرة واحدة", labelEn: "Once" },
      { value: "twice", label: "مرتين", labelEn: "Twice" },
      { value: "three_plus", label: "ثلاث مرات أو أكثر", labelEn: "Three or More" },
    ],
  },
  {
    id: "bruxism",
    question: "هل تصرّ على أسنانك أثناء النوم أو خلال اليوم؟",
    questionEn: "Do you grind your teeth while sleeping or during the day?",
    type: "radio",
    options: [
      { value: "yes_sleep", label: "نعم، أثناء النوم", labelEn: "Yes, While Sleeping" },
      { value: "yes_day", label: "نعم، خلال اليوم", labelEn: "Yes, During the Day" },
      { value: "yes_both", label: "نعم، كلاهما", labelEn: "Yes, Both" },
      { value: "no", label: "لا", labelEn: "No" },
      { value: "not_sure", label: "لست متأكداً", labelEn: "Not Sure" },
    ],
  },
  {
    id: "previous_treatment",
    question: "هل تلقيت علاج أسنان سابق؟",
    questionEn: "Have you received previous dental treatment?",
    type: "radio",
    options: [
      { value: "filling", label: "حشوات", labelEn: "Fillings" },
      { value: "extraction", label: "خلع أسنان", labelEn: "Tooth Extraction" },
      { value: "root_canal", label: "علاج عصب", labelEn: "Root Canal" },
      { value: "orthodontics", label: "تقويم أسنان", labelEn: "Orthodontics" },
      { value: "cleaning", label: "تنظيف أسنان", labelEn: "Teeth Cleaning" },
      { value: "none", label: "لم أتلق علاج سابق", labelEn: "No Previous Treatment" },
    ],
  },
  {
    id: "age_group",
    question: "ما فئتك العمرية؟",
    questionEn: "What is your age group?",
    type: "radio",
    options: [
      { value: "child", label: "أقل من 12 سنة", labelEn: "Under 12 Years" },
      { value: "teen", label: "12-18 سنة", labelEn: "12-18 Years" },
      { value: "adult", label: "19-40 سنة", labelEn: "19-40 Years" },
      { value: "middle", label: "41-60 سنة", labelEn: "41-60 Years" },
      { value: "senior", label: "أكثر من 60 سنة", labelEn: "Over 60 Years" },
    ],
  },
  {
    id: "smoking",
    question: "هل تدخن أو تستخدم التبغ؟",
    questionEn: "Do you smoke or use tobacco?",
    type: "radio",
    options: [
      { value: "yes_cigarettes", label: "نعم، سجائر", labelEn: "Yes, Cigarettes" },
      { value: "yes_shisha", label: "نعم، شيشة", labelEn: "Yes, Shisha" },
      { value: "yes_both", label: "نعم، كلاهما", labelEn: "Yes, Both" },
      { value: "former", label: "مدخن سابق", labelEn: "Former Smoker" },
      { value: "no", label: "لا أدخن", labelEn: "Non-Smoker" },
    ],
  },
  {
    id: "medical_history",
    question: "هل لديك أي حالات طبية سابقة؟",
    questionEn: "Do you have any previous medical conditions?",
    type: "radio",
    options: [
      { value: "diabetes", label: "مرض السكري", labelEn: "Diabetes" },
      { value: "heart", label: "أمراض القلب", labelEn: "Heart Disease" },
      { value: "blood_pressure", label: "ضغط الدم", labelEn: "Blood Pressure" },
      { value: "allergy", label: "حساسية من الأدوية", labelEn: "Drug Allergy" },
      { value: "pregnancy", label: "حمل", labelEn: "Pregnancy" },
      { value: "none", label: "لا توجد حالات سابقة", labelEn: "No Previous Conditions" },
    ],
  },
  {
    id: "concern_type",
    question: "ما هو الهدف الرئيسي من زيارتك؟",
    questionEn: "What is the main purpose of your visit?",
    type: "radio",
    options: [
      { value: "pain_relief", label: "التخلص من الألم", labelEn: "Pain Relief" },
      { value: "cosmetic", label: "تحسين المظهر الجمالي", labelEn: "Cosmetic Improvement" },
      { value: "checkup", label: "فحص روتيني", labelEn: "Routine Checkup" },
      { value: "replacement", label: "تعويض أسنان مفقودة", labelEn: "Replace Missing Teeth" },
      { value: "alignment", label: "تقويم الأسنان", labelEn: "Teeth Alignment" },
      { value: "cleaning", label: "تنظيف الأسنان", labelEn: "Teeth Cleaning" },
    ],
  },
  {
    id: "additional_notes",
    question: "هل هناك أي معلومات إضافية تريد إضافتها؟",
    questionEn: "Is there any additional information you would like to add?",
    type: "text",
  },
];

export default function AIDiagnosisPage() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [xrayImage, setXrayImage] = useState<File | null>(null);
  const [xrayPreview, setXrayPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("questions");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    ar: {
      title: "التشخيص الذكي بالذكاء الاصطناعي",
      subtitle: "أجب على الأسئلة وارفع صورة الأشعة للحصول على تشخيص مبدئي",
      questionsTab: "الأسئلة",
      xrayTab: "صورة الأشعة",
      resultTab: "النتيجة",
      next: "التالي",
      previous: "السابق",
      analyze: "تحليل بالذكاء الاصطناعي",
      analyzing: "جاري التحليل...",
      uploadXray: "رفع صورة الأشعة",
      dragDrop: "اسحب وأفلت الصورة هنا أو اضغط للاختيار",
      supportedFormats: "الصيغ المدعومة: JPG, PNG, DICOM",
      maxSize: "الحجم الأقصى: 10 ميجابايت",
      removeImage: "إزالة الصورة",
      progress: "التقدم",
      questionOf: "السؤال",
      of: "من",
      diagnosisResult: "نتيجة التشخيص",
      possibleConditions: "الحالات المحتملة",
      recommendations: "التوصيات",
      urgency: "درجة الاستعجال",
      confidence: "نسبة الثقة",
      disclaimer: "تنويه: هذا التشخيص مبدئي ولا يغني عن استشارة الطبيب المختص",
      bookAppointment: "حجز موعد",
      downloadReport: "تحميل التقرير",
      shareResult: "مشاركة النتيجة",
      printResult: "طباعة",
      startOver: "بدء من جديد",
      high: "عالية",
      medium: "متوسطة",
      low: "منخفضة",
      enterAnswer: "أدخل إجابتك هنا...",
      painScale: "مقياس الألم",
      noPain: "لا ألم",
      severePain: "ألم شديد",
      suggestedClinicTitle: "العيادة المقترحة",
      bookAtClinic: "احجز موعد في هذه العيادة",
      basedOnDiagnosis: "بناءً على التشخيص، ننصحك بزيارة:",
    },
    en: {
      title: "AI-Powered Diagnosis",
      subtitle: "Answer the questions and upload your X-ray for a preliminary diagnosis",
      questionsTab: "Questions",
      xrayTab: "X-Ray Image",
      resultTab: "Result",
      next: "Next",
      previous: "Previous",
      analyze: "Analyze with AI",
      analyzing: "Analyzing...",
      uploadXray: "Upload X-Ray",
      dragDrop: "Drag and drop image here or click to select",
      supportedFormats: "Supported formats: JPG, PNG, DICOM",
      maxSize: "Maximum size: 10MB",
      removeImage: "Remove Image",
      progress: "Progress",
      questionOf: "Question",
      of: "of",
      diagnosisResult: "Diagnosis Result",
      possibleConditions: "Possible Conditions",
      recommendations: "Recommendations",
      urgency: "Urgency Level",
      confidence: "Confidence",
      disclaimer: "Disclaimer: This is a preliminary diagnosis and does not replace professional medical advice",
      bookAppointment: "Book Appointment",
      downloadReport: "Download Report",
      shareResult: "Share Result",
      printResult: "Print",
      startOver: "Start Over",
      high: "High",
      medium: "Medium",
      low: "Low",
      enterAnswer: "Enter your answer here...",
      painScale: "Pain Scale",
      noPain: "No Pain",
      severePain: "Severe Pain",
      suggestedClinicTitle: "Suggested Clinic",
      bookAtClinic: "Book Appointment at This Clinic",
      basedOnDiagnosis: "Based on the diagnosis, we recommend visiting:",
    },
  };

  const t = translations[language];

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert(language === "ar" ? "الملف كبير جداً. الحد الأقصى 10 ميجابايت" : "File too large. Maximum 10MB");
        return;
      }
      setXrayImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setXrayPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.name.endsWith(".dcm"))) {
      setXrayImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setXrayPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setXrayImage(null);
    setXrayPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatSymptomsForAI = () => {
    let summary = "";
    diagnosisQuestions.forEach(q => {
      const answer = answers[q.id];
      if (answer) {
        const questionText = language === "ar" ? q.question : q.questionEn;
        let answerText = answer;

        if (q.options) {
          const option = q.options.find(o => o.value === answer);
          if (option) {
            answerText = language === "ar" ? option.label : option.labelEn;
          }
        }

        summary += `${questionText}: ${answerText}\n`;
      }
    });
    return summary;
  };

  const analyzeDiagnosis = (userAnswers: Record<string, string>) => {
    const conditionScores: Record<string, number> = {
      dental_caries: 0,
      gingivitis: 0,
      tooth_sensitivity: 0,
      root_canal: 0,
      extraction: 0,
      orthodontic: 0,
      cosmetic: 0,
      implant: 0,
      pediatric: 0,
      periodontitis: 0,
      dentures: 0,
      crowns: 0,
    };

    if (userAnswers.pain_type === "sharp" || userAnswers.pain_type === "throbbing") {
      conditionScores.dental_caries += 30;
      conditionScores.root_canal += 25;
    }
    if (userAnswers.pain_type === "sensitivity") {
      conditionScores.tooth_sensitivity += 40;
      conditionScores.dental_caries += 15;
    }
    if (userAnswers.pain_type === "night_pain") {
      conditionScores.root_canal += 35;
    }

    if (userAnswers.symptoms === "bleeding") {
      conditionScores.gingivitis += 40;
      conditionScores.periodontitis += 30;
    }
    if (userAnswers.symptoms === "swelling" || userAnswers.symptoms === "pus") {
      conditionScores.root_canal += 30;
      conditionScores.extraction += 25;
    }
    if (userAnswers.symptoms === "loose_tooth") {
      conditionScores.periodontitis += 35;
      conditionScores.extraction += 20;
    }
    if (userAnswers.symptoms === "discoloration") {
      conditionScores.dental_caries += 25;
      conditionScores.cosmetic += 20;
    }

    if (userAnswers.pain_location === "gums") {
      conditionScores.gingivitis += 25;
      conditionScores.periodontitis += 20;
    }

    const painIntensity = parseInt(userAnswers.pain_intensity || "0");
    if (painIntensity >= 8) {
      conditionScores.root_canal += 20;
      conditionScores.extraction += 15;
    }

    if (userAnswers.pain_duration === "months") {
      conditionScores.periodontitis += 15;
      conditionScores.root_canal += 10;
    }

    if (userAnswers.concern_type === "cosmetic") {
      conditionScores.cosmetic += 50;
    }
    if (userAnswers.concern_type === "alignment") {
      conditionScores.orthodontic += 50;
    }
    if (userAnswers.concern_type === "replacement") {
      conditionScores.implant += 30;
      conditionScores.dentures += 25;
      conditionScores.crowns += 20;
    }
    if (userAnswers.concern_type === "cleaning") {
      conditionScores.gingivitis += 20;
    }

    if (userAnswers.age_group === "child") {
      conditionScores.pediatric += 40;
    }
    if (userAnswers.age_group === "senior") {
      conditionScores.dentures += 15;
      conditionScores.periodontitis += 10;
    }

    if (userAnswers.smoking === "yes_cigarettes" || userAnswers.smoking === "yes_shisha" || userAnswers.smoking === "yes_both") {
      conditionScores.periodontitis += 15;
      conditionScores.cosmetic += 10;
    }

    if (userAnswers.oral_hygiene === "rarely") {
      conditionScores.dental_caries += 20;
      conditionScores.gingivitis += 15;
    }

    if (userAnswers.bruxism === "yes_sleep" || userAnswers.bruxism === "yes_day" || userAnswers.bruxism === "yes_both") {
      conditionScores.tooth_sensitivity += 20;
      conditionScores.crowns += 15;
    }

    if (userAnswers.previous_treatment === "root_canal") {
      conditionScores.crowns += 20;
    }
    if (userAnswers.previous_treatment === "extraction") {
      conditionScores.implant += 25;
      conditionScores.dentures += 20;
    }

    const sortedConditions = Object.entries(conditionScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const maxScore = Math.max(...Object.values(conditionScores), 1);

    return sortedConditions.map(([key, score]) => ({
      conditionKey: key,
      probability: Math.min(Math.round((score / maxScore) * 100), 95),
    }));
  };

  const getConditionDetails = (conditionKey: string) => {
    const conditions: Record<string, { nameAr: string; nameEn: string; descAr: string; descEn: string }> = {
      dental_caries: { nameAr: "تسوس الأسنان", nameEn: "Dental Caries", descAr: "تسوس يحتاج إلى حشو أو علاج تحفظي", descEn: "Cavity requiring filling or conservative treatment" },
      gingivitis: { nameAr: "التهاب اللثة", nameEn: "Gingivitis", descAr: "التهاب في اللثة يمكن علاجه بالتنظيف", descEn: "Gum inflammation treatable with cleaning" },
      tooth_sensitivity: { nameAr: "حساسية الأسنان", nameEn: "Tooth Sensitivity", descAr: "حساسية للبرودة والحرارة", descEn: "Sensitivity to cold and heat" },
      root_canal: { nameAr: "علاج العصب", nameEn: "Root Canal", descAr: "يحتاج إلى علاج عصب السن", descEn: "Requires root canal treatment" },
      extraction: { nameAr: "خلع الأسنان", nameEn: "Tooth Extraction", descAr: "قد يحتاج السن إلى الخلع", descEn: "Tooth may need extraction" },
      orthodontic: { nameAr: "تقويم الأسنان", nameEn: "Orthodontics", descAr: "يحتاج إلى تقويم لترتيب الأسنان", descEn: "Needs braces for teeth alignment" },
      cosmetic: { nameAr: "تجميل الأسنان", nameEn: "Cosmetic Dentistry", descAr: "إجراءات تجميلية لتحسين المظهر", descEn: "Cosmetic procedures to improve appearance" },
      implant: { nameAr: "زراعة الأسنان", nameEn: "Dental Implant", descAr: "زراعة لتعويض الأسنان المفقودة", descEn: "Implant to replace missing teeth" },
      pediatric: { nameAr: "أسنان الأطفال", nameEn: "Pediatric Dentistry", descAr: "رعاية أسنان خاصة بالأطفال", descEn: "Special dental care for children" },
      periodontitis: { nameAr: "أمراض اللثة المتقدمة", nameEn: "Periodontitis", descAr: "التهاب متقدم في اللثة يحتاج علاج متخصص", descEn: "Advanced gum disease requiring specialized treatment" },
      dentures: { nameAr: "أطقم الأسنان", nameEn: "Dentures", descAr: "تركيبات متحركة لتعويض الأسنان", descEn: "Removable prosthetics to replace teeth" },
      crowns: { nameAr: "التيجان", nameEn: "Crowns", descAr: "تيجان ثابتة لحماية الأسنان", descEn: "Fixed crowns to protect teeth" },
    };
    return conditions[conditionKey] || conditions.dental_caries;
  };

  const getRecommendations = (primaryCondition: string, userAnswers: Record<string, string>) => {
    const baseRecs = {
      ar: ["زيارة طبيب الأسنان في أقرب وقت ممكن"],
      en: ["Visit a dentist as soon as possible"],
    };

    if (userAnswers.oral_hygiene === "rarely" || userAnswers.oral_hygiene === "once") {
      baseRecs.ar.push("تنظيف الأسنان مرتين يومياً على الأقل");
      baseRecs.en.push("Brush your teeth at least twice daily");
    }

    if (primaryCondition === "gingivitis" || primaryCondition === "periodontitis") {
      baseRecs.ar.push("استخدام غسول الفم المطهر", "المضمضة بالماء المالح");
      baseRecs.en.push("Use antiseptic mouthwash", "Rinse with salt water");
    }

    if (primaryCondition === "tooth_sensitivity") {
      baseRecs.ar.push("استخدام معجون أسنان للحساسية", "تجنب الأطعمة شديدة البرودة أو الحرارة");
      baseRecs.en.push("Use sensitivity toothpaste", "Avoid very cold or hot foods");
    }

    if (userAnswers.smoking && userAnswers.smoking !== "no") {
      baseRecs.ar.push("الإقلاع عن التدخين لتحسين صحة الفم");
      baseRecs.en.push("Quit smoking to improve oral health");
    }

    return language === "ar" ? baseRecs.ar : baseRecs.en;
  };

  const getUrgency = (conditions: { conditionKey: string; probability: number }[], painIntensity: number) => {
    const urgentConditions = ["root_canal", "extraction", "periodontitis"];
    const primaryCondition = conditions[0]?.conditionKey;

    if (painIntensity >= 8 || urgentConditions.includes(primaryCondition)) {
      return "high";
    }
    if (painIntensity >= 5 || conditions[0]?.probability >= 70) {
      return "medium";
    }
    return "low";
  };

  const runDiagnosis = async () => {
    setIsAnalyzing(true);
    setActiveTab("result");

    try {
      const response = await fetch('/api/ai/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          symptomSummary: formatSymptomsForAI(),
          xrayImage: xrayPreview,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get diagnosis');
      }

      const aiResult = await response.json();

      if (aiResult.conditions && aiResult.conditions.length > 0) {
        const primaryConditionKey = aiResult.conditions[0]?.conditionKey || "dental_caries";
        const suggestedClinicInfo = clinicConditionMapping[primaryConditionKey] || clinicConditionMapping.dental_caries;

        const result = {
          conditions: aiResult.conditions.map((cond: any) => ({
            name: cond.name,
            nameEn: cond.nameEn,
            conditionKey: cond.conditionKey,
            probability: cond.probability,
            description: cond.description,
          })),
          recommendations: aiResult.recommendations || [],
          urgency: aiResult.urgency || "medium",
          confidence: aiResult.confidence || 70,
          suggestedClinic: aiResult.suggestedClinic || {
            id: suggestedClinicInfo.clinicId,
            name: language === "ar" ? suggestedClinicInfo.clinicName : suggestedClinicInfo.clinicNameEn,
            nameAr: suggestedClinicInfo.clinicName,
            nameEn: suggestedClinicInfo.clinicNameEn,
          },
          estimatedTreatmentTime: aiResult.estimatedTreatmentTime || (language === "ar" ? "30-45 دقيقة" : "30-45 minutes"),
        };
        setDiagnosisResult(result);
      } else {
        throw new Error('No valid diagnosis returned from AI');
      }
    } catch (error) {
      console.error('AI Diagnosis error:', error);
      // Only use local fallback if specifically desired, for now let's show an error or a clearer fallback
      const analyzedConditions = analyzeDiagnosis(answers);
      const primaryCondition = analyzedConditions[0]?.conditionKey || "dental_caries";
      const suggestedClinicInfo = clinicConditionMapping[primaryCondition] || clinicConditionMapping.dental_caries;
      const painIntensity = parseInt(answers.pain_intensity || "0");

      const result = {
        conditions: analyzedConditions.map((cond) => {
          const details = getConditionDetails(cond.conditionKey);
          return {
            name: (language === "ar" ? details.nameAr : details.nameEn) + " (تحليل محلي)",
            nameEn: details.nameEn + " (Local Analysis)",
            conditionKey: cond.conditionKey,
            probability: cond.probability,
            description: (language === "ar" ? details.descAr : details.descEn) + " - نعتذر، خدمة الذكاء الاصطناعي غير متوفرة حالياً.",
          };
        }),
        recommendations: getRecommendations(primaryCondition, answers),
        urgency: getUrgency(analyzedConditions, painIntensity),
        confidence: 0, // Mark as 0 to indicate it's not a real AI confidence
        suggestedClinic: {
          id: suggestedClinicInfo.clinicId,
          name: language === "ar" ? suggestedClinicInfo.clinicName : suggestedClinicInfo.clinicNameEn,
          nameAr: suggestedClinicInfo.clinicName,
          nameEn: suggestedClinicInfo.clinicNameEn,
        },
        estimatedTreatmentTime: language === "ar" ? "30-45 دقيقة" : "30-45 minutes",
        isLocalFallback: true
      };
      setDiagnosisResult(result);
    }

    setIsAnalyzing(false);
  };

  const currentQuestion = diagnosisQuestions[currentStep];
  const progress = ((currentStep + 1) / diagnosisQuestions.length) * 100;

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const questionText = language === "ar" ? currentQuestion.question : currentQuestion.questionEn;

    return (
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-sm">
            {t.questionOf} {currentStep + 1} {t.of} {diagnosisQuestions.length}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.progress}</span>
            <Progress value={progress} className="w-32 h-2" />
          </div>
        </div>

        <h3 className="text-xl font-semibold">{questionText}</h3>

        {currentQuestion.type === "radio" && currentQuestion.options && (
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Label
                  htmlFor={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${answers[currentQuestion.id] === option.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                    }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <span>{language === "ar" ? option.label : option.labelEn}</span>
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.type === "scale" && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t.noPain}</span>
              <span>{t.severePain}</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <motion.button
                  key={num}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAnswer(currentQuestion.id, num.toString())}
                  className={`w-10 h-10 rounded-full font-bold transition-all ${answers[currentQuestion.id] === num.toString()
                      ? num <= 3
                        ? "bg-green-500 text-white"
                        : num <= 6
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                      : "bg-muted hover:bg-muted/80"
                    }`}
                >
                  {num}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === "text" && (
          <Textarea
            placeholder={t.enterAnswer}
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            className="min-h-[120px]"
            data-testid="textarea-additional-notes"
          />
        )}
      </motion.div>
    );
  };

  const renderXrayUpload = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <ImageIcon className="w-6 h-6 text-primary" />
          {t.uploadXray}
        </h3>
        <p className="text-muted-foreground">{t.dragDrop}</p>
      </div>

      {!xrayPreview ? (
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">{t.supportedFormats}</p>
          <p className="text-sm text-muted-foreground">{t.maxSize}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.dcm"
            onChange={handleFileUpload}
            className="hidden"
            data-testid="input-xray-upload"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-xl overflow-hidden border-2 border-primary"
        >
          <img
            src={xrayPreview}
            alt="X-Ray"
            className="w-full h-64 object-contain bg-black"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
            data-testid="button-remove-xray"
          >
            <X className="w-4 h-4 mr-1" />
            {t.removeImage}
          </Button>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {xrayImage?.name}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6">
      {isAnalyzing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <Brain className="w-20 h-20 text-primary" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">{t.analyzing}</h3>
          <p className="text-muted-foreground">جاري تحليل البيانات والصورة بالذكاء الاصطناعي...</p>
          <Progress value={66} className="w-48 mx-auto mt-4" />
        </motion.div>
      ) : diagnosisResult ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              {t.diagnosisResult}
            </h3>
            <Badge
              variant={
                diagnosisResult.urgency === "high"
                  ? "destructive"
                  : diagnosisResult.urgency === "medium"
                    ? "default"
                    : "secondary"
              }
              className="text-sm px-3 py-1"
            >
              {t.urgency}: {diagnosisResult.urgency === "high" ? t.high : diagnosisResult.urgency === "medium" ? t.medium : t.low}
            </Badge>
          </div>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                {t.possibleConditions}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {diagnosisResult.conditions.map((condition: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{condition.name}</span>
                    <Badge variant="outline">{condition.probability}%</Badge>
                  </div>
                  <Progress value={condition.probability} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">{condition.description}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t.recommendations}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {diagnosisResult.recommendations.map((rec: string, idx: number) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {diagnosisResult.suggestedClinic && (
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  {t.suggestedClinicTitle}
                </CardTitle>
                <CardDescription>{t.basedOnDiagnosis}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{diagnosisResult.suggestedClinic.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? diagnosisResult.suggestedClinic.nameEn : diagnosisResult.suggestedClinic.nameAr}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setLocation(`/clinic/${diagnosisResult.suggestedClinic.id}`)}
                    data-testid="button-book-at-clinic"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t.bookAtClinic}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.confidence}</p>
                  <p className="text-2xl font-bold">{diagnosisResult.confidence}%</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">وقت العلاج المتوقع</p>
                  <p className="text-xl font-bold">{diagnosisResult.estimatedTreatmentTime}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{t.disclaimer}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="flex-1" data-testid="button-book-appointment">
              <Calendar className="w-4 h-4 mr-2" />
              {t.bookAppointment}
            </Button>
            <Button variant="outline" data-testid="button-download-report">
              <Download className="w-4 h-4 mr-2" />
              {t.downloadReport}
            </Button>
            <Button variant="outline" data-testid="button-share-result">
              <Share2 className="w-4 h-4 mr-2" />
              {t.shareResult}
            </Button>
            <Button variant="outline" data-testid="button-print-result">
              <Printer className="w-4 h-4 mr-2" />
              {t.printResult}
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setDiagnosisResult(null);
              setAnswers({});
              setXrayImage(null);
              setXrayPreview(null);
              setCurrentStep(0);
              setActiveTab("questions");
            }}
            data-testid="button-start-over"
          >
            {t.startOver}
          </Button>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>أجب على الأسئلة وارفع صورة الأشعة للحصول على التشخيص</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2">
          <Zap className="w-4 h-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="questions" className="flex items-center gap-2" data-testid="tab-questions">
                <MessageSquare className="w-4 h-4" />
                {t.questionsTab}
              </TabsTrigger>
              <TabsTrigger value="xray" className="flex items-center gap-2" data-testid="tab-xray">
                <ImageIcon className="w-4 h-4" />
                {t.xrayTab}
              </TabsTrigger>
              <TabsTrigger value="result" className="flex items-center gap-2" data-testid="tab-result">
                <Sparkles className="w-4 h-4" />
                {t.resultTab}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="mt-0">
              <AnimatePresence mode="wait">
                {renderQuestion()}
              </AnimatePresence>

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  data-testid="button-previous"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  {t.previous}
                </Button>

                {currentStep < diagnosisQuestions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!answers[currentQuestion?.id]}
                    data-testid="button-next"
                  >
                    {t.next}
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveTab("xray")}
                    className="bg-primary"
                    data-testid="button-go-to-xray"
                  >
                    {t.uploadXray}
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="xray" className="mt-0">
              {renderXrayUpload()}

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("questions")}
                  data-testid="button-back-to-questions"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  {t.previous}
                </Button>

                <Button
                  onClick={runDiagnosis}
                  disabled={Object.keys(answers).length < 3}
                  className="bg-gradient-to-r from-primary to-blue-600"
                  data-testid="button-analyze"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {t.analyze}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="result" className="mt-0">
              {renderResult()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
