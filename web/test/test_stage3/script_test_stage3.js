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
// 获取当前对阵
// =========================
function getCurrentMatchups() {
    const scenario = document.getElementById("scenarioSelect").value;
    return firstRoundMatchesByScenario[scenario];
}


// =========================
// 所有轮次结果
// =========================
let roundResults = {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {}
};


// =========================
// 当前队伍状态
// =========================
let teams =
    createTeamsFromFirstRound(getCurrentMatchups());


// =========================
// 每一轮对应的战绩盒子
// =========================
const roundBoxes = {

    1: {
        "0-0": "zeroZero"
    },

    2: {
        "1-0": "oneZero",
        "0-1": "zeroOne"
    },

    3: {
        "2-0": "twoZero",
        "1-1": "oneOne",
        "0-2": "zeroTwo"
    },

    4: {
        "3-0": "threeZero",
        "2-1": "twoOne",
        "1-2": "oneTwo",
        "0-3": "zeroThree"
    },

    5: {
        "2-2": "twoTwo"
    }
};


// =========================
// 初始化页面
// =========================
renderRound1();
fillPickemSelects();


// =========================
// Scenario 切换 — 完全重置
// =========================
document.getElementById("scenarioSelect").addEventListener("change", () => {

    roundResults = {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {}
    };

    teams = createTeamsFromFirstRound(getCurrentMatchups());

    clearAllRounds();
    renderRound1();
    fillPickemSelects();
});


// =========================
// 显示 Round 1
// =========================
function renderRound1() {

    const zeroZeroBox =
        document.getElementById("zeroZero");

    zeroZeroBox.innerHTML = `
        <h3>0-0</h3>
    `;

    const matchups = getCurrentMatchups();

    matchups.forEach((match, index) => {

        zeroZeroBox.innerHTML += createMatchHTML(
            match[0],
            match[1],
            1,
            index
        );
    });

    addClickEventsForRound(1);
}


// =========================
// 生成一场比赛的 HTML
// =========================
function createMatchHTML(teamA, teamB, roundNumber, matchIndex) {

    return `

        <div class="matchCard"
             data-round="${roundNumber}"
             data-index="${matchIndex}">

            <button class="teamButton">
                ${teamA}
            </button>

            <span>VS</span>

            <button class="teamButton">
                ${teamB}
            </button>

        </div>

    `;
}


// =========================
// 选择胜者（视觉样式）
// =========================
function selectWinner(card, winnerButton, loserButton) {

    winnerButton.classList.add("winnerButton");
    winnerButton.classList.remove("loserButton");

    loserButton.classList.add("loserButton");
    loserButton.classList.remove("winnerButton");
}


// =========================
// 给某一轮的比赛绑定点击事件
// =========================
function addClickEventsForRound(roundNumber) {

    const cards =
        document.querySelectorAll(
            `.matchCard[data-round="${roundNumber}"]`
        );

    cards.forEach(card => {

        const index =
            card.dataset.index;

        const buttons =
            card.querySelectorAll(".teamButton");

        const teamAButton = buttons[0];
        const teamBButton = buttons[1];

        teamAButton.addEventListener("click", () => {

            saveMatchResult(
                roundNumber,
                index,
                teamAButton,
                teamBButton
            );

            rebuildAndRender();
        });

        teamBButton.addEventListener("click", () => {

            saveMatchResult(
                roundNumber,
                index,
                teamBButton,
                teamAButton
            );

            rebuildAndRender();
        });
    });
}


// =========================
// 保存某一场比赛的结果
// =========================
function saveMatchResult(
    roundNumber,
    index,
    winnerButton,
    loserButton
) {

    clearResultsAfterRound(roundNumber);

    roundResults[roundNumber][index] = {

        winner:
            winnerButton.textContent.trim(),

        loser:
            loserButton.textContent.trim()
    };
}


// =========================
// 清除后续轮次结果
// =========================
function clearResultsAfterRound(roundNumber) {

    for (let round = roundNumber + 1; round <= 5; round++) {

        if (roundResults[round]) {
            roundResults[round] = {};
        }
    }
}


// =========================
// 重新计算整个瑞士轮状态
// =========================
function rebuildAndRender() {

    teams =
        createTeamsFromFirstRound(getCurrentMatchups());

    clearFutureRounds();

    for (let round = 1; round <= 5; round++) {

        applyRoundResults(round);

        restoreSelections(round);

        renderFinalResults();

        if (!isRoundComplete(round)) {
            break;
        }

        if (round === 5) {
            break;
        }

        const nextRoundNumber =
            round + 1;

        const nextRound =
            generateNextRound(teams);

        renderRound(
            nextRoundNumber,
            nextRound
        );

        if (nextRoundNumber <= 5) {

            addClickEventsForRound(
                nextRoundNumber
            );
        }
    }

    renderFinalResults();
}


// =========================
// 应用某一轮已经选择的结果
// =========================
function applyRoundResults(roundNumber) {

    Object.values(
        roundResults[roundNumber]
    ).forEach(result => {

        recordMatchResult(
            teams,
            result.winner,
            result.loser
        );
    });
}


// =========================
// 判断某一轮是否已经点完
// =========================
function isRoundComplete(roundNumber) {

    const expectedMatchCount = {
        1: 8,
        2: 8,
        3: 8,
        4: 6,
        5: 3
    };

    return (
        Object.keys(roundResults[roundNumber]).length ===
        expectedMatchCount[roundNumber]
    );
}


// =========================
// 显示某一轮的所有对局
// =========================
function renderRound(roundNumber, roundData) {

    const boxes =
        roundBoxes[roundNumber];

    Object.keys(boxes).forEach(record => {

        const boxId =
            boxes[record];

        const matchups =
            roundData[record] || [];

        renderMatchupsToBox(
            boxId,
            record,
            matchups,
            roundNumber
        );
    });
}


// =========================
// 把某个战绩组的对局显示到页面
// =========================
function renderMatchupsToBox(
    boxId,
    record,
    matchups,
    roundNumber
) {

    const box =
        document.getElementById(boxId);

    box.innerHTML = `
        <h3>${record}</h3>
    `;

    matchups.forEach((match, index) => {

        box.innerHTML += createMatchHTML(
            match.a.name,
            match.b.name,
            roundNumber,
            `${boxId}-${index}`
        );
    });
}


// =========================
// 恢复某一轮已经选择过的按钮颜色
// =========================
function restoreSelections(roundNumber) {

    const cards =
        document.querySelectorAll(
            `.matchCard[data-round="${roundNumber}"]`
        );

    cards.forEach(card => {

        const index =
            card.dataset.index;

        const result =
            roundResults[roundNumber][index];

        if (!result) {
            return;
        }

        const buttons =
            card.querySelectorAll(".teamButton");

        const teamAButton = buttons[0];
        const teamBButton = buttons[1];

        if (
            teamAButton.textContent.trim() ===
            result.winner
        ) {

            selectWinner(
                card,
                teamAButton,
                teamBButton
            );
        }

        if (
            teamBButton.textContent.trim() ===
            result.winner
        ) {

            selectWinner(
                card,
                teamBButton,
                teamAButton
            );
        }
    });
}


// =========================
// 清空未来轮次
// =========================
function clearFutureRounds() {

    for (let round = 2; round <= 5; round++) {

        const boxes =
            roundBoxes[round];

        Object.keys(boxes).forEach(record => {

            const boxId =
                boxes[record];

            const box =
                document.getElementById(boxId);

            box.innerHTML = `
                <h3>${record}</h3>
            `;
        });
    }
}


// =========================
// 全部清空（Scenario 切换用）
// =========================
function clearAllRounds() {

    for (let round = 2; round <= 5; round++) {

        const boxes = roundBoxes[round];

        Object.keys(boxes).forEach(record => {

            const boxId = boxes[record];

            const box = document.getElementById(boxId);

            box.innerHTML = `<h3>${record}</h3>`;
        });
    }

    document.getElementById("threeZero").innerHTML = `<h3>3-0</h3>`;
    document.getElementById("zeroThree").innerHTML = `<h3>0-3</h3>`;
    document.getElementById("advancedFinal").innerHTML = `<h3>晋级</h3>`;
    document.getElementById("eliminatedFinal").innerHTML = `<h3>淘汰</h3>`;
}


// =========================
// 显示最终晋级/淘汰
// =========================
function renderFinalResults() {

    const threeZeroBox =
        document.getElementById("threeZero");

    const zeroThreeBox =
        document.getElementById("zeroThree");

    const advancedBox =
        document.getElementById("advancedFinal");

    const eliminatedBox =
        document.getElementById("eliminatedFinal");

    threeZeroBox.innerHTML = `<h3>3-0</h3>`;
    zeroThreeBox.innerHTML = `<h3>0-3</h3>`;
    advancedBox.innerHTML = `<h3>晋级</h3>`;
    eliminatedBox.innerHTML = `<h3>淘汰</h3>`;

    teams.forEach(team => {

        if (team.advanced && team.losses === 0) {

            threeZeroBox.innerHTML += `
                <div class="teamCard">${team.name}</div>
            `;
        }

        if (team.advanced && team.losses > 0) {

            advancedBox.innerHTML += `
                <div class="teamCard">${team.name}</div>
            `;
        }

        if (team.eliminated && team.wins === 0) {

            zeroThreeBox.innerHTML += `
                <div class="teamCard">${team.name}</div>
            `;
        }

        if (team.eliminated && team.wins > 0) {

            eliminatedBox.innerHTML += `
                <div class="teamCard">${team.name}</div>
            `;
        }
    });
}


// =========================
// 填充 Pick'Em 下拉框
// =========================
function fillPickemSelects() {

    const teamNames =
        getCurrentMatchups().flat();

    const options =
        `
        <option value="">Select Team</option>
        ${teamNames
            .map(team => `<option value="${team}">${team}</option>`)
            .join("")}
        `;

    document
        .querySelectorAll(".pickemSelect")
        .forEach(select => {
            select.innerHTML = options;
        });
}


// =========================
// 防止重复选择队伍
// =========================
document
    .querySelectorAll(".pickemSelect")
    .forEach(select => {

        select.addEventListener(
            "change",
            updatePickemOptions
        );
    });

function updatePickemOptions() {

    const selects =
        document.querySelectorAll(".pickemSelect");

    const selectedTeams = [];

    selects.forEach(select => {

        if (select.value !== "") {
            selectedTeams.push(select.value);
        }
    });

    selects.forEach(currentSelect => {

        const currentValue = currentSelect.value;

        Array.from(
            currentSelect.options
        ).forEach(option => {

            if (option.value === "") {
                return;
            }

            if (option.value === currentValue) {
                option.hidden = false;
                return;
            }

            option.hidden =
                selectedTeams.includes(option.value);
        });
    });
}


// =========================
// 读取用户 Pick'Em
// =========================
function getUserPickem() {

    return {
        threeZero: [
            document.getElementById("threeZeroPick1").value,
            document.getElementById("threeZeroPick2").value
        ].filter(team => team !== ""),

        advance: [
            document.getElementById("advancePick1").value,
            document.getElementById("advancePick2").value,
            document.getElementById("advancePick3").value,
            document.getElementById("advancePick4").value,
            document.getElementById("advancePick5").value,
            document.getElementById("advancePick6").value
        ].filter(team => team !== ""),

        zeroThree: [
            document.getElementById("zeroThreePick1").value,
            document.getElementById("zeroThreePick2").value
        ].filter(team => team !== "")
    };
}


// =========================
// 计算按钮
// =========================
document
    .getElementById("calculateMyPickemButton")
    .addEventListener("click", () => {

        const ratingData =
            getSavedStage3Ratings();

        const ratings =
            ratingData.ratings;

        const usingDefaultRatings =
            ratingData.usingDefault;

        const userPickem =
            getUserPickem();

        const passChance =
            calculateUserPassChance(
                userPickem,
                ratings,
                1000
            );

        document.getElementById("myPickemResultArea").innerHTML = `

            <h1>${(passChance * 100).toFixed(1)}%</h1>

            <p>Chance to reach 5 correct picks</p>

            ${
                usingDefaultRatings
                ? `
                    <p class="warningText">
                        没找到保存过的评分数据。
                        目前所有战队的胜率都是50%
                        <br>
                        想要更加准确的结果，
                        请先去 Stage 3 Simulator 保存评分。
                    </p>
                `
                : `
                    <p class="successText">
                        已使用你保存过的数据
                    </p>
                `
            }

        `;
    });


// =========================
// 复制当前队伍状态
// =========================
function cloneTeams(currentTeams) {

    return currentTeams.map(team => {

        return {
            ...team,
            opponents: [...team.opponents]
        };
    });
}


// =========================
// 从当前状态继续模拟剩余瑞士轮
// 使用 Logistic 模型
// =========================
function simulateRemainingTournament(currentTeams, ratings) {

    const simulatedTeams =
        cloneTeams(currentTeams);

    const k = 1;

    for (let round = 1; round <= 5; round++) {

        const nextRound =
            generateNextRound(simulatedTeams);

        Object.values(nextRound).forEach(matchups => {

            matchups.forEach(match => {

                const teamA =
                    match.a.name;

                const teamB =
                    match.b.name;

                const ratingA =
                    ratings[teamA] || 5;

                const ratingB =
                    ratings[teamB] || 5;

                const diff =
                    ratingA - ratingB;

                const teamAWinRate =
                    1 / (1 + Math.exp(-k * diff));

                let winner;
                let loser;

                if (Math.random() < teamAWinRate) {
                    winner = teamA;
                    loser = teamB;
                } else {
                    winner = teamB;
                    loser = teamA;
                }

                recordMatchResult(
                    simulatedTeams,
                    winner,
                    loser
                );
            });
        });
    }

    return simulatedTeams;
}


// =========================
// 计算用户 Pick'Em 对了几个
// =========================
function countUserCorrectPickem(
    userPickem,
    finalTeams
) {

    let correct = 0;

    finalTeams.forEach(team => {

        if (
            userPickem.threeZero.includes(team.name) &&
            team.wins === 3 &&
            team.losses === 0
        ) {
            correct++;
        }

        if (
            userPickem.advance.includes(team.name) &&
            team.advanced &&
            team.losses > 0
        ) {
            correct++;
        }

        if (
            userPickem.zeroThree.includes(team.name) &&
            team.wins === 0 &&
            team.losses === 3
        ) {
            correct++;
        }
    });

    return correct;
}


// =========================
// 计算用户通过概率
// =========================
function calculateUserPassChance(
    userPickem,
    ratings,
    simulationCount = 1000
) {

    let passCount = 0;

    for (let i = 0; i < simulationCount; i++) {

        const finalTeams =
            simulateRemainingTournament(
                teams,
                ratings
            );

        const correct =
            countUserCorrectPickem(
                userPickem,
                finalTeams
            );

        if (correct >= 5) {
            passCount++;
        }
    }

    return passCount / simulationCount;
}


// =========================
// 读取 Stage 3 Simulator 保存的评分
// =========================
function getSavedStage3Ratings() {

    const savedRatings =
        localStorage.getItem("stage3Ratings");

    if (savedRatings) {

        return {
            ratings: JSON.parse(savedRatings),
            usingDefault: false
        };
    }

    const defaultRatings = {};

    getCurrentMatchups()
        .flat()
        .forEach(team => {

            defaultRatings[team] = 5;
        });

    return {
        ratings: defaultRatings,
        usingDefault: true
    };
}
