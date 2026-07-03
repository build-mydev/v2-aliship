import { useAuth } from "@/lib/auth-context";

export function useUserSite() {
  const { siteId, siteName, siteType } = useAuth();

  return {
    siteId,
    siteName,
    siteType,
    isHQ: siteType === "hq",
    isDC: siteType === "dc",
    isOffice: siteType === "office",
    isBranch: siteType === "branch",
    isSuperAdmin: siteType === null,
  };
}
