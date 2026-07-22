export type FrameworkRouteKey = "design-system" | "homepage" | "elements";

export interface FrameworkRoute {
  key: FrameworkRouteKey;
  path: string;
  variant: "A" | "B" | "E";
  title: string;
  description: string;
}

export const frameworkRoutes: readonly FrameworkRoute[] = [
  {
    key: "design-system",
    path: "/framework/design-system",
    variant: "A",
    title: "Design system | Techies Framework",
    description: "Framework primitives, semantic roles, accessibility evidence, and generated values.",
  },
  {
    key: "homepage",
    path: "/framework/homepage",
    variant: "B",
    title: "Homepage preview | Techies Framework",
    description: "A realistic homepage preview showing how Framework preferences compose into reusable sections.",
  },
  {
    key: "elements",
    path: "/framework/elements",
    variant: "E",
    title: "Element Reference | Techies Framework",
    description: "Searchable Element Guidance with semantic HTML, treatment evidence, and accessibility expectations.",
  },
];

export const canonicalFrameworkRoute = (key: string): FrameworkRoute | undefined =>
  frameworkRoutes.find((route) => route.key === key);

export const frameworkRouteForPathname = (pathname: string): FrameworkRoute | undefined =>
  frameworkRoutes.find((route) => route.path === pathname.replace(/\/$/, ""));

export const frameworkRouteForLegacyVariant = (variant: string | null): FrameworkRoute | undefined =>
  frameworkRoutes.find((route) => route.variant === (variant ?? "A"));

export const frameworkRouteAddress = (route: FrameworkRoute): string => `techies.local${route.path}`;
