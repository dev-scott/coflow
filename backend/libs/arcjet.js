import arcjet, {
  detectBot,
  shield,
  tokenBucket,
  validateEmail,
} from "@arcjet/node";

const ARCJET_KEY = process.env.ARCJET_KEY;

// Si la clé Arcjet n'est pas définie ou invalide, on exporte un mock qui autorise tout
// Cela évite les erreurs en développement sans clé configurée
if (!ARCJET_KEY || ARCJET_KEY === "ajkey_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
  console.warn(
    "[ARCJET] Clé ARCJET_KEY absente ou de test. La protection Arcjet est DÉSACTIVÉE."
  );
}

const aj = arcjet({
  key: ARCJET_KEY || "ajkey_test_00000000000000000000000000000000",
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN" }),
    // Create a bot detection rule
    detectBot({
      mode: "DRY_RUN", // DRY_RUN = log seulement, ne bloque pas
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    validateEmail({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default aj;
