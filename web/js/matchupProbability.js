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
    // 已保存的比赛用真实选择，没保存的比赛按 50/50 随机。
    function simulateOnePathUntilRound(targetRound, teamA, teamB) {
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

                const teamAName = match.a.name;
                const teamBName = match.b.name;
                const teamAWins = Math.random() < 0.5;

                recordMatchResult(
                    simulatedTeams,
                    teamAWins ? teamAName : teamBName,
                    teamAWins ? teamBName : teamAName
                );
            });
        }

        return null;
    }

    // 主计算函数：
    // 能确定就返回 100% 或 0%；不能确定就跑多次模拟并统计总概率和分组概率。
    function calculateMatchupProbability(targetRound, teamA, teamB) {
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
                simulated: false
            };
        }

        let matchedCount = 0;
        let groupCounts = {};

        for (let i = 0; i < simulationCount; i++) {
            const pairGroup =
                simulateOnePathUntilRound(
                    targetRound,
                    teamA,
                    teamB
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
            simulated: true
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
        `;
    });

    fillTeamSelects();
})();
