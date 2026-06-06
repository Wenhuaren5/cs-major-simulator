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
// 使用回溯搜索，尽量避免重复交手
//
// 规则：
// 1. 先按 Buchholz + Seed 排序
// 2. 每次固定当前最高排序队伍
// 3. 从最低排序队伍开始尝试配对
// 4. 如果后续配对失败，就回退重试
// 5. 如果完全找不到无重复方案，才允许 fallback
// =========================
function createSwissPairings(group, teams) {

    if (group.length < 2 || group.length % 2 !== 0) {
        return [];
    }

    const sorted =
        sortGroupForSwiss(group, teams);

    const result =
        findPairingsWithoutRematch(
            sorted,
            teams
        );

    if (result) {
        return result;
    }

    console.warn(
        "No rematch-free pairing found, using fallback.",
        sorted.map(team => team.name)
    );

    // =========================
    // fallback：
    // 如果真的不存在完全避免重复交手的方案，
    // 才使用原来的贪心方法
    // =========================
    return createFallbackPairings(
        sorted
    );
}


// =========================
// 回溯搜索无重复配对
// =========================
function findPairingsWithoutRematch(
    remainingTeams,
    teams
) {

    if (remainingTeams.length === 0) {
        return [];
    }

    const teamA =
        remainingTeams[0];

    // 从最低排序队伍开始尝试
    for (let i = remainingTeams.length - 1; i >= 1; i--) {

        const teamB =
            remainingTeams[i];

        // 如果已经打过，跳过
        if (playedBefore(teamA, teamB)) {
            continue;
        }

        const nextRemaining =
            remainingTeams.filter((team, index) => {
                return index !== 0 && index !== i;
            });

        const nextPairings =
            findPairingsWithoutRematch(
                nextRemaining,
                teams
            );

        if (nextPairings !== null) {

            return [
                {
                    a: teamA,
                    b: teamB
                },
                ...nextPairings
            ];
        }
    }

    return null;
}


// =========================
// fallback 配对
// 只有在无重复方案不存在时使用
// =========================
function createFallbackPairings(sortedTeams) {

    const remaining =
        [...sortedTeams];

    const pairings = [];

    while (remaining.length >= 2) {

        const teamA =
            remaining.shift();

        const teamB =
            remaining.pop();

        pairings.push({
            a: teamA,
            b: teamB
        });
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