"use client";

import { useAppContext } from "@/hooks/use-app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { User, Baby, School, MessageSquare, Quote } from "lucide-react";
import type { Role, Sentiment } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const roleIcons: Record<Role, React.ReactNode> = {
  Child: <Baby className="size-5 text-primary-foreground" />,
  Parent: <User className="size-5 text-primary-foreground" />,
  Teacher: <School className="size-5 text-primary-foreground" />,
};

const sentimentVariant: Record<Sentiment, "destructive" | "neutral" | "default"> = {
    Negative: 'destructive',
    Neutral: 'neutral',
    Positive: 'default'
};


export default function HistoryList() {
  const { history } = useAppContext();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[60vh]">
        <div className="bg-primary/5 rounded-full p-8 mb-6">
            <MessageSquare className="size-16 text-primary/20" />
        </div>
        <h3 className="text-2xl font-black text-foreground tracking-tight">No History Yet</h3>
        <p className="text-muted-foreground mt-2 max-w-[200px] mx-auto text-sm font-medium leading-relaxed">
            Your past mediated conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2 mb-2">
        <h2 className="text-2xl font-black tracking-tight text-foreground">Past Activity</h2>
        <p className="text-sm font-medium text-muted-foreground">Review your mediated communication history.</p>
      </div>
      
      {history.map((conv) => (
        <Card key={conv.id} className="relative border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/60 backdrop-blur-sm group">
          <div className="absolute top-6 left-6">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 transform transition-transform group-hover:rotate-12">
                {roleIcons[conv.role]}
             </div>
          </div>
          
          <CardHeader className="pl-20 pt-6">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                  {formatDistanceToNow(new Date(conv.timestamp), { addSuffix: true })}
                </span>
                <Badge variant={sentimentVariant[conv.sentiment]} className="px-2 py-0.5 font-bold uppercase text-[9px] tracking-wider">
                  {conv.sentiment}
                </Badge>
            </div>
            <CardTitle className="text-lg font-black tracking-tight mt-1">
                Mediated Session
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pl-6 pr-6 pb-8 space-y-4">
            <div className="space-y-2 mt-2">
                <div className="flex items-start gap-2 text-muted-foreground/60">
                    <Quote className="size-4 rotate-180 shrink-0" />
                    <p className="text-sm font-medium italic leading-relaxed line-clamp-3">
                      {conv.transcription}
                    </p>
                </div>
                
                <Separator className="bg-primary/5 my-4" />
                
                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                    <p className="text-base font-bold text-foreground leading-relaxed italic">
                      "{conv.rephrased}"
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}