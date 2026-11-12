function safariSearchQuery(request) {
    if (request.type !== "main_frame" || request.frameId !== 0 || request.tabId < 0 || request.method !== "GET")
        return null;

    const source = new URL(request.url);
    if (source.origin !== "https://www.google.com" || source.pathname !== "/search"
        || source.searchParams.get("client") !== "safari"
        || source.searchParams.get("udm") === "2" || source.searchParams.get("tbm") === "isch")
        return null;

    const headers = new Map((request.requestHeaders ?? []).map(header => [
        header.name.toLowerCase(), header.value
    ]));
    // Browser-generated Fetch Metadata distinguishes an address-bar navigation
    // from a page linking to a URL that happens to contain client=safari.
    if (headers.get("sec-fetch-site") !== "none"
        || headers.get("sec-fetch-dest") !== "document"
        || headers.get("sec-fetch-mode") !== "navigate"
        || headers.has("referer"))
        return null;

    const query = source.searchParams.get("q");
    return query?.trim() ? query : null;
}

function imageSearchQuery(query) {
    const command = /^(?:please\s+)?(?:image\s+search|(?:search|find|show(?:\s+me)?|look\s+for)\s+(?:for\s+)?(?:images?|pictures?|photos?))(?=$|[\s:])/i;
    const text = query.trim();
    const match = command.exec(text);
    if (!match)
        return null;

    return text.slice(match[0].length).trimStart()
        .replace(/^(?::\s*|(?:of|for)\s+)+/i, "").trim();
}

function googleImagesDestination(query) {
    if (!query)
        return new URL("https://www.google.com/imghp");

    const destination = new URL("https://www.google.com/search");
    destination.searchParams.set("q", query);
    destination.searchParams.set("udm", "2");
    return destination;
}

function claudeSearchDestination(query, token) {
    const destination = new URL("https://claude.ai/new");
    destination.searchParams.set("q", query);
    destination.hash = "safari-search=" + token;
    return destination;
}
