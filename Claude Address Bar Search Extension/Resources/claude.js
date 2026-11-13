(async () => {
    const destination = new URL(location.href);
    const token = new URLSearchParams(destination.hash.slice(1)).get("safari-search");
    if (destination.pathname !== "/new" || !token)
        return;

    const authorization = await browser.runtime.sendMessage({
        type: "claim-safari-search", token
    }).catch(() => null);
    if (!authorization?.prompt)
        return;

    const normalize = value => value.replace(/\s+/g, " ").trim();
    const expected = normalize(authorization.prompt);
    const stop = () => {
        observer.disconnect();
        clearTimeout(timeout);
    };
    const modelName = /^Haiku 5\.5(?:\s|$)/i;
    let modelChosen = false;
    let effortOpened = false;
    let effortChosen = false;

    const submit = () => {
        if (location.pathname !== "/new") {
            stop();
            return;
        }

        const editor = document.querySelector('[contenteditable="true"][aria-label="Write your prompt to Claude"], [contenteditable="true"][role="textbox"], .ProseMirror[contenteditable="true"]');
        const send = document.querySelector('button[aria-label="Send message"]');
        if (!editor || !send || send.disabled || send.getAttribute("aria-disabled") === "true")
            return;
        if (normalize(editor.innerText) !== expected)
            return;

        const picker = document.querySelector('button[aria-label^="Model:"]');
        if (!picker)
            return;

        const selection = picker.getAttribute("aria-label").slice("Model:".length).trim();
        if (/^Haiku 5\.5 Low$/i.test(selection)) {
            stop();
            send.click();
            return;
        }

        const haikuSelected = modelName.test(selection);
        if (picker.getAttribute("aria-expanded") !== "true") {
            // Model selection closes the menu. Open it again for effort if needed.
            if (!(haikuSelected ? effortOpened : modelChosen))
                picker.click();
            return;
        }

        const options = [...document.querySelectorAll('[role="menuitemradio"]')];
        if (!haikuSelected) {
            const haiku = options.find(option => modelName.test(option.innerText.trim()));
            if (haiku && !modelChosen) {
                modelChosen = true;
                haiku.click();
            }
            return;
        }

        const effort = [...document.querySelectorAll('[role="menuitem"]')]
            .find(option => /^Effort\b/i.test(option.innerText.trim()));
        if (!effort)
            return;
        if (!effortOpened) {
            effortOpened = true;
            if (effort.getAttribute("aria-expanded") !== "true")
                effort.click();
            return;
        }

        const low = options.find(option => /^Low(?:\s+Recommended)?$/i.test(option.innerText.trim()));
        if (low && !effortChosen) {
            effortChosen = true;
            low.click();
        }
    };

    const observer = new MutationObserver(submit);
    const timeout = setTimeout(stop, 12_000);
    observer.observe(document, {
        childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: ["disabled", "aria-disabled", "aria-expanded", "aria-label", "contenteditable"]
    });
    submit();
})();
