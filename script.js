// 获取页面上的主要元素：按钮、第一轮对阵输入框、右侧队伍显示区域
const generateButton = document.getElementById("generateButton");
const matchupInputs = document.querySelectorAll("#matches input");
const teamList = document.getElementById("teamList");

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

        alert("开始计算概率！");

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