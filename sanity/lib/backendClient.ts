import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId ,token } from "../env";

export const backendClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: true,
  token
});
