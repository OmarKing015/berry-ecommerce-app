"use client"

import { motion } from "framer-motion"
import { useEditorStore } from "../../store/editorStore"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Sparkles, TrendingUp } from "lucide-react"

export default function CostSummary() {
  const { totalCost } = useEditorStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="w-full max-w-sm"
    >
      <Card className="bg-gradient-to-br from-background/90 via-background/80 to-background/70 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

        <CardHeader className="relative z-10 pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Your Creation
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Investment
            </Label>

            <motion.div
              key={totalCost}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex items-baseline gap-1"
            >
              <span className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                {totalCost.toFixed(2)}
              </span>
              <span className="text-lg font-semibold text-muted-foreground">EGP</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-muted-foreground"
            >
              Price includes all customizations and premium quality materials.
            </motion.p>
          </div>

          {/* Value Indicators */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-xs font-medium text-primary">Premium</div>
              <div className="text-xs text-muted-foreground">Quality</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-xs font-medium text-primary">Custom</div>
              <div className="text-xs text-muted-foreground">Design</div>
            </div>
          </div>
        </CardContent>

        {/* Subtle Animation Border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none"
          animate={{
            borderColor: ["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.4)", "rgba(59, 130, 246, 0.2)"],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </Card>
    </motion.div>
  )
}
