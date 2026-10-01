import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  devServer: {
    host: "0.0.0.0",
    port: 3002,
  },

  ssr: true,

  css: [
    "@fontsource/inter/latin-400.css",
    "@fontsource/inter/latin-500.css",
    "@fontsource/inter/latin-600.css",
    "@fontsource/inter/latin-700.css",
    "~/assets/css/tailwind.css",
    "~/assets/scss/main.scss",
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: "lightningcss",
    },
  },

  modules: ["@pinia/nuxt"],

  components: false,

  app: {
    pageTransition: false,
    layoutTransition: false,

    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "JobHound",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },

        { name: "apple-mobile-web-app-title", content: "JobHound" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },

        { name: "mobile-web-app-capable", content: "yes" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      script: [],
      noscript: [],
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
    },
  },
})
