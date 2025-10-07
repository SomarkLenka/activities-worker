import { handleRoot } from './routes/root.js';
import { handleInitialSubmit, handleCompleteSubmit } from './routes/submit.js';
import { handleAdminSearch } from './routes/admin/search.js';
import { handleAdminActivities } from './routes/admin/activities.js';
import { handleAdminRisks } from './routes/admin/risks.js';
import { handleAdminProperties } from './routes/admin/properties.js';
import { handleAdminDocument } from './routes/admin/document.js';
import { handleAdminVerify } from './routes/admin/verify.js';
import { handleAdminReleases } from './routes/admin/releases.js';
import { handleAdminDownloadAll } from './routes/admin/download-all.js';
import { handleAdminDebug } from './routes/admin/debug.js';
import { handleAdminApiDocs } from './routes/admin/api-docs.js';
import { handleStatus } from './routes/status.js';
import { handleDownload } from './routes/download.js';
import { handleAdmin } from './utils/admin.js';

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    try {
      if (request.method === 'GET'  && pathname === '/')                      return await handleRoot(request, env);
      if (request.method === 'POST' && pathname === '/submit/initial')        return await handleInitialSubmit(request, env);
      if (request.method === 'POST' && pathname === '/submit/complete')       return await handleCompleteSubmit(request, env);
      if (request.method === 'GET'  && pathname === '/admin/search')          return await handleAdminSearch(request, env);
      if (request.method === 'GET'  && pathname === '/status')                return await handleStatus(env);
      
      if (request.method === 'GET'  && pathname === '/admin')                 return await handleAdmin();
	  if (request.method === 'GET'  && pathname === '/admin/document')        return await handleAdminDocument(request, env);
      if (request.method === 'GET'  && pathname === '/admin/verify')          return await handleAdminVerify(request, env);
      if (request.method === 'GET'  && pathname === '/admin/download-all')    return await handleAdminDownloadAll(request, env);
      if (request.method === 'GET'  && pathname === '/admin/debug')           return await handleAdminDebug(request, env);
      if (request.method === 'GET'  && pathname === '/admin/api-docs')        return await handleAdminApiDocs();
      if ((request.method === 'GET' || request.method === 'POST') && pathname.startsWith('/admin/releases'))	return await handleAdminReleases(request, env);
      if ((request.method === 'GET' || request.method === 'POST') && pathname.startsWith('/admin/activities')) 	return await handleAdminActivities(request, env);
      if ((request.method === 'GET' || request.method === 'POST') && pathname.startsWith('/admin/properties'))	return await handleAdminProperties(request, env);
      if ((request.method === 'GET' || request.method === 'POST') && pathname === '/admin/risks')				return await handleAdminRisks(request, env);
      if (request.method === 'GET'  && pathname.startsWith('/download/'))     return await handleDownload(request, env);

      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return new Response('Server error', { status: 500 });
    }
  }
};
