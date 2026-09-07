import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/hooks/use-auth";
import { signInSchema } from "@/lib/schema";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Lock, Mail, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<SigninFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const { mutate, isPending } = useLoginMutation();

  const handleOnSubmit = (values: SigninFormData) => {
    mutate(values, {
      onSuccess: (data) => {
        login(data);
        toast.success("Welcome back!");
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      {/* Decorative orbs */}
      <div
        className="pointer-events-none fixed top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ background: "#7c3aed" }}
      />
      <div
        className="pointer-events-none fixed bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15"
        style={{ background: "#06b6d4" }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div
          className="rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{
            background: "rgba(17, 17, 24, 0.90)",
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 64px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.08)",
          }}
        >
          {/* Top gradient line */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #7c3aed88, #06b6d466, transparent)",
            }}
          />

          <div className="px-8 py-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1.5 text-center">
                Sign in to continue to CoFlow
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleOnSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 bg-white/[0.04] border-white/[0.08] focus-visible:border-[#7c3aed]/60 h-11"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-1.5">
                        <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Password
                        </FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-white/[0.04] border-white/[0.08] focus-visible:border-[#7c3aed]/60 h-11"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-11 font-semibold text-sm",
                    "bg-gradient-to-r from-[#7c3aed] to-[#4f46e5]",
                    "hover:from-[#6d28d9] hover:to-[#4338ca]",
                    "border-0 shadow-lg shadow-[#7c3aed]/30",
                    "transition-all duration-200"
                  )}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              No account yet?{" "}
              <Link
                to="/sign-up"
                className="text-[#a78bfa] hover:text-[#c4b5fd] font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
