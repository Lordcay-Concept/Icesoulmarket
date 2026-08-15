import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ✅ KEEP: Gaming theme colors for fallback
        gaming: {
          green: 'var(--theme-primary)',
          'green-dark': 'var(--theme-secondary)',
          'green-glow': 'color-mix(in srgb, var(--theme-glow) 15%, transparent)',
          black: '#0a0a0a',
          'black-light': '#1a1a1a',
          'black-lighter': '#2a2a2a',
          neon: '#39ff14',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // ✅ Gaming animations - keep these for effects
        "pulse-glow": {
          '0%, 100%': { 
            boxShadow: '0 0 20px color-mix(in srgb, var(--theme-glow) 30%, transparent)' 
          },
          '50%': { 
            boxShadow: '0 0 40px color-mix(in srgb, var(--theme-glow) 60%, transparent)' 
          },
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "glitch": {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
          '100%': { transform: 'translate(0)' },
        },
        "scanline": {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glitch": "glitch 0.3s ease-in-out infinite",
        "scanline": "scanline 8s linear infinite",
      },
      // ✅ Updated backgroundImage to use theme variables
      backgroundImage: {
        'gaming-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        'neon-glow': 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--theme-glow) 10%, transparent) 0%, transparent 70%)',
      },
      // ✅ Added theme-aware box shadows
      boxShadow: {
        'theme-glow': '0 0 30px color-mix(in srgb, var(--theme-glow) 100%, transparent)',
        'theme-glow-sm': '0 0 15px color-mix(in srgb, var(--theme-glow) 100%, transparent)',
        'theme-glow-lg': '0 0 50px color-mix(in srgb, var(--theme-glow) 100%, transparent)',
        'theme-glow-xl': '0 0 70px color-mix(in srgb, var(--theme-glow) 100%, transparent)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config