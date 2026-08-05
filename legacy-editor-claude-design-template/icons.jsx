/* global React */
// Icon library — clean line icons on a 24x24 grid.
// Usage: <Icon n="save" />   stroke inherits currentColor.

const ICON_PATHS = {
  // ---- title bar / quick access ----
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><rect x="8" y="13" width="8" height="6"/>',
  print: '<path d="M7 9V4h10v5"/><path d="M7 18H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2"/><rect x="7" y="15" width="10" height="5"/>',
  undo: '<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12h-1"/>',
  redo: '<path d="m15 7 5 5-5 5"/><path d="M20 12H10a6 6 0 0 0 0 12h1"/>',
  more: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  quickprint: '<path d="M7 9V4h10v5"/><rect x="6" y="9" width="12" height="7" rx="1.5"/><path d="M9 19h6"/>',

  // ---- left rail ----
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/>',
  comments: '<path d="M5 5h14v10H9l-4 4z"/>',
  chat: '<path d="M4 5h16v9H8l-4 4z"/><path d="M8 9h8M8 11.5h5"/>',
  navigation: '<path d="M4 6h10M4 12h13M4 18h8"/>',
  feedback: '<path d="M4 5h16v11H7l-3 3z"/><path d="M9 9l2 2 4-4"/>',
  about: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.7" fill="currentColor" stroke="none"/>',
  thesaurus: '<path d="M5 5h14M5 12h14M5 19h9"/>',

  // ---- clipboard ----
  paste: '<rect x="6" y="5" width="12" height="16" rx="1.5"/><path d="M9 5V3.5h6V5"/><path d="M9 11h6M9 14h6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M5 15H4V4h11v1"/>',
  cut: '<circle cx="7" cy="7" r="2.2"/><circle cx="7" cy="17" r="2.2"/><path d="M9 8.5 20 17M9 15.5 20 7"/>',
  painter: '<path d="M5 6h11v4H5z"/><path d="M16 8h3v4h-7v3"/><path d="M11 15h2v6h-2z"/>',

  // ---- font styling (letters rendered as text) ----
  fontcolor: '<path d="M6 17 10 6h2l4 11" stroke-width="1.7"/><path d="M7.5 13h6"/><rect x="5" y="20" width="14" height="2.5" fill="currentColor" stroke="none"/>',
  highlight: '<path d="M4 20h6"/><path d="m9 15 6-6 4 4-6 6H8z"/><path d="m13 7 3-3 3 3-3 3"/>',
  clearstyle: '<path d="M7 6h11M9 6l-1.5 9M14 6l-.5 3"/><path d="m14 14 5 5M19 14l-5 5"/>',

  // ---- lists / paragraph ----
  bullets: '<circle cx="5" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="5" cy="17" r="1.3" fill="currentColor" stroke="none"/><path d="M9 7h11M9 12h11M9 17h11"/>',
  numbering: '<path d="M9 7h11M9 12h11M9 17h11"/><text x="3.5" y="9" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">1</text><text x="3.5" y="14" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">2</text><text x="3.5" y="19" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">3</text>',
  multilevel: '<path d="M4 6h3M9 6h11M9 11h11M11 16h9M11 20h9"/><circle cx="8.5" cy="16" r="1" fill="currentColor" stroke="none"/>',
  indentdec: '<path d="M20 5H4M20 12h-9M20 19H4M8 9 4 12l4 3"/>',
  indentinc: '<path d="M4 5h16M11 12h9M4 19h16M4 9l4 3-4 3"/>',
  marks: '<path d="M11 4h6M14 4v16M11 4a4 4 0 0 0 0 8h3"/>',
  alignleft: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
  aligncenter: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
  alignright: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
  alignjustify: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
  linespacing: '<path d="M11 6h9M11 12h9M11 18h9"/><path d="M5 5v14M5 5 3 7M5 5l2 2M5 19l-2-2M5 19l2-2"/>',
  shading: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 9h16" /><path d="M8 9v10M12 9v10M16 9v10" opacity="0.5"/>',

  // ---- insert ----
  blankpage: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>',
  pagebreak: '<path d="M6 4h8l4 4v3H6zM6 20h8l4-4v-3H6z" fill="none"/><path d="M3 12h18" stroke-dasharray="2 2"/>',
  table: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 10h16M4 14.5h16M9.3 5v14M14.6 5v14"/>',
  image: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 3-3 3 3"/>',
  shapes: '<rect x="4" y="11" width="9" height="9" rx="1"/><circle cx="16" cy="8" r="4"/>',
  iconsins: '<path d="M12 3 9.5 9 3 9.5l5 4-1.6 6.5L12 16l5.6 4-1.6-6.5 5-4L15 9z"/>',
  chart: '<path d="M4 20h16"/><rect x="6" y="11" width="3" height="6"/><rect x="11" y="7" width="3" height="10"/><rect x="16" y="13" width="3" height="4"/>',
  smartart: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="15" width="6" height="5" rx="1"/><rect x="15" y="15" width="6" height="5" rx="1"/><path d="M12 8v4M12 12H6v3M12 12h6v3"/>',
  header: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h16" fill="none"/><path d="M7 6.5h6" opacity="0.7"/>',
  footer: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 15h16" fill="none"/><path d="M7 17.5h6" opacity="0.7"/>',
  pagenum: '<rect x="4" y="4" width="16" height="16" rx="1"/><text x="8.5" y="17" font-size="8" fill="currentColor" stroke="none" font-family="sans-serif">#</text>',
  textbox: '<rect x="4" y="7" width="16" height="10" rx="1"/><path d="M9 12h6"/>',
  textart: '<path d="M5 18 9 7l4 11M6.5 14h5" /><path d="M16 7c2 0 3 1.5 3 5.5S17 18 15 18"/>',
  dropcap: '<path d="M4 5h6v14H4z"/><path d="M12 7h8M12 11h8M12 15h6"/>',
  comment: '<path d="M5 5h14v10H9l-4 4z"/><path d="M9 10h6"/>',
  hyperlink: '<path d="M10 14a4 4 0 0 0 5.6 0l2.4-2.4a4 4 0 0 0-5.6-5.6L11 7.4"/><path d="M14 10a4 4 0 0 0-5.6 0L6 12.4a4 4 0 0 0 5.6 5.6L13 16.6"/>',
  bookmark: '<path d="M7 4h10v16l-5-4-5 4z"/>',
  symbol: '<path d="M8 18c0-4 2-6 4-6s2 2 0 4-4 2-4-2 2-6 4-6"/><path d="M6 20h12"/>',
  equation: '<path d="M14 6h-3a3 3 0 0 0-3 3v9"/><path d="M6 12h6"/><path d="M16 10l4 6M20 10l-4 6"/>',
  crossref: '<path d="M4 7h7v10H4zM13 7h7v10h-7z" fill="none"/><path d="M11 12h2" stroke-dasharray="1.5 1.5"/>',

  // ---- draw ----
  pen: '<path d="m5 19 2-5L16 5l3 3-9 9z"/><path d="M14 7l3 3"/>',
  highlighterpen: '<path d="M4 20h5l2-2-3-3-2 2z"/><path d="m9 15 7-7 3 3-7 7"/>',
  eraser: '<path d="m6 17 7-7 5 5-4 4H9z"/><path d="M5 20h9"/>',
  selectcur: '<path d="m6 4 12 6-5 1.5L11 18z"/>',

  // ---- layout ----
  margins: '<rect x="4" y="4" width="16" height="16"/><rect x="8" y="8" width="8" height="8" stroke-dasharray="2 2"/>',
  orientation: '<rect x="6" y="3" width="9" height="13" rx="1"/><path d="m16 14 3 3-3 3M19 17h-7"/>',
  size: '<rect x="5" y="3" width="11" height="16" rx="1"/><path d="M18 8v11H8"/>',
  columns: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16"/>',
  breaks: '<path d="M5 8h14M5 16h14"/><path d="M9 12h6M12 9v6" opacity="0.6"/>',
  linenumbers: '<path d="M8 6h12M8 12h12M8 18h12"/><text x="3" y="8" font-size="5" fill="currentColor" stroke="none">1</text><text x="3" y="14" font-size="5" fill="currentColor" stroke="none">2</text><text x="3" y="20" font-size="5" fill="currentColor" stroke="none">3</text>',
  hyphenation: '<path d="M9 12h6"/><path d="M5 9v6M19 9v6"/>',
  watermark: '<path d="M5 8h14M5 12h10M5 16h12"/><path d="M14 14l5 5M19 14l-5 5" opacity="0.5"/>',
  wrap: '<rect x="4" y="6" width="7" height="7" rx="1"/><path d="M13 7h7M13 11h7M4 16h16M4 20h16"/>',
  position: '<rect x="9" y="9" width="6" height="6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  alignobj: '<path d="M3 4v16"/><rect x="6" y="6" width="6" height="4"/><rect x="6" y="14" width="11" height="4"/>',
  group: '<rect x="5" y="5" width="6" height="6"/><rect x="13" y="13" width="6" height="6"/><path d="M11 8h4v5" stroke-dasharray="2 2"/>',
  rotate: '<path d="M19 10a7 7 0 1 0-1.5 5"/><path d="M19 5v5h-5"/>',

  // ---- references ----
  toc: '<path d="M4 6h9M4 11h9M4 16h9"/><path d="M16 6h4M16 11h4M16 16h4" opacity="0.6"/>',
  footnote: '<path d="M5 5h10M5 9h7"/><path d="M5 20h14M5 16h14" opacity="0.5"/><text x="14" y="9" font-size="6" fill="currentColor" stroke="none">1</text>',
  endnote: '<path d="M5 5h14M5 9h10"/><path d="M14 20l5-5M14 15h5v5" /><text x="4" y="20" font-size="6" fill="currentColor" stroke="none">i</text>',
  citation: '<path d="M7 7c-1.5 0-2.5 1-2.5 2.5S5.5 12 7 12c1.2 0 1.5 1 1 2s-1.5 1.5-2.5 1.5M16 7c-1.5 0-2.5 1-2.5 2.5S14.5 12 16 12c1.2 0 1.5 1 1 2s-1.5 1.5-2.5 1.5"/>',
  bibliography: '<path d="M5 4h5v16H5zM10 4h4v16h-4z"/><path d="m14 6 4 1-2 13-4-1"/>',
  caption: '<rect x="4" y="5" width="16" height="9" rx="1"/><path d="M7 18h10M7 21h6"/>',
  updatefield: '<path d="M19 8a7 7 0 1 0 1 4"/><path d="M19 4v4h-4"/>',

  // ---- collaboration ----
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="m8.2 11 6.6-3.5M8.2 13l6.6 3.5"/>',
  coediting: '<circle cx="9" cy="8" r="3"/><path d="M4 19c0-3 2.5-5 5-5s5 2 5 5"/><circle cx="17" cy="10" r="2.2"/><path d="M14.5 18c.5-2 1.8-3 3-3 1.5 0 2.5 1 2.5 3"/>',
  trackchanges: '<path d="m5 18 2-5L16 4l3 3-9 9z"/><path d="M14 6l3 3"/><circle cx="6" cy="18" r="1" fill="currentColor" stroke="none"/>',
  accept: '<circle cx="12" cy="12" r="8.5"/><path d="m8 12 3 3 5-6"/>',
  reject: '<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>',
  prevchange: '<path d="M14 6 8 12l6 6"/><path d="M8 12h10" opacity="0.5"/>',
  nextchange: '<path d="m10 6 6 6-6 6"/><path d="M6 12h10" opacity="0.5"/>',
  compare: '<rect x="3" y="6" width="8" height="12" rx="1"/><rect x="13" y="6" width="8" height="12" rx="1"/><path d="M12 3v18" stroke-dasharray="2 2"/>',

  // ---- protection ----
  protect: '<path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  encrypt: '<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none"/>',
  signature: '<path d="M3 17c3 0 3-6 5-6s2 4 4 4 3-7 5-7 2 4 4 4"/><path d="M3 20h18"/>',
  signline: '<path d="M4 16c2 0 2-4 4-4s1 3 3 3 2-5 4-5"/><path d="M4 20h16"/><path d="M15 4l2 2-5 5-2 .5.5-2z"/>',
  permissions: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.5-5 6-5"/><rect x="13" y="13" width="8" height="7" rx="1"/><path d="M15 13v-1.5a2 2 0 0 1 4 0V13"/>',

  // ---- view ----
  headings: '<path d="M5 6v12M11 6v12M5 12h6"/><path d="M15 18V9l-2 1.5"/>',
  zoomin: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3M11 9v4M9 11h4"/>',
  fitpage: '<rect x="6" y="4" width="12" height="16" rx="1"/><path d="m9 9 6 6M15 9v6h-6"/>',
  fitwidth: '<rect x="6" y="4" width="12" height="16" rx="1"/><path d="M3 12h4M21 12h-4M5 10l-2 2 2 2M19 10l2 2-2 2"/>',
  zoom100: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9.5 11 8.5v7M15 8.5v7"/>',
  multipage: '<rect x="4" y="5" width="6" height="14" rx="1"/><rect x="14" y="5" width="6" height="14" rx="1"/>',
  theme: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  darkdoc: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M14 8a4 4 0 1 0 2 4 5 5 0 0 1-2-4z" fill="currentColor" stroke="none"/>',
  macros: '<path d="M7 5 3 12l4 7M17 5l4 7-4 7"/><path d="M10 16 14 8" />',
  record: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>',
  pause: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>',
  ruler: '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3M11 8v4M15 8v3M19 8v3"/>',
  panelleft: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M9 5v14"/><path d="M6 9h1.5M6 12h1.5" opacity="0.6"/>',
  panelright: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M15 5v14"/><path d="M17 9h1.5M17 12h1.5" opacity="0.6"/>',
  statusbaric: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 15h16"/>',
  toolbaric: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 9h16"/>',

  // ---- plugins / ai ----
  plugin: '<path d="M9 4v3M15 4v3M5 7h14v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M9 17v3M15 17v3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
  translate: '<path d="M4 6h8M8 4v2c0 4-2 7-5 8"/><path d="M6 9c0 2.5 2.5 4.5 5 5"/><path d="m13 20 3.5-9 3.5 9M14.2 17h4.6"/>',
  speech: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3M9 20h6"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 6l-2 12"/>',
  ai: '<path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
  summarize: '<path d="M5 5h14M5 9h14M5 13h9M5 17h6"/>',
  rewrite: '<path d="M4 17 14 7l3 3L7 20H4z"/><path d="M13 6l3 3"/><path d="M16 4l1 1" /><path d="M19 5l1 1"/>',
  imagegen: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.5"/><path d="m5 18 4-4 3 3 3-3 3 3"/><path d="M18 3l.7 1.8L20.5 5.5l-1.8.7L18 8l-.7-1.8L15.5 5.5l1.8-.7z" fill="currentColor" stroke="none"/>',

  // ---- CRM sections ----
  dashboard: '<rect x="4" y="4" width="7" height="9" rx="1"/><rect x="4" y="15" width="7" height="5" rx="1"/><rect x="13" y="4" width="7" height="5" rx="1"/><rect x="13" y="11" width="7" height="9" rx="1"/>',
  contacts: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-4 3.2-6.5 7-6.5s7 2.5 7 6.5"/>',
  company: '<path d="M4 20V7l7-3v16M4 20h16M11 20V10l9 3v7"/><path d="M7 9v.01M7 12v.01M7 15v.01M15 14v.01M15 17v.01"/>',
  deals: '<path d="M3 7h18v12H3z"/><path d="M3 11h18M8 7V5h8v2"/><circle cx="12" cy="15" r="1.6"/>',
  pipeline: '<path d="M4 6h16M7 6v4a3 3 0 0 0 3 3v5M17 6v4a3 3 0 0 1-3 3"/><circle cx="10" cy="20" r="1.5"/>',
  tasks: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 2.5 2.5L16 9"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 9h16M8 3v4M16 3v4"/><circle cx="9" cy="13" r="0.8" fill="currentColor" stroke="none"/><circle cx="13" cy="13" r="0.8" fill="currentColor" stroke="none"/>',
  reports: '<path d="M5 4v16h15"/><path d="m8 14 3-4 3 3 4-6"/>',
  leads: '<path d="M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/><path d="M9 20h6M10 17v3M14 17v3"/>',
  money: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M14.5 9.2C14 8.4 13 8 12 8c-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.9 2.5 2-1 2-2.5 2c-1 0-2-.4-2.5-1.2"/>',
  phone: '<path d="M6 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z"/>',
  email: '<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5M8 9h8M8 12h6"/>',
  meeting: '<circle cx="8" cy="9" r="2.4"/><circle cx="16" cy="9" r="2.4"/><path d="M3 18c0-2.6 2.2-4.2 5-4.2s5 1.6 5 4.2M13 17c.4-2 2.3-3.2 4-3.2 2 0 3.5 1.2 3.5 3.5"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  sort: '<path d="M7 4v16M7 4 4 7m3-3 3 3M14 8h6M14 12h4M14 16h2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  edit: '<path d="M4 16 14 6l4 4L8 20H4z"/><path d="M13 7l4 4"/>',
  importic: '<path d="M12 4v10m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/>',
  exportic: '<path d="M12 16V6m0 0 4 4M12 6 8 10"/><path d="M5 19h14"/>',
  merge: '<path d="M7 4v5a4 4 0 0 0 4 4h2a4 4 0 0 1 4 4v3M7 4 4 7m3-3 3 3M17 20l3-3m-3 3-3-3"/>',
  assign: '<circle cx="10" cy="8" r="3"/><path d="M4 19c0-3.3 2.7-5 6-5"/><path d="M16 14v6M13 17h6"/>',
  pin: '<path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
  tag: '<path d="M4 4h7l9 9-7 7-9-9z"/><circle cx="8.5" cy="8.5" r="1.4"/>',
  kanban: '<rect x="4" y="4" width="4.5" height="16" rx="1"/><rect x="10" y="4" width="4.5" height="11" rx="1"/><rect x="16" y="4" width="4.5" height="13" rx="1"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  refresh: '<path d="M19 8a7 7 0 1 0 1 4"/><path d="M19 4v4h-4"/>',
  bell: '<path d="M6 16V10a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  trendup: '<path d="M4 17 10 11l3 3 7-8"/><path d="M16 6h4v4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17"/>',
  building2: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',

  // ---- generic ----
  chevdown: '<path d="m6 9 6 6 6-6"/>',
  chevup: '<path d="m6 15 6-6 6 6"/>',
  chevright: '<path d="m9 6 6 6-6 6"/>',
  check: '<path d="m5 12 5 5 9-11"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  star: '<path d="m12 4 2.3 5.2 5.7.5-4.3 3.8 1.3 5.6L12 17.7 7 21.5l1.3-5.6L4 12.1l5.7-.5z"/>',
  starfill: '<path d="m12 4 2.3 5.2 5.7.5-4.3 3.8 1.3 5.6L12 17.7 7 21.5l1.3-5.6L4 12.1l5.7-.5z" fill="currentColor" stroke="none"/>',
  folder: '<path d="M4 7h6l2 2h8v9H4z"/>',
  location: '<path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  newfolder: '<path d="M4 7h6l2 2h8v9H4z"/><path d="M14 13h4M16 11v4" opacity="0.9"/>',
  fontsize: '<path d="M3 17 7 6l4 11M4.5 13h5"/><path d="M13 10 16 6l3 4M14 8h4"/>',
  growfont: '<path d="M3 18 8 6l5 12M5 14h6"/><path d="M17 9v8M14 12h6"/>',
  shrinkfont: '<path d="M3 18 7 8l4 10M4.5 15h5"/><path d="M14 13h6"/>',
};

function Icon({ n, size, style, className }) {
  const inner = ICON_PATHS[n];
  if (!inner) {
    return React.createElement('svg', { viewBox: '0 0 24 24', width: size, height: size, style, className },
      React.createElement('rect', { x: 5, y: 5, width: 14, height: 14, rx: 2, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }));
  }
  return React.createElement('svg', {
    viewBox: '0 0 24 24', width: size, height: size, style, className,
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    dangerouslySetInnerHTML: { __html: inner },
  });
}

window.Icon = Icon;
