// =========================
// Monte Carlo Simulator
//
// 这个文件负责“跑很多次可能的比赛结果”。
// 它会复用 simulation.js 里的瑞士轮规则，然后统计每支队伍晋级、淘汰、3-0、0-3 的概率。
// =========================


// 根据两队 rating 随机决定一场比赛胜者。
// rating 越高，抽到胜利的概率越高；rating 一样就是 50/50。
function simulateMatch(teamA, teamB) {

    const totalRating =
        teamA.rating + teamB.rating;

    const teamAWinRate =
        teamA.rating / totalRating;

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


// 模拟一次完整 Stage。
// 从第一轮开始打，最多生成到第五轮，最终返回所有队伍的胜负状态。
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


// Monte Carlo 多次模拟入口。
// stats 用来展示概率表，simulationResults 会交给 Pick'Em 推荐系统继续复用。
function runMonteCarlo(firstRoundMatches, ratings, simulationCount = 10000) {

    let stats = {};
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

        // 保存这一次完整模拟，后面算“最佳 Pick'Em”时不用重新跑比赛。
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
        simulationResults: simulationResults
    };
}
