import TshirtEditor from "@/components/customizer/TshirtEditor";
import { Toaster } from "@/components/ui/sonner";


export default function CustomizePage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <TshirtEditor />
      </main>
      <Toaster />
    </>
  );
}
