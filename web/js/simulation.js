// =========================
// 队伍对象
// =========================
class Team {
    constructor(name, rating, seed) {
        this.name = name;
        this.rating = rating;
        this.seed = seed;

        this.wins = 0;
        this.losses = 0;

        this.advanced = false;
        this.eliminated = false;

        this.opponents = [];
    }
}

// =========================
// 根据双方评分计算 A 队胜率
// =========================
function getWinProbability(ratingA, ratingB) {
    let p = 0.5 + (ratingA - ratingB) * 0.05;

    if (p < 0.05) p = 0.05;
    if (p > 0.95) p = 0.95;

    return p;
}

// =========================
// 检查两队是否交手过
// =========================
function playedBefore(team, opponentName) {
    return team.opponents.includes(opponentName);
}

// =========================
// 模拟一场比赛
// =========================
function playMatch(match) {
    const teamA = match.a;
    const teamB = match.b;

    const probabilityA =
        getWinProbability(teamA.rating, teamB.rating);

    let winner;
    let loser;

    if (Math.random() < probabilityA) {
        winner = teamA;
        loser = teamB;
    } else {
        winner = teamB;
        loser = teamA;
    }

    winner.wins++;
    loser.losses++;

    winner.opponents.push(loser.name);
    loser.opponents.push(winner.name);

    if (winner.wins === 3) {
        winner.advanced = true;
    }

    if (loser.losses === 3) {
        loser.eliminated = true;
    }
}

// =========================
// 计算 Buchholz 分数
// Buchholz = 所有对手当前胜场数之和
// =========================
function getBuchholzScore(team, allTeams) {
    let score = 0;

    team.opponents.forEach(opponentName => {
        const opponent = allTeams.find(
            t => t.name === opponentName
        );

        if (opponent) {
            score += opponent.wins;
        }
    });

    return score;
}

// =========================
// 根据当前战绩生成下一轮对阵
// 规则：
// 1. 同战绩分组
// 2. Buchholz 高的排前面
// 3. Buchholz 相同则 seed 小的排前面
// 4. 高排名优先打低排名
// 5. 尽量避免重复交手
// =========================
function generateNextRound(teams) {
    let matches = [];

    for (let w = 0; w <= 2; w++) {
        for (let l = 0; l <= 2; l++) {

            let group = teams.filter(team =>
                !team.advanced &&
                !team.eliminated &&
                team.wins === w &&
                team.losses === l
            );

            if (group.length < 2) {
                continue;
            }

            group.sort((a, b) => {
                const buchholzA =
                    getBuchholzScore(a, teams);

                const buchholzB =
                    getBuchholzScore(b, teams);

                if (buchholzB !== buchholzA) {
                    return buchholzB - buchholzA;
                }

                return a.seed - b.seed;
            });

            while (group.length >= 2) {
                const teamA = group[0];

                let opponentIndex = -1;

                for (let i = group.length - 1; i >= 1; i--) {
                    if (!playedBefore(teamA, group[i].name)) {
                        opponentIndex = i;
                        break;
                    }
                }

                if (opponentIndex === -1) {
                    opponentIndex = group.length - 1;
                }

                const teamB = group[opponentIndex];

                matches.push({
                    a: teamA,
                    b: teamB
                });

                group.splice(opponentIndex, 1);
                group.splice(0, 1);
            }
        }
    }

    return matches;
}

// =========================
// 运行一次完整瑞士轮模拟
// 注意：teamsData 的顺序就是 HLTV 内部 seed 顺序
// index + 1 会变成 seed
// =========================
function runSimulation(teamsData, firstRoundMatches) {
    let teams = [];

    teamsData.forEach((team, index) => {
        teams.push(
            new Team(
                team.name,
                team.rating,
                index + 1
            )
        );
    });

    let teamMap = {};

    teams.forEach(team => {
        teamMap[team.name] = team;
    });

    let currentMatches = [];

    firstRoundMatches.forEach(match => {
        currentMatches.push({
            a: teamMap[match.a],
            b: teamMap[match.b]
        });
    });

    currentMatches.forEach(match => {
        playMatch(match);
    });

    while (true) {
        let unfinishedTeams = teams.filter(team =>
            !team.advanced &&
            !team.eliminated
        );

        if (unfinishedTeams.length === 0) {
            break;
        }

        currentMatches =
            generateNextRound(teams);

        currentMatches.forEach(match => {
            playMatch(match);
        });
    }

    return teams;
}

// =========================
// Monte Carlo 模拟
// =========================
function runMonteCarlo(
    teamsData,
    firstRoundMatches,
    simulationCount
) {
    let stats = {};
    let simulationResults = [];

    teamsData.forEach(team => {
        stats[team.name] = {
            threeZero: 0,
            normalAdvance: 0,
            zeroThree: 0
        };
    });

    for (let i = 0; i < simulationCount; i++) {
        const result =
            runSimulation(
                teamsData,
                firstRoundMatches
            );

        simulationResults.push(result);

        result.forEach(team => {
            if (team.wins === 3 && team.losses === 0) {
                stats[team.name].threeZero++;
            }

            if (
                team.wins === 3 &&
                (team.losses === 1 || team.losses === 2)
            ) {
                stats[team.name].normalAdvance++;
            }

            if (team.wins === 0 && team.losses === 3) {
                stats[team.name].zeroThree++;
            }
        });
    }

    return {
        stats: stats,
        simulationResults: simulationResults
    };
}

// =========================
// 计算一套 Pick'Em 命中几个
// =========================
function countCorrectPicks(simulationResult, pickEm) {
    let correctCount = 0;

    pickEm.threeZero.forEach(teamName => {
        const team = simulationResult.find(
            team => team.name === teamName
        );

        if (team.wins === 3 && team.losses === 0) {
            correctCount++;
        }
    });

    pickEm.advance.forEach(teamName => {
        const team = simulationResult.find(
            team => team.name === teamName
        );

        if (team.wins === 3) {
            correctCount++;
        }
    });

    pickEm.zeroThree.forEach(teamName => {
        const team = simulationResult.find(
            team => team.name === teamName
        );

        if (team.wins === 0 && team.losses === 3) {
            correctCount++;
        }
    });

    return correctCount;
}

// =========================
// 计算一套 Pick'Em 的保5成功率
// =========================
function evaluatePickEm(
    simulationResults,
    pickEm
) {
    let successCount = 0;

    simulationResults.forEach(simulationResult => {
        const correctCount =
            countCorrectPicks(
                simulationResult,
                pickEm
            );

        if (correctCount >= 5) {
            successCount++;
        }
    });

    return (
        successCount /
        simulationResults.length
    );
}