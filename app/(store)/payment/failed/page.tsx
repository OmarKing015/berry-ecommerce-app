"use client";

import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error") || "An unknown error occurred.";

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 md:p-10">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
          <div className="text-center">
            <XCircle className="text-red-500 w-16 h-16 mx-auto" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-4">
              Payment Failed
            </h1>
            <p className="text-gray-600 mt-2">
              Unfortunately, we were unable to process your payment.
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Error Details
            </h2>
            <div className="space-y-4 mt-4">
              <p className="text-red-500 bg-red-50 p-4 rounded-md">
                {errorMessage}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/basket"
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
