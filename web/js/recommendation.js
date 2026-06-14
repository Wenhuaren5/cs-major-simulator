// =========================
// Pick'Em Recommendation System
//
// 这个文件根据 Monte Carlo 结果生成 Pick'Em 推荐。
// 简单推荐看单项概率；最佳推荐会组合多套答案，计算哪套最容易保 5。
// =========================


// 推荐最可能 3-0 的队伍。
function getBest30Picks(results, count = 2) {

    return Object.keys(results)
        .sort((a, b) => {
            return results[b].threeZero - results[a].threeZero;
        })
        .slice(0, count);
}


// 推荐最可能晋级的队伍。
// excludedTeams 用来避免和 3-0 推荐重复。
function getBestAdvancePicks(
    results,
    count = 6,
    excludedTeams = []
) {

    return Object.keys(results)
        .filter(team =>
            !excludedTeams.includes(team)
        )
        .sort((a, b) => {
            return results[b].advanced - results[a].advanced;
        })
        .slice(0, count);
}


// 推荐最可能 0-3 的队伍。
function getBest03Picks(results, count = 2) {

    return Object.keys(results)
        .sort((a, b) => {
            return results[b].zeroThree - results[a].zeroThree;
        })
        .slice(0, count);
}


// 生成一套基础 Pick'Em 推荐。
function generatePickemRecommendation(results) {

    const threeZero =
        getBest30Picks(results);

    const advance =
        getBestAdvancePicks(
            results,
            6,
            threeZero
        );

    const zeroThree =
        getBest03Picks(results);

    return {
        threeZero,
        advance,
        zeroThree
    };
}


// 组合工具函数：从数组里选 count 个元素。
// 最佳 Pick'Em 会用它枚举候选答案。
function getCombinations(array, count) {

    if (count === 0) {
        return [[]];
    }

    if (array.length < count) {
        return [];
    }

    let results = [];

    for (let i = 0; i <= array.length - count; i++) {

        const head =
            array[i];

        const tailCombinations =
            getCombinations(
                array.slice(i + 1),
                count - 1
            );

        tailCombinations.forEach(tail => {
            results.push([head, ...tail]);
        });
    }

    return results;
}


// 计算一套 Pick'Em 在一次模拟结果里能答对几个。
function countCorrectPickem(pickem, tournamentTeams) {

    let correct = 0;

    tournamentTeams.forEach(team => {

        if (
            pickem.threeZero.includes(team.name) &&
            team.wins === 3 &&
            team.losses === 0
        ) {
            correct++;
        }

        if (
            pickem.advance.includes(team.name) &&
            team.advanced
        ) {
            correct++;
        }

        if (
            pickem.zeroThree.includes(team.name) &&
            team.wins === 0 &&
            team.losses === 3
        ) {
            correct++;
        }
    });

    return correct;
}


// 评估一套 Pick'Em 的保 5 概率。
// 这里直接复用 Monte Carlo 已经跑好的 simulationResults，不重新模拟比赛。
function evaluatePickemPassChance(
    pickem,
    simulationResults
) {

    let passCount = 0;

    simulationResults.forEach(tournamentTeams => {

        const correct =
            countCorrectPickem(
                pickem,
                tournamentTeams
            );

        if (correct >= 5) {
            passCount++;
        }
    });

    return (
        passCount /
        simulationResults.length
    );
}


// 生成“保 5 概率最高”的 Pick'Em 推荐。
// 为了速度，只从高概率候选池里组合：
// 3-0 前 5 选 2，晋级前 9 选 6，0-3 前 5 选 2。
function generateBestPickemRecommendation(
    results,
    simulationResults
) {

    const threeZeroCandidates =
        Object.keys(results)
            .sort((a, b) => {
                return results[b].threeZero - results[a].threeZero;
            })
            .slice(0, 5);

    const advanceCandidates =
        Object.keys(results)
            .sort((a, b) => {
                return results[b].advanced - results[a].advanced;
            })
            .slice(0, 9);

    const zeroThreeCandidates =
        Object.keys(results)
            .sort((a, b) => {
                return results[b].zeroThree - results[a].zeroThree;
            })
            .slice(0, 5);

    const threeZeroCombinations =
        getCombinations(
            threeZeroCandidates,
            2
        );

    const zeroThreeCombinations =
        getCombinations(
            zeroThreeCandidates,
            2
        );

    let bestPickem = null;
    let bestPassChance = -1;

    threeZeroCombinations.forEach(threeZero => {

        const filteredAdvanceCandidates =
            advanceCandidates.filter(team =>
                !threeZero.includes(team)
            );

        const advanceCombinations =
            getCombinations(
                filteredAdvanceCandidates,
                6
            );

        advanceCombinations.forEach(advance => {

            zeroThreeCombinations.forEach(zeroThree => {

                const pickem = {
                    threeZero,
                    advance,
                    zeroThree
                };

                const passChance =
                    evaluatePickemPassChance(
                        pickem,
                        simulationResults
                    );

                if (passChance > bestPassChance) {

                    bestPassChance =
                        passChance;

                    bestPickem = pickem;
                }
            });
        });
    });

    bestPickem.passChance =
        bestPassChance;

    return bestPickem;
}
