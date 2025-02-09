const API_URL = "http://localhost:3000/api/definitions";

// Handle adding a word
document.addEventListener("DOMContentLoaded", function () {
    const addForm = document.getElementById("addForm");
    if (addForm) {
        addForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const word = document.getElementById("word").value.trim();
            const definition = document.getElementById("definition").value.trim();
            const messageEl = document.getElementById("message");

            if (!word || !definition || /\d/.test(word)) {
                messageEl.textContent = "Invalid input: Words must contain only letters.";
                return;
            }

            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word, definition })
            })
                .then(response => response.json())
                .then(data => messageEl.textContent = data.message)
                .catch(error => messageEl.textContent = "Error: " + error);
        });
    }

    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const searchWord = document.getElementById("searchWord").value.trim();
            const resultEl = document.getElementById("searchResult");

            if (!searchWord || /\d/.test(searchWord)) {
                resultEl.textContent = "Invalid input: Words must contain only letters.";
                return;
            }

            fetch(`${API_URL}/?word=${encodeURIComponent(searchWord)}`)
                .then(response => response.json())
                .then(data => {
                    resultEl.textContent = data.message || `${data.word}: ${data.definition}`;
                })
                .catch(error => resultEl.textContent = "Error: " + error);
        });
    }
});
