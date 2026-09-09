import arcjet, { detectBot, shield, tokenBucket, validateEmail } from "@arcjet/node";

const ARCJET_KEY = process.env.ARCJET_KEY;

if (!ARCJET_KEY || ARCJET_KEY === "ajkey_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
  console.warn(
    "[Arcjet] ARCJET_KEY absent ou de test. La protection Arcjet est DÉSACTIVÉE."
  );
}

const aj = arcjet({
  key: ARCJET_KEY ?? "ajkey_test_00000000000000000000000000000000",
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN" }),
    detectBot({
      mode: "DRY_RUN",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    validateEmail({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
    tokenBucket({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default aj;
