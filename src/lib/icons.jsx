// Minimal Lucide-style icon set, drawn inline so it ships without deps.
// All icons are 24×24 stroke-1.6 line caps round.

const I = ({ children, size = 20, stroke = 'currentColor', sw = 1.7, fill = 'none', ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

const Icon = {
  Code: (p) => <I {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></I>,
  ArrowRight: (p) => <I {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></I>,
  ArrowUpRight: (p) => <I {...p}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></I>,
  Check: (p) => <I {...p}><polyline points="20 6 9 17 4 12"/></I>,
  Plus: (p) => <I {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></I>,
  Sparkle: (p) => <I {...p}><path d="M12 3 L13.5 9 L20 10.5 L13.5 12 L12 18 L10.5 12 L4 10.5 L10.5 9 Z"/></I>,
  Globe: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3 a 14 14 0 0 1 0 18 a 14 14 0 0 1 0 -18"/></I>,
  Cpu: (p) => <I {...p}><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="5"/><line x1="15" y1="2" x2="15" y2="5"/><line x1="9" y1="19" x2="9" y2="22"/><line x1="15" y1="19" x2="15" y2="22"/><line x1="2" y1="9" x2="5" y2="9"/><line x1="2" y1="15" x2="5" y2="15"/><line x1="19" y1="9" x2="22" y2="9"/><line x1="19" y1="15" x2="22" y2="15"/></I>,
  Smartphone: (p) => <I {...p}><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></I>,
  Layers: (p) => <I {...p}><polygon points="12 2 22 8.5 12 15 2 8.5"/><polyline points="2 15.5 12 22 22 15.5"/></I>,
  Wrench: (p) => <I {...p}><path d="M14 7a4 4 0 1 1 4 4l1 1 -7 7 -4 -4 7 -7 -1 -1z"/></I>,
  Search: (p) => <I {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></I>,
  Compass: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><polygon points="16 8 13 14 8 16 11 10"/></I>,
  Shield: (p) => <I {...p}><path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z"/></I>,
  Cloud: (p) => <I {...p}><path d="M7 18 A 4 4 0 0 1 7 10 A 5 5 0 0 1 17 9 A 4 4 0 0 1 17 18 Z"/></I>,
  Database: (p) => <I {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5 v6 c0 1.66 3.58 3 8 3 s8 -1.34 8 -3 v-6"/><path d="M4 11 v6 c0 1.66 3.58 3 8 3 s8 -1.34 8 -3 v-6"/></I>,
  BarChart: (p) => <I {...p}><line x1="4" y1="20" x2="4" y2="10"/><line x1="10" y1="20" x2="10" y2="4"/><line x1="16" y1="20" x2="16" y2="14"/><line x1="20" y1="20" x2="20" y2="8"/></I>,
  Plug: (p) => <I {...p}><path d="M9 2 v4 M15 2 v4 M5 8 h14 v3 a7 7 0 0 1 -14 0z M12 18 v4"/></I>,
  Users: (p) => <I {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21 a 7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 21 a 5 5 0 0 1 6 0"/></I>,
  Rocket: (p) => <I {...p}><path d="M5 14 L10 9 a 7 7 0 0 1 9 -2 a 7 7 0 0 1 -2 9 l -5 5 -3 -2 -2 -3 z"/><circle cx="14" cy="10" r="1.5"/><path d="M5 14 l -2 5 5 -2"/></I>,
  Briefcase: (p) => <I {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7 V5 a 2 2 0 0 1 2 -2 h 2 a 2 2 0 0 1 2 2 v2"/></I>,
  TrendingUp: (p) => <I {...p}><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></I>,
  Brain: (p) => <I {...p}><path d="M9 4 a 3 3 0 0 0 -3 3 v0 a 3 3 0 0 0 -1 5 a 3 3 0 0 0 1 4 v0 a 3 3 0 0 0 3 4 a 3 3 0 0 0 3 -3 v-13 a 3 3 0 0 0 -3 -3z"/><path d="M15 4 a 3 3 0 0 1 3 3 v0 a 3 3 0 0 1 1 5 a 3 3 0 0 1 -1 4 v0 a 3 3 0 0 1 -3 4 a 3 3 0 0 1 -3 -3"/></I>,
  Lock: (p) => <I {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11 V7 a 4 4 0 0 1 8 0 v4"/></I>,
  Network: (p) => <I {...p}><circle cx="12" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><line x1="12" y1="6" x2="5" y2="18"/><line x1="12" y1="6" x2="19" y2="18"/><line x1="6" y1="20" x2="18" y2="20"/></I>,
  Megaphone: (p) => <I {...p}><path d="M3 11 v2 l 14 5 V6 z"/><path d="M17 9 a 3 3 0 0 1 0 6"/></I>,
  Zap: (p) => <I {...p}><polygon points="13 2 3 14 11 14 11 22 21 10 13 10 13 2"/></I>,
  Mail: (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></I>,
  Phone: (p) => <I {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></I>,
  MapPin: (p) => <I {...p}><path d="M12 21 s -7 -7 -7 -12 a 7 7 0 0 1 14 0 c 0 5 -7 12 -7 12z"/><circle cx="12" cy="9" r="2.5"/></I>,
  Clock: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></I>,
  Menu: (p) => <I {...p}><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></I>,
  X: (p) => <I {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>,
  ChevronDown: (p) => <I {...p}><polyline points="6 9 12 15 18 9"/></I>,
  ChevronRight: (p) => <I {...p}><polyline points="9 6 15 12 9 18"/></I>,
  Eye: (p) => <I {...p}><path d="M2 12 s 4 -7 10 -7 s 10 7 10 7 s -4 7 -10 7 s -10 -7 -10 -7z"/><circle cx="12" cy="12" r="3"/></I>,
  Target: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></I>,
  Telescope: (p) => <I {...p}><path d="M3 13 l 18 -7 l 1 3 l -18 7z"/><path d="M5 14 l 4 1 -3 6"/><path d="M14 9 l 2 4"/></I>,
  Lightbulb: (p) => <I {...p}><path d="M9 18 h6 M10 21 h4 M12 3 a 6 6 0 0 0 -3.5 11 c 0.5 0.5 1 1 1 2 v1 h5 v-1 c 0 -1 0.5 -1.5 1 -2 a 6 6 0 0 0 -3.5 -11z"/></I>,
  Heart: (p) => <I {...p}><path d="M20 8 a 5 5 0 0 0 -8 -3 a 5 5 0 0 0 -8 3 c 0 6 8 11 8 11 s 8 -5 8 -11z"/></I>,
  Award: (p) => <I {...p}><circle cx="12" cy="9" r="6"/><polyline points="8 14 7 22 12 19 17 22 16 14"/></I>,
  Handshake: (p) => <I {...p}><path d="M3 12 l 4 -4 l 3 3 l 4 -3 l 3 3 l 4 -4 M3 12 l 5 5 l 3 -2 l 3 2 l 5 -5"/></I>,
  Github: (p) => <I {...p} fill="currentColor" stroke="none"><path d="M12 2 a 10 10 0 0 0 -3.16 19.49 c 0.5 0.09 0.68 -0.22 0.68 -0.48 v-1.7 c -2.78 0.6 -3.37 -1.34 -3.37 -1.34 c -0.45 -1.16 -1.11 -1.47 -1.11 -1.47 c -0.91 -0.62 0.07 -0.6 0.07 -0.6 c 1 0.07 1.53 1.03 1.53 1.03 c 0.89 1.53 2.34 1.09 2.91 0.83 c 0.09 -0.65 0.35 -1.09 0.63 -1.34 c -2.22 -0.25 -4.55 -1.11 -4.55 -4.94 c 0 -1.09 0.39 -1.99 1.03 -2.69 c -0.1 -0.25 -0.45 -1.27 0.1 -2.65 c 0 0 0.84 -0.27 2.75 1.02 a 9.6 9.6 0 0 1 5 0 c 1.91 -1.29 2.75 -1.02 2.75 -1.02 c 0.55 1.38 0.2 2.4 0.1 2.65 c 0.64 0.7 1.03 1.6 1.03 2.69 c 0 3.84 -2.34 4.69 -4.57 4.93 c 0.36 0.31 0.68 0.92 0.68 1.86 v2.75 c 0 0.27 0.18 0.58 0.69 0.48 A 10 10 0 0 0 12 2z"/></I>,
  Linkedin: (p) => <I {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="11" x2="8" y2="17"/><circle cx="8" cy="7.5" r="1"/><path d="M12 17 v-6 M12 13 a 3 3 0 0 1 6 0 v4"/></I>,
  Whatsapp: (p) => <I {...p}><path d="M3 21 l 1.5 -5 a 9 9 0 1 1 4 4 z"/><path d="M9 10 c 1 4 3 5 5 5 l 1 -1 c -1 -0.3 -2 -0.5 -2.5 -1.5 c -1 -0.5 -1.2 -1.5 -1.5 -2.5 z"/></I>,
  Instagram: (p) => <I {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></I>,
  Folder: (p) => <I {...p}><path d="M3 7 a 2 2 0 0 1 2 -2 h 4 l 2 2 h 8 a 2 2 0 0 1 2 2 v 9 a 2 2 0 0 1 -2 2 H 5 a 2 2 0 0 1 -2 -2z"/></I>,
  Sun: (p) => <I {...p}><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="6.5" y2="6.5"/><line x1="17.5" y1="17.5" x2="19" y2="19"/><line x1="5" y1="19" x2="6.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="19" y2="5"/></I>,
  Activity: (p) => <I {...p}><polyline points="3 12 7 12 10 4 14 20 17 12 21 12"/></I>,
  Coffee: (p) => <I {...p}><path d="M4 8 h13 v6 a 5 5 0 0 1 -5 5 H 9 a 5 5 0 0 1 -5 -5z"/><path d="M17 10 h2 a 2 2 0 0 1 0 6 h -2"/><line x1="6" y1="3" x2="6" y2="6"/><line x1="10" y1="3" x2="10" y2="6"/><line x1="14" y1="3" x2="14" y2="6"/></I>,
  ShoppingBag: (p) => <I {...p}><path d="M5 8 h14 l -1 12 H 6z"/><path d="M9 8 V5 a 3 3 0 0 1 6 0 v3"/></I>,
  Stethoscope: (p) => <I {...p}><path d="M5 3 v6 a 4 4 0 0 0 8 0 V3"/><path d="M9 13 v3 a 4 4 0 0 0 8 0 v -3"/><circle cx="17" cy="9" r="2"/></I>,
  Tractor: (p) => <I {...p}><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="2"/><path d="M3 17 v -5 h 8 l 2 -5 h 4 v 5 h 4"/></I>,
  Star: (p) => <I {...p}><polygon points="12 2 14.5 9 22 9.5 16 14.5 18 22 12 18 6 22 8 14.5 2 9.5 9.5 9"/></I>,
  DollarSign: (p) => <I {...p}><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5 H9.5 a3.5 3.5 0 0 0 0 7 h5 a3.5 3.5 0 0 1 0 7 H6"/></I>,
  Book: (p) => <I {...p}><path d="M4 19.5 v-15 A2.5 2.5 0 0 1 6.5 2 H20 v20 H6.5 a2.5 2.5 0 0 1 0 -5 H20"/></I>,
  Truck: (p) => <I {...p}><path d="M14 18 V6 a2 2 0 0 0 -2 -2 H4 a2 2 0 0 0 -2 2 v11 a1 1 0 0 0 1 1 h2"/><path d="M15 18 H9"/><path d="M19 18 h2 a1 1 0 0 0 1 -1 v-3.65 a1 1 0 0 0 -0.22 -0.62 l -3.48 -4.35 A1 1 0 0 0 17.52 8 H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></I>,
  Utensils: (p) => <I {...p}><path d="M3 2 v7 c0 1.1 0.9 2 2 2 h4 a2 2 0 0 0 2 -2 V2"/><path d="M7 2 v20"/><path d="M21 15 V2 a5 5 0 0 0 -5 5 v6 c0 1.1 0.9 2 2 2 h3 Z M21 15 v7"/></I>,
  Send: (p) => <I {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9"/></I>,
  Building: (p) => <I {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="13" y1="7" x2="13" y2="7.01"/><line x1="9" y1="11" x2="9" y2="11.01"/><line x1="13" y1="11" x2="13" y2="11.01"/><line x1="9" y1="15" x2="9" y2="15.01"/><line x1="13" y1="15" x2="13" y2="15.01"/></I>,
  Box: (p) => <I {...p}><polyline points="3 7 12 2 21 7 21 17 12 22 3 17 3 7"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="3" y1="7" x2="12" y2="12"/><line x1="21" y1="7" x2="12" y2="12"/></I>,
  Settings: (p) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15 a 1.65 1.65 0 0 0 .33 1.82 l 0 .06 a 2 2 0 1 1 -2.83 2.83 l -.06 -0.06 a 1.65 1.65 0 0 0 -1.82 -.33 a 1.65 1.65 0 0 0 -1 1.51 V21 a 2 2 0 0 1 -4 0 V20.91 A 1.65 1.65 0 0 0 9 19.4 a 1.65 1.65 0 0 0 -1.82 .33 l -.06 .06 A 2 2 0 1 1 4.29 16.96 l .06 -.06 A 1.65 1.65 0 0 0 4.68 15 a 1.65 1.65 0 0 0 -1.51 -1 H 3 a 2 2 0 0 1 0 -4 H 3.09 A 1.65 1.65 0 0 0 4.6 9 a 1.65 1.65 0 0 0 -.33 -1.82 l -.06 -.06 A 2 2 0 1 1 7.04 4.29 l .06 .06 A 1.65 1.65 0 0 0 9 4.68 a 1.65 1.65 0 0 0 1 -1.51 V3 a 2 2 0 0 1 4 0 v.09 a 1.65 1.65 0 0 0 1 1.51 a 1.65 1.65 0 0 0 1.82 -.33 l .06 -.06 a 2 2 0 1 1 2.83 2.83 l -.06 .06 a 1.65 1.65 0 0 0 -.33 1.82 a 1.65 1.65 0 0 0 1.51 1 H 21 a 2 2 0 0 1 0 4 h-.09 a 1.65 1.65 0 0 0 -1.51 1z"/></I>,
  Edit: (p) => <I {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></I>,
  Download: (p) => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></I>,
  Upload: (p) => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></I>,
  Moon: (p) => <I {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></I>,
  Home: (p) => <I {...p}><path d="M3 10.5 L12 3 l9 7.5"/><path d="M5 9.5 V21 h14 V9.5"/></I>,
  Inbox: (p) => <I {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 L2 12 v6 a2 2 0 0 0 2 2 h16 a2 2 0 0 0 2 -2 v-6 l-3.45 -6.89 A2 2 0 0 0 16.76 4 H7.24 a2 2 0 0 0 -1.79 1.11z"/></I>,
  AlertTriangle: (p) => <I {...p}><path d="M10.29 3.86 L1.82 18 a2 2 0 0 0 1.71 3 h16.94 a2 2 0 0 0 1.71 -3 L13.71 3.86 a2 2 0 0 0 -3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></I>,
  CheckCircle: (p) => <I {...p}><path d="M22 11.08 V12 a10 10 0 1 1 -5.93 -9.14"/><polyline points="22 4 12 14.01 9 11.01"/></I>,
  Info: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></I>,
  Refresh: (p) => <I {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15 a9 9 0 1 1 -2.12 -9.36 L23 10"/></I>,
};

window.Icon = Icon;
