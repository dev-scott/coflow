import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("[DB] La variable d'environnement MONGODB_URI n'est pas définie dans .env");
}

const uri: string = MONGODB_URI;

let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<void> {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!cachedPromise) {
    const maskedUri = uri.replace(/:([^:@]+)@/, ":****@");
    console.log(`[DB] Connexion en cours à MongoDB (${maskedUri})...`);

    cachedPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false,
      })
      .then((m) => {
        console.log("[DB] Connecté avec succès à MongoDB !");
        return m;
      })
      .catch((error) => {
        cachedPromise = null;
        console.error("\n========================================================");
        console.error("❌ ERREUR DE CONNEXION MONGODB ATLAS");
        console.error("========================================================");
        if (error.name === "MongooseServerSelectionError") {
          console.error("Cause probable : Votre adresse IP n'est pas autorisée sur MongoDB Atlas.");
          console.error("Pour débloquer l'accès en 30 secondes :");
          console.error("1. Ouvrez https://cloud.mongodb.com");
          console.error("2. Allez dans 'Security' -> 'Network Access'");
          console.error("3. Cliquez sur 'Add IP Address'");
          console.error("4. Choisissez 'Allow Access From Anywhere' (0.0.0.0/0) ou ajoutez votre IP actuelle.");
          console.error("5. Cliquez sur 'Confirm' et attendez quelques secondes.");
        } else {
          console.error("Détails de l'erreur :", error.message || error);
        }
        console.error("========================================================\n");

        if (!process.env.VERCEL) {
          process.exit(1);
        }
        throw error;
      });
  }

  await cachedPromise;
}

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] Déconnecté de MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("[DB] Erreur Mongoose :", err);
});
