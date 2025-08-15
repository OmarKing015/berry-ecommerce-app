import { ACTIVE_SALE_BY_COUPON_QUERYResult, Sale } from "@/sanity.types"
import { getActiveSaleByCouponCode } from "@/sanity/lib/sales/getActiveSaleByCouponCode"
import { Palette, Type, ImageIcon, ArrowRight, Sparkles, Clock, Shirt } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

function CustomizationBanner() {
  const [sale, setSale] = useState<ACTIVE_SALE_BY_COUPON_QUERYResult>()
  useEffect( () => {
    const getSale = async () => {
    try {
      const sale = await getActiveSaleByCouponCode("FRIDAYCC22")
      setSale(sale)
    } catch (error) {
      console.error("Error fetching active sale:", error)
    }
  }
  getSale()

  }, [])

  return (
    <div className="mx-4 mt-4 mb-6">
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white rounded-xl shadow-2xl overflow-hidden">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black bg-opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
            {/* Design Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-6 left-8 w-12 h-12 border-2 border-white rounded-lg rotate-12"></div>
              <div className="absolute top-12 right-12 w-8 h-8 bg-white rounded-full"></div>
              <div className="absolute bottom-8 left-16 w-16 h-2 bg-white rounded-full"></div>
              <div className="absolute bottom-16 right-8 w-6 h-6 border-2 border-white rounded-full"></div>
            </div>
          </div>

          {sale?.isActive ? (
            // Split Layout when sale is active
            <div className="relative grid lg:grid-cols-2 min-h-[300px]">
              {/* Left Side - Customization */}
              <div className="px-6 py-8 sm:px-8 sm:py-12 flex flex-col justify-center border-r border-white/20">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                    <Shirt className="h-6 w-6 text-yellow-300 animate-bounce" />
                    <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wide">
                      Design Your Style
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
                    <span className="text-yellow-300">Customize</span> Your
                    <br />
                    <span className="text-white">Perfect T-Shirt</span>
                  </h2>

                  <p className="text-base sm:text-lg text-white/90 mb-6">
                    Add your logo, text, and choose from amazing colors. Create something uniquely yours!
                  </p>

                  {/* Feature Icons */}
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                    <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                      <Type className="h-4 w-4" />
                      <span className="text-sm">Text</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm">Logos</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                      <Palette className="h-4 w-4" />
                      <span className="text-sm">Colors</span>
                    </div>
                  </div>

                  <Link href="/customize" className="animate-pulse group">
                    <button className="inline-flex items-center bg-white text-purple-600 hover:text-purple-700 font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                      <Palette className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Start Designing</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Side - Sale Info */}
              <div className="px-6 py-8 sm:px-8 sm:py-12 flex flex-col justify-center bg-gradient-to-br from-red-500/20 to-orange-400/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                    <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wide">Special Offer</span>
                    <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 text-yellow-300">{sale.title}</h3>

                  <p className="text-base sm:text-lg text-white/90 mb-4">{sale.description}</p>

                  <div className="relative inline-block">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl">
                      <div className="text-center">
                        <div className="text-4xl sm:text-5xl font-black text-white mb-2">{sale.discountedAmount}%</div>
                        <div className="text-lg font-semibold text-white/90">OFF</div>
                        <div className="text-sm text-white/80 mt-2">Auto-Applied</div>
                        <div className="flex items-center justify-center mt-2 text-white/80">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-xs">Limited Time</span>
                        </div>
                      </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm animate-bounce">
                      🎨
                    </div>
                    <div className="absolute -bottom-2 -left-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs animate-pulse">
                      ✨
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Full Width Layout when no sale
            <div className="relative px-6 py-8 sm:px-8 sm:py-12">
              <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  {/* Left Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                      <Shirt className="h-8 w-8 text-yellow-300 animate-bounce" />
                      <span className="text-yellow-300 font-semibold text-lg uppercase tracking-wide">
                        Design Your Style
                      </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                      <span className="text-yellow-300">Customize</span> Your
                      <br />
                      <span className="text-white">Perfect T-Shirt</span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl">
                      Express yourself with custom text, logos, and vibrant colors. Create a t-shirt that's uniquely
                      yours in just a few clicks!
                    </p>

                    {/* Feature Highlights */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <Type className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium">Custom Text</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <ImageIcon className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium">Upload Logos</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <Palette className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium">Choose Colors</span>
                      </div>
                    </div>

                    <Link href="/customize" className="animate-pulse group">
                      <button className="inline-flex items-center bg-white text-purple-600 hover:text-purple-700 font-bold py-5 px-10 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 text-lg">
                        <Palette className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Start Designing</span>
                        <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </Link>
                  </div>

                  {/* Right Content - Visual Element */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-2xl">
                        <div className="text-center">
                          {/* T-Shirt Visual */}
                          <div className="relative mb-6">
                            <div className="w-24 h-24 mx-auto bg-white rounded-lg shadow-lg flex items-center justify-center">
                              <Shirt className="h-16 w-16 text-purple-600" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                              <Palette className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-white mb-2">Easy Design</div>
                          <div className="text-lg text-white/80">Endless Possibilities</div>
                        </div>
                      </div>

                      {/* Floating Color Dots */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full animate-bounce"></div>
                      <div className="absolute top-8 -left-3 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                      <div
                        className="absolute -bottom-3 -left-3 w-5 h-5 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div
                        className="absolute bottom-8 -right-3 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Gradient Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-80"></div>
        </div>
      </div>
    </div>
  )
}

export default CustomizationBanner
