import { hc } from "hono/client";

import type { APIType } from "../pages/api/[...path]";

import { BASE_URL } from "./baseUrl";

const client = hc<APIType>(BASE_URL);

export default client;
