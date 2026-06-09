// =========================
// Stage 3 第一轮对阵 — 两个 Scenario
//
// Scenario A: BIG 晋级
// Scenario B: B8 晋级
// =========================
const firstRoundMatchesByScenario = {
    A: [
        ["Vitality", "Spirit"],
        ["NAVI", "FUT"],
        ["FALCONS", "G2"],
        ["MongolZ", "BetBoom"],
        ["PV", "9z"],
        ["Aurora", "monte"],
        ["FURIA", "BIG"],
        ["MOUZ", "Legacy"]
    ],
    B: [
        ["Vitality", "FUT"],
        ["NAVI", "Spirit"],
        ["FALCONS", "G2"],
        ["MongolZ", "BetBoom"],
        ["PV", "9z"],
        ["Aurora", "monte"],
        ["FURIA", "B8"],
        ["MOUZ", "Legacy"]
    ]
};


// =========================
// 页面元素
// =========================
const scenarioSelect =
    document.getElementById("scenarioSelect");

const matchupInputArea =
    document.getElementById("matchupInputArea");

const ratingInputArea =
    document.getElementById("ratingInputArea");

const runSimulationButton =
    document.getElementById("runSimulationButton");

const saveRatingsButton =
    document.getElementById("saveRatingsButton");

const loadRatingsButton =
    document.getElementById("loadRatingsButton");

const statusMessage =
    document.getElementById("statusMessage");


// =========================
// 获取当前选中的 Scenario
// =========================
function getCurrentScenario() {
    return scenarioSelect.value;
}


// =========================
// 获取当前对阵
// =========================
function getCurrentMatchups() {
    return firstRoundMatchesByScenario[getCurrentScenario()];
}


// =========================
// 页面初始化
// =========================
renderMatchups();
renderRatingInputs();


// =========================
// Scenario 切换时重新渲染
// =========================
scenarioSelect.addEventListener("change", () => {

    renderMatchups();
    renderRatingInputs();

    // 有已保存评分的话尝试载入
    const savedRatings = localStorage.getItem("stage3Ratings");
    if (savedRatings) {
        const ratings = JSON.parse(savedRatings);
        applyRatingsToInputs(ratings);
    }
});


// =========================
// 显示第一轮对阵
// =========================
function renderMatchups() {

    matchupInputArea.innerHTML = "";

    const matchups = getCurrentMatchups();

    matchups.forEach(match => {

        matchupInputArea.innerHTML += `

            <div class="matchCard">

                <button class="teamButton">
                    ${match[0]}
                </button>

                <span>VS</span>

                <button class="teamButton">
                    ${match[1]}
                </button>

            </div>

        `;
    });
}


// =========================
// 根据第一轮对阵生成队伍顺序
// 左列 Seed 1-8
// 右列 Seed 9-16
// =========================
function getStage3TeamOrder() {

    let teams = [];

    const matchups = getCurrentMatchups();

    matchups.forEach(match => {
        teams.push(match[0]);
    });

    matchups.forEach(match => {
        teams.push(match[1]);
    });

    return teams;
}


// =========================
// 显示评分输入框
// =========================
function renderRatingInputs() {

    ratingInputArea.innerHTML = "";

    const matchups = getCurrentMatchups();

    matchups.forEach(match => {

        ratingInputArea.innerHTML += `

            <div class="ratingMatchRow">

                <div class="ratingTeamBox">
                    <span>${match[0]}</span>

                    <input
                        class="ratingInput"
                        type="number"
                        min="1"
                        max="10"
                        value="5"
                        data-team="${match[0]}"
                    >
                </div>

                <span class="ratingVs">VS</span>

                <div class="ratingTeamBox">
                    <span>${match[1]}</span>

                    <input
                        class="ratingInput"
                        type="number"
                        min="1"
                        max="10"
                        value="5"
                        data-team="${match[1]}"
                    >
                </div>

            </div>

        `;
    });
}


// =========================
// 把已保存的评分填回输入框
// =========================
function applyRatingsToInputs(ratings) {

    document
        .querySelectorAll(".ratingInput")
        .forEach(input => {

            const teamName = input.dataset.team;

            if (ratings[teamName] !== undefined) {
                input.value = ratings[teamName];
            }
        });
}


const resultArea =
    document.getElementById("resultArea");


// =========================
// 读取 rating 输入
// =========================
function getRatingsFromInput() {

    let ratings = {};

    document
        .querySelectorAll(".ratingInput")
        .forEach(input => {

            ratings[input.dataset.team] =
                Number(input.value);
        });

    return ratings;
}


// =========================
// 点击开始模拟
// =========================
runSimulationButton.addEventListener(
    "click",
    () => {

        const ratings =
            getRatingsFromInput();

        const matchups =
            getCurrentMatchups();

        // =========================
        // 运行 Monte Carlo
        // =========================
        const monteCarloResult =
            runMonteCarlo(
                matchups,
                ratings,
                10000
            );

        const results =
            monteCarloResult.stats;

        const simulationResults =
            monteCarloResult.simulationResults;

        // =========================
        // 显示结果区域
        // =========================
        document
            .getElementById("resultsSection")
            .style.display =
            "block";

        // =========================
        // 显示模拟结果
        // =========================
        renderSimulationResults(results);

        // =========================
        // 自动滚动到结果区域
        // =========================
        document
            .getElementById("resultsSection")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        // =========================
        // 生成推荐
        // =========================
        const recommendation =
            generatePickemRecommendation(results);

        const bestPickemToggle =
            document.getElementById("bestPickemToggle");

        renderRecommendation(recommendation);

        if (bestPickemToggle.checked) {

            console.log("开始计算保5最优推荐");

            const bestPickemRecommendation =
                generateBestPickemRecommendation(
                    results,
                    simulationResults
                );

            renderBestPickemRecommendation(
                bestPickemRecommendation
            );
        }
    }
);


// =========================
// 显示模拟结果
// =========================
function renderSimulationResults(results) {

    resultArea.innerHTML = "";

    const sortedTeams =
        Object.keys(results).sort((a, b) => {
            return results[b].advanced - results[a].advanced;
        });

    resultArea.innerHTML += `

        <div class="resultHeader">

            <span>Team</span>
            <span>3-0</span>
            <span>Advance</span>
            <span>0-3</span>

        </div>

    `;

    sortedTeams.forEach(teamName => {

        const threeZeroRate =
            (
                results[teamName].threeZero / 10000 * 100
            ).toFixed(1);

        const advanceRate =
            (
                results[teamName].advanced / 10000 * 100
            ).toFixed(1);

        const zeroThreeRate =
            (
                results[teamName].zeroThree / 10000 * 100
            ).toFixed(1);

        resultArea.innerHTML += `

            <div class="resultRow">

                <span>${teamName}</span>

                <span>${threeZeroRate}%</span>

                <span>${advanceRate}%</span>

                <span>${zeroThreeRate}%</span>

            </div>

        `;
    });
}


// =========================
// 显示推荐结果
// =========================
function renderRecommendation(recommendation) {

    const area =
        document.getElementById("recommendationArea");

    area.innerHTML = `

        <h3>Recommended 3-0</h3>

        ${recommendation.threeZero
            .map(team => `<div>${team}</div>`)
            .join("")}

        <h3>Recommended Advance</h3>

        ${recommendation.advance
            .map(team => `<div>${team}</div>`)
            .join("")}

        <h3>Recommended 0-3</h3>

        ${recommendation.zeroThree
            .map(team => `<div>${team}</div>`)
            .join("")}
    `;
}


// =========================
// 保存评分
// =========================
saveRatingsButton.addEventListener("click", () => {

    const ratings = getRatingsFromInput();

    localStorage.setItem(
        "stage3Ratings",
        JSON.stringify(ratings)
    );

    showStatus("✓ 评分已保存");
});


// =========================
// 载入评分
// =========================
loadRatingsButton.addEventListener("click", () => {

    const savedRatings =
        localStorage.getItem("stage3Ratings");

    if (!savedRatings) {
        showStatus("没有找到已保存的评分");
        return;
    }

    const ratings = JSON.parse(savedRatings);
    applyRatingsToInputs(ratings);

    showStatus("✓ 评分已载入");
});


// =========================
// 显示状态提示（淡入淡出）
// =========================
function showStatus(message) {

    statusMessage.textContent = message;
    statusMessage.style.opacity = "1";

    setTimeout(() => {

        statusMessage.style.opacity = "0";

        setTimeout(() => {
            statusMessage.textContent = "";
        }, 500);

    }, 2000);
}


// =========================
// 显示保5最优推荐
// =========================
function renderBestPickemRecommendation(recommendation) {

    const area =
        document.getElementById("recommendationArea");

    area.innerHTML += `

        <hr>

        <h2>保通过的最佳推荐</h2>

        <h3>
            Pass Chance:
            ${(recommendation.passChance * 100).toFixed(1)}%
        </h3>

        <h3>Best 3-0</h3>

        ${recommendation.threeZero
            .map(team => `<div>${team}</div>`)
            .join("")}

        <h3>Best Advance</h3>

        ${recommendation.advance
            .map(team => `<div>${team}</div>`)
            .join("")}

        <h3>Best 0-3</h3>

        ${recommendation.zeroThree
            .map(team => `<div>${team}</div>`)
            .join("")}
    `;
}
