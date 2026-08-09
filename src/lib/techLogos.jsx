// Real tech logos — official-style SVG paths for each technology.
// Stylized to be recognizable but not infringing; uses each brand's signature shape and color.

const TECH_LOGOS = [
  {
    name: 'React',
    color: '#61DAFB',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <circle cx="12" cy="12" r="2.05" fill="#61DAFB"/>
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse cx="12" cy="12" rx="11" ry="4.2"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)"/>
        </g>
      </svg>
    ),
  },
  {
    name: 'Node.js',
    color: '#8CC84B',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 1.5L2.5 7v10L12 22.5L21.5 17V7L12 1.5z" fill="#8CC84B"/>
        <text x="12" y="15.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#1a1a1a" fontFamily="sans-serif">JS</text>
      </svg>
    ),
  },
  {
    name: 'Python',
    color: '#3776AB',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <defs>
          <linearGradient id="py-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#387EB8"/>
            <stop offset="100%" stopColor="#366994"/>
          </linearGradient>
          <linearGradient id="py-yellow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE873"/>
            <stop offset="100%" stopColor="#FFD43B"/>
          </linearGradient>
        </defs>
        <path d="M11.9 2C8 2 8.2 3.7 8.2 3.7l0 1.8h3.8v0.5H6.6S4 6 4 9.9s2.3 3.8 2.3 3.8h1.4v-1.9s-0.1-2.3 2.3-2.3h3.8s2.2 0 2.2-2.1V4.1s0.3-2.1-4.1-2.1zm-2.1 1.2c0.4 0 0.7 0.3 0.7 0.7s-0.3 0.7-0.7 0.7-0.7-0.3-0.7-0.7 0.3-0.7 0.7-0.7z" fill="url(#py-blue)"/>
        <path d="M12.1 22c3.9 0 3.7-1.7 3.7-1.7l0-1.8h-3.8v-0.5h5.4s2.6 0.3 2.6-3.6-2.3-3.8-2.3-3.8h-1.4v1.9s0.1 2.3-2.3 2.3h-3.8s-2.2 0-2.2 2.1v3.4s-0.3 2.1 4.1 2.1zm2.1-1.2c-0.4 0-0.7-0.3-0.7-0.7s0.3-0.7 0.7-0.7 0.7 0.3 0.7 0.7-0.3 0.7-0.7 0.7z" fill="url(#py-yellow)"/>
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    color: '#3178C6',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <rect width="24" height="24" rx="3" fill="#3178C6"/>
        <path d="M13.5 14h2.5v-2h-7v2h2.5v6h2v-6z" fill="white"/>
        <path d="M16.8 17.5c0 0.8 0.6 1.4 1.6 1.6 1 0.2 1.6-0.2 1.6-0.7 0-0.4-0.3-0.7-1.2-0.9-1.5-0.4-2.3-1.1-2.3-2.2 0-1.3 1.1-2.3 2.7-2.3 1.3 0 2.4 0.5 2.7 1.4l-1.4 0.7c-0.2-0.6-0.6-0.9-1.3-0.9s-1 0.3-1 0.7c0 0.3 0.3 0.6 1.1 0.8 1.6 0.4 2.5 1.1 2.5 2.3 0 1.5-1.1 2.5-2.9 2.5-1.5 0-2.7-0.7-3-1.9l1.5-0.6z" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'JavaScript',
    color: '#F7DF1E',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <rect width="24" height="24" rx="3" fill="#F7DF1E"/>
        <path d="M12 18.7c0 0.9 0.5 1.7 1.8 1.7 1.4 0 1.9-0.7 1.9-1.7v-6.3h2v6.4c0 2.1-1.2 3-3.7 3-2.3 0-3.7-1.2-3.7-2.5l1.7-0.6z" fill="#000"/>
        <path d="M19 18.6c0.6 1 1.5 1.7 3 1.7 1.3 0 2.1-0.6 2.1-1.5 0-1-0.8-1.4-2.1-1.9l-0.7-0.3c-2-0.9-3.4-2-3.4-4.2 0-2 1.5-3.6 4-3.6 1.7 0 3 0.6 3.9 2.2l-1.6 1c-0.5-0.9-1-1.2-1.9-1.2-0.9 0-1.5 0.6-1.5 1.4 0 1 0.6 1.3 2 1.9l0.7 0.3c2.4 1 3.7 2.1 3.7 4.3 0 2.4-1.9 3.7-4.4 3.7-2.5 0-4.1-1.2-4.9-2.8z" fill="#000" transform="translate(-2 0)"/>
      </svg>
    ),
  },
  {
    name: 'Next.js',
    color: '#FFFFFF',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <circle cx="12" cy="12" r="11" fill="#000"/>
        <path d="M9 7v10M9 7l8 10M15 7v5.5" stroke="#fff" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
  {
    name: 'Vue.js',
    color: '#42B883',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M2 4l10 17L22 4h-4l-6 10L6 4H2z" fill="#42B883"/>
        <path d="M6 4l6 10 6-10h-3.5L12 9.5 9.5 4H6z" fill="#35495E"/>
      </svg>
    ),
  },
  {
    name: 'Angular',
    color: '#DD0031',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 1.5L2 5l1.6 13.2L12 22.5l8.4-4.3L22 5 12 1.5z" fill="#DD0031"/>
        <path d="M12 1.5v21L20.4 18.2 22 5 12 1.5z" fill="#C3002F"/>
        <path d="M12 5L6 18h2.2l1.2-3h5.2l1.2 3H18L12 5zm1.8 8.4h-3.6L12 9l1.8 4.4z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Docker',
    color: '#2496ED',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M21.5 10.5c-0.3-0.2-1.5-0.7-2.7-0.5-0.2-1-0.7-1.9-1.5-2.7l-0.4-0.4-0.4 0.4c-0.7 0.8-1.1 1.7-1.2 2.7-0.5-0.1-1-0.1-1.5 0-1.4 0.4-2.1 1.5-2.4 2.4H1c-0.5 2.5 0 4.8 1.5 6.4 1.4 1.5 3.6 2.2 6.4 2.2 6.2 0 10.8-2.9 13-8 1.4 0 2.8-0.4 3.5-1.5 0.2-0.3 0.5-0.7 0.6-1.1l0.2-0.6-0.7-0.3z" fill="#2496ED"/>
        <g fill="#2496ED">
          <rect x="2" y="9.5" width="2.5" height="2.5"/>
          <rect x="5" y="9.5" width="2.5" height="2.5"/>
          <rect x="8" y="9.5" width="2.5" height="2.5"/>
          <rect x="5" y="6.5" width="2.5" height="2.5"/>
          <rect x="8" y="6.5" width="2.5" height="2.5"/>
          <rect x="8" y="3.5" width="2.5" height="2.5"/>
          <rect x="11" y="9.5" width="2.5" height="2.5"/>
        </g>
      </svg>
    ),
  },
  {
    name: 'Kubernetes',
    color: '#326CE5',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 1.5l9.5 4.5v12L12 22.5 2.5 18V6L12 1.5z" fill="#326CE5"/>
        <path d="M12 5l-6 3v8l6 3 6-3V8l-6-3zm0 2.5l4 2v5l-4 2-4-2v-5l4-2z" fill="#fff" opacity="0.9"/>
        <circle cx="12" cy="12" r="2" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'AWS',
    color: '#FF9900',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <rect width="24" height="24" rx="3" fill="#232F3E"/>
        <text x="12" y="13" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff" fontFamily="sans-serif">aws</text>
        <path d="M4 17c4 2.5 12 2.5 16 0" stroke="#FF9900" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M19.5 16l1 1-0.5 1.5" stroke="#FF9900" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Google Cloud',
    color: '#4285F4',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M14 7l-1.5-1.5C11.7 4.7 10.6 4.5 9.5 4.8c-2 0.4-3.5 2-3.8 4-1.6 0.3-2.7 1.7-2.7 3.4 0 1.9 1.6 3.5 3.5 3.5h11c1.7 0 3-1.4 3-3 0-1.6-1.3-3-3-3-0.6 0-1.2 0.2-1.7 0.5-0.2-1-0.9-1.9-1.8-2.2z" fill="#4285F4"/>
        <path d="M14 7l-1 3 2 2 2-0.5C16.5 9 15.5 7.5 14 7z" fill="#34A853"/>
        <path d="M9.5 4.8c-0.7 0.1-1.3 0.4-1.8 0.9l1.8 1.8 1.7-1.7c-0.5-0.5-1.1-0.9-1.7-1z" fill="#FBBC05"/>
        <path d="M3 12.2c0 0.7 0.3 1.4 0.7 2L6 11.7c-0.4-0.4-0.7-1-0.7-1.6 0-0.4 0.1-0.7 0.3-1L3.7 6.8C3.3 7.4 3 8 3 8.7v3.5z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    name: 'PostgreSQL',
    color: '#336791',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M19.5 6.5C18.8 4 16.5 3 14 3.2c-1 0.1-1.9 0.4-2.7 0.8C10.5 3.5 9.5 3.2 8.5 3.4c-2 0.4-3.5 2-3.8 4C3.5 8 3 9.5 3.5 11c0.5 1.5 1.5 2.5 2 3 1 1 2 2 2.5 3 0.5 1 0.5 2 1 2.5s2 1 4 0.5c2-0.5 3.5-2 4.5-3.5 1-1.5 2-3.5 2.5-5.5 0.5-2 0-3.5-1-4.5z" fill="#336791"/>
        <path d="M9 8c0.5 2 1 4 2 6M14 7c0 2-0.5 4-1 6M17 9.5c-1 1.5-2 3-3.5 4" stroke="#fff" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'MySQL',
    color: '#00758F',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M3 17c2 0.5 4 0 6-0.5 1.5-0.5 3-1 4-2-1 0.5-2 0.5-3 0.5-2 0-4-1-5-2.5-1-1.5-2-3.5-2-5.5h2c0 1.5 0.5 3 1.5 4 1 1 2 2 3.5 2 0.5 0 1.5 0 2-0.5-1-2-1-4 0-6 0.5-1 1.5-1.5 2.5-1.5 1 0 2 0.5 2.5 1.5 1 2 1 4 0 6 0.5 0.5 1 1 1.5 1.5L18.5 15c0.5 0.5 1 1 1.5 1.5L18.5 18c-0.5-0.5-1-1-1.5-1.5-1 0.5-2 0.5-3 0.5-1 0-2-0.5-3-1-1.5 1.5-3.5 2-5.5 2.5-1 0.2-2 0.2-2.5 0V17z" fill="#00758F"/>
      </svg>
    ),
  },
  {
    name: 'MongoDB',
    color: '#47A248',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 2c-0.5 2-2 4-3 6-2 3-3 6-2 9 1 3 3 4.5 5 5 2-0.5 4-2 5-5 1-3 0-6-2-9-1-2-2.5-4-3-6z" fill="#47A248"/>
        <path d="M12 2v20" stroke="#3a7e3a" strokeWidth="0.8"/>
      </svg>
    ),
  },
  {
    name: 'Redis',
    color: '#DC382D',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 4c-3.5 0-7 0.5-9 1.5-1 0.5-1 1.5 0 2L11 11c0.5 0.3 1.5 0.3 2 0l8-3.5c1-0.5 1-1.5 0-2-2-1-5.5-1.5-9-1.5z" fill="#DC382D"/>
        <path d="M21 9c-2 1-5.5 1.5-9 1.5s-7-0.5-9-1.5v3c2 1 5.5 1.5 9 1.5s7-0.5 9-1.5V9z" fill="#A41E11"/>
        <path d="M21 13c-2 1-5.5 1.5-9 1.5s-7-0.5-9-1.5v3c2 1 5.5 1.5 9 1.5s7-0.5 9-1.5v-3z" fill="#DC382D"/>
      </svg>
    ),
  },
  {
    name: 'GraphQL',
    color: '#E10098',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="none" stroke="#E10098" strokeWidth="1.4"/>
        <line x1="12" y1="2" x2="12" y2="22" stroke="#E10098" strokeWidth="1.4"/>
        <line x1="3" y1="7" x2="21" y2="17" stroke="#E10098" strokeWidth="1.4"/>
        <line x1="21" y1="7" x2="3" y2="17" stroke="#E10098" strokeWidth="1.4"/>
        <circle cx="12" cy="2" r="1.6" fill="#E10098"/>
        <circle cx="21" cy="7" r="1.6" fill="#E10098"/>
        <circle cx="21" cy="17" r="1.6" fill="#E10098"/>
        <circle cx="12" cy="22" r="1.6" fill="#E10098"/>
        <circle cx="3" cy="17" r="1.6" fill="#E10098"/>
        <circle cx="3" cy="7" r="1.6" fill="#E10098"/>
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    color: '#06B6D4',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5 0.8 0.2 1.3 0.7 2 1.4 1.1 1 2.3 2.2 4.8 2.2 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-0.8-0.2-1.3-0.7-2-1.4C15.7 7.2 14.5 6 12 6zM7 12c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5 0.8 0.2 1.3 0.7 2 1.4 1.1 1 2.3 2.2 4.8 2.2 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-0.8-0.2-1.3-0.7-2-1.4-1.1-1-2.3-2.2-4.8-2.2z" fill="#06B6D4"/>
      </svg>
    ),
  },
  {
    name: 'Figma',
    color: '#F24E1E',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M8 2h4v6H8a3 3 0 0 1 0-6z" fill="#F24E1E"/>
        <path d="M12 2h4a3 3 0 0 1 0 6h-4V2z" fill="#FF7262"/>
        <path d="M12 8h4a3 3 0 0 1 0 6h-4V8z" fill="#A259FF"/>
        <path d="M8 8h4v6H8a3 3 0 0 1 0-6z" fill="#1ABCFE"/>
        <path d="M8 14h4v3a3 3 0 1 1-3-3h-1z" fill="#0ACF83"/>
      </svg>
    ),
  },
  {
    name: 'Firebase',
    color: '#FFCA28',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M5 18l3-13 3 5.5L5 18z" fill="#FFA000"/>
        <path d="M5 18l9-15 6 15-7.5 4L5 18z" fill="#F57C00"/>
        <path d="M5 18l7.5 4L20 18l-2-9-5 5L5 18z" fill="#FFCA28"/>
        <path d="M5 18l7.5 4L20 18l-7.5-2L5 18z" fill="#FFA000" opacity="0.4"/>
      </svg>
    ),
  },
  {
    name: 'Git',
    color: '#F05032',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M22.5 11.4L12.6 1.5c-0.6-0.6-1.5-0.6-2.1 0L8.5 3.5l2.6 2.6c0.6-0.2 1.3-0.1 1.8 0.4 0.5 0.5 0.6 1.3 0.4 1.9l2.5 2.5c0.6-0.2 1.4-0.1 1.9 0.4 0.7 0.7 0.7 1.9 0 2.6-0.7 0.7-1.9 0.7-2.6 0-0.5-0.5-0.7-1.3-0.4-2L12.4 9.6V16c0.2 0.1 0.4 0.2 0.6 0.4 0.7 0.7 0.7 1.9 0 2.6-0.7 0.7-1.9 0.7-2.6 0-0.7-0.7-0.7-1.9 0-2.6 0.2-0.2 0.5-0.4 0.8-0.5V9.5c-0.3-0.1-0.6-0.3-0.8-0.5C9.7 8.4 9.5 7.6 9.8 6.9L7.3 4.4 0.5 11.3c-0.6 0.6-0.6 1.5 0 2.1l9.9 9.9c0.6 0.6 1.5 0.6 2.1 0l9.9-9.9c0.7-0.5 0.7-1.4 0.1-2z" fill="#F05032"/>
      </svg>
    ),
  },
  {
    name: 'GitHub',
    color: '#FFFFFF',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5 0.5 0.1 0.7-0.2 0.7-0.5V19c-2.8 0.6-3.4-1.3-3.4-1.3-0.5-1.2-1.1-1.5-1.1-1.5-0.9-0.6 0.1-0.6 0.1-0.6 1 0.1 1.5 1 1.5 1 0.9 1.5 2.3 1.1 2.9 0.8 0.1-0.6 0.4-1.1 0.6-1.3-2.2-0.3-4.5-1.1-4.5-5 0-1.1 0.4-2 1-2.7-0.1-0.3-0.5-1.3 0.1-2.7 0 0 0.8-0.3 2.8 1 0.8-0.2 1.7-0.3 2.5-0.3s1.7 0.1 2.5 0.3c1.9-1.3 2.8-1 2.8-1 0.6 1.4 0.2 2.5 0.1 2.7 0.7 0.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 0.4 0.3 0.7 0.9 0.7 1.8v2.7c0 0.3 0.2 0.6 0.7 0.5C19.1 20.2 22 16.4 22 12c0-5.5-4.5-10-10-10z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Linux',
    color: '#FCC624',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 2c-3 0-5 2.5-5 6 0 1.5 0.5 3 1 4-1.5 2-3 4-3 6 0 2 1 4 4 4 1 0 2-0.5 3-1 1 0.5 2 1 3 1 3 0 4-2 4-4 0-2-1.5-4-3-6 0.5-1 1-2.5 1-4 0-3.5-2-6-5-6z" fill="#000"/>
        <ellipse cx="10" cy="7" rx="0.8" ry="1.2" fill="#fff"/>
        <ellipse cx="14" cy="7" rx="0.8" ry="1.2" fill="#fff"/>
        <ellipse cx="10" cy="7" rx="0.4" ry="0.6" fill="#000"/>
        <ellipse cx="14" cy="7" rx="0.4" ry="0.6" fill="#000"/>
        <path d="M11 9c0.5 0.5 1.5 0.5 2 0" stroke="#FCC624" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M9 13c0 2 6 2 6 0" stroke="#FCC624" strokeWidth="1.4" fill="#FCC624"/>
      </svg>
    ),
  },
  {
    name: 'Nginx',
    color: '#009639',
    svg: () => (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 1.5L2.5 7v10L12 22.5 21.5 17V7L12 1.5z" fill="#009639"/>
        <path d="M8 7v10h1.5V10l5 7H16V7h-1.5v7l-5-7H8z" fill="#fff"/>
      </svg>
    ),
  },
];

window.TECH_LOGOS = TECH_LOGOS;
