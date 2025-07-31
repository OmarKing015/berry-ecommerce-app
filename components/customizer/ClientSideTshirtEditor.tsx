"use client";

import dynamic from "next/dynamic";
import Loader from "@/components/loader";

const TshirtEditor = dynamic(
  () => import("@/components/customizer/TshirtEditor"),
  { ssr: false, loading: () => <Loader /> }
);

export default function ClientSideTshirtEditor() {
  return <TshirtEditor />;
}
