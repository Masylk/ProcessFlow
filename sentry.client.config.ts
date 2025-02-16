// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://44626799eb3705f48c15304ea7915494@o4508738869788672.ingest.de.sentry.io/4508738871623760",

  // Désactive la collecte des spans en mode développement (client)
  tracesSampler: (samplingContext) => {
    if (process.env.NODE_ENV === "development") {
      return 0;
    }
    return 1;
  },

  // Ajout de l'intégration du feedback utilisateur
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "system",
      isEmailRequired: true,
      disabledPaths: [
        "/login",
        "/reset-password",
        "/forgot-password",
        "/auth-design",
        "/auth-signup-design",
        "/login/",
        "/reset-password/",
        "/forgot-password/",
        "/auth-design/",
        "/auth-signup-design/"
      ]
    }),
  ],

  debug: false,
});