import { connectDB } from "./config/db.js";

async function main() {
  console.log("=== Test de connexion MongoDB CoFlow ===");
  await connectDB();
  console.log("=== Test réussi avec succès ! ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Test échoué :", err);
  process.exit(1);
});
