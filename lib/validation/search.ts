import { z } from "zod";

/**
 * Stock search query sent by the search palette: 1–32 characters of letters,
 * digits, spaces and `. - &` ("BRK.B", "AT&T", "Coca-Cola").
 */
export const searchQuerySchema = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[\p{L}\p{N} .\-&]+$/u);
