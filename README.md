<div align="center">

<img src="./3dicons-co-icon.png" height="60px">

# Swarnam

A no-frills web playground plugin for Obsidian.

<small>(icon credit: [3dicons](https://3dicons.co))</small>
</div>

## Usage

Install the extension from Obsidian community plugins list (you need to enable this first from
Settings), enable the plugin and then restart Obsidian.

To create a new Swarnam block, you need to open a block code snippet and give it the `swarnam` tag
like so:

    ```swarnam
    <h1>Hello, world</h1>
    ```

When you preview this, it'll show the source and render the HTML side-by-side. You can hover on the
top-right and click the `</>` icon to edit the snippet to make some changes.

You can also add CSS and JS by separating them with `---*---` like so:

    ```swarnam
    <h1 id="h1">Hello world</h1>

    ---*---

    h1 {
    font-family: "Manjari";
    color: red;
    animation: rainbow 5s ease infinite forwards;
    }

    @keyframes rainbow {
    0% { filter: hue-rotate(0); }
    100% { filter: hue-rotate(360deg); }
    }

    ---*---

    let i = 0;

    setInterval(() => {	
        h1.textContent = `${["Hello", "Hola", "നമസ്കാരം"][i++ % 3]} Obsidian!`;
    }, 1500)
    ```

This'll render the three snippets on the left side and show the preview of a web page that has all
these 3 blocks injected.

## How does it work

We split the code block snippet into 3 parts and form an HTML document string by injecting the CSS
and JS pieces into `<style>` and `<script>` tags. Once we have the final HTML document, we convert
this into Base64 and create a data URI. Finally, an `<iframe>` element is created and the data URI
is given as the `src`. Data URIs of mime type `text/html` and base64 enoding can be rendered by most
browsers including the Chromium renderer Obsidian is built on top of. There are no additional build
steps involved and thus, this is not a full-blown replacement for something like Sandpack.

## Contributing

Spot any issue? Have a feature request or idea? Feel free to create a new issue in GitHub to
discuss. (Pretty please do this before you spend your precious time on a PR that might not make into
this repo).
