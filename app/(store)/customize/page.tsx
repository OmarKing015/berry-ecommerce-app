import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default function DesignPage() {
  const headersList = headers()
  const userAgent = headersList.get("user-agent")

  const isMobile = /Mobi|Android/i.test(userAgent || "")

  if (isMobile) {
    redirect("/customize/mobile")
  } else {
    redirect("/customize/desktop")
  }

  return null
}
