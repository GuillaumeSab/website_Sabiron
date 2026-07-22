const CVS = {
  fr: "https://guillaumesabiron.github.io/static/documents/guillaume-sabiron-cv-fr.pdf",
  en: "https://guillaumesabiron.github.io/static/documents/guillaume-sabiron-cv-en.pdf",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const language = url.pathname.replace(/^\//, "").replace(/\/$/, "");

    if (!Object.hasOwn(CVS, language)) {
      return new Response("Not found", { status: 404 });
    }

    // Intentionally record only the requested CV variant and the timestamp
    // automatically attached by Analytics Engine. No IP address, referrer,
    // user agent, or other visitor identifier is stored here.
    env.CV_DOWNLOADS.writeDataPoint({
      blobs: [language],
      doubles: [1],
      indexes: ["cv-download"],
    });

    return Response.redirect(CVS[language], 302);
  },
};
