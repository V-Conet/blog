function queryAll(root, selector) { return [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)]; }

// 当前实际明暗：固定模式写在 <html data-theme>，没有该属性表示跟随系统。
// 与 color-scheme-switch 的 resolvedColorScheme 同语义，但该模块只在启用配色切换时加载，
// 这里不能静态依赖它。
function prefersDarkScheme(root) {
  const documentRef = root?.nodeType === 9 ? root : root?.ownerDocument;
  const fixed = documentRef?.documentElement?.getAttribute('data-theme');
  if (fixed === 'dark') return true;
  if (fixed === 'light') return false;
  return documentRef?.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

// auto 跟随配色模式；其余取值始终生效，不再被系统深色模式覆盖。
function resolveTheme(config, root) {
  if (config.theme && config.theme !== 'auto') return config.theme;
  return prefersDarkScheme(root) ? 'dark' : 'neutral';
}

export async function mount(root, context) {
  const config = context.extension.config;
  await context.assets.script(config.assets.js);
  context.signal?.throwIfAborted();
  const theme = resolveTheme(config, root);
  window.mermaid.initialize({
    startOnLoad: false,
    theme,
    logLevel: 3,
    flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'linear' },
    gantt: { axisFormat: '%Y/%m/%d' },
    sequence: { actorMargin: 50 }
  });
  await window.mermaid.run({ nodes: queryAll(root, '.mermaid') });
  return () => {};
}
