"use client";

import { useEditorStore } from "../../store/editorStore";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";

export default function CostSummary() {
  const { totalCost } = useEditorStore();

  return (
    <>
      {/* Mobile View: A more structured, but simple, cost display */}
      <div className="lg:hidden w-full mt-4 p-4 border-t bg-background">
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">{totalCost.toFixed(2)} EGP</p>
        </div>
      </div>

      {/* Desktop View: Detailed card, fixed position */}
      <div className="hidden lg:block">
        <Card className="w-full max-w-xs sm:mx-auto sm:mt-8 m-5 lg:fixed lg:bottom-4 lg:right-4 lg:w-72 shadow-2xl backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Finalize Your Design</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <Label className="text-base font-medium">Total Cost</Label>
              <p className="text-3xl font-bold text-black">
                {totalCost.toFixed(2)} EGP
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Price includes all customizations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
