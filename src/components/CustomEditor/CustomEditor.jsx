import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import './CustomEditor.css';
import {
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaMinus, FaListOl, FaListUl, FaRegSquare, FaTable, FaSmile,
  FaSearch, FaFont, FaFillDrip,
} from 'react-icons/fa';
import { throttle } from 'lodash';

const CustomEditor = ({ value = '', onChange, placeholder = '' }) => {
  const editorRef = useRef(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showSpecialCharPanel, setShowSpecialCharPanel] = useState(false);
  const [showTablePanel, setShowTablePanel] = useState(false);
  const [currentFont, setCurrentFont] = useState('');
  const [currentSize, setCurrentSize] = useState('');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentLineHeight, setCurrentLineHeight] = useState('');
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentLetterSpacing, setCurrentLetterSpacing] = useState('');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceContent, setSourceContent] = useState('');
  const [sourceCopied, setSourceCopied] = useState(false);
  const [internalHtml, setInternalHtml] = useState(value || '');
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const debouncedOnChange = useCallback(
    throttle((html) => { if (onChange) onChange(html); }, 500),
    [onChange]
  );

  const saveHistory = useCallback(() => {
    if (editorRef.current) {
      setHistory((prev) => [...prev, editorRef.current.innerHTML]);
      setRedoStack([]);
    }
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [editorRef.current.innerHTML, ...prev]);
    setInternalHtml(last);
    setHistory(history.slice(0, -1));
  }, [history]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, editorRef.current.innerHTML]);
    setInternalHtml(next);
    setRedoStack(redoStack.slice(1));
  }, [redoStack]);

  const changeCase = useCallback((type) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    const text = range.toString();
    let newText = text;
    if (type === 'upper') newText = text.toUpperCase();
    if (type === 'lower') newText = text.toLowerCase();
    if (type === 'capitalize') newText = text.replace(/\b\w/g, (c) => c.toUpperCase());
    document.execCommand('insertText', false, newText);
    handleInput(true);
  }, [saveHistory]);

  const applyBorder = useCallback((type) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const node = selection.anchorNode.parentElement;
    switch (type) {
      case 'borderBottom': node.style.borderBottom = '1px solid black'; break;
      case 'borderTop': node.style.borderTop = '1px solid black'; break;
      case 'borderLeft': node.style.borderLeft = '1px solid black'; break;
      case 'borderRight': node.style.borderRight = '1px solid black'; break;
      case 'borderAll': node.style.border = '1px solid black'; break;
      case 'noBorder':
        node.style.border = 'none';
        node.style.borderTop = '';
        node.style.borderBottom = '';
        node.style.borderLeft = '';
        node.style.borderRight = '';
        break;
      default: break;
    }
    handleInput(true);
  }, [saveHistory]);

  const insertEquation = useCallback(() => {
    const latex = prompt('Enter LaTeX equation (e.g. x^2 + y^2 = z^2):');
    if (latex) {
      saveHistory();
      document.execCommand('insertHTML', false, `<span class="equation">\\(${latex}\\)</span>`);
      handleInput(true);
    }
  }, [saveHistory]);

  const insertShape = useCallback((shape) => {
    saveHistory();
    let html = '';
    if (shape === 'rect') html = '<div style="width:100px;height:50px;border:1px solid #000;"></div>';
    document.execCommand('insertHTML', false, html);
    handleInput(true);
  }, [saveHistory]);

  const zoomEditor = useCallback((factor) => {
    saveHistory();
    if (editorRef.current) {
      const current = parseFloat(editorRef.current.style.zoom || 1);
      editorRef.current.style.zoom = current * factor;
    }
    handleInput(true);
  }, [saveHistory]);

  const getWordCount = useCallback(() => {
    const text = editorRef.current?.innerText.trim() || '';
    return `Words: ${text.split(/\s+/).length}, Characters: ${text.length}`;
  }, []);

  const updateCurrentFormatting = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let node = selection.anchorNode;
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    if (!editorRef.current.contains(node)) return;
    let block = node;
    while (block && block !== editorRef.current && !['DIV', 'P', 'LI'].includes(block.nodeName)) block = block.parentNode;
    let inline = node;
    while (inline && inline !== editorRef.current && inline.nodeName !== 'SPAN') inline = inline.parentNode;
    let size = '';
    if (inline?.style?.fontSize) size = inline.style.fontSize;
    else if (block?.style?.fontSize) size = block.style.fontSize;
    const validSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '32', '36', '40', '48', '60', '72'];
    size = size.replace('px', '');
    if (!validSizes.includes(size)) size = '';
    setCurrentSize(size);
    let family = '';
    if (inline?.style?.fontFamily) family = inline.style.fontFamily;
    else if (block?.style?.fontFamily) family = block.style.fontFamily;
    else family = window.getComputedStyle(node).fontFamily;
    if (family) {
      family = family.replace(/['"]/g, '');
      if (family.includes(',')) family = family.split(',')[0].trim();
    }
    setCurrentFont(family || '');
    let lh = '';
    if (block?.style?.lineHeight) lh = block.style.lineHeight;
    else lh = window.getComputedStyle(node).lineHeight;
    const validLineHeights = ['1.0', '1.15', '1.3', '1.5', '1.75', '2.0'];
    if (lh === 'normal' || !lh || !validLineHeights.includes(lh)) lh = '';
    else lh = String(lh);
    setCurrentLineHeight(lh);
    let ls = '';
    if (inline?.style?.letterSpacing) ls = inline.style.letterSpacing;
    else ls = window.getComputedStyle(node).letterSpacing;
    const validLetterSpacings = Array.from({ length: 11 }, (_, i) => String(i - 5));
    ls = ls.replace('px', '');
    if (!validLetterSpacings.includes(ls)) ls = '';
    setCurrentLetterSpacing(ls);
    let color = '';
    if (inline?.style?.color) color = inline.style.color;
    else color = window.getComputedStyle(node).color;
    if (color) {
      const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (match) {
        const hex = `#${((1 << 24) + (parseInt(match[1]) << 16) + (parseInt(match[2]) << 8) + parseInt(match[3])).toString(16).slice(1).padStart(6, '0')}`;
        setCurrentColor(hex);
      } else {
        setCurrentColor(color);
      }
    }
  }, []);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel.rangeCount || !editorRef.current) return null;
    const range = sel.getRangeAt(0);
    const getPath = (node) => {
      const path = [];
      let current = node;
      while (current && current !== editorRef.current) {
        const parent = current.parentNode;
        if (parent) { path.unshift(Array.prototype.indexOf.call(parent.childNodes, current)); current = parent; }
        else break;
      }
      return path;
    };
    return { startPath: getPath(range.startContainer), startOffset: range.startOffset, endPath: getPath(range.endContainer), endOffset: range.endOffset };
  }, []);

  const restoreSelection = useCallback((savedSel) => {
    if (!savedSel || !editorRef.current) return;
    const { startPath, startOffset, endPath, endOffset } = savedSel;
    const getNodeFromPath = (path) => {
      let node = editorRef.current;
      for (const index of path) node = node.childNodes[index] || node;
      return node;
    };
    try {
      const startNode = getNodeFromPath(startPath);
      const endNode = getNodeFromPath(endPath);
      if (!startNode || !endNode) return;
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(startNode, Math.min(startOffset, startNode.nodeType === Node.TEXT_NODE ? startNode.length : startNode.childNodes.length));
      range.setEnd(endNode, Math.min(endOffset, endNode.nodeType === Node.TEXT_NODE ? endNode.length : endNode.childNodes.length));
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* ignore */ }
  }, []);

  const cleanHtml = useCallback((html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const fonts = temp.querySelectorAll('font');
    for (const font of fonts) {
      const span = document.createElement('span');
      const color = font.getAttribute('color');
      if (color) span.style.color = color;
      const face = font.getAttribute('face');
      if (face) span.style.fontFamily = face;
      const size = font.getAttribute('size');
      if (size) {
        const num = parseInt(size, 10);
        if (!isNaN(num) && num >= 1 && num <= 7) {
          const pxSizes = [10, 12, 14, 16, 18, 24, 36];
          span.style.fontSize = `${pxSizes[num - 1]}px`;
        }
      }
      while (font.firstChild) span.appendChild(font.firstChild);
      font.parentNode.replaceChild(span, font);
    }
    const elementsWithStyle = temp.querySelectorAll('[style]');
    for (const el of elementsWithStyle) {
      if (el.getAttribute('style').trim() === '') el.removeAttribute('style');
    }
    return temp.innerHTML;
  }, []);

  const handleInput = useCallback((forceCleanup = false) => {
    if (!editorRef.current) return;
    const savedSel = saveSelection();
    const rawHtml = editorRef.current.innerHTML;
    let newHtml = rawHtml;
    if (forceCleanup) {
      newHtml = cleanHtml(rawHtml);
      if (rawHtml !== newHtml) {
        editorRef.current.innerHTML = newHtml;
        restoreSelection(savedSel);
      }
    }
    setInternalHtml(newHtml);
    debouncedOnChange(newHtml);
    updateCurrentFormatting();
  }, [cleanHtml, debouncedOnChange, updateCurrentFormatting, restoreSelection, saveSelection]);

  const format = useCallback((command, val = null) => {
    saveHistory();
    document.execCommand(command, false, val);
    handleInput(true);
  }, [saveHistory, handleInput]);

  const insertContent = useCallback((content) => {
    if (editorRef.current) {
      saveHistory();
      editorRef.current.focus();
      document.execCommand('insertText', false, content);
      handleInput(true);
    }
  }, [saveHistory, handleInput]);

  const applyFontSize = useCallback((size) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode.nodeValue.trim() === '') continue;
      const parent = textNode.parentNode;
      if (parent.nodeName === 'SPAN') parent.style.fontSize = `${size}px`;
      else { const span = document.createElement('span'); span.style.fontSize = `${size}px`; parent.replaceChild(span, textNode); span.appendChild(textNode); }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentSize(String(size));
  }, [saveHistory, handleInput]);

  const applyFontFamily = useCallback((family) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode.nodeValue.trim() === '') continue;
      const parent = textNode.parentNode;
      if (parent.nodeName === 'SPAN') parent.style.fontFamily = family;
      else { const span = document.createElement('span'); span.style.fontFamily = family; parent.replaceChild(span, textNode); span.appendChild(textNode); }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentFont(family);
  }, [saveHistory, handleInput]);

  const applyLineHeight = useCallback((lh) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    let block = range.startContainer;
    while (block && block !== editorRef.current && !['DIV', 'P', 'LI'].includes(block.nodeName)) block = block.parentNode;
    if (block && block.style) { block.style.lineHeight = lh; handleInput(true); setCurrentLineHeight(String(lh)); }
  }, [saveHistory, handleInput]);

  const applyTextColor = useCallback((color) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode.nodeValue.trim() === '') continue;
      const parent = textNode.parentNode;
      if (parent.nodeName === 'SPAN') parent.style.color = color;
      else { const span = document.createElement('span'); span.style.color = color; parent.replaceChild(span, textNode); span.appendChild(textNode); }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentColor(color);
  }, [saveHistory, handleInput]);

  const collapseCaretToEnd = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const applyLetterSpacing = useCallback((spacing) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    saveHistory();
    const value = String(spacing).trim();
    if (value === '') { setCurrentLetterSpacing(''); return; }
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (textNode.nodeValue.trim() === '') continue;
      const parent = textNode.parentNode;
      if (parent && parent.nodeName === 'SPAN') parent.style.letterSpacing = `${value}px`;
      else {
        const span = document.createElement('span');
        span.style.letterSpacing = `${value}px`;
        parent.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.insertNode(frag);
    collapseCaretToEnd();
    handleInput(true);
    setCurrentLetterSpacing(value);
  }, [saveHistory, handleInput, collapseCaretToEnd]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      saveHistory();
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const newLine = document.createElement('div');
      newLine.innerHTML = '<br>';
      if (currentFont) newLine.style.fontFamily = currentFont;
      if (currentLineHeight) newLine.style.lineHeight = currentLineHeight;
      range.deleteContents();
      range.insertNode(newLine);
      const newRange = document.createRange();
      newRange.setStart(newLine, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      handleInput(true);
    }
  }, [saveHistory, handleInput, currentFont, currentLineHeight]);

  const insertTable = useCallback((rows, cols, width, height) => {
    saveHistory();
    let table = `<table style="border-collapse:collapse;width:${width || '100%'};height:${height || 'auto'};">`;
    for (let r = 0; r < rows; r++) {
      table += '<tr>';
      for (let c = 0; c < cols; c++) table += '<td style="padding:8px;border:1px solid #ccc;">&nbsp;</td>';
      table += '</tr>';
    }
    table += '</table><br>';
    document.execCommand('insertHTML', false, table);
    handleInput(true);
    setShowTablePanel(false);
  }, [saveHistory, handleInput]);

  const handleImageInsert = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) { saveHistory(); format('insertImage', url); }
  }, [saveHistory, format]);

  const handleImageClick = useCallback((e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target);
      setImageWidth(e.target.style.width?.replace('px', '') || e.target.width || '');
      setImageHeight(e.target.style.height?.replace('px', '') || e.target.height || '');
    }
  }, []);

  const applyImageResize = () => {
    if (!selectedImage) { alert('Please select an image first.'); return; }
    if (imageWidth) selectedImage.style.width = `${imageWidth}px`;
    if (imageHeight) selectedImage.style.height = `${imageHeight}px`;
    else selectedImage.style.height = 'auto';
    handleInput(true);
    setSelectedImage(null);
    setImageWidth('');
    setImageHeight('');
  };

  const handleLinkInsert = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) { saveHistory(); format('createLink', url); }
  }, [saveHistory, format]);

  const handleVideoInsert = useCallback(() => {
    const url = prompt('Enter video iframe embed code:');
    if (url && editorRef.current) { saveHistory(); editorRef.current.focus(); document.execCommand('insertHTML', false, url); handleInput(true); }
  }, [saveHistory, handleInput]);

  const formatHtml = useCallback((html) => {
    let indent = 0;
    return html
      .replace(/></g, '>\n<')
      .split('\n')
      .map((line) => {
        line = line.trim();
        if (!line) return '';
        if (/^<\//.test(line)) indent = Math.max(0, indent - 1);
        const out = '  '.repeat(indent) + line;
        if (/^<[^/!][^>]*[^/]>$/.test(line) && !/<\/.+>/.test(line)) indent++;
        return out;
      })
      .filter(Boolean)
      .join('\n');
  }, []);

  const handleCopySource = useCallback(() => {
    navigator.clipboard.writeText(sourceContent).then(() => {
      setSourceCopied(true);
      setTimeout(() => setSourceCopied(false), 2000);
    });
  }, [sourceContent]);

  const handleAutoFormat = useCallback(() => {
    saveHistory();
    let html = editorRef.current.innerHTML;
    html = html.replace(/"([^"]*)"/g, '\u201c$1\u201d');
    html = html.replace(/\s--\s/g, ' \u2014 ');
    setInternalHtml(cleanHtml(html));
  }, [saveHistory, cleanHtml]);

  const handleFindReplace = useCallback(() => {
    saveHistory();
    const html = editorRef.current.innerHTML;
    const updated = html.replaceAll(findValue, replaceValue);
    setInternalHtml(cleanHtml(updated));
    setShowFindReplace(false);
  }, [saveHistory, findValue, replaceValue, cleanHtml]);

  const handlePastePlainText = useCallback((e) => {
    e.preventDefault();
    saveHistory();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput(true);
  }, [saveHistory, handleInput]);

  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
    };
    document.addEventListener('keydown', handleKeyDownGlobal);
    return () => document.removeEventListener('keydown', handleKeyDownGlobal);
  }, [undo, redo]);

  useEffect(() => {
    const handleSelectionChange = () => updateCurrentFormatting();
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateCurrentFormatting]);

  useLayoutEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== internalHtml) {
      const savedSel = saveSelection();
      editorRef.current.innerHTML = internalHtml;
      restoreSelection(savedSel);
      updateCurrentFormatting();
    }
  }, [internalHtml, updateCurrentFormatting, saveSelection, restoreSelection]);

  useEffect(() => {
    if (value !== internalHtml && value !== '') {
      const cleaned = cleanHtml(value);
      setInternalHtml(cleaned);
      setHistory([cleaned]);
    }
  }, [value, cleanHtml]);

  const EMOJIS = ['😀','😂','😍','😎','🥳','🤔','😢','😡','👍','👎','❤️','🔥','✨','🎉','💡','📧','📅','🔑','✅','❌','⭐','💬','📌','🏆'];
  const SPECIAL_CHARS = ['©','®','™','€','£','¥','§','¶','°','±','×','÷','½','¼','¾','→','←','↑','↓','↔','≠','≤','≥','∞','√'];
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(3);
  const [tableWidth, setTableWidth] = useState('100%');
  const [tableHeight, setTableHeight] = useState('auto');

  return (
    <div className="editor-container">
      <div className="toolbar">
        <button onClick={undo} title="Undo">↺</button>
        <button onClick={redo} title="Redo">↻</button>
        <button onClick={() => document.execCommand('selectAll')} title="Select All">Select All</button>
        <button onClick={handleAutoFormat} title="Autoformat">✨</button>
        <button onClick={() => document.execCommand('insertParagraph')} title="Insert Paragraph">⏎</button>
        <button onClick={() => window.print()} title="Print">🖨️</button>
        <button onClick={() => format('bold')} title="Bold"><b>B</b></button>
        <button onClick={() => format('italic')} title="Italic"><i>I</i></button>
        <button onClick={() => format('underline')} title="Underline"><u>U</u></button>
        <button onClick={() => format('strikeThrough')} title="Strikethrough"><s>S</s></button>
        <button onClick={() => format('superscript')} title="Superscript">x²</button>
        <button onClick={() => format('subscript')} title="Subscript">x₂</button>
        <button onClick={() => format('removeFormat')} title="Clear Formatting">🚫</button>
        <button onClick={() => document.documentElement.requestFullscreen()} title="Fullscreen">⛶</button>
        <button onClick={() => { setSourceContent(editorRef.current?.innerHTML || ''); setIsSourceModalOpen(true); }} title="Source Code" className="source-btn">{'</>'} Source</button>
        <button onClick={() => setShowFindReplace(!showFindReplace)} title="Find & Replace"><FaSearch /></button>

        <select value={currentFont} onChange={(e) => applyFontFamily(e.target.value)}>
          <option value="">Font</option>
          {['Arial','Calibri','Cambria','Comic Sans MS','Consolas','Courier New','Georgia','Helvetica','Impact','Palatino Linotype','Segoe UI','Tahoma','Times New Roman','Trebuchet MS','Verdana','Garamond','Century Gothic'].map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select value={currentSize} onChange={(e) => applyFontSize(e.target.value)}>
          <option value="">Size</option>
          {[8,9,10,11,12,14,16,18,20,22,24,26,28,32,36,40,48,60,72].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select value={currentLineHeight} onChange={(e) => applyLineHeight(e.target.value)}>
          <option value="">Line Height</option>
          {['1.0','1.15','1.3','1.5','1.75','2.0'].map(lh => (
            <option key={lh} value={lh}>{lh}</option>
          ))}
        </select>

        <select value={currentLetterSpacing} onChange={(e) => applyLetterSpacing(e.target.value)}>
          <option value="">Letter Spacing</option>
          {Array.from({ length: 11 }, (_, i) => i - 5).map(v => (
            <option key={v} value={v}>{v}px</option>
          ))}
        </select>

        <div className="editor-toolbar-section">
          <div className="toolbar-button">
            <FaFont size={13} />
            <input type="color" value={currentColor} onChange={(e) => { applyTextColor(e.target.value); setCurrentColor(e.target.value); }} className="color-input" title="Text Color" />
            <input type="text" value={currentColor} onChange={(e) => { setCurrentColor(e.target.value); applyTextColor(e.target.value); }} placeholder="#000000" className="hex-input" />
          </div>
          <div className="toolbar-button">
            <FaFillDrip size={13} />
            <input type="color" onChange={(e) => format('hiliteColor', e.target.value)} className="color-input" title="Highlight" />
          </div>
        </div>

        <select onChange={(e) => format('formatBlock', e.target.value)}>
          <option value="">Heading</option>
          {['H1','H2','H3','H4','H5','H6','BLOCKQUOTE'].map(h => <option key={h} value={h}>{h}</option>)}
        </select>

        <button onClick={() => format('insertHorizontalRule')} title="HR"><FaMinus /></button>
        <button onClick={() => format('justifyLeft')} title="Left"><FaAlignLeft /></button>
        <button onClick={() => format('justifyCenter')} title="Center"><FaAlignCenter /></button>
        <button onClick={() => format('justifyRight')} title="Right"><FaAlignRight /></button>
        <button onClick={() => format('justifyFull')} title="Justify"><FaAlignJustify /></button>
        <button onClick={handleImageInsert} title="Image">🖼️</button>
        <button onClick={handleVideoInsert} title="Video">📹</button>
        <button onClick={handleLinkInsert} title="Link">🔗</button>
        <button onClick={() => format('unlink')} title="Remove Link">❌</button>
        <button onClick={() => format('insertOrderedList')} title="OL"><FaListOl /></button>
        <button onClick={() => format('insertUnorderedList')} title="UL"><FaListUl /></button>
        <button onClick={() => document.execCommand('insertText', false, '☐ ')} title="Todo"><FaRegSquare /></button>
        <button onClick={() => setShowTablePanel(!showTablePanel)} title="Table"><FaTable /></button>
        <button onClick={() => setShowEmojiPanel(!showEmojiPanel)} title="Emoji"><FaSmile /></button>
        <button onClick={() => setShowSpecialCharPanel(!showSpecialCharPanel)} title="Special Chars">Ω</button>
        <button onClick={() => changeCase('upper')} title="UPPER">AA</button>
        <button onClick={() => changeCase('lower')} title="lower">aa</button>
        <button onClick={() => changeCase('capitalize')} title="Capitalize">Aa</button>
        <button onClick={() => format('indent')} title="Indent">→</button>
        <button onClick={() => format('outdent')} title="Outdent">←</button>
        <button onClick={() => alert(getWordCount())} title="Word Count">Wc</button>
      </div>

      {showFindReplace && (
        <div className="find-replace-panel">
          <input placeholder="Find…" value={findValue} onChange={(e) => setFindValue(e.target.value)} />
          <input placeholder="Replace with…" value={replaceValue} onChange={(e) => setReplaceValue(e.target.value)} />
          <button onClick={handleFindReplace}>Replace All</button>
          <button onClick={() => setShowFindReplace(false)}>Close</button>
        </div>
      )}

      {showTablePanel && (
        <div className="table-panel">
          <label>Rows</label>
          <input type="number" min={1} value={tableRows} onChange={(e) => setTableRows(+e.target.value)} />
          <label>Cols</label>
          <input type="number" min={1} value={tableCols} onChange={(e) => setTableCols(+e.target.value)} />
          <label>Width</label>
          <input value={tableWidth} onChange={(e) => setTableWidth(e.target.value)} />
          <label>Height</label>
          <input value={tableHeight} onChange={(e) => setTableHeight(e.target.value)} />
          <button onClick={() => insertTable(tableRows, tableCols, tableWidth, tableHeight)}>Insert</button>
          <button onClick={() => setShowTablePanel(false)}>Cancel</button>
        </div>
      )}

      {showEmojiPanel && (
        <div className="emoji-panel">
          {EMOJIS.map((e, i) => <span key={i} onClick={() => { insertContent(e); setShowEmojiPanel(false); }}>{e}</span>)}
        </div>
      )}

      {showSpecialCharPanel && (
        <div className="special-char-panel">
          {SPECIAL_CHARS.map((c, i) => <span key={i} onClick={() => { insertContent(c); setShowSpecialCharPanel(false); }}>{c}</span>)}
        </div>
      )}

      {selectedImage && (
        <div className="image-resize-panel">
          <label>Resize Image:</label>
          <input type="number" placeholder="Width (px)" value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} />
          <input type="number" placeholder="Height (px)" value={imageHeight} onChange={(e) => setImageHeight(e.target.value)} />
          <button onClick={applyImageResize}>Apply</button>
          <button onClick={() => { setSelectedImage(null); setImageWidth(''); setImageHeight(''); }}>Cancel</button>
        </div>
      )}

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => handleInput(false)}
        onKeyDown={handleKeyDown}
        onPaste={handlePastePlainText}
        onClick={handleImageClick}
        onMouseUp={updateCurrentFormatting}
      />

      {isSourceModalOpen && (
        <div className="source-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsSourceModalOpen(false); }}>
          <div className="source-modal">
            {/* Header */}
            <div className="source-modal-header">
              <div className="source-modal-title">
                <span className="source-modal-icon">{'</>'}</span>
                <span>HTML Source Code</span>
              </div>
              <div className="source-modal-header-actions">
                <button
                  className={`source-copy-btn ${sourceCopied ? 'copied' : ''}`}
                  onClick={handleCopySource}
                  title="Copy source code"
                >
                  {sourceCopied ? '✓ Copied!' : '⎘ Copy'}
                </button>
                <button
                  className="source-format-btn"
                  onClick={() => setSourceContent(formatHtml(sourceContent))}
                  title="Beautify / format HTML"
                >
                  ✦ Format
                </button>
                <button
                  className="source-close-btn"
                  onClick={() => setIsSourceModalOpen(false)}
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="source-textarea-wrap">
              <textarea
                className="source-textarea"
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                spellCheck={false}
                placeholder="HTML source code..."
              />
            </div>

            {/* Footer */}
            <div className="source-modal-footer">
              <span className="source-char-count">{sourceContent.length} chars</span>
              <div className="source-modal-actions">
                <button
                  className="source-cancel-btn"
                  onClick={() => setIsSourceModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="source-apply-btn"
                  onClick={() => { setInternalHtml(cleanHtml(sourceContent)); setIsSourceModalOpen(false); }}
                >
                  ✓ Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEditor;
