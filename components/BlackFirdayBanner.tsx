import { getActiveSaleByCouponCode } from "@/sanity/lib/sales/getActiveSaleByCouponCode"
import { Tag, Clock, Sparkles } from "lucide-react"

async function BlackFridayBanner() {
  const sale = await getActiveSaleByCouponCode("FRIDAYCC22")

  if (!sale?.isActive) {
    return null
  }

  return (
    <div className="mx-4 mt-4 mb-6">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white rounded-xl shadow-xl overflow-hidden">
        <div className="relative px-6 py-8 sm:px-8 sm:py-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black bg-opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative container mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                  <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wide">
                    Limited Time Offer
                  </span>
                  <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">{sale.title}</h2>

                <p className="text-lg sm:text-xl lg:text-2xl font-medium mb-6 text-white/90">{sale.description}</p>

                {/* Coupon Code */}
                <div className="inline-flex items-center bg-white text-gray-900 rounded-full px-6 py-3 shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <Tag className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-bold text-red-600 text-lg mr-2">{sale.couponCode}</span>
                  <span className="font-bold text-gray-900 text-base sm:text-lg">for {sale.discountedAmount}% OFF</span>
                </div>
              </div>

              {/* Right Content - Visual Element */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl font-black text-white mb-2">{sale.discountedAmount}%</div>
                      <div className="text-lg font-semibold text-white/90">OFF</div>
                      <div className="flex items-center justify-center mt-3 text-white/80">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">Hurry up!</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm animate-bounce">
                    🔥
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs animate-pulse">
                    ⚡
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-red-700 via-orange-600 to-yellow-600 opacity-50"></div>
        </div>
      </div>
    </div>
  )
}

export default BlackFridayBanner
