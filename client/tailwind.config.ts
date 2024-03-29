import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        'feed-overview': 'repeat(auto-fill, minmax(225px,1fr))',
      },
      width: {
        160: '40rem',
      },
      minHeight: {
        5: '1.25rem',
        84: '21rem',
        100: '25rem',
      },
      colors: {
        primary: {
          DEFAULT: 'rgba(172, 36, 125, var(--tw-bg-opacity))',
          1: 'var(--primary-1)',
          2: 'var(--primary-2)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary)',
        },
        gray: {
          DEFAULT: 'var(--gray)',
          1: 'var(--gray-1)',
        },
        error: {
          DEFAULT: 'var(--error)',
        },
        success: {
          DEFAULT: 'var(--success)',
        },
        sidebar: 'var(--sidebar-bg-color)',
        link: 'var(--external-link-col)',
      },
      boxShadow: {
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        modal: '0px 20px 30px 0px rgba(0, 0, 0, 0.8)',
        'modal-right': '-10px 0px 30px 0px rgba(0, 0, 0, 0.5)',
        'modal-left': '10px 0px 30px 0px rgba(0, 0, 0, 0.5)',
        'input-primary': '0px 0px 0px 2px var(--primary)',
        'input-gray': '0px 0px 0px 2px #777d8c',
        'input-error': '0px 0px 0px 2px var(--error)',
        popup: '0rem 7px 10px 0px #c0c0c0',
        message: '0rem 5px 10px 0px #c0c0c0',
        'message-darker': '0rem 5px 10px 0px #909090',
        'message-err': '0rem 5px 10px 0px var(--error-shadow)',
        'message-err-darker': '0rem 5px 10px 0px var(--error-shadow-hover)',
        'message-success': '0rem 5px 10px 0px var(--success-shadow)',
        'message-success-darker': '0rem 5px 10px 0px var(--success-shadow-hover)',
      },
      gradientColorStops: ({ theme }) => ({
        ...theme('colors'),
        gradFrom: 'hsl(321, 65%, 40%)',
        gradTo: 'hsl(321, 65%, 10%)',
      }),
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
    },
  },
  plugins: [],
};

export default config;
