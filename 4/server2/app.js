const http = require("http");
const url = require("url");

const dictionary = [];  // Stores words and definitions
let requestCount = 0;

const server = http.createServer((req, res) => {
    requestCount++;
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Handle CORS for cross-origin requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    if (pathname === "/api/definitions" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            try {
                const { word, definition } = JSON.parse(body);
                if (!word || !definition || /^[a-zA-Z]+$/.test(word)) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Invalid input: Words must contain only letters." }));
                }

                const existing = dictionary.find(entry => entry.word.toLowerCase() === word.toLowerCase());
                if (existing) {
                    res.writeHead(409, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: `Warning! '${word}' already exists.` }));
                }

                dictionary.push({ word, definition });
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    message: `New entry recorded: '${word} : ${definition}'`,
                    requestCount,
                    totalEntries: dictionary.length
                }));
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid JSON format." }));
            }
        });

    } else if (pathname === "/api/definitions/" && req.method === "GET") {
        const word = query.word;
        if (!word || /^[a-zA-Z]+$/.test(word)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid input: Words must contain only letters." }));
        }

        const entry = dictionary.find(entry => entry.word.toLowerCase() === word.toLowerCase());
        if (entry) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ word: entry.word, definition: entry.definition, requestCount }));
        } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: `Request# ${requestCount}, word '${word}' not found!` }));
        }

    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid route." }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
