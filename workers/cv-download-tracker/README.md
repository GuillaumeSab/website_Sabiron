# CV download tracker

This Worker records one anonymous event for each requested CV variant, then
returns a `302` redirect to the PDF served by GitHub Pages.

Only the variant (`fr` or `en`) and the event timestamp are written to Workers
Analytics Engine. It does not store IP addresses, user agents, referrers, or
other visitor identifiers.

## Deploy

1. In the Cloudflare dashboard, open **Workers & Pages** and create a Worker.
2. Name it `guillaume-sabiron-cv-downloads`.
3. In **Settings → Bindings**, add an **Analytics Engine** binding named
   `CV_DOWNLOADS` with the dataset `guillaume_sabiron_cv_downloads`.
4. Replace the Worker code with `src/index.js` and deploy it.
5. Copy the resulting `*.workers.dev` URL. The public CV links will then use:
   - `https://YOUR-WORKER.workers.dev/fr`
   - `https://YOUR-WORKER.workers.dev/en`

After deployment, provide the Worker URL so it can be inserted into the site.
