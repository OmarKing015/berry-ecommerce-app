import ClientSideDesktopTshirtEditor from "@/components/customizer/ClientSideDesktopTshirtEditor"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Design Studio | Create Your Perfect T-Shirt",
  description:
    "Unleash your creativity with our advanced T-shirt design studio. Create custom designs with text, logos, and unlimited possibilities.",
  keywords: ["custom t-shirt", "design studio", "personalized clothing", "creative design"],
}

export default function DesktopDesignPage() {
  return (
    <main className="min-h-screen">
      <ClientSideDesktopTshirtEditor />
    </main>
  )
}
