"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { postData } from "@/lib/fetch-util";

const schema = z
  .object({
    newPassword: z.string().min(8, "Au moins 8 caractères requis"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      postData<{ message: string }>("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    onSuccess: () => {
      setDone(true);
      toast.success("Mot de passe mis à jour avec succès !");
      setTimeout(() => router.push("/sign-in"), 1800);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur de réinitialisation");
    },
  });

  if (!token) {
    return (
      <div
        style={{
          background: "rgba(17, 17, 24, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.12)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertCircle size={26} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" }}>
          Jeton de validation manquant
        </h2>
        <p style={{ fontSize: 13, color: "#71717a", margin: "0 auto 20px", maxWidth: 300 }}>
          Le lien utilisé est incomplet ou a expiré. Veuillez refaire une demande de réinitialisation.
        </p>
        <Link
          href="/forgot-password"
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            borderRadius: 8,
            fontSize: 13.5,
            textDecoration: "none",
          }}
        >
          Nouvelle demande
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div
        style={{
          background: "rgba(17, 17, 24, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.12)",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" }}>
          Mot de passe modifié !
        </h2>
        <p style={{ fontSize: 13, color: "#71717a", margin: "0 auto 20px" }}>
          Redirection automatique vers la connexion...
        </p>
        <Link
          href="/sign-in"
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            borderRadius: 8,
            fontSize: 13.5,
            textDecoration: "none",
          }}
        >
          Se connecter maintenant
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(17, 17, 24, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        padding: "36px 32px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -1,
          left: "20%",
          right: "20%",
          height: 1,
          background: "linear-gradient(90deg, transparent, #10b981, transparent)",
        }}
      />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#f1f5f9", margin: "0 0 6px" }}>
          Nouveau mot de passe
        </h1>
        <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>
          Choisissez un nouveau mot de passe fort pour sécuriser votre compte.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
            Nouveau mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              {...register("newPassword")}
              style={{
                width: "100%",
                padding: "10px 38px 10px 36px",
                background: "rgba(255,255,255,0.03)",
                border: errors.newPassword ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13.5,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#52525b",
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.newPassword && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
            Confirmer le mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "rgba(255,255,255,0.03)",
                border: errors.confirmPassword ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>
          {errors.confirmPassword && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            marginTop: 6,
            borderRadius: 8,
            fontSize: 13.5,
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin-slow" />
              Mise à jour...
            </>
          ) : (
            <>
              Réinitialiser le mot de passe
              <ArrowRight size={15} className="lp-arrow" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
