(function () {
    // 这个工具用于回答：
    // “在第几轮，某两支队伍相遇的概率是多少？”
    // 如果当前保存结果已经能确定那一轮，就直接算确定结果；
    // 如果还没确定，就从当前局面开始随机模拟很多次。
    const simulationCount = 5000;

    const roundSelect =
        document.getElementById("matchupRoundSelect");

    const teamASelect =
        document.getElementById("matchupTeamASelect");

    const teamBSelect =
        document.getElementById("matchupTeamBSelect");

    const calculateButton =
        document.getElementById("calculateMatchupProbabilityButton");

    const resultArea =
        document.getElementById("matchupProbabilityResult");

    if (
        !roundSelect ||
        !teamASelect ||
        !teamBSelect ||
        !calculateButton ||
        !resultArea
    ) {
        return;
    }

    // 队伍列表直接来自当前 Major + 当前 stage 的第一轮对阵。
    function getTeamNames() {
        return firstRoundMatches.flat();
    }

    // 当前脚本会被 Stage 1 / 2 / 3 的 Test 页面共同加载。
    // 从页面路径识别当前 stage，才能读取对应 Simulator 保存的评分。
    function getCurrentStageId() {
        const match =
            window.location.pathname.match(/test_stage([123])/);

        return match ? `stage${match[1]}` : null;
    }

    // 读取当前 Major、当前 Stage 的评分。
    // Simulator 保存评分时使用的 key 是：
    // majorManager.getMajorScopedKey("stage1Ratings")（Stage 2/3 同理）。
    // 如果没有保存评分、数据损坏或某支队伍缺少评分，则该队回退到 5 分。
    // 两队都是 5 分时，胜率自然就是 50/50。
    function getRatingsForCurrentStage() {
        const defaultRating = 5;
        const ratings = {};

        getTeamNames().forEach(team => {
            ratings[team] = defaultRating;
        });

        const stageId = getCurrentStageId();

        if (!stageId) {
            return {
                ratings,
                usingDefault: true
            };
        }

        const storageKey =
            majorManager.getMajorScopedKey(`${stageId}Ratings`);

        const savedRatings =
            localStorage.getItem(storageKey);

        if (!savedRatings) {
            return {
                ratings,
                usingDefault: true
            };
        }

        try {
            const parsedRatings = JSON.parse(savedRatings);

            getTeamNames().forEach(team => {
                const savedRating = Number(parsedRatings[team]);

                // 评分必须是正数；无效值继续使用默认 5 分。
                if (Number.isFinite(savedRating) && savedRating > 0) {
                    ratings[team] = savedRating;
                }
            });

            return {
                ratings,
                usingDefault: false
            };
        } catch (error) {
            console.warn(
                "Saved ratings are invalid; using default ratings.",
                error
            );

            return {
                ratings,
                usingDefault: true
            };
        }
    }

    // 用与 Simulator Monte Carlo 相同的公式模拟单场比赛：
    // A 队胜率 = A 评分 /（A 评分 + B 评分）。
    // 例如 8 分对 6 分时，A 的胜率是 8 / 14，约为 57.1%。
    function simulateMatchWinnerByRating(match, ratings) {
        const teamAName = match.a.name;
        const teamBName = match.b.name;

        const teamARating = ratings[teamAName] || 5;
        const teamBRating = ratings[teamBName] || 5;

        const teamAWinRate =
            teamARating / (teamARating + teamBRating);

        const teamAWins =
            Math.random() < teamAWinRate;

        return {
            winner: teamAWins ? teamAName : teamBName,
            loser: teamAWins ? teamBName : teamAName
        };
    }

    // 初始化两个队伍下拉框。
    function fillTeamSelects() {
        const options =
            `
            <option value="">Select Team</option>
            ${getTeamNames()
                .map(team => `<option value="${team}">${team}</option>`)
                .join("")}
            `;

        teamASelect.innerHTML = options;
        teamBSelect.innerHTML = options;
    }

    const groupOrderByRound = {
        2: ["1-0", "0-1"],
        3: ["2-0", "1-1", "0-2"],
        4: ["2-1", "1-2"],
        5: ["2-2"]
    };

    // 根据目标轮次生成这一轮的对阵数据。
    // 第 1 轮用固定初始对阵，后面轮次用 Swiss 规则生成。
    function createRoundDataForRound(currentTeams, roundNumber) {
        if (roundNumber === 1) {
            return {
                "0-0": firstRoundMatches.map(match => {
                    return {
                        a: { name: match[0] },
                        b: { name: match[1] }
                    };
                })
            };
        }

        return generateNextRound(currentTeams);
    }

    // 把不同战绩组里的比赛压成一个数组，方便统一遍历。
    function flattenRoundData(roundData) {
        return Object
            .values(roundData)
            .flat();
    }

    // 判断一条保存结果是否对应当前这场 match。
    // 胜负方向不重要，只要两支队伍相同就算同一场。
    function resultMatchesPair(result, match) {
        const teamA = match.a.name;
        const teamB = match.b.name;

        return (
            (
                result.winner === teamA &&
                result.loser === teamB
            ) ||
            (
                result.winner === teamB &&
                result.loser === teamA
            )
        );
    }

    // 从用户已经点击保存的结果里，找当前 match 的结果。
    function getSavedResultForMatch(roundNumber, match) {
        return Object
            .values(roundResults[roundNumber] || {})
            .find(result => resultMatchesPair(result, match));
    }

    // 检查一组对阵里是否包含指定两队。
    function matchupsIncludePair(matchups, teamA, teamB) {
        return matchups.some(match => {
            const nameA = match.a.name;
            const nameB = match.b.name;

            return (
                (
                    nameA === teamA &&
                    nameB === teamB
                ) ||
                (
                    nameA === teamB &&
                    nameB === teamA
                )
            );
        });
    }

    // 找到两队相遇时属于哪个战绩组，比如 2-0、1-1、0-2。
    function findPairGroup(roundData, teamA, teamB) {
        const groupName =
            Object
                .keys(roundData)
                .find(record => {
                    return matchupsIncludePair(
                        roundData[record],
                        teamA,
                        teamB
                    );
                });

        return groupName || null;
    }

    // 输出分组概率时保持固定顺序，额外出现的组再补到后面。
    function getGroupsForRound(targetRound, breakdown) {
        const defaultGroups =
            groupOrderByRound[targetRound] || [];

        const extraGroups =
            Object
                .keys(breakdown)
                .filter(group => !defaultGroups.includes(group));

        return [...defaultGroups, ...extraGroups];
    }

    // 如果目标轮之前的所有比赛都有保存结果，就可以直接推到目标轮，不需要模拟。
    function getKnownRoundDataForRound(targetRound) {
        const simulatedTeams =
            createTeamsFromFirstRound(firstRoundMatches);

        for (let round = 1; round <= targetRound; round++) {
            const roundData =
                createRoundDataForRound(
                    simulatedTeams,
                    round
                );

            const matchups =
                flattenRoundData(roundData);

            if (round === targetRound) {
                return roundData;
            }

            for (const match of matchups) {
                const savedResult =
                    getSavedResultForMatch(round, match);

                if (!savedResult) {
                    return null;
                }

                recordMatchResult(
                    simulatedTeams,
                    savedResult.winner,
                    savedResult.loser
                );
            }
        }

        return null;
    }

    // 从当前已保存局面随机模拟一条路径，直到目标轮。
    // 已保存的比赛结果优先视为真实结果；尚未完成的比赛才按评分随机。
    // 只有用户没有保存评分时，各队才会以默认 5 分形成 50/50。
    function simulateOnePathUntilRound(
        targetRound,
        teamA,
        teamB,
        ratings
    ) {
        const simulatedTeams =
            createTeamsFromFirstRound(
                firstRoundMatches,
                ratings
            );

        for (let round = 1; round <= targetRound; round++) {
            const roundData =
                createRoundDataForRound(
                    simulatedTeams,
                    round
                );

            const matchups =
                flattenRoundData(roundData);

            if (round === targetRound) {
                return findPairGroup(
                    roundData,
                    teamA,
                    teamB
                );
            }

            matchups.forEach(match => {
                const savedResult =
                    getSavedResultForMatch(round, match);

                if (savedResult) {
                    recordMatchResult(
                        simulatedTeams,
                        savedResult.winner,
                        savedResult.loser
                    );

                    return;
                }

                const simulatedResult =
                    simulateMatchWinnerByRating(
                        match,
                        ratings
                    );

                recordMatchResult(
                    simulatedTeams,
                    simulatedResult.winner,
                    simulatedResult.loser
                );
            });
        }

        return null;
    }

    // 主计算函数：
    // 能确定就返回 100% 或 0%；不能确定就跑多次模拟并统计总概率和分组概率。
    function calculateMatchupProbability(targetRound, teamA, teamB) {
        const ratingData =
            getRatingsForCurrentStage();

        const knownRoundData =
            getKnownRoundDataForRound(targetRound);

        if (knownRoundData) {
            const pairGroup =
                findPairGroup(
                    knownRoundData,
                    teamA,
                    teamB
                );

            const breakdown = {};

            if (pairGroup) {
                breakdown[pairGroup] = 1;
            }

            return {
                probability: pairGroup ? 1 : 0,
                breakdown,
                simulated: false,
                usingDefaultRatings: ratingData.usingDefault
            };
        }

        let matchedCount = 0;
        let groupCounts = {};

        for (let i = 0; i < simulationCount; i++) {
            const pairGroup =
                simulateOnePathUntilRound(
                    targetRound,
                    teamA,
                    teamB,
                    ratingData.ratings
                );

            if (pairGroup) {
                matchedCount++;
                groupCounts[pairGroup] =
                    (groupCounts[pairGroup] || 0) + 1;
            }
        }

        const breakdown = {};

        Object
            .keys(groupCounts)
            .forEach(group => {
                breakdown[group] =
                    groupCounts[group] / simulationCount;
            });

        return {
            probability: matchedCount / simulationCount,
            breakdown,
            simulated: true,
            usingDefaultRatings: ratingData.usingDefault
        };
    }

    // 把“总概率下面的分组概率”渲染成小表格。
    function renderBreakdown(targetRound, breakdown) {
        const groups =
            getGroupsForRound(targetRound, breakdown);

        if (groups.length === 0) {
            return "";
        }

        return `
            <div class="matchupBreakdown">
                ${groups
                    .map(group => {
                        const probability =
                            breakdown[group] || 0;

                        return `
                            <div class="matchupBreakdownRow">
                                <span>${group}</span>
                                <span>${(probability * 100).toFixed(1)}%</span>
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        `;
    }

    // 点击 Calculate 后读取用户选择，校验输入，然后输出结果。
    calculateButton.addEventListener("click", () => {
        const targetRound =
            Number(roundSelect.value);

        const teamA =
            teamASelect.value;

        const teamB =
            teamBSelect.value;

        if (!teamA || !teamB) {
            resultArea.textContent =
                "Please select two teams.";

            return;
        }

        if (teamA === teamB) {
            resultArea.textContent =
                "Please select two different teams.";

            return;
        }

        const result =
            calculateMatchupProbability(
                targetRound,
                teamA,
                teamB
            );

        resultArea.innerHTML = `
            <h3>${(result.probability * 100).toFixed(1)}%</h3>
            ${renderBreakdown(targetRound, result.breakdown)}
            <p class="matchupRatingSource">
                ${
                    result.simulated
                        ? (
                            result.usingDefaultRatings
                                ? "未找到已保存评分，未完成比赛按默认 50/50 模拟。"
                                : "未完成比赛已使用当前 Stage 保存的战力评分模拟。"
                        )
                        : "目标轮之前的赛果完整，结果由已填写赛果直接确定。"
                }
            </p>
        `;
    });

    fillTeamSelects();
})();
