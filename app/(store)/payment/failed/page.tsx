"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get("error") || "Payment was not completed"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Payment Failed</h1>
          <p className="text-gray-600 mt-2">We couldn't process your payment</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Unsuccessful</CardTitle>
            <CardDescription>Don't worry, no charges were made to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {errorMessage}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Common reasons for payment failure:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Insufficient funds in your account</li>
                <li>• Incorrect card details</li>
                <li>• Card expired or blocked</li>
                <li>• Network connectivity issues</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button asChild className="flex-1">
                <Link href="/payment">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Store
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
