class ElixirService {
    constructor() {
        this.baseUrl = "https://elixir.bootlin.com";
    }

    async searchFunc(FuncName, project = "linux", version = "latest", family = "C") {
        const url = `${this.baseUrl}/api/ident/${project}/${encodeURIComponent(FuncName)}?version=${version}&family=${family}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Elixir API request failed with status ${response.status}`);
            }
            const data = await response.json();
            const results = [];

            data.definitions?.forEach(def => {
                results.push({
                    name: FuncName,
                    type: def.type || "func",
                    file: def.path,
                    line: typeof def.line === "string" ? parseInt(def.line) : def.line,
                    project,
                    version,
                });
            });

            data.references?.slice(0, 100).forEach(ref => {
                const lines = String(ref.line).split(",").map(l => parseInt(l.trim()));
                lines.forEach(lineNum => {
                    results.push({
                        name: FuncName,
                        type: ref.type || "reference",
                        file: ref.path,
                        line: lineNum,
                        project,
                        version,
                    });
                });
            });

            return { results, query: FuncName, project, version, family };
        } catch (error) {
            console.error("Search failed:", error);
            return { error: "Search failed", message: error.message, results: [] };
        }
    }

    async getSourceFile(project, version, filePath) {
        const url = `${this.baseUrl}/${project}/${version}/source/${filePath}?raw=1`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Source file not found: ${response.statusText}`);
            }
            const content = await response.text();
            // Check if bootlin returned an HTML error page instead of raw text
            if (content.trim().toLowerCase().startsWith("<!doctype html")) {
                throw new Error("Could not retrieve source. The file may not exist or access is restricted.");
            }
            return { content, path: filePath };
        } catch (error) {
            console.error(`Error fetching source file:`, error);
            return { error: "Source file not found", message: error.message };
        }
    }
}