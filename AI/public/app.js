const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const questionForm = document.getElementById("questionForm");
const answer = document.getElementById("answer");

questionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = questionInput.value;
  console.log(question);
  const result = await askQuestion(question);
  console.log(result);
  answer.textContent = result;
});

async function askQuestion(question) {
    try {
        const response = await fetch("/api/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question }),
        });
        const data = await response.json();
        return data.answer;
    }
    catch (error) {
        console.error("Error asking question:", error);
        return "Sorry, there was an error processing your question.";
    }
}
