// =========================
// 根据 rating 随机决定一场比赛胜者
//
// 使用 Logistic / Sigmoid 模型：
// P(A赢) = 1 / (1 + e^{-k * (ratingA - ratingB)})
//
// k = 1:
//   rating 差 1 分 ≈ 73%
//   rating 差 2 分 ≈ 88%
//   rating 差 3 分 ≈ 95%
//   rating 相等     = 50%
// =========================
function simulateMatch(teamA, teamB) {

    const k = 1;
    const diff = teamA.rating - teamB.rating;

    const teamAWinRate =
        1 / (1 + Math.exp(-k * diff));

    if (Math.random() < teamAWinRate) {
        return {
            winner: teamA,
            loser: teamB
        };
    }

    return {
        winner: teamB,
        loser: teamA
    };
}


// =========================
// 模拟一次完整 Stage 1
// =========================
function simulateOneTournament(firstRoundMatches, ratings) {

    let teams =
        createTeamsFromFirstRound(
            firstRoundMatches,
            ratings
        );

    let currentRound = {
        "0-0": firstRoundMatches.map(match => {
            return {
                a: getTeamByName(teams, match[0]),
                b: getTeamByName(teams, match[1])
            };
        })
    };

    for (let round = 1; round <= 5; round++) {

        Object.values(currentRound).forEach(group => {

            group.forEach(match => {

                const result =
                    simulateMatch(match.a, match.b);

                recordMatchResult(
                    teams,
                    result.winner.name,
                    result.loser.name
                );
            });
        });

        currentRound =
            generateNextRound(teams);
    }

    return teams;
}


// =========================
// Monte Carlo 多次模拟
// =========================
function runMonteCarlo(firstRoundMatches, ratings, simulationCount = 10000) {

    let stats = {};

    // =========================
    // 保存每一次完整模拟结果
    //
    // 后面保5推荐会直接复用
    // 不需要重新模拟
    // =========================
    let simulationResults = [];

    const teamNames =
        Object.keys(ratings);

    teamNames.forEach(teamName => {

        stats[teamName] = {
            advanced: 0,
            eliminated: 0,
            threeZero: 0,
            zeroThree: 0
        };
    });

    for (let i = 0; i < simulationCount; i++) {

        const resultTeams =
            simulateOneTournament(
                firstRoundMatches,
                ratings
            );

        // =========================
        // 保存本次模拟结果
        // =========================
        simulationResults.push(
            resultTeams
        );

        resultTeams.forEach(team => {

            if (team.advanced) {
                stats[team.name].advanced++;
            }

            if (team.eliminated) {
                stats[team.name].eliminated++;
            }

            if (team.wins === 3 && team.losses === 0) {
                stats[team.name].threeZero++;
            }

            if (team.wins === 0 && team.losses === 3) {
                stats[team.name].zeroThree++;
            }
        });
    }

    return {

        stats: stats,

        simulationResults:
            simulationResults
    };
}