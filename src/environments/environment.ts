export const environment = {
  production: false,
  // Ports match the actual .NET launchSettings.json http profiles for these two services
  // (src/FashionSaaS.API and services/fashionsaas-tryon/src/FashionSaaS.TryOn.Api) - the
  // previous 5000/5050 values didn't match either service's real dev port, so a developer
  // running `dotnet run` for both APIs per their own launchSettings could never reach them
  // from a locally-served storefront. Confirmed via live end-to-end testing.
  apiBaseUrl: 'http://localhost:5129/api',
  // Real seeded tenant used for local dev/E2E testing against the new slug-based public
  // catalog routes (api/{slug}/categories, api/{slug}/products). This is a placeholder
  // for local development ONLY: resolving the real tenant from the production subdomain
  // (e.g. chic-boutique.fashionsaas.com) is explicitly out of scope for this fix — see
  // environment.prod.ts, which intentionally leaves tenantSlug empty pending that work.
  tenantSlug: 'chic-boutique',
  tryOnApiBaseUrl: 'http://localhost:5231/api',
};
