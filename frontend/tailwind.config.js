/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#059669', // Emerald 600
                    secondary: '#0ea5e9', // Sky 500
                    dark: '#0f172a',    // Slate 900
                    light: '#f8fafc',   // Slate 50
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            }
        },
    },
    plugins: [],
}
