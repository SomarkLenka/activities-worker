import { handleRoot } from './routes/root.js';
import { handleSubmit } from './routes/submit.js';
import { handleAdminSearch } from './routes/adminSearch.js';
import { handleStatus } from './routes/status.js';
import { handleDownload } from './routes/download.js';

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    try {
      if (request.method === 'GET'  && pathname === '/')              return await handleRoot(env);
      if (request.method === 'POST' && pathname === '/submit')        return await handleSubmit(request, env);
      if (request.method === 'GET'  && pathname === '/admin/search')  return await handleAdminSearch(request, env);
      if (request.method === 'GET'  && pathname === '/status')        return await handleStatus(env);
      if (request.method === 'GET'  && pathname.startsWith('/download/')) return await handleDownload(request, env);

      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return new Response('Server error', { status: 500 });
    }
  }
};
