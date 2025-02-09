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
                if (!word || !definition || /\d/.test(word)) {
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

    } else if (req.method === "GET" && pathname.startsWith("/api/definitions")) {
        requestCount++;
        if (pathname === "/api/definitions/all") {
            res.writeHead(200);
            return res.end(JSON.stringify({ requestCount, totalEntries: dictionary.length, dictionary }));
        }

        const word = query.word;
        if (word) {
            // Return definition of a single word
            const entry = dictionary.find(item => item.word.toLowerCase() === word.toLowerCase());
            if (entry) {
                res.writeHead(200);
                return res.end(JSON.stringify({ requestCount, word: entry.word, definition: entry.definition }));
            } else {
                res.writeHead(404);
                return res.end(JSON.stringify({ requestCount, message: `Word '${word}' not found!` }));
            }
        } else {
            res.writeHead(400);
            return res.end(JSON.stringify({ requestCount, message: "Invalid request. Use ?word=yourword" }));
        }
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid route." }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
