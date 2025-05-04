"use client";
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <div className="min-h-screen bg-linear-to-br from-tech_white to-tech_bg_color flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-tech_white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative">
            <div className="absolute top-4 left-4 z-10">
              <Link href="/">
                <button className="p-2 rounded-full bg-tech_white/80 hover:bg-tech_white shadow-md transition-all duration-300">
                  <ArrowLeft className="h-5 w-5 text-tech_dark" />
                </button>
              </Link>
            </div>
            <div className="bg-tech_dark text-tech_white p-6 text-center">
              <div className="flex justify-center mb-4">
                <Link href={"/"}>
                  <Image
                    src={logo}
                    alt="logo"
                    className="w-24"
                    width={100}
                    height={100}
                  />
                </Link>
              </div>
              <h1 className="text-2xl font-bold">Create an Account</h1>
              <p className="text-sm opacity-80 mt-1">
                Join ShopTech for the best shopping experience
              </p>
            </div>
          </div>

          <div className="p-6">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-tech_orange hover:bg-tech_orange/90 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200",
                  card: "shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "border border-gray-300 hover:border-tech_orange transition-all duration-200",
                  formFieldInput:
                    "border border-gray-200 focus:border-tech_orange focus:ring-1 focus:ring-tech_orange rounded-md",
                  footerActionLink:
                    "text-tech_orange hover:text-tech_orange/80 font-medium",
                },
              }}
              redirectUrl={redirectUrl}
              signInUrl={`/sign-in?redirect_url=${redirectUrl}`}
            />
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <Link
              href={`/sign-in?redirect_url=${redirectUrl}`}
              className="text-tech_orange font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
