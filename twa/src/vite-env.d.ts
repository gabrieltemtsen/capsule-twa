/// <reference types="vite/client" />

import { Environment } from "@usecapsule/web-sdk";

interface ImportMetaEnv {
  readonly VITE_CAPSULE_ENV: Environment;
  readonly VITE_CAPSULE_API_KEY: string;
  readonly VITE_KV_REST_API_URL: string;
  readonly VITE_KV_REST_API_TOKEN: string;
  readonly VITE_CONVEX_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
