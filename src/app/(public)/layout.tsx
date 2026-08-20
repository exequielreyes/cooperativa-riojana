import { SiteHeader } from "@/components/layout/SiteHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import AppChatBot from "@/components/ChatBot";


export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}

        {/* <ChatBot /> */}
        <AppChatBot />
      </main>
      <PublicFooter />
    </div>
  );
}
