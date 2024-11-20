"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { Icon } from "@/components/ui/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from 'next/navigation';

const schema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4, { message: "Password must be at least 4 characters." }),
});

type FormValues = z.infer<typeof schema>;

const LoginForm = () => {
  const [isPending, setIsPending] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passwordType, setPasswordType] = React.useState("password");
  const [rememberMe, setRememberMe] = React.useState(false);

  const togglePasswordType = () => {
    setPasswordType(prev => prev === "password" ? "text" : "password");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "Configuration":
        return "Server configuration error. Please contact support.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "CredentialsSignin":
        return "Invalid email or password. Please try again.";
      case "OAuthSignin":
        return "Error during sign in. Please try a different method.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsPending(true);

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(getErrorMessage(result.error));
        return;
      }

      // Get return URL from query parameters or default to dashboard
      const callbackUrl = searchParams?.get('callbackUrl') || '/en/dashboard/analytics';
      
      toast.success("Successfully logged in");
      router.push(callbackUrl);
      router.refresh(); // Refresh to update session state

    } catch (error) {
      toast.error("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium text-default-600">
          Email
        </Label>
        <Input 
          size="lg"
          disabled={isPending}
          {...register("email")}
          type="email"
          id="email"
          placeholder="Enter your email"
          className={cn("", {
            "border-destructive": errors.email,
          })}
        />
        {errors.email && (
          <div className="text-destructive text-sm">
            {errors.email.message}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="font-medium text-default-600">
          Password
        </Label>
        <div className="relative">
          <Input 
            size="lg"
            disabled={isPending}
            {...register("password")}
            type={passwordType}
            id="password"
            placeholder="Enter your password"
            className="peer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
            onClick={togglePasswordType}
          >
            {passwordType === "password" ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
        {errors.password && (
          <div className="text-destructive text-sm">
            {errors.password.message}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Checkbox 
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked: boolean) => setRememberMe(checked)}
          />
          <Label htmlFor="remember">Keep Me Signed In</Label>
        </div>
        <Link
          href="/en/auth/forgot-password"
          className="text-sm text-default-800 dark:text-default-400 leading-6 font-medium hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <Button 
        type="submit" 
        fullWidth 
        disabled={isPending}
        className="mt-6"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-center mt-6">
        <span className="text-sm text-default-500">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </span>
      </div>
    </form>
  );
};

export default LoginForm;
