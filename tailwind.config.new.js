// Parliament Loop - 设计系统重构
// 新的设计token系统，基于议会仪式感和现代交互体验

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 重新定义色彩系统 - 更权威、更优雅、更有仪式感
      colors: {
        // 主色调：庄重的深蓝，象征权威和理性
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff', 
          200: '#c7d8ff',
          300: '#a5bdff',
          400: '#7c97ff',
          500: '#5470ff',  // 主色调
          600: '#3b51f7',
          700: '#2d3ee3',
          800: '#2532c7',
          900: '#1e2b9e',
          950: '#13185c',
        },
        
        // 辅助色：温暖的金色，象征智慧和成果
        accent: {
          50: '#fffcf0',
          100: '#fff7db',
          200: '#ffecb7',
          300: '#ffdb88',
          400: '#ffc349',
          500: '#ffad1f',  // 智慧金
          600: '#f09007',
          700: '#c67003',
          800: '#9d5709',
          900: '#7e470b',
        },
        
        // 成功色：更温和的绿色
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        
        // 警告色：更有层次的橙色
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        
        // 中性色系：更细致的灰度层次
        neutral: {
          25: '#fcfcfc',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          850: '#1a222c',
          900: '#111827',
          950: '#0a0e1a',
        },
        
        // 语义化颜色
        surface: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
          elevated: '#ffffff',
        },
        
        border: {
          light: '#f3f4f6',
          default: '#e5e7eb',
          strong: '#d1d5db',
        },
        
        // 状态色彩
        discussion: {
          active: '#5470ff',
          locked: '#f59e0b', 
          completed: '#22c55e',
          pending: '#9ca3af',
        }
      },
      
      // 字体系统 - 更好的可读性和层次
      fontFamily: {
        sans: [
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"SF Pro Display"', 
          '"Segoe UI"', 
          'Roboto', 
          '"Helvetica Neue"', 
          'Arial', 
          'sans-serif'
        ],
        mono: [
          '"SF Mono"', 
          'Monaco', 
          '"Cascadia Code"', 
          '"Roboto Mono"', 
          'Consolas', 
          '"Liberation Mono"', 
          '"Courier New"', 
          'monospace'
        ],
      },
      
      // 字体大小系统 - 更精确的比例
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        
        // 语义化字体大小
        'caption': ['0.75rem', { lineHeight: '1rem' }],
        'body-sm': ['0.875rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4' }],
        'heading': ['1.5rem', { lineHeight: '1.3' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.3' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2' }],
        'display': ['3rem', { lineHeight: '1.1' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1' }],
      },
      
      // 间距系统 - 8pt网格系统
      spacing: {
        '0.5': '0.125rem',  // 2px
        '1.5': '0.375rem',  // 6px
        '2.5': '0.625rem',  // 10px
        '3.5': '0.875rem',  // 14px
        '4.5': '1.125rem',  // 18px
        '5.5': '1.375rem',  // 22px
        '6.5': '1.625rem',  // 26px
        '7.5': '1.875rem',  // 30px
        '8.5': '2.125rem',  // 34px
        '9.5': '2.375rem',  // 38px
        '18': '4.5rem',     // 72px
        '22': '5.5rem',     // 88px
        '26': '6.5rem',     // 104px
      },
      
      // 阴影系统 - 更细腻的层次
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
        
        // 语义化阴影
        'card': '0 2px 8px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)',
        'card-hover': '0 8px 25px rgb(0 0 0 / 0.1), 0 3px 10px rgb(0 0 0 / 0.08)',
        'elevated': '0 10px 40px rgb(0 0 0 / 0.08), 0 4px 12px rgb(0 0 0 / 0.06)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.2)',
      },
      
      // 圆角系统 - 更现代的圆角设计
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'DEFAULT': '0.5rem',  // 8px
        'md': '0.75rem',    // 12px
        'lg': '1rem',       // 16px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
      },
      
      // 过渡动画系统
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
      },
      
      // 断点系统 - 移动端优先
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // 动画关键帧
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'progress-fill': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        }
      },
      
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'progress-fill': 'progress-fill 0.8s ease-out forwards',
      },
    },
  },
  plugins: [
    // 添加自定义CSS工具类
    function({ addUtilities, addComponents, theme }) {
      // 添加玻璃态效果
      addUtilities({
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.9)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(17, 24, 39, 0.8)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        }
      });
      
      // 添加语义化组件类
      addComponents({
        '.card-primary': {
          'background': theme('colors.surface.primary'),
          'border': `1px solid ${theme('colors.border.light')}`,
          'border-radius': theme('borderRadius.lg'),
          'box-shadow': theme('boxShadow.card'),
          'transition': 'all 150ms ease-in-out',
          '&:hover': {
            'box-shadow': theme('boxShadow.card-hover'),
            'transform': 'translateY(-2px)',
          }
        },
        '.card-interactive': {
          'background': theme('colors.surface.primary'),
          'border': `1px solid ${theme('colors.border.default')}`,
          'border-radius': theme('borderRadius.lg'),
          'box-shadow': theme('boxShadow.card'),
          'transition': 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          'cursor': 'pointer',
          '&:hover': {
            'box-shadow': theme('boxShadow.card-hover'),
            'transform': 'translateY(-4px) scale(1.02)',
            'border-color': theme('colors.primary.300'),
          },
          '&:active': {
            'transform': 'translateY(-2px) scale(1.01)',
          }
        }
      });
    }
  ],
}
