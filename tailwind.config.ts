import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				rubik: ['Rubik Variable', 'sans-serif']
			},
			keyframes: {
				'gradient-text': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'spin-slow-1': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(-180deg)' }
				},
				'spin-slow-2': {
					from: { transform: 'rotate(-180deg)' },
					to: { transform: 'rotate(-360deg)' }
				},
				wiggle: {
					'0%': { transform: 'rotate(0deg)' },
					'17%': { transform: 'rotate(-9deg)' },
					'33%': { transform: 'rotate(0deg)' },
					'50%': { transform: 'rotate(9deg)' },
					'67%': { transform: 'rotate(0deg)' },
					'83%': { transform: 'rotate(-9deg)' },
					'100%': { transform: 'rotate(0deg)' }
				}
			},
			animation: {
				'gradient-text': 'gradient-text 12s infinite',
				'spin-slow-1': 'spin-slow-1 350ms ease-in',
				'spin-slow-2': 'spin-slow-2 350ms ease-out',
				wiggle: 'wiggle 625ms ease-in-out'
			},
			boxShadow: {
				DEFAULT: 'rgba(0, 0, 0, 0.27) 0px 0px 0.5rem'
			},
			dropShadow: {
				DEFAULT: 'rgba(0, 0, 0, 0.27) 0px 0px 0.5rem'
			},
			borderColor: {
				DEFAULT: 'rgba(var(--border))'
			},
			borderRadius: {
				DEFAULT: '8px',
				sm: '4px'
			},

			colors: {
				palette: {
					green: 'rgba(var(--palette-green))',
					'green-hover': 'rgba(var(--palette-green-hover))',
					cyan: 'rgba(var(--palette-cyan))',
					magenta: 'rgba(var(--palette-magenta))',
					purple: 'rgba(var(--palette-purple))',
					'cyan-dark': 'rgba(var(--palette-cyan-dark))',
					'cyan-light-1': 'rgba(var(--palette-cyan-light-1))',
					'cyan-light-2': 'rgba(var(--palette-cyan-light-2))'
				},
				themeicon: 'rgba(var(--themeicon))',
				border: 'rgba(var(--border))',
				'btn-hover': 'rgba(var(--btn-hover))',
				bg: {
					1: 'rgba(var(--bg-1))',
					2: 'rgba(var(--bg-2))',
					3: 'rgba(var(--bg-3))'
				},
				text: {
					1: 'rgba(var(--text-1))',
					2: 'rgba(var(--text-2))',
					3: 'rgba(var(--text-3))',
					4: 'rgba(var(--text-4))'
				}
			}
		}
	},

	plugins: []
} satisfies Config;
