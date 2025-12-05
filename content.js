// Smart Auto Dark Mode content script
browser.storage.local.get({ darkStart: 19, darkEnd: 7, excludedSites: "" }).then(settings => {
    const hour = new Date().getHours();
    const dark = (hour >= settings.darkStart || hour < settings.darkEnd);
    if (!dark) return;

    // Build exclusion list
    const excluded = settings.excludedSites
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);

    const hostname = window.location.hostname.toLowerCase();
    if (excluded.some(site => hostname.endsWith(site))) return;

    // Skip sites that respect prefers-color-scheme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) return;

    // Inject smart dark CSS
    const style = document.createElement('style');
    style.id = 'smart-dark-mode-style';
    style.textContent = `
        body, p, span, div, li, h1, h2, h3, h4, h5, h6, a {
            background-color: #111 !important;
            color: #eee !important;
            border-color: #333 !important;
        }
        img, video, canvas, iframe, svg {
            background-color: transparent !important;
            color: inherit !important;
        }
        a { color: #80c0ff !important; }
        input, textarea, select, button {
            background-color: #222 !important;
            color: #eee !important;
            border-color: #444 !important;
        }
        body, div, section, header, footer, article {
            background-image: inherit !important;
        }
    `;
    document.head.appendChild(style);

    // Observe dynamic content (SPAs)
    const observer = new MutationObserver(() => {
        if (!document.getElementById('smart-dark-mode-style')) {
            document.head.appendChild(style);
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
});
