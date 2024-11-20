"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const Social = ({ locale }: { locale: string }) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleOAuthSignIn = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      
      // Get the callback URL from searchParams or default to dashboard
      const callbackUrl = searchParams?.get('callbackUrl') || `/${locale}/dashboard/analytics`;

      await signIn(provider, {
        callbackUrl,
        redirect: true,
      }).catch((error) => {
        console.error(`${provider} sign in error:`, error);
        throw error;
      });

    } catch (error) {
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  const providers = [
    {
      id: "google",
      name: "Google",
      icon: "/images/icon/gp.svg",
      bgColor: "bg-[#EA4335]"
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "/images/icon/fb.svg",
      bgColor: "bg-[#395599]"
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "/images/icon/in.svg",
      bgColor: "bg-[#0A63BC]"
    },
    {
      id: "github",
      name: "GitHub",
      icon: "/images/icon/gh.svg",
      bgColor: "bg-[#333333]"
    }
  ];

  return (
    <ul className="flex">
      {providers.map((provider) => (
        <li key={provider.id} className="flex-1">
          <button
            onClick={() => handleOAuthSignIn(provider.id)}
            disabled={!!loadingProvider}
            className={`inline-flex h-10 w-10 p-2 ${provider.bgColor} text-white text-2xl flex-col items-center justify-center rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={`Sign in with ${provider.name}`}
          >
            {loadingProvider === provider.id ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Image 
                width={300} 
                height={300} 
                className="w-full h-full" 
                src={provider.icon} 
                alt={provider.name} 
              />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Social;
