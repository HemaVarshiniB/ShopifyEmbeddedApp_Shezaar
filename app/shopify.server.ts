import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import type { AppLoadContext } from "@remix-run/node";
import { MemorySessionStorage } from '@shopify/shopify-app-session-storage-memory';


export const shopify = (context: AppLoadContext) =>
  shopifyApp({
    apiKey: context.cloudflare.env.SHOPIFY_API_KEY,
    apiSecretKey: context.cloudflare.env.SHOPIFY_API_SECRET || "",
    apiVersion: ApiVersion.October24,
    scopes: context.cloudflare.env.SCOPES?.split(","),
    appUrl: context.cloudflare.env.SHOPIFY_APP_URL || "",
    authPathPrefix: "/auth",
    sessionStorage: new MemorySessionStorage(),
    distribution: AppDistribution.AppStore,
    future: {
      unstable_newEmbeddedAuthStrategy: true,
    },
    ...(process.env.SHOP_CUSTOM_DOMAIN
      ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
      : {}),
  });

export default shopify;
export const apiVersion = ApiVersion.October24;