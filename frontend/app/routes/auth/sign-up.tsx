import { signUpSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useSignUpMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ArrowRight, Lock, Loader2, Mail, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type SignupFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", name: "", confirmPassword: "" },
  });

  const { mutate, isPending } = useSignUpMutation();

  const handleOnSubmit = (values: SignupFormData) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Account created!", {
          description: "You can now sign in.",
        });
        form.reset();
        navigate("/sign-in");
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
        className="pointer-events-none fixed top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ background: "#7c3aed" }}
      />
      <div
        className="pointer-events-none fixed bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-15"
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
                "linear-gradient(90deg, transparent, #06b6d466, #7c3aed88, transparent)",
            }}
          />

          <div className="px-8 py-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-7">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
              <p className="text-sm text-muted-foreground mt-1.5 text-center">
                Join CoFlow and start collaborating
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleOnSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="John Doe"
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
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Password
                      </FormLabel>
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Confirm Password
                      </FormLabel>
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
                    "w-full h-11 font-semibold text-sm mt-2",
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
                      Create account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="text-[#a78bfa] hover:text-[#c4b5fd] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
