import { Plugin } from "obsidian";

const PREFIX = "swarnam";

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
		<div class="${PREFIX}-html-container">
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
				const root = el.createDiv({ cls: `${PREFIX}-root` });

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
					cls: `${PREFIX}-source-root`,
				});

				const htmlContainer = sourceRoot.createDiv({
					cls: `${PREFIX}-source-container`,
				});
				const htmlEl = htmlContainer.createEl("pre", {
					cls: `${PREFIX}-source ${PREFIX}-html-source`,
				});
				htmlContainer.createDiv({
					text: "HTML",
					cls: `${PREFIX}-badge ${PREFIX}-html-badge`,
				});
				htmlEl.setText(htmlSource);

				if (cssSource) {
					const cssContainer = sourceRoot.createDiv({
						cls: `${PREFIX}-source-container`,
					});
					const cssEl = cssContainer.createEl("pre", {
						cls: `${PREFIX}-source ${PREFIX}-css-source`,
					});
					cssContainer.createDiv({
						text: "CSS",
						cls: `${PREFIX}-badge ${PREFIX}-css-badge`,
					});
					cssEl.setText(cssSource);
				}

				if (jsSource) {
					const jsContainer = sourceRoot.createDiv({
						cls: `${PREFIX}-source-container`,
					});

					const jsEl = jsContainer.createEl("pre", {
						cls: `${PREFIX}-source ${PREFIX}-js-source`,
					});

					jsContainer.createDiv({
						text: "JS",
						cls: `${PREFIX}-badge ${PREFIX}-js-badge`,
					});
					jsEl.setText(jsSource);
				}

				const iframeEl = root.createEl("iframe", {
					cls: `${PREFIX}-preview`,
				});

				iframeEl.src = `data:text/html;base64;charset=UTF-8,${asBase64(
					getIframeDoc(htmlSource, cssSource, jsSource)
				)}`;
			}
		);
	}
}
