"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { estateContactQueryOptions } from "@/app/properties/_queries/estate-contact.query";

/**
 * Drives the "نمایش شماره تماس" affordance: nothing is requested until the
 * visitor taps, and both the sidebar card and the mobile bar share the cache.
 */
export function useEstateContact(estateId: string) {
  const [requested, setRequested] = useState(false);
  const query = useQuery(estateContactQueryOptions(estateId, requested));

  return {
    ...query,
    requested,
    reveal: () => setRequested(true),
  };
}
