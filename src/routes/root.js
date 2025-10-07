import { htmlPage } from '../utils/spa.js';

export async function handleRoot(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  return await htmlPage(env, token);
}
