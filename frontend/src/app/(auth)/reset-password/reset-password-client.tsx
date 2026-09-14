"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2, AlertCircle, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
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
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-card-accent-line" />

        <div className="auth-icon-circle error">
          <AlertCircle size={26} />
        </div>
        <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 8px" }}>
          Lien de validation manquant
        </h2>
        <p style={{ fontSize: 13, color: "#64748B", margin: "0 auto 20px", maxWidth: 320, lineHeight: 1.5 }}>
          Le lien utilisé est incomplet ou a expiré. Veuillez refaire une demande de réinitialisation.
        </p>
        <Link
          href="/forgot-password"
          className="auth-submit-btn"
          style={{ textDecoration: "none", marginBottom: 12 }}
        >
          Nouvelle demande
          <ArrowRight size={16} className="arrow-icon" />
        </Link>
        <Link href="/sign-in" className="auth-back-link" style={{ justifyContent: "center" }}>
          <ArrowLeft size={14} />
          Retour à la page de connexion
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-card-accent-line" />

        <div className="auth-icon-circle success">
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 8px" }}>
          Mot de passe modifié !
        </h2>
        <p style={{ fontSize: 13, color: "#64748B", margin: "0 auto 22px" }}>
          Votre nouveau mot de passe a été enregistré. Redirection en cours vers la connexion...
        </p>
        <Link
          href="/sign-in"
          className="auth-submit-btn"
          style={{ textDecoration: "none" }}
        >
          Se connecter
          <ArrowRight size={16} className="arrow-icon" />
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card-accent-line" />

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="auth-icon-circle success">
          <KeyRound size={24} />
        </div>
        <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 6px" }}>
          Nouveau mot de passe
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
          Définissez un mot de passe sécurisé pour votre compte.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="auth-input-group">
          <label className="auth-input-label">
            <span>Nouveau mot de passe</span>
          </label>
          <div className="auth-input-wrapper">
            <Lock className="auth-input-icon" size={16} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              {...register("newPassword")}
              className={`auth-input-field ${errors.newPassword ? "error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-eye-btn"
              aria-label="Afficher ou masquer le mot de passe"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="auth-field-error">
              <AlertCircle size={12} />
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="auth-input-group">
          <label className="auth-input-label">
            <span>Confirmer le mot de passe</span>
          </label>
          <div className="auth-input-wrapper">
            <Lock className="auth-input-icon" size={16} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Répétez le mot de passe"
              {...register("confirmPassword")}
              className={`auth-input-field ${errors.confirmPassword ? "error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="auth-eye-btn"
              aria-label="Afficher ou masquer la confirmation du mot de passe"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="auth-field-error">
              <AlertCircle size={12} />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="auth-submit-btn"
          style={{ marginTop: 4 }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Mise à jour en cours...
            </>
          ) : (
            <>
              Enregistrer le nouveau mot de passe
              <ArrowRight size={16} className="arrow-icon" />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: 22, textAlign: "center" }}>
        <Link
          href="/sign-in"
          className="auth-back-link"
          style={{ justifyContent: "center" }}
        >
          <ArrowLeft size={14} />
          Retour à la page de connexion
        </Link>
      </div>

      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid rgba(15, 23, 42, 0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 11.5,
          color: "#64748B",
        }}
      >
        <ShieldCheck size={14} color="#3B805C" />
        <span>Chiffrement SSL 256-bit</span>
      </div>
    </div>
  );
}

