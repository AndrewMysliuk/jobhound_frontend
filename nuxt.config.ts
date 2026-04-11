// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  devServer: {
    host: "0.0.0.0",
    port: 3002,
  },

  ssr: true,

  css: ["~/assets/scss/main.scss"],

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

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
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },

        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        },
      ],
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
