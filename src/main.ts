import { getCurrentWindow } from "@tauri-apps/api/window";
import { version } from "../package.json";
import "./styles.css";

const versionLabel = document.querySelector<HTMLElement>(".version");
const quitButton = document.querySelector<HTMLButtonElement>(
  '[data-action="quit"]',
);

if (versionLabel) {
  versionLabel.textContent = `v${version}`;
}

quitButton?.addEventListener("click", async () => {
  await getCurrentWindow().close();
});
