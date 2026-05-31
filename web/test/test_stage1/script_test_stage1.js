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
// 所有轮次结果
//
// roundResults[1] = Round 1 结果
// roundResults[2] = Round 2 结果
// roundResults[3] = Round 3 结果
// roundResults[4] = Round 4 结果
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
// 每次点击后都会重新生成
// =========================
let teams =
    createTeamsFromFirstRound(
        firstRoundMatches
    );


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


// =========================
// 显示 Round 1
// =========================
function renderRound1() {

    const zeroZeroBox =
        document.getElementById("zeroZero");

    zeroZeroBox.innerHTML = `
        <h3>0-0</h3>
    `;

    firstRoundMatches.forEach((match, index) => {

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
// 选择胜者
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
//
// 如果改了 Round 2
// 那 Round 3、4、5 的旧结果都不能保留
//
// 如果改了 Round 4
// 那 Round 5 的旧结果不能保留
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
//
// 核心思想：
// 不在旧 teams 上反复加胜负
// 每次点击后都从 0-0 重新计算
// =========================
function rebuildAndRender() {

    teams =
        createTeamsFromFirstRound(
            firstRoundMatches
        );

    clearFutureRounds();

    for (let round = 1; round <= 5; round++) {

        applyRoundResults(round);

        restoreSelections(round);

        renderFinalResults();

        if (!isRoundComplete(round)) {
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
//
// 每次重新计算前，先把 Round2-Round5 清空
// 然后再根据当前结果重新渲染
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