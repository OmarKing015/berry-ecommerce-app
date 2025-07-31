import { Toaster } from "@/components/ui/sonner";
import ClientSideTshirtEditor from "@/components/customizer/ClientSideTshirtEditor";

export default function CustomizePage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <ClientSideTshirtEditor />
      </main>
      <Toaster />
    </>
  );
}
