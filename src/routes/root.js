import { htmlPage } from '../utils/spa.js';

export async function handleRoot(env) {
  return await htmlPage(env);
}
