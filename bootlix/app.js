class BootlixApp {
    constructor() {
        this.elixirBaseUrl = "https://vm-fail.ner9211.workers.dev";
        this.init();
    }

    init() {
        const searchForm = document.getElementById('search-form');
        searchForm.addEventListener('submit', this.handleSearch.bind(this));

        document.getElementById("close-viewer-btn").addEventListener("click", () => {
            document.body.classList.remove("viewer-open");
        });

        const resizer = document.getElementById("resizer");
        let isResizing = false;
        resizer.addEventListener("mousedown", (e) => {
            e.preventDefault();
            isResizing = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            const mouseMoveHandler = (e) => this.handleResize(e, isResizing);
            document.addEventListener("mousemove", mouseMoveHandler);
            document.addEventListener("mouseup", () => {
                isResizing = false;
                document.body.style.cursor = "default";
                document.body.style.userSelect = "auto";
                document.removeEventListener("mousemove", mouseMoveHandler);
            }, { once: true });
        });
    }

    handleResize(e, isResizing) {
        if (!isResizing)
            return;

        const newWidth = Math.max(320, window.innerWidth - e.clientX);
        const maxAllowedWidth = window.innerWidth * 0.8;
        if (newWidth < maxAllowedWidth) {
            document.documentElement.style.setProperty("--viewer-width", `${newWidth}px`);
        }
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
            resultsDiv.innerHTML = `<div class="text-center text-gray-400 py-8"><p>Please enter a search term.</p></div>`;
            spinner.style.display = 'none';
            return;
        }

        const url = `${this.elixirBaseUrl}/api/ident/${project}/${encodeURIComponent(q)}?version=${version}&family=C`;
        try {
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Proxy returned status ${response.status}`);

            const apiData = await response.json();

            const searchData = {
                results: this.processApiResults(apiData, q, project, version),
                query: q,
                project,
                version
            };
            this.renderResults(searchData);

        } catch (error) {
            this.renderResults({ error: "Search failed", message: error.message });
        } finally {
            spinner.style.display = 'none';
        }
    }

    processApiResults(apiData, q, project, version) {
        const results = [];
        apiData.definitions?.forEach(def => {
            results.push({
                name: q,
                type: def.type || "definition",
                file: def.path,
                line: parseInt(def.line),
                project,
                version
            });
        });
        apiData.references?.slice(0, 100).forEach(ref => {
            String(ref.line).split(",").forEach(lineNum => {
                results.push({
                    name: q,
                    type: ref.type || "reference",
                    file: ref.path,
                    line: parseInt(lineNum.trim()),
                    project,
                    version
                });
            });
        });
        return results;
    }

    renderResults(data) {
        const resultsDiv = document.getElementById("results");
        if (data.error) {
            resultsDiv.innerHTML = `<div class="bg-red-900 border border-red-700 rounded-lg p-4"><h3 class="text-red-400 font-semibold">Error</h3><p>${data.message}</p></div>`;
            return;
        }
        if (!data.results || data.results.length === 0) {
            resultsDiv.innerHTML = `<div class="bg-yellow-900 border border-yellow-700 rounded-lg p-4"><h3 class="text-yellow-400 font-semibold">No Results</h3><p>Sorry! Parsers couldn't find anything for <span class="font-mono">"${data.query}"</span>.</p></div>`;
            return;
        }
        const definitions = data.results.filter(r => r.type !== "reference");
        const references = data.results.filter(r => r.type === "reference");
        let html = `<div class="bg-neutral-950 rounded-lg p-6"><h2 class="text-2xl font-bold text-blue-400 mb-4">Results for "<span class="font-mono">${data.query}</span>"</h2>`;
        if (definitions.length > 0) {
            html += `<div class="mb-6"><h3 class="text-lg font-semibold text-blue-400 mb-3">Definitions</h3><div class="space-y-2 font-mono">`;
            definitions.forEach(def => {
                html += `<div class="bg-[#0f0f0f] rounded p-4 border-l-4 border-blue-400"><div class="flex justify-between items-start"><div><span class="text-blue-500 font-semibold">${def.name}</span> <span class="text-gray-100 ml-2">(${def.type})</span></div><div class="text-right text-sm text-gray-400"><div>${def.file}:${def.line}</div></div></div><button onclick="window.bootlix.showSourceCode('${def.project}', '${def.version}', '${def.file}', ${def.line}, '${def.name}')" class="text-blue-400 hover:text-blue-300 text-sm mt-2 font-sans">View source →</button></div>`;
            });
            html += `</div></div>`;
        }
        if (references.length > 0) {
            html += `<div><h3 class="text-lg font-semibold text-blue-200 mb-3">References (${references.length})</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">`;
            references.slice(0, 50).forEach(ref => {
                html += `<div class="bg-[#0f0f0f] rounded p-3 border-l-4 border-blue-200"><div class="text-sm"><div class="text-gray-300">${ref.file}:${ref.line}</div><button onclick="window.bootlix.showSourceCode('${ref.project}', '${ref.version}', '${ref.file}', ${ref.line}, '${data.query}')" class="text-blue-400 hover:text-blue-300 text-xs mt-1 font-sans">View →</button></div></div>`;
            });
            html += `</div></div>`;
        }
        html += `</div>`;
        resultsDiv.innerHTML = html;
    }

    async showSourceCode(project, version, file, line) {
        document.body.classList.add("viewer-open");
        const placeholderEl = document.getElementById("code-viewer-placeholder");
        const preEl = document.querySelector("#code-viewer-content pre");
        const codeEl = document.getElementById("sourceCode");
        document.getElementById("code-viewer-title").textContent = `Source: ${file.split("/").pop()}`;
        document.getElementById("code-viewer-filepath").textContent = `${file}:${line}`;
        // The link to view on Bootlin still goes to the real site
        document.getElementById("code-viewer-link").href = `https://elixir.bootlin.com/${project}/${version}/source/${file}#L${line}`;
        preEl.classList.add("hidden");
        placeholderEl.classList.remove("hidden");
        placeholderEl.innerHTML = `<div class="flex items-center justify-center h-full"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div><span class="ml-2">Loading...</span></div>`;

        const url = `${this.elixirBaseUrl}/${project}/${version}/source/${file}?raw=1`;
        try {
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Source file not found (status: ${response.status})`);

            const content = await response.text();
            if (content.trim().toLowerCase().startsWith("<!doctype html"))
                throw new Error("Could not retrieve source. Bootlin returned an HTML page.");


            placeholderEl.classList.add("hidden");
            preEl.classList.remove("hidden");
            preEl.dataset.line = line;
            codeEl.textContent = content;
            Prism.highlightElement(codeEl);
            if (Prism.plugins.lineHighlight)
                Prism.plugins.lineHighlight.highlightLines(preEl)();

        } catch (error) {
            placeholderEl.innerHTML = `<div class="p-4 text-red-400 text-center">${error.message}</div>`;
        }
    }
}


window.bootlix = new BootlixApp();
window.searchExample = (term) => {
    document.querySelector('input[name="q"]').value = term;
    document.getElementById('search-form').dispatchEvent(new Event('submit'));
};