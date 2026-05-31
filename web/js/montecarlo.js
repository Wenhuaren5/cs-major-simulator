// =========================
// 根据 rating 随机决定一场比赛胜者
// =========================
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

    return stats;
}