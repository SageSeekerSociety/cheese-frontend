/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Plugins
import { registerPlugins } from "@/plugins";
import i18next from "i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
// Import your language translation files
import translation from "zod-i18n-map/locales/zh-CN/zod.json";
import AccountService from "@/services/account";

AccountService.init();

const app = createApp(App);

registerPlugins(app);

app.mount("#app");

// Initialize i18next
i18next.init({
  lng: "zh-CN",
  resources: {
    "zh-CN": {
      zod: translation,
    },
  },
});
z.setErrorMap(zodI18nMap);
