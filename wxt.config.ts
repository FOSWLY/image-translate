import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  manifest: {
    name: "Translate Image",
    permissions: [
      "contextMenus",
      "activeTab",
      "scripting",
      "declarativeNetRequest",
    ],
    host_permissions: ["<all_urls>"],
    externally_connectable: {
      matches: ["<all_urls>"],
    },
    browser_specific_settings: {
      gecko: {
        id: "ya-translate-image@firefox",
        data_collection_permissions: {
          required: ["none"],
        },
      },
    },
  },
});
