import { htmlPage } from '../spa.js';

export async function handleRoot(env) {
  return await htmlPage(env);
}
