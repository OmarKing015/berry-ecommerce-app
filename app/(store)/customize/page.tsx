import ClientSideTshirtEditor from "@/components/customizer/ClientSideTshirtEditor"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Design Studio | Create Your Perfect T-Shirt",
  description:
    "Unleash your creativity with our advanced T-shirt design studio. Create custom designs with text, logos, and unlimited possibilities.",
  keywords: ["custom t-shirt", "design studio", "personalized clothing", "creative design"],
}

export default function DesignPage() {
  return (
    <main className="min-h-screen">
      <ClientSideTshirtEditor />
    </main>
  )
}
