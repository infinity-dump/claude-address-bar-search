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
    let modelPickerOpened = false;
    let sonnetSelected = false;

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

        if (!/\bSonnet\b/i.test(picker.getAttribute("aria-label"))) {
            if (!modelPickerOpened) {
                modelPickerOpened = true;
                if (picker.getAttribute("aria-expanded") !== "true")
                    picker.click();
                return;
            }

            const menu = document.querySelector('[role="menu"][aria-label^="Model:"]')
                ?? document.querySelector('[role="menu"]');
            const sonnet = [...(menu?.querySelectorAll('[role="menuitemradio"], [role="menuitem"]') ?? [])]
                .find(option => /^Sonnet\b/i.test(option.textContent.trim()));
            if (sonnet && !sonnetSelected) {
                sonnetSelected = true;
                sonnet.click();
            }
            return;
        }

        stop();
        send.click();
    };

    const observer = new MutationObserver(submit);
    const timeout = setTimeout(stop, 12_000);
    observer.observe(document, {
        childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: ["disabled", "aria-disabled", "aria-expanded", "aria-label", "contenteditable"]
    });
    submit();
})();
