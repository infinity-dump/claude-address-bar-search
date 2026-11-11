const pending = new Map();
const lifetime = 15_000;

browser.webRequest.onBeforeSendHeaders.addListener(request => {
    const query = safariSearchQuery(request);
    if (!query)
        return;

    const token = crypto.randomUUID();
    const destination = claudeSearchDestination(query, token);
    pending.set(request.tabId, { token, url: destination.href, expires: Date.now() + lifetime });
    setTimeout(() => clearPending(request.tabId, token), lifetime);
    browser.tabs.update(request.tabId, { url: destination.href })
        .catch(() => clearPending(request.tabId, token));
}, {
    urls: ["https://www.google.com/*"]
}, ["requestHeaders"]);

function clearPending(tabId, token) {
    if (pending.get(tabId)?.token === token)
        pending.delete(tabId);
}

browser.runtime.onMessage.addListener((message, sender, respond) => {
    if (message?.type !== "claim-safari-search" || sender.frameId !== 0)
        return;

    const tabId = sender.tab?.id;
    const entry = pending.get(tabId);
    if (!entry || entry.token !== message.token || entry.url !== sender.url || entry.expires < Date.now())
        return;

    pending.delete(tabId);
    respond({ prompt: new URL(entry.url).searchParams.get("q") });
});
