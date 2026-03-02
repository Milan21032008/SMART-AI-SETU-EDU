"use client";

import { AnimatedWrapper } from "@/components/animated-wrapper";
import EmotionTrendChart from "@/components/emotion-trend-chart";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, ShieldCheck, Heart, User } from "lucide-react";
import { useAppContext } from "@/hooks/use-app-context";

export default function DashboardPage() {
  const { role } = useAppContext();

  const isTeacher = role === 'Teacher';
  const title = isTeacher ? "Teacher Dashboard" : "Progress Report";
  const subtitle = isTeacher 
    ? "Monitor the emotional health of your classroom powered by AI mediation insights."
    : "Track your child's emotional well-being and communication growth.";

  return (
    <AnimatedWrapper className="animate-slide-in pb-12">
      <div className="container mx-auto h-full max-w-md space-y-8">
        <div className="space-y-2 pt-4">
          <h2 className="text-3xl font-black tracking-tighter text-foreground">{title}</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        </div>

        <EmotionTrendChart />

        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-[1.5rem] border-none bg-primary/5 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                <BrainCircuit className="size-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Mediated</p>
              <p className="text-xl font-black text-foreground">100%</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-[1.5rem] border-none bg-accent/5 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-accent shadow-sm">
                <ShieldCheck className="size-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-accent/60">Safety</p>
              <p className="text-xl font-black text-foreground">Active</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-primary to-accent p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {isTeacher ? (
                <Heart className="size-6 text-white fill-current" />
              ) : (
                <User className="size-6 text-white" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                {isTeacher ? "Guardian AI Tips" : "Parenting Insights"}
              </p>
              <h3 className="text-lg font-bold">
                {isTeacher ? "Focus on Well-being" : "Supportive Growth"}
              </h3>
            </div>
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-90">
            {isTeacher 
              ? "Based on this week's data, your students are feeling positive, but there was a slight dip on Tuesday. Consider a brief mindfulness session."
              : "Your child has been using more constructive language this week! This shows great emotional development. Keep encouraging open dialogue."
            }
          </p>
        </Card>
      </div>
    </AnimatedWrapper>
  );
}
