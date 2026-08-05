/* global React, ReactDOM, TitleBar, Ribbon, LeftRail, LeftPanel, RightRail, RightPanel,
   DocumentArea, StatusBar, Backstage, ShareDialog, PluginsDialog */
const { useState: uS, useRef: uR, useEffect: uE, useCallback: uC } = React;

function App() {
  const docRef = uR(null);
  const scrollRef = uR(null);

  const [theme, setThemeState] = uS(localStorage.getItem('de_theme') || 'modern-light');
  const [activeTab, setActiveTab] = uS('Home');
  const [backstage, setBackstage] = uS(false);
  const [shareOpen, setShareOpen] = uS(false);
  const [pluginsOpen, setPluginsOpen] = uS(false);

  const [show, setShow] = uS({ toolbar: true, leftPanel: true, rightPanel: true, rulers: true, statusBar: true });
  const [leftPanel, setLeftPanel] = uS('search');      // which left panel open (null = none)
  const [rightTab, setRightTab] = uS('paragraph');
  const [rightOpen, setRightOpen] = uS(true);

  const [darkDoc, setDarkDoc] = uS(false);
  const [zoom, setZoomState] = uS(100);

  const [font, setFont] = uS({ name: 'Arial', size: 11 });
  const [fmt, setFmt] = uS({ bold: false, italic: false, underline: false, strike: false, sup: false, sub: false, align: 'left' });
  const [colors, setColors] = uS({ fore: '#c00000', hilite: '#ffff00', shade: '' });
  const [curStyle, setCurStyle] = uS('Normal');
  const [lineSpacing, setLineSpacingState] = uS('1.15');
  const [spacingType, setSpacingType] = uS('Multiple');

  const [editMode, setEditMode] = uS('Editing');
  const [fav, setFav] = uS(false);
  const [track, setTrack] = uS(false);
  const [displayMode, setDisplayMode] = uS(0);
  const [language, setLanguage] = uS('English (US)');
  const [spellcheck, setSpell] = uS(true);
  const [painter, setPainter] = uS(false);
  const [marks, setMarks] = uS(false);
  const [protect, setProtect] = uS(false);
  const [readOnly, setReadOnly] = uS(false);
  const [drawTool, setDrawTool] = uS('select');
  const [drawColor, setDrawColor] = uS('#c00000');
  const [drawWidth, setDrawWidth] = uS(2);

  const [wordCount, setWordCount] = uS(0);
  const [pageCount] = uS(1);
  const [curPage] = uS(1);

  // theme
  uE(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('de_theme', theme); }, [theme]);

  // word count + marks class
  const refreshCounts = uC(() => {
    if (docRef.current) {
      const txt = (docRef.current.innerText || '').trim();
      setWordCount(txt ? txt.split(/\s+/).length : 0);
    }
  }, []);
  uE(() => { refreshCounts(); }, []);
  uE(() => { if (docRef.current) docRef.current.classList.toggle('show-marks', marks); }, [marks]);
  uE(() => { if (docRef.current) docRef.current.setAttribute('spellcheck', spellcheck); }, [spellcheck]);

  const focusDoc = () => { if (docRef.current) docRef.current.focus(); };

  const refreshFmt = uC(() => {
    try {
      const align = document.queryCommandState('justifyCenter') ? 'center'
        : document.queryCommandState('justifyRight') ? 'right'
        : document.queryCommandState('justifyFull') ? 'justify' : 'left';
      setFmt({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        sup: document.queryCommandState('superscript'),
        sub: document.queryCommandState('subscript'),
        align,
      });
      const fn = (document.queryCommandValue('fontName') || '').replace(/['"]/g, '');
      if (fn) setFont((f) => ({ ...f, name: fn.split(',')[0] }));
    } catch (e) { /* noop */ }
  }, []);

  const exec = uC((cmd, val) => {
    if (cmd === 'print') { window.print(); return; }
    if (cmd === 'selectAll') { focusDoc(); document.execCommand('selectAll'); return; }
    focusDoc();
    try { document.execCommand('styleWithCSS', false, true); } catch (e) {}
    document.execCommand(cmd, false, val);
    refreshFmt(); refreshCounts();
  }, [refreshFmt, refreshCounts]);

  const applyColor = uC((cmd, c, key) => {
    setColors((p) => ({ ...p, [key]: c }));
    if (!c) { if (key === 'shade') return; }
    focusDoc();
    try { document.execCommand('styleWithCSS', false, true); } catch (e) {}
    document.execCommand(cmd, false, c || 'transparent');
    refreshFmt();
  }, [refreshFmt]);

  const wrapSelection = (prop, value) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const span = document.createElement('span');
    span.style[prop] = value;
    try { range.surroundContents(span); }
    catch (e) { const frag = range.extractContents(); span.appendChild(frag); range.insertNode(span); }
    sel.removeAllRanges();
    const nr = document.createRange(); nr.selectNodeContents(span); sel.addRange(nr);
  };

  const applyFont = uC((name) => { setFont((f) => ({ ...f, name })); focusDoc(); try { document.execCommand('styleWithCSS', false, true); } catch (e) {} document.execCommand('fontName', false, name); }, []);
  const applyFontSize = uC((size) => { setFont((f) => ({ ...f, size })); focusDoc(); wrapSelection('fontSize', size + 'px'); }, []);
  const bumpSize = uC((d) => { setFont((f) => { const ns = Math.max(6, Math.min(96, f.size + d)); focusDoc(); wrapSelection('fontSize', ns + 'px'); return { ...f, size: ns }; }); }, []);

  const getBlock = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    let n = sel.getRangeAt(0).startContainer;
    while (n && n !== docRef.current) {
      if (n.nodeType === 1 && /^(P|H1|H2|H3|H4|LI|DIV)$/.test(n.tagName)) return n;
      n = n.parentNode;
    }
    return null;
  };

  const setLineSpacing = uC((v) => { setLineSpacingState(v); const b = getBlock(); if (b) b.style.lineHeight = v; }, []);
  const nudgeSpacing = uC((d) => { setLineSpacingState((s) => { const nv = Math.max(0.5, Math.round((parseFloat(s) + d) * 100) / 100).toFixed(2); const b = getBlock(); if (b) b.style.lineHeight = nv; return nv; }); }, []);
  const setShade = uC((c) => { setColors((p) => ({ ...p, shade: c })); const b = getBlock(); if (b) b.style.background = c || ''; }, []);

  const applyStyle = uC((name) => {
    setCurStyle(name);
    focusDoc();
    const map = { 'Normal': 'P', 'No Spacing': 'P', 'Heading 1': 'H1', 'Heading 2': 'H2', 'Heading 3': 'H3', 'Title': 'H1', 'Subtitle': 'P' };
    document.execCommand('formatBlock', false, map[name] || 'P');
    const b = getBlock();
    if (b) { b.className = (name === 'Subtitle') ? 'subtitle' : ''; }
    refreshFmt();
  }, [refreshFmt]);

  const insert = uC((kind, opt) => {
    focusDoc();
    if (kind === 'table') {
      let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0">';
      for (let r = 0; r < opt.r; r++) { html += '<tr>'; for (let c = 0; c < opt.c; c++) html += '<td style="border:1px solid #b8b8b8;height:24px;padding:3px 6px">&nbsp;</td>'; html += '</tr>'; }
      html += '</table><p><br></p>';
      document.execCommand('insertHTML', false, html);
    } else if (kind === 'image') {
      document.execCommand('insertHTML', false, '<span style="display:inline-block;width:240px;height:150px;background:repeating-linear-gradient(45deg,#eee,#eee 8px,#e3e3e3 8px,#e3e3e3 16px);border:1px solid #ccc;color:#888;text-align:center;line-height:150px;font-family:monospace;font-size:12px">image</span>');
    } else if (kind === 'link') {
      const url = prompt('Enter URL:', 'https://'); if (url) document.execCommand('createLink', false, url);
    } else if (kind === 'pagebreak') {
      document.execCommand('insertHTML', false, '<hr style="border:none;border-top:1px dashed #bbb;margin:24px 0">');
    } else if (kind === 'symbol') {
      document.execCommand('insertText', false, '\u00A7');
    } else if (kind === 'textbox') {
      document.execCommand('insertHTML', false, '<span style="display:inline-block;border:1px solid #bbb;padding:8px 12px;min-width:120px">Text box</span>');
    } else if (kind === 'page') {
      document.execCommand('insertHTML', false, '<p><br></p><p><br></p>');
    }
    refreshCounts();
  }, [refreshCounts]);

  const setZoom = uC((z) => setZoomState(Math.max(50, Math.min(200, Math.round(z)))), []);
  const setFit = uC((mode) => {
    const avail = scrollRef.current ? scrollRef.current.clientWidth : 900;
    if (mode === 'width') setZoom(((avail - 24) / 816) * 100);
    else setZoom(((scrollRef.current ? scrollRef.current.clientHeight : 700) - 44) / 1056 * 100);
  }, [setZoom]);

  const toggleShow = uC((key) => setShow((s) => ({ ...s, [key]: !s[key] })), []);
  const toggleLeftPanel = uC((id) => setLeftPanel((p) => (p === id ? null : id)), []);
  const openLeftPanel = uC((id) => { setShow((s) => ({ ...s, leftPanel: true })); setLeftPanel(id); }, []);
  const openRightPanel = uC(() => { setShow((s) => ({ ...s, rightPanel: true })); setRightOpen(true); setRightTab('paragraph'); }, []);

  const scrollToHeading = uC((t) => {
    if (!docRef.current || !scrollRef.current) return;
    const hs = docRef.current.querySelectorAll('h1,h2,h3');
    for (const h of hs) { if ((h.getAttribute('data-h') || h.textContent).replace(/&amp;/g, '&') === t.replace(/&amp;/g, '&')) { scrollRef.current.scrollTo({ top: h.offsetTop * (zoom / 100), behavior: 'smooth' }); break; } }
  }, [zoom]);

  // keyboard: ctrl+f -> find, ctrl+s -> noop save
  uE(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); openLeftPanel('search'); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); window.print(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openLeftPanel]);

  const ctx = {
    theme, setTheme: setThemeState, activeTab, setActiveTab,
    openBackstage: () => setBackstage(true), closeBackstage: () => setBackstage(false),
    openShare: () => setShareOpen(true), closeShare: () => setShareOpen(false),
    openPlugins: () => setPluginsOpen(true), closePlugins: () => setPluginsOpen(false),
    show, toggleShow, toolbarPinned: false,
    leftPanel, toggleLeftPanel, openLeftPanel,
    rightTab, setRightTab: (t) => { if (t === rightTab && rightOpen) { setRightOpen(false); } else { setRightTab(t); setRightOpen(true); } }, rightOpen, openRightPanel,
    darkDoc, toggleDarkDoc: () => setDarkDoc((d) => !d),
    zoom, setZoom, setFit,
    font, applyFont, applyFontSize, bumpSize,
    fmt, exec, colors, applyColor, setShade,
    curStyle, applyStyle, lineSpacing, setLineSpacing, nudgeSpacing, spacingType, setSpacingType,
    editMode, setEditMode, fav, toggleFav: () => setFav((v) => !v),
    track, toggleTrack: () => setTrack((v) => !v), displayMode, setDisplayMode,
    language, setLanguage, spellcheck, toggleSpell: () => setSpell((v) => !v),
    painter, togglePainter: () => setPainter((v) => !v), marks, toggleMarks: () => setMarks((v) => !v),
    protect, toggleProtect: () => setProtect((v) => !v), readOnly, toggleReadOnly: () => setReadOnly((v) => !v),
    drawTool, setDrawTool, drawColor, setDrawColor, drawWidth, setDrawWidth,
    insert, scrollToHeading,
    docName: 'New document.docx', wordCount, pageCount, curPage,
    panels: { navigation: leftPanel === 'navigation' ? 'open' : '' },
    docRef, scrollRef,
    onDocInput: () => { refreshCounts(); },
    onSelChange: () => { refreshFmt(); },
  };

  return React.createElement('div', { className: 'editor-app' },
    React.createElement(TitleBar, { docName: ctx.docName, onCmd: (c) => { if (c === 'close') {} else exec(c); }, canUndo: true, canRedo: true }),
    React.createElement(Ribbon, { ctx }),
    React.createElement('div', { className: 'workspace' },
      show.leftPanel && React.createElement(LeftRail, { ctx }),
      show.leftPanel && leftPanel && React.createElement(LeftPanel, { ctx }),
      React.createElement(DocumentArea, { ctx }),
      show.rightPanel && rightOpen && React.createElement(RightPanel, { ctx }),
      show.rightPanel && React.createElement(RightRail, { ctx }),
      backstage && React.createElement(Backstage, { ctx })
    ),
    show.statusBar && React.createElement(StatusBar, { ctx }),
    shareOpen && React.createElement(ShareDialog, { ctx }),
    pluginsOpen && React.createElement(PluginsDialog, { ctx })
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
