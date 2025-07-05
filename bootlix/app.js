class BootlixApp {
  constructor() {
    this.workerBaseUrl = 'https://vm-fail.ner9211.workers.dev';

    this.tokyoNightCSS = `
code[class*="language-"],pre[class*="language-"]{color:#a9b1d6;background:#1a1b26;text-shadow:none;font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}pre[class*="language-"]{padding:1em;margin:.5em 0;overflow:auto;border-radius:.3em}:not(pre)>code[class*="language-"],pre[class*="language-"]{background:#1a1b26}:not(pre)>code[class*="language-"]{padding:.1em;border-radius:.3em;white-space:normal}.token.comment,.token.prolog,.token.doctype,.token.cdata{color:#565f89}.token.punctuation{color:#c0caf5}.token.namespace{opacity:.7}.token.property,.token.tag,.token.constant,.token.symbol,.token.deleted{color:#f7768e}.token.boolean,.token.number{color:#ff9e64}.token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.inserted{color:#9ece6a}.token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string{color:#7aa2f7;background:0 0}.token.atrule,.token.attr-value,.token.keyword{color:#bb9af7}.token.function,.token.class-name{color:#7dcfff}.token.regex,.token.important,.token.variable{color:#e0af68}.token.important,.token.bold{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}
    `;
    this.themes = {
      'Tokyo Night': {internal: true},
      'One Dark': {
        url:
            'https://cdn.jsdelivr.net/npm/prism-themes@1.9.0/themes/prism-one-dark.css'
      },
      'Dracula': {
        url:
            'https://cdn.jsdelivr.net/npm/prism-themes@1.9.0/themes/prism-dracula.css'
      },
      'Gruvbox Dark': {
        url:
            'https://cdn.jsdelivr.net/npm/prism-themes@1.9.0/themes/prism-gruvbox-dark.css'
      },
      'Material Oceanic': {
        url:
            'https://cdn.jsdelivr.net/npm/prism-themes@1.9.0/themes/prism-material-oceanic.css'
      },
      'One Light': {
        url:
            'https://cdn.jsdelivr.net/npm/prism-themes@1.9.0/themes/prism-one-light.css'
      },
      'Material Light': {
        url:
            'https://cdn.jsdelivr.net/npm/prism-themes@1.9.0/themes/prism-material-light.css'
      },
    };
    this.projectVersions = {
      'linux': [
        'latest', 'v6.12', 'v6.11', 'v6.10', 'v6.9', 'v6.8', 'v6.7', 'v6.1',
        'v5.15', 'v5.10', 'v5.4', 'v4.19'
      ],
      'u-boot': ['latest', 'v2024.07', 'v2024.04', 'v2024.01', 'v2023.10'],
      'glibc': ['latest', 'glibc-2.39', 'glibc-2.38', 'glibc-2.37'],
      'musl': ['latest', 'v1.2.5', 'v1.2.4'],
      'arm-trusted-firmware': ['latest', 'v2.10', 'v2.9', 'v2.8'],
      'op-tee': ['latest', '4.2.0', '4.1.0', '4.0.0'],
      'coreboot': ['latest', '24.05', '24.02', '23.11'],
      'qemu': ['latest', 'v9.0.0', 'v8.2.0', 'v8.1.0'],
      'xen': ['latest', '4.18.0', '4.17.0', '4.16.0'],
      'busybox': ['latest', '1.36.1', '1.35.0', '1.34.0'],
      'toybox': ['latest', '0.8.11', '0.8.10'],
      'zephyr': ['latest', 'v3.6.0', 'v3.5.0']
    };
    this.sunIcon =
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    this.moonIcon =
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    this.init();
  }

  init() {
    document.getElementById('search-form')
        .addEventListener('submit', this.handleSearch.bind(this));
    document.getElementById('close-viewer-btn')
        .addEventListener(
            'click', () => document.body.classList.remove('viewer-open'));
    document.getElementById('sourceCode')
        .addEventListener('click', (e) => this.handleCodeClick(e));

    this.initResizer();
    this.initTheming();
    this.initProjectSelector();
  }

  initTheming() {
    const themeSelector = document.getElementById('theme-selector');
    const siteThemeToggle = document.getElementById('site-theme-toggle');

    themeSelector.innerHTML = '';
    Object.keys(this.themes).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      themeSelector.appendChild(option);
    });

    siteThemeToggle.addEventListener('click', () => this.toggleSiteTheme());
    themeSelector.addEventListener(
        'change', (e) => this.applyCodeTheme(e.target.value));

    const savedSiteTheme = localStorage.getItem('siteTheme');
    const isDarkMode = savedSiteTheme === 'dark' ||
        (savedSiteTheme === null &&
         window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.updateSiteTheme(isDarkMode);
  }

  toggleSiteTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('siteTheme', isDark ? 'dark' : 'light');
    this.updateSiteTheme(isDark);
  }

  updateSiteTheme(isDark) {
    document.documentElement.classList.toggle('dark', isDark);
    document.getElementById('site-theme-toggle').innerHTML =
        isDark ? this.sunIcon : this.moonIcon;
    const savedCodeTheme = localStorage.getItem('codeTheme');
    if (savedCodeTheme && this.themes[savedCodeTheme]) {
      this.applyCodeTheme(savedCodeTheme);
    } else {
      this.applyCodeTheme(isDark ? 'Tokyo Night' : 'One Light');
    }
  }

  applyCodeTheme(themeName) {
    if (!this.themes[themeName]) return;
    const theme = this.themes[themeName];
    const externalThemeLink = document.getElementById('prism-theme-link');
    const internalThemeStyle = document.getElementById('internal-prism-theme');

    if (theme.internal) {
      internalThemeStyle.innerHTML = this.tokyoNightCSS;
      externalThemeLink.setAttribute('href', '');
    } else {
      internalThemeStyle.innerHTML = '';
      externalThemeLink.setAttribute('href', theme.url);
    }
    document.getElementById('theme-selector').value = themeName;
    localStorage.setItem('codeTheme', themeName);
  }

  initResizer() {
    const resizer = document.getElementById('resizer');
    let isResizing = false;
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      const mouseMoveHandler = (e) => {
        if (isResizing) this.handleResize(e);
      };
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        document.removeEventListener('mousemove', mouseMoveHandler);
      }, {once: true});
    });
  }

  handleResize(e) {
    const newWidth = Math.max(320, window.innerWidth - e.clientX);
    const maxAllowedWidth = window.innerWidth * 0.8;
    if (newWidth < maxAllowedWidth) {
      document.documentElement.style.setProperty(
          '--viewer-width', `${newWidth}px`);
    }
  }

  initProjectSelector() {
    const projectSelector = document.getElementById('project-selector');
    projectSelector.addEventListener(
        'change', (e) => this.updateVersionSelector(e.target.value));
    this.updateVersionSelector(projectSelector.value);
  }

  updateVersionSelector(projectName) {
    const versionSelector = document.getElementById('version-selector');
    const versions = this.projectVersions[projectName] || ['latest'];
    versionSelector.innerHTML = '';
    versions.forEach(version => {
      const option = document.createElement('option');
      option.value = version;
      option.textContent = version;
      versionSelector.appendChild(option);
    });
  }

  handleCodeClick(event) {
    if (event.target.tagName === 'SPAN' &&
        event.target.classList.contains('token')) {
      const identifier = event.target.textContent.trim();
      if (identifier && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
        document.querySelector('input[name="q"]').value = identifier;
        document.getElementById('search-form')
            .dispatchEvent(new Event('submit'));
      }
    }
  }

  highlightIdentifier(element, identifier) {
    if (!identifier || !element) return;
    const safeIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${safeIdentifier}$`);
    element.querySelectorAll('.token').forEach(tokenSpan => {
      if (regex.test(tokenSpan.textContent)) {
        tokenSpan.classList.add('highlight-token');
      }
    });
  }

  async handleSearch(e) {
    e.preventDefault();
    const spinner = document.getElementById('search-spinner');
    const resultsDiv = document.getElementById('results');
    spinner.style.display = 'inline-block';

    const formData = new FormData(e.target);
    const q = formData.get('q');
    const project = formData.get('project');
    const version = formData.get('version');

    if (!q) {
      resultsDiv.innerHTML =
          `<div class="text-center text-gray-500 dark:text-neutral-500 py-8"><p>Start typing a function name to search...</p></div>`;
      spinner.style.display = 'none';
      return;
    }

    const url = `${this.workerBaseUrl}/search?q=${
        encodeURIComponent(q)}&project=${project}&version=${version}`;
    try {
      const response = await fetch(url);
      const html = await response.text();
      if (!response.ok)
        throw new Error(`API returned status ${response.status}`);
      resultsDiv.innerHTML = html;
    } catch (error) {
      resultsDiv.innerHTML =
          `<div class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg p-4"><h3 class="font-semibold">Search Failed</h3><p>${
              error.message}</p></div>`;
    } finally {
      spinner.style.display = 'none';
    }
  }

  async showSourceCode(project, version, file, line, identifier) {
    document.body.classList.add('viewer-open');
    const placeholderEl = document.getElementById('code-viewer-placeholder');
    const preEl = document.querySelector('#code-viewer-content pre');
    const codeEl = document.getElementById('sourceCode');

    document.getElementById('code-viewer-title').textContent =
        `Source: ${file.split('/').pop()}`;
    document.getElementById('code-viewer-filepath').textContent =
        `${file}:${line}`;
    document.getElementById('code-viewer-link').href =
        `https://elixir.bootlin.com/${project}/${version}/source/${file}#L${
            line}`;

    preEl.classList.add('hidden');
    placeholderEl.classList.remove('hidden');
    placeholderEl.innerHTML =
        `<div class="flex items-center justify-center h-full"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div><span class="ml-2">Loading...</span></div>`;

    const url = `${this.workerBaseUrl}/source/${project}/${version}?path=${
        encodeURIComponent(file)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok || !data.content ||
          data.content.startsWith('Sorry we couldn\'t')) {
        throw new Error(
            data.content || `API returned status ${response.status}`);
      }
      placeholderEl.classList.add('hidden');
      preEl.classList.remove('hidden');
      preEl.dataset.line = line;
      codeEl.textContent = data.content;

      Prism.highlightElement(codeEl);
      this.highlightIdentifier(codeEl, identifier);

      if (Prism.plugins.lineHighlight) {
        Prism.plugins.lineHighlight.highlightLines(preEl)();
      }
    } catch (error) {
      placeholderEl.innerHTML =
          `<div class="p-4 text-red-400 text-center">${error.message}</div>`;
    }
  }
}

window.bootlix = new BootlixApp();
window.showSourceCode = (project, version, file, line, identifier) => {
  window.bootlix.showSourceCode(project, version, file, line, identifier);
};