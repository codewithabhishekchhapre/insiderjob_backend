// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"
// import {nodeProfilingIntegration} from "@sentry/profiling-node";
// const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://63ebbcb034f32e1b1257f48890a2f0aa@o4508964179410944.ingest.us.sentry.io/4508964188127232",
  integrations: [
    // nodeProfillingIntegration(),
    Sentry.mongooseIntegration()
],
// Tracing
// tracesSampleRate: 1.0,             //Capture 100% of the transaction
});
//Manuallay call starProfiler and stopProfiler
//to profile the code in between
Sentry.profiler.startProfiler();

// Starts a transaction that will also be profiled
Sentry.startSpan({
  name: "My First Transaction",
}, () => {
  // the code executing inside the transaction will be wrapped in a span and profiled
});

// Calls to stopProfiling are optional - if you don't stop the profiler, it will keep profiling
// your application until the process exits or stopProfiling is called.
Sentry.profiler.stopProfiler();