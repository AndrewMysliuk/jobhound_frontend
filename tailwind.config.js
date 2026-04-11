/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        page: "#FAFAFA",
        primary: "#18181B",
        secondary: "#71717A",
        border: "#E4E4E7",
        link: "#52525B",
        linkHover: "#18181B",
        headerBg: "#FFFFFF",
        btnPrimary: "#2563EB",
        btnText: "#FFFFFF",
        cardBg: "#FFFFFF",
        placeholder: "#A1A1AA",
        destructive: "#DC2626",
        tableHeaderBg: "#FAFAFA",
        rowHover: "#F4F4F5",
        chipBg: "#F4F4F5",
      },
      borderRadius: {
        card: "14px",
        lg: "10px",
      },
    },
  },
  plugins: [],
}
