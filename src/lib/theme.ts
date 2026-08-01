/**
 * Shared between the server layout (which reads the cookie while rendering) and
 * the client provider (which writes it). It deliberately lives outside the
 * `"use client"` provider module: importing a value from a client module into a
 * server component hands back a client-reference proxy rather than the value
 * itself, so the cookie lookup would silently never match.
 */
export const THEME_COOKIE = "koomeh-theme";

export type Theme = "light" | "dark";
