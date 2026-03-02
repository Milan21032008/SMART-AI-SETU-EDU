"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/hooks/use-app-context";
import { mediateMessage, type MediationResult } from "@/app/actions";
import { CheckCircle, Languages, ScanText, ShieldCheck, Waves } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const pipelineSteps = [
  { name: "Input Processing", icon: Waves },
  { name: "Sentiment Detection", icon: ScanText },
  { name: "AI Mediation", icon: Languages },
  { name: "Safety Check", icon: ShieldCheck },
];

export default function ProcessingFlow() {
  const { currentConversation, updateConversation, isOnline, role } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isOnline) {
      toast({
        title: "You are offline",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      router.back();
      return;
    }

    if (!currentConversation?.audioDataUri && !currentConversation?.textMessage) {
      toast({
        title: "No input data",
        description: "Please record a message or type something first.",
        variant: "destructive",
      });
      router.push("/record");
      return;
    }

    const processMessage = async () => {
      try {
        const result = await mediateMessage(
          currentConversation.audioDataUri, 
          currentConversation.textMessage,
          role || undefined
        );
        updateConversation({
          ...result,
          timestamp: Date.now(),
        });
        setActiveStep(pipelineSteps.length);
        setTimeout(() => router.push("/result"), 500);
      } catch (error) {
        console.error(error);
        toast({
          title: "Processing Error",
          description: error instanceof Error ? error.message : "Could not process the message. Please try again.",
          variant: "destructive",
        });
        router.push("/record");
      }
    };
    
    const stepInterval = setInterval(() => {
        setActiveStep((prev) => (prev < pipelineSteps.length - 1 ? prev + 1 : prev));
      }, 700);

    processMessage();
    
    return () => clearInterval(stepInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold font-headline">Analyzing your message</h2>
      <p className="text-muted-foreground mt-2 px-6">
        Our AI is working to make your communication more constructive.
      </p>

      <div className="mt-12 w-full space-y-4 px-4">
        {pipelineSteps.map((step, index) => (
          <div
            key={step.name}
            className={`flex items-center space-x-4 rounded-xl p-4 transition-all duration-300 ${
              index <= activeStep ? "bg-primary/10" : "bg-muted/50"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                index <= activeStep ? "bg-primary" : "bg-muted-foreground/50"
              }`}
            >
              {index < activeStep ? (
                <CheckCircle className="size-6 text-primary-foreground" />
              ) : (
                <step.icon className="size-6 text-primary-foreground" />
              )}
            </div>
            <span
              className={`font-medium ${
                index <= activeStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
