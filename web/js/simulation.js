// =========================
// Swiss System Core Engine
//
// 这个文件只负责瑞士轮的核心规则：
// 1. 创建队伍对象
// 2. 记录胜负和交手历史
// 3. 按战绩组生成下一轮对局
// 4. 尽量避免重复交手
// 页面显示、按钮点击、Monte Carlo 模拟都放在别的文件里。
// =========================


// 每支队伍在模拟过程里的状态对象。
class Team {

    constructor(name, seed, rating = 1) {

        this.name = name;
        this.seed = seed;
        this.rating = rating;

        this.wins = 0;
        this.losses = 0;

        // opponents 用来判断两队之前有没有交手过。
        this.opponents = [];

        this.advanced = false;
        this.eliminated = false;
    }
}


// 根据第一轮对阵生成 16 支队伍。
// 第一轮左边一列视为 seed 1-8，右边一列视为 seed 9-16。
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


// 根据队名找到对应的队伍对象。
function getTeamByName(teams, name) {

    return teams.find(team => {
        return team.name === name;
    });
}


// 写入一场比赛结果，并同步更新胜负、交手历史、晋级/淘汰状态。
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


// 检查两支队伍是否已经交手过，瑞士轮配对时会优先避开这种情况。
function playedBefore(teamA, teamB) {

    return teamA.opponents.includes(teamB.name);
}


// 计算 Buchholz 分数。
// 这里用“所有对手当前净胜场之和”作为同战绩组内的排序依据。
function getBuchholzScore(team, teams) {

    let score = 0;

    team.opponents.forEach(opponentName => {

        const opponent =
            getTeamByName(teams, opponentName);

        if (opponent) {
            score += opponent.wins - opponent.losses;
        }
    });

    return score;
}

// 6 队组的固定优先级表。
// 普通回溯在 6 队组里有时会和目标网站不同，所以这里按已测试过的顺序尝试。
const sixTeamPairingPriority = [
    [[1, 6], [2, 5], [3, 4]],
    [[1, 6], [2, 4], [3, 5]],
    [[1, 5], [2, 6], [3, 4]],
    [[1, 5], [2, 4], [3, 6]],
    [[1, 4], [2, 6], [3, 5]],
    [[1, 4], [2, 5], [3, 6]],
    [[1, 6], [2, 3], [4, 5]],
    [[1, 5], [2, 3], [4, 6]],
    [[1, 3], [2, 6], [4, 5]],
    [[1, 3], [2, 5], [4, 6]],
    [[1, 4], [2, 3], [5, 6]],
    [[1, 3], [2, 4], [5, 6]],
    [[1, 2], [3, 6], [4, 5]],
    [[1, 2], [3, 5], [4, 6]],
    [[1, 2], [3, 4], [5, 6]]
];


// 同战绩组内排序：
// 1. Buchholz 高的排前面
// 2. Buchholz 相同则 seed 小的排前面
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

// 6 队组先按固定表尝试，只要找到没有重复交手的方案就使用。
function createSixTeamPairings(sortedTeams) {

    for (const option of sixTeamPairingPriority) {

        const pairings =
            option.map(pair => {

                return {
                    a: sortedTeams[pair[0] - 1],
                    b: sortedTeams[pair[1] - 1]
                };
            });

        const hasRematch =
            pairings.some(match => {
                return playedBefore(match.a, match.b);
            });

        if (!hasRematch) {
            return pairings;
        }
    }

    return null;
}


// 生成一个战绩组里的对阵。
// 先排序，再优先使用 6 队组规则，最后用回溯搜索避免重复交手。
function createSwissPairings(group, teams) {

    if (group.length < 2 || group.length % 2 !== 0) {
        return [];
    }

    const sorted =
        sortGroupForSwiss(group, teams);

    if (sorted.length === 6) {

        console.log("=== Sorted Group ===");

        console.table(
            sorted.map(team => ({
            name: team.name,
            seed: team.seed,
            buchholz: getBuchholzScore(team, teams),
            opponents: team.opponents.join(", ")
            }))
        );
    }

    if (sorted.length === 6) {

        const sixTeamResult =
            createSixTeamPairings(sorted);

        if (sixTeamResult) {
            return sixTeamResult;
        }
    }

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

    return createFallbackPairings(
        sorted
    );
}


// 回溯搜索无重复交手的配对。
// 固定当前最高排序队伍，然后从低排序队伍开始试，失败就回退换下一种。
function findPairingsWithoutRematch(
    remainingTeams,
    teams
) {

    if (remainingTeams.length === 0) {
        return [];
    }

    const teamA =
        remainingTeams[0];

    for (let i = remainingTeams.length - 1; i >= 1; i--) {

        const teamB =
            remainingTeams[i];

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


// fallback 配对。
// 只有在完全找不到无重复交手方案时才使用，保证页面至少能继续生成。
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


// 生成下一轮对阵。
// 先排除已经 3 胜晋级和 3 负淘汰的队伍，再按当前战绩分组配对。
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
