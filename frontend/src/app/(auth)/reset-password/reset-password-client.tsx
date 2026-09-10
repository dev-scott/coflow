"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { postData } from "@/lib/fetch-util";
import { CoFlowLogo } from "@/components/logo";

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          width: "100%",
          maxWidth: 440,
          margin: "0 auto",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "var(--shadow-card)",
          position: "relative",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "rgba(220, 38, 38, 0.12)",
            color: "#DC2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertCircle size={26} />
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--foreground)", margin: "0 0 8px" }}>
          Lien de validation manquant
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 auto 20px", maxWidth: 300, lineHeight: 1.5 }}>
          Le lien utilisé est incomplet ou a expiré. Veuillez refaire une demande de réinitialisation.
        </p>
        <Link
          href="/forgot-password"
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            borderRadius: 10,
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
          width: "100%",
          maxWidth: 440,
          margin: "0 auto",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "var(--shadow-card)",
          position: "relative",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "rgba(77, 153, 114, 0.12)",
            color: "#3B805C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)", margin: "0 0 8px" }}>
          Mot de passe modifié !
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 auto 22px" }}>
          Redirection automatique vers la connexion...
        </p>
        <Link
          href="/sign-in"
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            borderRadius: 10,
            fontSize: 13.5,
            textDecoration: "none",
          }}
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "36px 32px",
        boxShadow: "var(--shadow-card)",
        position: "relative",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Top green accent line */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: "25%",
          right: "25%",
          height: 2,
          background: "linear-gradient(90deg, transparent, #3B805C, transparent)",
        }}
      />

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <CoFlowLogo size={40} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--foreground)", margin: "0 0 6px" }}>
          Nouveau mot de passe
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
          Définissez un mot de passe sécurisé pour votre compte.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Nouveau mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              {...register("newPassword")}
              style={{
                width: "100%",
                padding: "11px 40px 11px 40px",
                background: "var(--input-bg)",
                border: errors.newPassword ? "1px solid #DC2626" : "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
                transition: "border-color 0.15s ease",
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
                padding: 4,
                cursor: "pointer",
                color: "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Afficher ou masquer le mot de passe"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.newPassword && (
            <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Confirmer le mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Répétez le mot de passe"
              {...register("confirmPassword")}
              style={{
                width: "100%",
                padding: "11px 40px 11px 40px",
                background: "var(--input-bg)",
                border: errors.confirmPassword ? "1px solid #DC2626" : "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                padding: 4,
                cursor: "pointer",
                color: "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Afficher ou masquer la confirmation du mot de passe"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
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
            height: 44,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin-slow" />
              Mise à jour...
            </>
          ) : (
            <>
              Enregistrer le nouveau mot de passe
              <ArrowRight size={16} className="lp-arrow" />
            </>
          )}
        </button>
      </form>

      <div
        style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 11.5,
          color: "var(--muted-foreground)",
        }}
      >
        <ShieldCheck size={13} color="#3B805C" />
        <span>Chiffrement SSL 256-bit</span>
      </div>
    </div>
  );
}
