"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/hooks/use-app-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowRight,
  ChevronDown,
  Play,
  Pause,
  Loader2,
  Copy,
  RotateCcw,
  Edit2,
  Check,
  ShieldAlert,
  Phone,
  User,
  Heart,
} from "lucide-react";
import type { Sentiment } from "@/lib/types";
import { getTranslatedSpeech } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const sentimentVariant: Record<Sentiment, "destructive" | "neutral" | "default"> = {
    Negative: 'destructive',
    Neutral: 'neutral',
    Positive: 'default'
};

const availableLanguages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'punjabi', label: 'Punjabi' },
];

export default function ResultDisplay() {
  const { currentConversation, updateConversation, finishConversation, role } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const supportiveAudioRef = useRef<HTMLAudioElement>(null);
  const [isSupportivePlaying, setIsSupportivePlaying] = useState(false);
  const [supportiveDuration, setSupportiveDuration] = useState(0);
  const [supportiveCurrentTime, setSupportiveCurrentTime] = useState(0);
  const [supportiveAudioUri, setSupportiveAudioUri] = useState<string | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);

  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isEditingOriginal, setIsEditingOriginal] = useState(false);
  const [isEditingRephrased, setIsEditingRephrased] = useState(false);
  
  const { transcription, rephrased, sentiment, explanation, audioDataUri, isCrisis } = currentConversation || {};
  const [editedTranscription, setEditedTranscription] = useState(transcription || "");
  const [editedRephrased, setEditedRephrased] = useState(rephrased || "");
  
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  useEffect(() => {
    if (!transcription) {
      router.replace("/record");
    }
  }, [transcription, router]);

  useEffect(() => {
    if (isCrisis && role === 'Child') {
      setShowCrisisModal(true);
    }
  }, [isCrisis, role]);

  useEffect(() => {
    const generateSpeech = async (lang: string) => {
        if (isGeneratingSpeech || !editedRephrased) return;
        
        setIsGeneratingSpeech(true);
        setSupportiveAudioUri(null);

        try {
          const languageLabel = availableLanguages.find(l => l.value === lang)?.label || 'English';
          const result = await getTranslatedSpeech(editedRephrased, languageLabel);
          setSupportiveAudioUri(result.audioDataUri);
        } catch(e) {
            const error = e as Error;
            toast({
                title: "Speech Generation Failed",
                description: error.message || "Could not generate audio for the selected language.",
                variant: "destructive"
            });
        } finally {
            setIsGeneratingSpeech(false);
        }
    };
    
    if (editedRephrased) {
        generateSpeech(selectedLanguage);
    }
  }, [editedRephrased, selectedLanguage, toast]);


  useEffect(() => {
    const audio = originalAudioRef.current;
    if (!audio) return;
    const setAudioData = () => { setDuration(audio.duration); setCurrentTime(audio.currentTime); }
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    return () => {
        audio.removeEventListener("loadeddata", setAudioData);
        audio.removeEventListener("timeupdate", setAudioTime);
    }
  }, []);

  useEffect(() => {
    const audio = supportiveAudioRef.current;
    if (!audio) return;
    const setAudioData = () => { setSupportiveDuration(audio.duration); setSupportiveCurrentTime(audio.currentTime); }
    const setAudioTime = () => setSupportiveCurrentTime(audio.currentTime);
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    return () => {
        audio.removeEventListener("loadeddata", setAudioData);
        audio.removeEventListener("timeupdate", setAudioTime);
    }
  }, [supportiveAudioUri]);

  if (!transcription) return null;
  
  const handlePlayPause = () => {
    if (originalAudioRef.current) {
      if (isPlaying) originalAudioRef.current.pause();
      else originalAudioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSupportivePlayPause = () => {
    if (supportiveAudioRef.current) {
      if (isSupportivePlaying) supportiveAudioRef.current.pause();
      else supportiveAudioRef.current.play();
      setIsSupportivePlaying(!isSupportivePlaying);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedRephrased);
    toast({ title: "Copied!", description: "Message copied to clipboard." });
  };

  const handleReMediate = () => {
    updateConversation({ transcription: editedTranscription });
    router.push('/processing');
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  const handleDone = () => {
    finishConversation({ 
      rephrased: editedRephrased, 
      transcription: editedTranscription 
    });
    router.push('/record');
  }
  
  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <AlertDialog open={showCrisisModal} onOpenChange={setShowCrisisModal}>
        <AlertDialogContent className="max-w-[90vw] rounded-[2rem] border-destructive/20 shadow-2xl overflow-hidden p-0 bg-white">
          <div className="bg-destructive/5 p-8 text-center space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-pulse">
              <ShieldAlert className="size-10" />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-3xl font-black text-foreground tracking-tight leading-tight">
                You are not alone.
              </AlertDialogTitle>
              <AlertDialogDescription className="text-lg font-medium text-muted-foreground/80 leading-relaxed">
                It sounds like you're feeling afraid. We're here to help you get support right away.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          
          <div className="p-8 space-y-4">
            <div className="bg-primary/5 rounded-2xl p-5 flex items-center gap-4 border border-primary/10">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                <Phone className="size-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Child Helpline</p>
                <p className="text-lg font-bold text-foreground">Call 1098</p>
              </div>
              <Button size="icon" className="rounded-full h-10 w-10 bg-primary shadow-lg shadow-primary/20">
                 <ArrowRight className="size-5" />
              </Button>
            </div>

            <div className="bg-accent/5 rounded-2xl p-5 flex items-center gap-4 border border-accent/10">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-white shrink-0">
                <User className="size-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent/60">Trusted Adult</p>
                <p className="text-lg font-bold text-foreground">Alert Sent Successfully</p>
              </div>
              <Badge className="bg-accent text-white font-bold uppercase text-[9px]">AWS Alert Live</Badge>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <AlertDialogAction className="h-14 rounded-2xl text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90">
                <Heart className="mr-2 size-5 fill-current" />
                I'm OK now
              </AlertDialogAction>
              <AlertDialogCancel className="h-12 border-none text-muted-foreground font-bold hover:bg-muted/50 rounded-xl" onClick={() => router.push('/record')}>
                Go Back
              </AlertDialogCancel>
            </div>
          </div>
          
          <div className="bg-muted/30 py-4 text-center">
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Safety Protocol Active • SETU Guardian AI</p>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="glassmorphism relative overflow-hidden border-none shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg font-black tracking-tight">
            Original Message
            <div className="flex items-center gap-3">
                {sentiment && <Badge variant={sentimentVariant[sentiment]} className="px-3 py-1 font-bold">{sentiment}</Badge>}
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/50 active:scale-90" onClick={() => setIsEditingOriginal(!isEditingOriginal)}>
                    {isEditingOriginal ? <Check className="size-5 text-primary" /> : <Edit2 className="size-5 text-muted-foreground" />}
                </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingOriginal ? (
            <div className="space-y-4">
                <Textarea 
                    value={editedTranscription} 
                    onChange={(e) => setEditedTranscription(e.target.value)}
                    className="min-h-[120px] text-base leading-relaxed bg-white/20 border-primary/10 focus:bg-white/40"
                />
                <Button variant="outline" className="w-full rounded-xl py-6 border-primary/10 bg-white/40 hover:bg-white/60 active:scale-[0.98]" onClick={handleReMediate}>
                    <RotateCcw className="mr-3 size-5" />
                    Re-mediate transcription
                </Button>
            </div>
          ) : (
            <p className="text-foreground/90 text-lg leading-relaxed">{editedTranscription}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center -my-4 relative z-10">
        <div className="bg-primary rounded-full p-4 shadow-lg shadow-primary/30 ring-4 ring-background">
            <ArrowRight className="size-8 text-white animate-pulse" />
        </div>
      </div>

      <Card className="border-primary/20 border-2 shadow-2xl relative overflow-hidden rounded-[2rem]">
        <CardHeader className="pb-4 bg-primary/5">
          <CardTitle className="flex items-center justify-between text-xl font-black tracking-tight text-primary">
            Supportive Message
            <div className="flex items-center gap-3">
                <Badge variant="neutral" className="px-3 py-1 font-black tracking-widest uppercase text-[10px]">Reframed</Badge>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/5 active:scale-90" onClick={() => setIsEditingRephrased(!isEditingRephrased)}>
                    {isEditingRephrased ? <Check className="size-5 text-primary" /> : <Edit2 className="size-5 text-primary/60" />}
                </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {isEditingRephrased ? (
             <Textarea 
                value={editedRephrased} 
                onChange={(e) => setEditedRephrased(e.target.value)}
                className="min-h-[140px] text-xl font-bold leading-relaxed bg-primary/5 border-primary/20"
             />
          ) : (
             <p className="text-xl font-bold text-foreground leading-relaxed italic">"{editedRephrased}"</p>
          )}
          
          <div className="flex items-center justify-between">
            <Button
                variant="ghost"
                className="text-primary font-bold hover:bg-primary/5 px-0 h-auto active:scale-95"
                onClick={() => setShowExplanation(!showExplanation)}
            >
                <span>Why this works</span>
                <ChevronDown className={`ml-2 size-5 transition-transform duration-300 ${showExplanation ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopy} className="h-10 px-5 rounded-full font-bold active:scale-95 shadow-sm">
                <Copy className="mr-2 size-4" />
                Copy
            </Button>
          </div>
          
          {showExplanation && (
            <p className="text-sm font-medium text-muted-foreground animate-fade-in rounded-2xl border border-primary/10 bg-primary/5 p-4 leading-relaxed">
              {explanation}
            </p>
          )}
        </CardContent>
      </Card>
      
      <Card className="rounded-3xl border-none shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="space-y-6 p-6">
           {audioDataUri && <audio ref={originalAudioRef} src={audioDataUri} onEnded={() => setIsPlaying(false)} />}
           <div className="flex items-center gap-5">
            <Button size="icon" className="rounded-full h-14 w-14 shadow-lg active:scale-90" onClick={handlePlayPause} disabled={!audioDataUri}>
                {isPlaying ? <Pause className="size-7 fill-current"/> : <Play className="size-7 fill-current ml-1"/>}
            </Button>
            <div className="flex-1 space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Your Voice Note</p>
                <Slider value={[currentTime]} max={duration || 1} step={0.1} onValueChange={(v) => { if(originalAudioRef.current) originalAudioRef.current.currentTime = v[0]; }} disabled={!audioDataUri} className="cursor-pointer" />
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
           </div>

           <Separator className="bg-primary/5" />
           
           {supportiveAudioUri && <audio ref={supportiveAudioRef} src={supportiveAudioUri} onEnded={() => setIsSupportivePlaying(false)} />}
           <div className="flex items-center gap-5">
            <Button size="icon" className="rounded-full h-14 w-14 shadow-lg active:scale-90 bg-accent hover:bg-accent/90" onClick={handleSupportivePlayPause} disabled={isGeneratingSpeech || !supportiveAudioUri}>
                {isGeneratingSpeech ? <Loader2 className="size-7 animate-spin" /> : (isSupportivePlaying ? <Pause className="size-7 fill-current"/> : <Play className="size-7 fill-current ml-1"/>)}
            </Button>
            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-primary">AI Support Voice</p>
                    <div className="flex items-center gap-2">
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isGeneratingSpeech}>
                            <SelectTrigger className="w-32 h-8 rounded-full border-none bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                {availableLanguages.map(lang => (
                                    <SelectItem key={lang.value} value={lang.value} className="text-xs font-bold">{lang.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Slider value={[supportiveCurrentTime]} max={supportiveDuration || 1} step={0.1} onValueChange={(v) => { if(supportiveAudioRef.current) supportiveAudioRef.current.currentTime = v[0]; }} disabled={isGeneratingSpeech || !supportiveAudioUri} className="cursor-pointer" />
                <div className="flex justify-between text-[10px] font-bold text-primary tabular-nums">
                    <span>{formatTime(supportiveCurrentTime)}</span>
                    <span>{formatTime(supportiveDuration)}</span>
                </div>
            </div>
           </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98]" onClick={handleDone}>
            Done
        </Button>
        <Button variant="ghost" className="w-full h-12 text-muted-foreground font-bold hover:bg-white/50 rounded-xl active:scale-95" onClick={() => router.push('/record')}>
            Go back and edit message
        </Button>
      </div>
    </div>
  );
}
