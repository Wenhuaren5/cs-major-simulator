// =========================
// Swiss System Core Engine
//
// 这个文件只负责瑞士轮逻辑
// 不负责页面显示
// 不负责按钮点击
// 不负责 Monte Carlo
// =========================


// =========================
// 队伍对象
// =========================
class Team {

    constructor(name, seed, rating = 1) {

        this.name = name;

        this.seed = seed;

        this.rating = rating;

        this.wins = 0;

        this.losses = 0;

        this.opponents = [];

        this.advanced = false;

        this.eliminated = false;
    }
}


// =========================
// 根据第一轮对阵生成队伍
//
// 第一轮左边一列：Seed 1-8
// 第一轮右边一列：Seed 9-16
// =========================
function createTeamsFromFirstRound(firstRoundMatches, ratings = {}) {

    let seedOrder = [];

    firstRoundMatches.forEach(match => {
        seedOrder.push(match[0]);
    });

    firstRoundMatches.forEach(match => {
        seedOrder.push(match[1]);
    });

    return seedOrder.map((teamName, index) => {

        return new Team(
            teamName,
            index + 1,
            ratings[teamName] || 1
        );
    });
}


// =========================
// 根据队名找到队伍对象
// =========================
function getTeamByName(teams, name) {

    return teams.find(team => {
        return team.name === name;
    });
}


// =========================
// 记录一场比赛结果
// =========================
function recordMatchResult(teams, winnerName, loserName) {

    const winner =
        getTeamByName(teams, winnerName);

    const loser =
        getTeamByName(teams, loserName);

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
// 检查两支队伍是否已经交手过
// =========================
function playedBefore(teamA, teamB) {

    return teamA.opponents.includes(teamB.name);
}


// =========================
// 计算 Buchholz 分数
//
// Buchholz = 所有对手当前胜场数之和
// =========================
function getBuchholzScore(team, teams) {

    let score = 0;

    team.opponents.forEach(opponentName => {

        const opponent =
            getTeamByName(teams, opponentName);

        if (opponent) {
            score += opponent.wins;
        }
    });

    return score;
}


// =========================
// 组内排序
//
// 第一排序：Buchholz 高的排前面
// 第二排序：Seed 小的排前面
// =========================
function sortGroupForSwiss(group, teams) {

    return [...group].sort((a, b) => {

        const buchholzA =
            getBuchholzScore(a, teams);

        const buchholzB =
            getBuchholzScore(b, teams);

        if (buchholzB !== buchholzA) {
            return buchholzB - buchholzA;
        }

        return a.seed - b.seed;
    });
}


// =========================
// 组内配对
//
// 规则：
// 1. 先按 Buchholz + Seed 排序
// 2. 排名最高的队伍固定在左边
// 3. 从排名最低的队伍开始找右边对手
// 4. 如果两队之前打过，就往前找下一个
// 5. 尽量避免重复交手
// =========================
function createSwissPairings(group, teams) {

    if (group.length < 2 || group.length % 2 !== 0) {
        return [];
    }

    let sorted =
        sortGroupForSwiss(group, teams);

    let pairings = [];

    while (sorted.length >= 2) {

        const teamA = sorted[0];

        let opponentIndex = -1;

        for (let i = sorted.length - 1; i >= 1; i--) {

            if (!playedBefore(teamA, sorted[i])) {
                opponentIndex = i;
                break;
            }
        }

        if (opponentIndex === -1) {
            opponentIndex = sorted.length - 1;
        }

        const teamB =
            sorted[opponentIndex];

        pairings.push({
            a: teamA,
            b: teamB
        });

        sorted.splice(opponentIndex, 1);
        sorted.splice(0, 1);
    }

    return pairings;
}


// =========================
// 生成下一轮对阵
//
// 规则：
// 1. 排除已经晋级和淘汰的队伍
// 2. 按当前战绩分组
// 3. 每个战绩组内用 Swiss Pairing 配对
// =========================
function generateNextRound(teams) {

    const activeTeams =
        teams.filter(team => {
            return !team.advanced && !team.eliminated;
        });

    let groups = {};

    activeTeams.forEach(team => {

        const record =
            `${team.wins}-${team.losses}`;

        if (!groups[record]) {
            groups[record] = [];
        }

        groups[record].push(team);
    });

    let nextRound = {};

    Object.keys(groups).forEach(record => {

        const group =
            groups[record];

        if (group.length >= 2 && group.length % 2 === 0) {

            nextRound[record] =
                createSwissPairings(
                    group,
                    teams
                );
        }
    });

    return nextRound;
}