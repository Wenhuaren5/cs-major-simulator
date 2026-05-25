// 获取页面上的主要元素：按钮、第一轮对阵输入框、右侧队伍显示区域
const generateButton = document.getElementById("generateButton");
const matchupInputs = document.querySelectorAll("#matches input");
const teamList = document.getElementById("teamList");
// 获取自动填入 Stage 1 的按钮
const stage1Button = document.getElementById("stage1Button");
// Stage 1 已确定的第一轮对阵
const stage1Matches = [
    ["GamerLegion", "NRG"],
    ["B8", "TYLOO"],
    ["HEROIC", "Sharks"],
    ["BetBoom", "Gaimin Gladiators"],
    ["BIG", "Liquid"],
    ["M80", "Lynn Vision"],
    ["MIBR", "Thunder dOWNUNDER"],
    ["SINNERS", "FlyQuest"]
];

// 点击按钮后，自动填入 Stage 1 对阵
stage1Button.addEventListener("click", function () {

    const inputs = document.querySelectorAll("#matches input");

    let index = 0;

    stage1Matches.forEach(match => {

        inputs[index].value = match[0];
        inputs[index + 1].value = match[1];

        index += 2;
    });

    // 自动填完后，重新检查是否有重复队伍
    checkDuplicateTeams();
});

// 当用户修改第一轮对阵输入框时，实时检查是否有重复队伍
matchupInputs.forEach(input => {
    input.addEventListener("input", checkDuplicateTeams);
});

// 点击“生成队伍”按钮后，读取第一轮对阵，并生成右侧队伍评分表
generateButton.addEventListener("click", function () {

        // 检查是否有空白输入框
        let hasEmpty = false;

        matchupInputs.forEach(input => {

            // 去掉前后空格后，如果还是空字符串
            if (input.value.trim() === "") {

                hasEmpty = true;
            }
        });

        // 如果有空白队伍，就弹出提示并停止生成
        if (hasEmpty) {

            alert("还有队伍没有输入完整！");

            return;
        }

    // 获取页面上所有输入框
    const inputs = document.querySelectorAll("input");

    // 用 Set 存队伍名，可以自动去重
    let teams = new Set();

    // 读取所有输入框里的队伍名
    inputs.forEach(input => {
        const teamName = input.value.trim();

        if (teamName !== "") {
            teams.add(teamName);
        }
    });

    // 清空右侧旧内容，避免重复生成
    teamList.innerHTML = "";

    // 右侧标题
    teamList.innerHTML += "<h2>队伍列表</h2>";

    // 把 Set 转成数组，方便之后两个两个排列
    let teamArray = Array.from(teams);

    // 生成队伍评分区域：每一行显示两个队伍
    teamList.innerHTML += `<div class="teamGrid">`;

    for (let i = 0; i < teamArray.length; i += 2) {

        teamList.innerHTML += `

            <div class="teamRow">

                <div class="teamRatingBox">
                    <span class="teamItem">${teamArray[i]}</span>
                    <input class="ratingInput" type="number" min="1" max="10">
                </div>

                <div class="teamRatingBox">
                    <span class="teamItem">${teamArray[i + 1] || ""}</span>
                    <input class="ratingInput" type="number" min="1" max="10">
                </div>

            </div>

        `;
    }

    // 评分提示文字，点击按钮生成队伍后才显示
    teamList.innerHTML += `

        <div class="teamHeader">

            <p class="ratingTip">
                请输入你对这支战队的评分（1-10）
            </p>

        </div>

    `;

    // 生成“开始模拟”按钮
    teamList.innerHTML += `

        <button id="simulateButton">
            开始模拟
        </button>

    `;

    // 获取刚刚生成的“开始模拟”按钮
    const simulateButton = document.getElementById("simulateButton");

    // 点击按钮后的测试
    simulateButton.addEventListener("click", function () {

        // 获取所有 rating 输入框
        const ratingInputs = document.querySelectorAll(".ratingInput");

        // 获取右侧所有队伍名字
        const teamNames = document.querySelectorAll(".teamItem");

        // 检查是否有空白评分
        let hasEmptyRating = false;

        // 检查评分是否超出范围
        let hasInvalidRating = false;

        ratingInputs.forEach(input => {

            // 如果输入框为空
            if (input.value.trim() === "") {

                hasEmptyRating = true;
            }

            // 把输入内容转成数字
            const value = Number(input.value);

            // 如果小于1或大于10
            if (value < 1 || value > 10) {

                hasInvalidRating = true;
            }
        });

        // 如果有队伍没评分，就弹窗并停止模拟
        if (hasEmptyRating) {

            alert("您还没有给所有战队打分！");

            return;
        }

        // 如果评分超出范围
        if (hasInvalidRating) {

            alert("战队评分必须在1到10之间！");

            return;
        }

        // =========================
        // 读取队伍数据
        // =========================
        let teamsData = [];

        for (let i = 0; i < teamNames.length; i++) {

            teamsData.push({

                name: teamNames[i].textContent,

                rating: Number(ratingInputs[i].value)
            });
        }

        // =========================
        // 读取第一轮对阵
        // =========================
        const matchupInputs = document.querySelectorAll("#matches input");

        let firstRoundMatches = [];

        for (let i = 0; i < matchupInputs.length; i += 2) {

            firstRoundMatches.push({

                a: matchupInputs[i].value.trim(),

                b: matchupInputs[i + 1].value.trim()
            });
        }

        // =========================
        // 设置模拟次数
        // =========================
        const simulationCount = 10000;

        // =========================
        // 运行 Monte Carlo 模拟
        // =========================
        const monteCarloResult = runMonteCarlo(

            teamsData,

            firstRoundMatches,

            simulationCount
        );

        // 取出概率统计
        const stats =
            monteCarloResult.stats;

        // 取出每一次模拟的完整结果
        const simulationResults =
            monteCarloResult.simulationResults;

        // 在控制台查看统计结果
        console.log(stats);

        // =========================
        // 获取结果区域
        // =========================
        const resultPanel =
            document.getElementById("resultPanel");

        // =========================
        // 表格开头
        // =========================
        let resultHTML = `

            <h2>模拟结果</h2>

            <table class="resultTable">

                <tr>
                    <th>队伍</th>
                    <th class="ratingColumn">评分</th>
                    <th>3-0</th>
                    <th>晋级</th>
                    <th>0-3</th>
                </tr>

        `;

        // 先按 rating 排序
        // 如果 rating 一样，再按 3-0 概率排序
        teamsData.sort((a, b) => {

            // rating 不同
            if (b.rating !== a.rating) {

                return b.rating - a.rating;
            }

            // rating 相同
            // 比较 3-0 概率
            return (

                stats[b.name].threeZero -

                stats[a.name].threeZero
            );
        });

        // 按排序后的队伍顺序，逐队加入表格
        teamsData.forEach(team => {

            // 根据队伍名，从 stats 里找到这支队伍的模拟统计
            const teamStats = stats[team.name];

            // 计算 3-0 概率
            const threeZeroRate =
                (
                    teamStats.threeZero /
                    simulationCount *
                    100
                ).toFixed(1);

            // 计算 3-1 或 3-2 晋级概率
            const advanceRate =
                (
                    teamStats.normalAdvance /
                    simulationCount *
                    100
                ).toFixed(1);

            // 计算 0-3 概率
            const zeroThreeRate =
                (
                    teamStats.zeroThree /
                    simulationCount *
                    100
                ).toFixed(1);

            resultHTML += `

                <tr>
                    <td>${team.name}</td>
                    <td>${team.rating}</td>
                    <td>${threeZeroRate}%</td>
                    <td>${advanceRate}%</td>
                    <td>${zeroThreeRate}%</td>
                </tr>

            `;
        });

        // =========================
        // 表格结束
        // =========================
        resultHTML += `
            </table>
        `;

        // =========================
        // 简单 Pick'Em 推荐
        // 根据单项概率直接推荐
        // =========================

        // 把 stats 转成数组，方便排序
        let recommendationData = teamsData.map(team => {

            const teamStats = stats[team.name];

            return {
                name: team.name,
                rating: team.rating,

                threeZeroRate: teamStats.threeZero / simulationCount,
                advanceRate: teamStats.normalAdvance / simulationCount,
                zeroThreeRate: teamStats.zeroThree / simulationCount
            };
        });

        // 0-3 推荐：选择 0-3 概率最高的 2 支队伍
        let zeroThreePicks = [...recommendationData]
            .sort((a, b) => b.zeroThreeRate - a.zeroThreeRate)
            .slice(0, 2);

        // 3-0 推荐：选择 3-0 概率最高的 2 支队伍
        let threeZeroPicks = [...recommendationData]
            .sort((a, b) => b.threeZeroRate - a.threeZeroRate)
            .slice(0, 2);

        // 普通晋级推荐：排除已经被选进 3-0 和 0-3 的队伍
        let pickedNames = new Set([
            ...threeZeroPicks.map(team => team.name),
            ...zeroThreePicks.map(team => team.name)
        ]);

        let advancePicks = [...recommendationData]
            .filter(team => !pickedNames.has(team.name))
            .sort((a, b) => b.advanceRate - a.advanceRate)
            .slice(0, 6);

        // 生成右下角 Pick'Em 推荐内容
        let recommendHTML = `

            <h2>基础款推荐</h2>

            <div class="recommendBox">

                <p><strong>推荐 3-0：</strong> ${threeZeroPicks.map(team => team.name).join("，")}</p>

                <p><strong>推荐晋级：</strong> ${advancePicks.map(team => team.name).join("，")}</p>

                <p><strong>推荐 0-3：</strong> ${zeroThreePicks.map(team => team.name).join("，")}</p>

            </div>

    `;

        // =========================
        // 显示结果
        // =========================
        resultPanel.innerHTML = resultHTML;

        // 获取推荐区域
        const recommendPanel =
            document.getElementById("recommendPanel");

        // 显示推荐结果
        recommendPanel.innerHTML =
            recommendHTML;

        // =========================
        // 自动滚动到结果区域
        // =========================
        resultPanel.scrollIntoView({

            behavior: "smooth"

        });

    });
});

// 检查用户是否在第一轮对阵里输入了重复队伍
function checkDuplicateTeams() {
    const inputs = document.querySelectorAll("#matches input");
    const nameCount = {};

    // 先清除旧的重复标记
    inputs.forEach(input => {
        input.classList.remove("duplicateInput");
    });

    // 统计每个队名出现了几次
    inputs.forEach(input => {
        const name = input.value.trim().toLowerCase();

        if (name !== "") {
            nameCount[name] = (nameCount[name] || 0) + 1;
        }
    });

    let hasDuplicate = false;

    // 如果某个队名出现超过一次，就把对应输入框标红
    inputs.forEach(input => {
        const name = input.value.trim().toLowerCase();

        if (name !== "" && nameCount[name] > 1) {
            input.classList.add("duplicateInput");
            hasDuplicate = true;
        }
    });

    // 如果有重复队伍，就禁止点击“生成队伍”
    generateButton.disabled = hasDuplicate;
}