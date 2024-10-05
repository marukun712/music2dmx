import { Webview } from "webview-bun";
import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");

const webview = new Webview();

webview.setHTML(html);
webview.run();
