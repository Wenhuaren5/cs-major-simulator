// =========================
// Pick'Em Recommendation System
//
// 根据 Monte Carlo 结果生成推荐
// =========================


// =========================
// 推荐 3-0
// =========================
function getBest30Picks(results, count = 2) {

    return Object.keys(results)
        .sort((a, b) => {
            return results[b].threeZero - results[a].threeZero;
        })
        .slice(0, count);
}


// =========================
// 推荐晋级队伍
// =========================
function getBestAdvancePicks(results, count = 7) {

    return Object.keys(results)
        .sort((a, b) => {
            return results[b].advanced - results[a].advanced;
        })
        .slice(0, count);
}


// =========================
// 推荐 0-3
// =========================
function getBest03Picks(results, count = 2) {

    return Object.keys(results)
        .sort((a, b) => {
            return results[b].zeroThree - results[a].zeroThree;
        })
        .slice(0, count);
}


// =========================
// 生成完整推荐
// =========================
function generatePickemRecommendation(results) {

    return {
        threeZero: getBest30Picks(results),
        advance: getBestAdvancePicks(results),
        zeroThree: getBest03Picks(results)
    };
}