import { Plugin } from "obsidian";

const PREFIX = "swarnam";

const SWARNAM_CSS = `
.swarnam-root {
	--${PREFIX}-html-color: #e34c26;
	--${PREFIX}-css-color: #2965f1;
	--${PREFIX}-js-color: #f0db4f;
	--${PREFIX}-box-padding: var(--size-4-3) var(--size-4-4);
	--${PREFIX}-border-color: var(--divider-color);
	--${PREFIX}-border-radius: var(--code-radius);
	--${PREFIX}-source-font: var(--font-monospace);
	--${PREFIX}-source-font-size: var(--code-size);

	display: flex;
	align-items: stretch;
	width: 100%;
}

.swarnam-root.error {
	display: block;
	padding: var(--${PREFIX}-box-padding);
	background-color: var(--code-background);
	text-align: center;

	.icon {
		font-family: "Apple Emoji Color", sans-serif;
		font-size: 1.5em;
	}
}

.swarnam-source-root {
	flex: 1 1 0;
	overflow-x: scroll;
	display: flex;
	align-items: stretch;
	flex-direction: column;
}

.swarnam-preview {
	flex: 1 1 0;
	border: 1px solid var(--${PREFIX}-border-color);
	border-left: 0;
	border-top-right-radius: var(--${PREFIX}-border-radius);
	border-bottom-right-radius: var(--${PREFIX}-border-radius);
	padding: var(--${PREFIX}-box-padding);
}

.swarnam-source-container {
	position: relative;
	flex: 1 1 0;

	& + & {
		border-top: 1px solid var(--${PREFIX}-border-color);
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
}

.markdown-rendered .swarnam-source {
	height: 100%;
	margin: 0;
	font-family: var(--${PREFIX}-source-font);
	font-size: var(--${PREFIX}-source-font-size);
	white-space: pre;
}

.swarnam-badge {
	position: absolute;
	top: calc(var(--size-4-3) / 1.5);
	right: calc(var(--size-4-3) / 1.5);
	font-size: 0.65em;
}

.swarnam-html-badge {
	color: var(--${PREFIX}-html-color);
}

.swarnam-css-badge {
	color: var(--${PREFIX}-css-color);
}

.swarnam-js-badge {
	color: var(--${PREFIX}-js-color);
}
`;

function base64ToBytes(base64: string) {
	const binString = atob(base64);
	// @ts-expect-error
	return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes: Uint8Array) {
	const binString = Array.from(bytes, (byte) =>
		String.fromCodePoint(byte)
	).join("");
	return btoa(binString);
}

function asBase64(text: string) {
	console.log({ text });
	const b64 = bytesToBase64(new TextEncoder().encode(text));
	console.log(console.log(new TextDecoder().decode(base64ToBytes(b64))));
	return b64;
}

function getIframeDoc(htmlSource: string, cssSource: string, jsSource: string) {
	const isDarkMode = window.matchMedia(
		"(prefers-color-scheme: dark)"
	).matches;

	return `
		<style>
			body { font-family: sans-serif; color: ${isDarkMode ? "#fff" : "#000"} }
		</style>
		<style>
		${cssSource}
		</style>
		<div class="swarnam-html-container">
		${htmlSource}
		</div>
		<script>
		${jsSource}
		</script>
	`;
}

function showError(msg: string, root: HTMLElement) {
	root.classList.add("error");
	root.createEl("p", { cls: "icon", text: "⚠️" });
	root.createEl("p", { text: msg });
}

export default class SwarnamPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			"swarnam",
			(source, el, ctx) => {
				const root = el.createDiv({ cls: "swarnam-root" });
				const head = el.ownerDocument.head;

				head.createEl("style", {
					text: SWARNAM_CSS,
				});

				let [
					htmlSource = "",
					cssSource = "",
					jsSource = "",
					// eslint-disable-next-line prefer-const
					...others
				] = source.split(/^\s*---\*---\s*$/m);

				if (others.length > 0) {
					showError(
						"Swarnam only supports HTML, CSS and JS blocks but your snippet has more than 3 blocks.",
						root
					);
					return;
				}

				htmlSource = htmlSource.trim();
				cssSource = cssSource.trim();
				jsSource = jsSource.trim();

				if (!htmlSource) {
					showError(
						"A Swarnam block must at least contain HTML",
						root
					);
					return;
				}

				const sourceRoot = root.createDiv({
					cls: "swarnam-source-root",
				});

				const htmlContainer = sourceRoot.createDiv({
					cls: "swarnam-source-container",
				});
				const htmlEl = htmlContainer.createEl("pre", {
					cls: "swarnam-source swarnam-html-source",
				});
				htmlContainer.createDiv({
					text: "HTML",
					cls: "swarnam-badge swarnam-html-badge",
				});
				htmlEl.setText(htmlSource);

				if (cssSource) {
					const cssContainer = sourceRoot.createDiv({
						cls: "swarnam-source-container",
					});
					const cssEl = cssContainer.createEl("pre", {
						cls: "swarnam-source swarnam-css-source",
					});
					cssContainer.createDiv({
						text: "CSS",
						cls: "swarnam-badge swarnam-css-badge",
					});
					cssEl.setText(cssSource);
				}

				if (jsSource) {
					const jsContainer = sourceRoot.createDiv({
						cls: "swarnam-source-container",
					});

					const jsEl = jsContainer.createEl("pre", {
						cls: "swarnam-source swarnam-js-source",
					});

					jsContainer.createDiv({
						text: "JS",
						cls: "swarnam-badge swarnam-js-badge",
					});
					jsEl.setText(jsSource);
				}

				const iframeEl = root.createEl("iframe", {
					cls: "swarnam-preview",
				});

				iframeEl.src = `data:text/html;base64;charset=UTF-8,${asBase64(
					getIframeDoc(htmlSource, cssSource, jsSource)
				)}`;
			}
		);
	}
}
