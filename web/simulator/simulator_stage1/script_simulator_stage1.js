// =========================
// Stage 1 第一轮固定对阵
// =========================
const firstRoundMatches = [
    ["GamerLegion", "NRG"],
    ["B8", "TYLOO"],
    ["HEROIC", "Sharks"],
    ["BetBoom", "Gaimin Gladiators"],
    ["BIG", "Liquid"],
    ["M80", "Lynn Vision"],
    ["MIBR", "Thunder dOWNUNDER"],
    ["SINNERS", "FlyQuest"]
];


// =========================
// 页面元素
// =========================
const matchupInputArea =
    document.getElementById("matchupInputArea");

const ratingInputArea =
    document.getElementById("ratingInputArea");

const runSimulationButton =
    document.getElementById("runSimulationButton");


// =========================
// 页面初始化
// =========================
renderMatchups();

renderRatingInputs();

// =========================
// 显示第一轮对阵
// =========================
function renderMatchups() {

    // 先清空旧内容
    matchupInputArea.innerHTML = "";

    // 遍历所有第一轮对阵
    firstRoundMatches.forEach(match => {

        matchupInputArea.innerHTML += `

            <div class="matchCard">

                <!-- 左边队伍 -->
                <button class="teamButton">
                    ${match[0]}
                </button>

                <!-- VS -->
                <span>VS</span>

                <!-- 右边队伍 -->
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
function getStage1TeamOrder() {

    let teams = [];

    firstRoundMatches.forEach(match => {
        teams.push(match[0]);
    });

    firstRoundMatches.forEach(match => {
        teams.push(match[1]);
    });

    return teams;
}


// =========================
// 显示评分输入框
//
// 排列方式和左边第一轮对阵一致：
// 每一行显示一组对阵双方的 rating
// =========================
function renderRatingInputs() {

    ratingInputArea.innerHTML = "";

    firstRoundMatches.forEach(match => {

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
runSimulationButton.addEventListener("click", () => {

    const ratings =
        getRatingsFromInput();

    const results =
        runMonteCarlo(
            firstRoundMatches,
            ratings,
            10000
        );

    renderSimulationResults(results);

    // =========================
    // 生成 Pick'Em 推荐
    // =========================
    const recommendation =
        generatePickemRecommendation(
            results
        );

    renderRecommendation(
        recommendation
    );
});

// =========================
// 显示模拟结果
// =========================
function renderSimulationResults(results) {

    resultArea.innerHTML = "";

    const sortedTeams =
        Object.keys(results).sort((a, b) => {
            return results[b].advanced - results[a].advanced;
        });

    sortedTeams.forEach(teamName => {

        const advanceRate =
            (
                results[teamName].advanced / 10000 * 100
            ).toFixed(1);

        resultArea.innerHTML += `

            <div class="resultRow">

                <span>${teamName}</span>

                <span>${advanceRate}%</span>

            </div>

        `;
    });
}

// =========================
// 显示推荐结果
// =========================
function renderRecommendation(recommendation) {

    const area =
        document.getElementById(
            "recommendationArea"
        );

    area.innerHTML = `

        <h3>Recommended 3-0</h3>

        ${recommendation.threeZero
            .map(team =>
                `<div>${team}</div>`
            )
            .join("")}

        <h3>Recommended Advance</h3>

        ${recommendation.advance
            .map(team =>
                `<div>${team}</div>`
            )
            .join("")}

        <h3>Recommended 0-3</h3>

        ${recommendation.zeroThree
            .map(team =>
                `<div>${team}</div>`
            )
            .join("")}
    `;
}