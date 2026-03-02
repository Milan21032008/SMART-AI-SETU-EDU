"use client";

import { BackButton } from "@/components/back-button";
import { History, X, LayoutDashboard, Mic } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { useAppContext } from "@/hooks/use-app-context";

const titles: { [key: string]: string } = {
  "/record": "",
  "/processing": "Processing",
  "/result": "Mediated Message",
  "/history": "History",
  "/dashboard": "Insights",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useAppContext();
  
  const isHistoryPage = pathname === '/history';
  const isRecordPage = pathname === '/record';
  const isDashboardPage = pathname === '/dashboard';
  
  const title = titles[pathname] || "SETU";

  // Dynamic dashboard title based on role
  const getHeaderTitle = () => {
    if (isDashboardPage) {
      return role === 'Teacher' ? 'Teacher Insights' : 'Progress Report';
    }
    return title;
  };

  return (
    <div className={cn("flex min-h-screen flex-col", isRecordPage && "bg-record-gradient")}>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-10 h-16 safe-top",
        isRecordPage ? "bg-transparent" : "bg-background/80 backdrop-blur-sm border-b"
      )}>
        <div className="mx-auto flex h-full max-w-md items-center justify-between px-4">
          <div className="w-1/4">
            <BackButton />
          </div>
          
          <div className="flex-grow flex justify-center text-center">
            {isRecordPage ? (
              <Select defaultValue="english">
                <SelectTrigger className="w-32 h-9 bg-white/50 border-none rounded-full px-4 shadow-sm backdrop-blur-sm">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="gujarati">Gujarati</SelectItem>
                  <SelectItem value="marathi">Marathi</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <h1 className="text-base font-bold font-headline text-foreground truncate px-2">
                {getHeaderTitle()}
              </h1>
            )}
          </div>

          <div className="w-1/4 flex justify-end gap-1">
            {(role === 'Teacher' || role === 'Parent') && !isDashboardPage && !isRecordPage && (
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full transition-transform active:scale-90">
                  <LayoutDashboard className="size-5 text-primary" />
              </Button>
            )}
            
            {isDashboardPage ? (
              <Button variant="ghost" size="icon" onClick={() => router.push('/record')} className="rounded-full transition-transform active:scale-90">
                  <Mic className="size-5 text-muted-foreground" />
              </Button>
            ) : isHistoryPage ? (
                 <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full transition-transform active:scale-90">
                    <X className="size-6 text-muted-foreground" />
                </Button>
            ) : (
              !isRecordPage && (
                <Button variant="ghost" size="icon" onClick={() => router.push('/history')} className="rounded-full transition-transform active:scale-90">
                    <History className="size-6 text-muted-foreground" />
                </Button>
              )
            )}

            {isRecordPage && (
               <div className="flex items-center gap-1.5 text-primary">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="w-2 h-2 rounded-full bg-primary/30" />
                  <div className="w-2 h-2 rounded-full bg-primary/10" />
               </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 pt-16 flex flex-col items-center w-full">
        <div className="w-full max-w-md flex-1 flex flex-col px-4">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
