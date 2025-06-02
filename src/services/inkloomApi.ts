// apiService.js

const BASE_URL = "https://inkloom-test.bi-dev2.de/api";

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Api-Key": "cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=",
};

/**
 * Generic GET request
 * @param {string} endpoint - e.g. '/preview'
 * @param {object} headers - optional extra headers
 */
export const get = async (endpoint: any, headers = {}, isText = false) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: { ...defaultHeaders, ...headers },
  });

  if (!response.ok) throw new Error(`GET ${endpoint} failed`);
  const text = await response.text(); // allow SVG or JSON response
  return { text, response };
};

/**
 * Generic POST request
 * @param {string} endpoint - e.g. '/preview'
 * @param {object} data - JSON payload
 * @param {object} headers - optional extra headers
 */
export const post = async (endpoint: any, data: any, headers = {}) => {
  //console.log(data);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`POST ${endpoint} failed`);
  const text = await response.text(); // allow SVG or JSON response
  return { text, response };
};
