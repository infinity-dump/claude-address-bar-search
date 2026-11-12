# Claude Address Bar Search

A macOS Safari extension that sends address-bar searches to Claude. Press Return once to open a new chat, select Sonnet, and submit the query as typed. Website addresses open normally.

## Search for images

Click the extension’s Safari toolbar button, enter a query, and click **Search images** to open Google Images in a new tab.

From the address bar, try `search images of vintage trains`, `image search: alpine cabins`, or `find photos of Saturn`. Enter `image search` on its own to open the Google Images homepage.

## Build and enable

1. Open `Claude Address Bar Search.xcodeproj` in Xcode.
2. Select your Apple Developer team for both the app and extension targets under Signing & Capabilities.
3. Build and run the macOS app.
4. In Safari → Settings → Extensions, enable Claude Address Bar Search and grant site access to Google and Claude.
5. Set Safari’s search engine to Google and sign in at claude.ai.

The extension relies on Safari’s Google search requests and Claude’s model picker. Google may receive the query before the redirect. If the extension can’t confirm that Sonnet is selected, it leaves the query in the Claude composer for manual submission.

The signed local build is kept in `dist/`.
