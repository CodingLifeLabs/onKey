"use client";

import { useState } from "react";
import { NativeButton } from "@/components/ui/button-native";
import { CheckCircle, Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

export function CopyButton({ text, variant = "outline", size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NativeButton variant={variant} size={size} onClick={handleCopy}>
      {copied ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </NativeButton>
  );
}
