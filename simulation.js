// =========================
// 队伍对象
// 保存每支队伍在一次模拟中的状态
// =========================
class Team {
    constructor(name, rating) {
        this.name = name;
        this.rating = rating;

        this.wins = 0;
        this.losses = 0;

        this.advanced = false;
        this.eliminated = false;

        this.opponents = [];
    }
}

// =========================
// 根据双方评分计算 A 队胜率
// 评分每高 1 分，胜率增加 5%
// 最低 5%，最高 95%
// =========================
function getWinProbability(ratingA, ratingB) {
    let p = 0.5 + (ratingA - ratingB) * 0.05;

    if (p < 0.05) p = 0.05;
    if (p > 0.95) p = 0.95;

    return p;
}

// =========================
// 检查两队是否已经交手过
// =========================
function playedBefore(team, opponentName) {
    return team.opponents.includes(opponentName);
}

// =========================
// 模拟一场比赛
// match = { a: Team, b: Team }
// =========================
function playMatch(match) {
    const teamA = match.a;
    const teamB = match.b;

    const probabilityA = getWinProbability(teamA.rating, teamB.rating);

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
// 根据当前战绩生成下一轮瑞士轮对阵
// 同战绩分组，组内按 rating 排序
// 强队优先匹配弱队，并尽量避免重复交手
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

            group.sort((x, y) => y.rating - x.rating);

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
// 运行一次完整的瑞士轮模拟
// teamsData:
// [
//   { name: "Spirit", rating: 8 },
//   { name: "FaZe", rating: 7 }
// ]
// =========================
function runSimulation(teamsData, firstRoundMatches) {

    // =========================
    // 创建本次模拟使用的队伍对象
    // =========================
    let teams = [];

    teamsData.forEach(team => {

        teams.push(
            new Team(team.name, team.rating)
        );
    });

    // =========================
    // 方便通过名字快速找到队伍
    // 比如：teamMap["Spirit"]
    // =========================
    let teamMap = {};

    teams.forEach(team => {
        teamMap[team.name] = team;
    });

    // =========================
    // 第一轮比赛
    // 使用用户输入的固定对阵
    // =========================
    let currentMatches = [];

    firstRoundMatches.forEach(match => {

        currentMatches.push({

            a: teamMap[match.a],

            b: teamMap[match.b]
        });
    });

    // 打完第一轮
    currentMatches.forEach(match => {
        playMatch(match);
    });

    // =========================
    // 后续轮次
    // 一直打到所有队伍晋级或淘汰
    // =========================
    while (true) {

        // 检查是否已经结束
        let unfinishedTeams = teams.filter(team =>
            !team.advanced &&
            !team.eliminated
        );

        // 如果所有队伍都结束
        if (unfinishedTeams.length === 0) {
            break;
        }

        // 生成下一轮对阵
        currentMatches = generateNextRound(teams);

        // 打完这一轮
        currentMatches.forEach(match => {
            playMatch(match);
        });
    }

    // =========================
    // 返回本次模拟最终结果
    // =========================
    return teams;
}

// =========================
// Monte Carlo 模拟
// 重复运行大量 Swiss 模拟
// 同时统计概率，并保存每一次模拟的完整结果
// =========================
function runMonteCarlo(
    teamsData,
    firstRoundMatches,
    simulationCount
) {

    // 记录每支队伍的概率统计
    let stats = {};

    // 保存每一次模拟的完整结果
    let simulationResults = [];

    teamsData.forEach(team => {

        stats[team.name] = {
            threeZero: 0,
            normalAdvance: 0,
            zeroThree: 0
        };
    });

    // 开始重复模拟
    for (let i = 0; i < simulationCount; i++) {

        // 运行一次完整 Swiss
        const result = runSimulation(
            teamsData,
            firstRoundMatches
        );

        // 保存这一次模拟结果，之后用来算“保5推荐”
        simulationResults.push(result);

        // 统计每支队伍的结果
        result.forEach(team => {

            // 3-0
            if (team.wins === 3 && team.losses === 0) {
                stats[team.name].threeZero++;
            }

            // 普通晋级：3-1 或 3-2
            if (
                team.wins === 3 &&
                (team.losses === 1 || team.losses === 2)
            ) {
                stats[team.name].normalAdvance++;
            }

            // 0-3
            if (team.wins === 0 && team.losses === 3) {
                stats[team.name].zeroThree++;
            }
        });
    }

    // stats 给概率表用
    // simulationResults 给后面的“保5推荐”算法用
    return {
        stats: stats,
        simulationResults: simulationResults
    };
}

// =========================
// 计算一套 Pick'Em 在一次模拟中命中了几个
// pickEm 结构：
// {
//   threeZero: ["A", "B"],
//   advance: ["C", "D", "E", "F", "G", "H"],
//   zeroThree: ["I", "J"]
// }
// =========================
function countCorrectPicks(simulationResult, pickEm) {

    let correctCount = 0;

    // 检查 3-0 预测
    pickEm.threeZero.forEach(teamName => {

        const team = simulationResult.find(
            team => team.name === teamName
        );

        if (team.wins === 3 && team.losses === 0) {
            correctCount++;
        }
    });

    // 检查普通晋级预测
    // 只要最终是 3 胜晋级，就算正确
    pickEm.advance.forEach(teamName => {

        const team = simulationResult.find(
            team => team.name === teamName
        );

        if (team.wins === 3) {
            correctCount++;
        }
    });

    // 检查 0-3 预测
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

    // 成功次数
    let successCount = 0;

    // 遍历每一次 Monte Carlo 模拟结果
    simulationResults.forEach(simulationResult => {

        // 计算这次中了几个
        const correctCount =
            countCorrectPicks(
                simulationResult,
                pickEm
            );

        // 如果 >=5
        // 就算成功
        if (correctCount >= 5) {

            successCount++;
        }
    });

    // 返回成功率
    return (

        successCount /

        simulationResults.length
    );
}