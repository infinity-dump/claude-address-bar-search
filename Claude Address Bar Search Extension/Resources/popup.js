const form = document.querySelector("form");
const query = document.querySelector("#query");
const button = document.querySelector("button");
const status = document.querySelector('[role="alert"]');

form.addEventListener("submit", async event => {
    event.preventDefault();
    button.disabled = true;
    status.hidden = true;
    try {
        await browser.tabs.create({ url: googleImagesDestination(query.value.trim()).href });
        window.close();
    } catch {
        status.textContent = "Could not open Google Images. Try again.";
        status.hidden = false;
        button.disabled = false;
    }
});
