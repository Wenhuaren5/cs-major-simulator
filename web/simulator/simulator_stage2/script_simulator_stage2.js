// =========================
// Stage 2 Simulator Page
//
// 这个页面负责：
// 1. 从当前 Major 读取 Stage 2 第一轮对阵
// 2. 让用户输入每支队伍 rating
// 3. 跑 Monte Carlo 模拟并输出概率
// 4. 根据模拟结果生成 Pick'Em 推荐
// =========================

// =========================
// Stage 2 第一轮固定对阵
// =========================
const firstRoundMatches =
    majorManager.getFirstRoundMatchesForStage("stage2");


// =========================
// 页面元素
// =========================
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
function getStage2TeamOrder() {

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
runSimulationButton.addEventListener(
    "click",
    () => {

        const ratings =
            getRatingsFromInput();

        // =========================
        // 运行 Monte Carlo
        // 返回统计结果和每一次模拟结果
        // =========================
        const monteCarloResult =
            runMonteCarlo(
                firstRoundMatches,
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
            .getElementById(
                "resultsSection"
            )
            .style.display =
            "block";

        // =========================
        // 显示模拟结果
        // =========================
        renderSimulationResults(
            results
        );

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
            generatePickemRecommendation(
                results
            );

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

    // =========================
    // 表头
    // =========================
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
        document.getElementById(
            "recommendationArea"
        );

    area.innerHTML = `

        <div class="pickemRecommendation">

            <section class="pickemRecommendationGroup">
                <h3>3-0</h3>
                <div class="pickemRecommendationTeams twoTeams">
                    ${recommendation.threeZero
                        .map(team => `<span>${team}</span>`)
                        .join("")}
                </div>
            </section>

            <section class="pickemRecommendationGroup">
                <h3>Advance</h3>
                <div class="pickemRecommendationTeams advanceTeams">
                    ${recommendation.advance
                        .map(team => `<span>${team}</span>`)
                        .join("")}
                </div>
            </section>

            <section class="pickemRecommendationGroup">
                <h3>0-3</h3>
                <div class="pickemRecommendationTeams twoTeams">
                    ${recommendation.zeroThree
                        .map(team => `<span>${team}</span>`)
                        .join("")}
                </div>
            </section>

        </div>
    `;
}

// =========================
// 保存评分
// =========================
saveRatingsButton.addEventListener("click", () => {

    const ratings =
        getRatingsFromInput();

    localStorage.setItem(
        majorManager.getMajorScopedKey("stage2Ratings"),
        JSON.stringify(ratings)
    );

    showStatus("✓ 评分已保存");
});


// =========================
// 载入评分
// =========================
loadRatingsButton.addEventListener("click", () => {

    const savedRatings =
        localStorage.getItem(
            majorManager.getMajorScopedKey("stage2Ratings")
        );

    if (!savedRatings) {
        showStatus("没有找到已保存的评分");
        return;
    }

    const ratings =
        JSON.parse(savedRatings);

    document
        .querySelectorAll(".ratingInput")
        .forEach(input => {

            const teamName =
                input.dataset.team;

            if (ratings[teamName] !== undefined) {
                input.value = ratings[teamName];
            }
        });

    showStatus("✓ 评分已载入");
});


// =========================
// 显示状态提示（淡入淡出）
// =========================
function showStatus(message) {

    statusMessage.textContent =
        message;

    // 淡入
    statusMessage.style.opacity = "1";

    setTimeout(() => {

        // 淡出
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

        <div class="pickemRecommendation">

            <section class="pickemRecommendationGroup">
                <h3>Best 3-0</h3>
                <div class="pickemRecommendationTeams twoTeams">
                    ${recommendation.threeZero
                        .map(team => `<span>${team}</span>`)
                        .join("")}
                </div>
            </section>

            <section class="pickemRecommendationGroup">
                <h3>Best Advance</h3>
                <div class="pickemRecommendationTeams advanceTeams">
                    ${recommendation.advance
                        .map(team => `<span>${team}</span>`)
                        .join("")}
                </div>
            </section>

            <section class="pickemRecommendationGroup">
                <h3>Best 0-3</h3>
                <div class="pickemRecommendationTeams twoTeams">
                    ${recommendation.zeroThree
                        .map(team => `<span>${team}</span>`)
                        .join("")}
                </div>
            </section>

        </div>
    `;
}
