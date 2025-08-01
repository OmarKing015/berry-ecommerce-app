"use server"

import { defineLive } from "next-sanity";
import { client } from "../lib/client";

// export const live = defineLive({client})
const token = process.env.SANITY_API_TOKEN;
if (!token) {
  throw new Error("Missing SANITY_API_TOKEN");
}
// export const live = defineLive({client,token})
export const { sanityFetch, SanityLive } = defineLive({
  client: client as any,
  serverToken: token,
  browserToken: token,
  fetchOptions: {
    revalidate: 3600, // 1 hour
  },
});
