import ClientSideMobileTshirtEditor from "@/components/customizer/ClientSideMobileTshirtEditor"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Design Studio | Create Your Perfect T-Shirt",
  description:
    "Unleash your creativity with our advanced T-shirt design studio. Create custom designs with text, logos, and unlimited possibilities.",
  keywords: ["custom t-shirt", "design studio", "personalized clothing", "creative design"],
}

export default function MobileDesignPage() {
  return (
    <main className="min-h-screen">
      <ClientSideMobileTshirtEditor />
    </main>
  )
}
