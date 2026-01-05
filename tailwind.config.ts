import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        muted: "var(--muted)",
        primaryText: "var(--primaryText)",
        text80: "var(--text80)",
        grayColor: "var(--grayColor)",
        text70: "var(--text70)",
        lightGreen: "var(--lightGreen)",
        pending: "var(--pending)",
        rejected: "var(--rejected)",
        assigned: "var(--assigned)",
        completed: "var(--completed)",
        closed: "var(--closed)",
        tableHeader: "var(--tableHeader)",
        tableHeaderText: "var(--tableHeaderText)",
        tableBodytext: "var(--tableBodytext)",
        success: "var(--success)",
        danger: "var(--danger)",
        tableBorder: "var(--tableBorder)",
        formBg:"var(--formBg)",
        formBorder:"var(--formBorder)",
        formLabel:"var(--formLabel)",

      },
    },
  },
  plugins: [],
}
export default config
