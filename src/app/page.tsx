"use client";

import { RoleSelector } from "@/components/role-selector";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import { Footer } from "@/components/footer";

export default function WelcomePage() {
  return (
    <AnimatedWrapper className="min-h-screen bg-record-gradient flex flex-col">
      <main className="container mx-auto flex flex-1 max-w-md flex-col items-center justify-center p-6 pt-12">
        <div className="w-full text-center space-y-2">
          <div className="inline-block p-4 rounded-3xl bg-primary/5 mb-4">
            <h1 className="text-5xl font-black font-headline text-primary tracking-tighter">
              SETU
            </h1>
          </div>
          <p className="text-lg font-medium text-foreground/60 max-w-[240px] mx-auto">
            Constructive communication powered by AI
          </p>
          <RoleSelector />
        </div>
      </main>
      <div className="max-w-md mx-auto w-full">
        <Footer />
      </div>
    </AnimatedWrapper>
  );
}
