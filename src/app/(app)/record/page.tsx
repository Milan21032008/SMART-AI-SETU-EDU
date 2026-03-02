
import { AnimatedWrapper } from "@/components/animated-wrapper";
import VoiceRecorder from "@/components/voice-recorder";

export default function RecordPage() {
  return (
    <AnimatedWrapper className="animate-slide-in flex-1 flex flex-col">
      <div className="container mx-auto flex-1 flex flex-col">
        <VoiceRecorder />
      </div>
    </AnimatedWrapper>
  );
}
