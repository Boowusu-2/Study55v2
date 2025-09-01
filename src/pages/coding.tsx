import React from "react";
import Head from "next/head";
import CodingTerminal from "@/components/CodingTerminal";

export default function CodingPage() {
  return (
    <>
      <Head>
        <title>Coding Terminal | SmartStudy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen w-full bg-[#0f1419]">
        <CodingTerminal
          isOpen={true}
          onClose={() => {
            if (typeof window !== "undefined") {
              window.history.back();
            }
          }}
          programmingLanguage="python"
          mode="page"
        />
      </div>
    </>
  );
}

