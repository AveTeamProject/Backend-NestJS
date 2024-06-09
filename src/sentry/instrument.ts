import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: 'https://16070e973a1fed8de32adf2c3b48306b@o4504282455801856.ingest.us.sentry.io/4507378520883200',
  integrations: [
    nodeProfilingIntegration(),
  ],
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});