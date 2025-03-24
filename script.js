const workerUrl = "https://kao88.github.io/ex/sqlite.worker.js"; // 替換為你的實際路徑
const wasmUrl = "https://kao88.github.io/ex/sql-wasm.wasm"; // 替換為你的實際路徑
let dbWorker;
let questions = [];
let currentQuestionIndex = 0;

// 檢查 createDbWorker 是否存在
console.log("createDbWorker 是否存在:", typeof createDbWorker);

async function initDatabase() {
    try {
        console.log("正在初始化數據庫...");
        if (typeof createDbWorker !== "function") {
            throw new Error("createDbWorker 未定義，請檢查 sql.js-httpvfs 腳本是否正確加載");
        }
        dbWorker = await createDbWorker(
            [{
                from: "inline",
                config: {
                    serverMode: "full",
                    requestChunkSize: 4096,
                    url: "https://kao88.github.io/ex/db.db" // 替換為你的實際路徑
                }
            }],
            workerUrl,
            wasmUrl
        );
        console.log("數據庫初始化成功");
    } catch (error) {
        console.error("數據庫初始化失敗:", error);
        throw error;
    }
}

async function loadQuestions() {
    try {
        console.log("正在加載題目...");
        const result = await dbWorker.db.exec("SELECT * FROM quiz ORDER BY RANDOM() LIMIT 5");
        if (!result[0] || !result[0].values) {
            throw new Error("未找到題目數據");
        }
        questions = result[0].values.map(row => ({
            question_id: row[0],
            question: row[1],
            answer: row[2],
            options: [row[3], row[4], row[5], row[6]],
            explanation: row[7]
        }));
        console.log("題目加載成功:", questions);
    } catch (error) {
        console.error("加載題目失敗:", error);
        throw error;
    }
}

function displayQuestion() {
    try {
        console.log("正在顯示題目:", currentQuestionIndex);
        const quizContainer = document.getElementById("quizContainer");
        const questionNumber = document.getElementById("questionNumber");
        const questionText = document.getElementById("questionText");
        const optionsList = document.getElementById("options");
        const userAnswer = document.getElementById("userAnswer");
        const feedback = document.getElementById("feedback");
        const explanation = document.getElementById("explanation");

        quizContainer.style.display = "block";
        feedback.innerHTML = "";
        explanation.style.display = "none";
        userAnswer.value = "";

        const currentQuestion = questions[currentQuestionIndex];
        questionNumber.textContent = `題號 ${currentQuestion.question_id}`;
        questionText.textContent = currentQuestion.question;
        optionsList.innerHTML = currentQuestion.options.map((opt, i) => `<li>${i + 1}. ${opt}</li>`).join("");
    } catch (error) {
        console.error("顯示題目失敗:", error);
    }
}

function checkAnswer() {
    try {
        const userAnswer = parseInt(document.getElementById("userAnswer").value);
        const feedback = document.getElementById("feedback");
        const explanation = document.getElementById("explanation");
        const currentQuestion = questions[currentQuestionIndex];

        if (isNaN(userAnswer) || userAnswer < 1 || userAnswer > 4) {
            alert("請輸入 1-4 之間的數字");
            return;
        }

        if (userAnswer === currentQuestion.answer) {
            feedback.innerHTML = '<div class="correct"></div>';
            setTimeout(nextQuestion, 2000);
        } else {
            feedback.innerHTML = '<div class="incorrect"></div>';
            explanation.textContent = currentQuestion.explanation;
            explanation.style.display = "block";
            setTimeout(nextQuestion, 5000);
        }
    } catch (error) {
        console.error("檢查答案失敗:", error);
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    document.getElementById("quizContainer").style.display = "none";
    const result = document.getElementById("result");
    result.style.display = "block";
    setTimeout(() => {
        window.location.href = "indexa.html";
    }, 3000);
}

document.getElementById("startQuiz").addEventListener("click", async () => {
    try {
        document.getElementById("startQuiz").style.display = "none";
        await initDatabase();
        await loadQuestions();
        displayQuestion();
    } catch (error) {
        console.error("測驗啟動失敗:", error);
        alert("無法啟動測驗，請檢查控制台以獲取更多信息");
        document.getElementById("startQuiz").style.display = "block";
    }
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").then(
            () => console.log("Service Worker 註冊成功"),
            err => console.log("Service Worker 註冊失敗:", err)
        );
    });
}