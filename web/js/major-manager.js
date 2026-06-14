(function () {
    const storageKey = "selectedMajorId";

    // 读取所有 Major 配置，数据本体在 major-data.js 里维护。
    function getMajorData() {
        return window.CS_MAJOR_DATA;
    }

    // 当前标签页里用户主动选择过的 Major。
    // 如果没有选择过，页面会使用 major-data.js 里的 defaultMajorId。
    function getSelectedMajorId() {
        return sessionStorage.getItem(storageKey);
    }

    // 默认 Major 现在就是网站打开后的默认页面状态：2026 Cologne。
    function getDefaultMajorId() {
        return getMajorData().defaultMajorId;
    }

    function getCurrentMajorId() {
        return getSelectedMajorId() || getDefaultMajorId();
    }

    function getCurrentMajor() {
        return getMajorData().majors[getCurrentMajorId()];
    }

    // 切换主题前先清掉所有 Major 主题 class，避免多个主题叠在一起。
    function clearMajorThemes() {
        document.body.classList.remove("major-selected");

        Object
            .values(getMajorData().majors)
            .forEach(major => {
                document.body.classList.remove(major.themeClass);
            });
    }

    // 应用当前 Major 的主题。
    // 没有手动选择时，也会自动应用默认的 Cologne 主题。
    function applyCurrentMajorTheme() {
        clearMajorThemes();

        const currentMajor =
            getCurrentMajor();

        if (!currentMajor) {
            return;
        }

        document.body.classList.add("major-selected");
        document.body.classList.add(currentMajor.themeClass);
    }

    // 用户点击 Major 按钮后，保存当前 Major，并立即应用对应主题。
    function selectMajor(majorId, targetPath) {
        const selectedMajor =
            getMajorData().majors[majorId];

        if (!selectedMajor) {
            return;
        }

        sessionStorage.setItem(storageKey, majorId);

        applyCurrentMajorTheme();

        if (targetPath) {
            window.location.href = targetPath;
        }
    }

    // 各 simulator/test 页面通过这个函数读取当前 Major 的对应 stage 对阵。
    function getFirstRoundMatchesForStage(stageId) {
        const stage =
            getCurrentMajor().stages[stageId];

        if (!stage) {
            return [];
        }

        return stage.firstRoundMatches;
    }

    // 保存 rating、pickem 等用户数据时加上 Major 前缀，避免不同 Major 互相覆盖。
    function getMajorScopedKey(key) {
        return `${getCurrentMajorId()}_${key}`;
    }

    // 首页左上角的 Major 按钮绑定在这里。
    function bindMajorButtons() {
        document
            .querySelectorAll(".majorButton")
            .forEach(button => {
                button.addEventListener("click", () => {
                    selectMajor(
                        button.dataset.majorId,
                        button.dataset.targetPath
                    );
                });
            });
    }

    // 现在网站默认就是 Cologne，所以 stage/test 链接一开始就可以直接点。
    // 这个函数先保留为空，之后如果又需要锁定入口，可以继续在这里加逻辑。
    function bindMajorLockedLinks() {
        return;
    }

    applyCurrentMajorTheme();
    bindMajorButtons();
    bindMajorLockedLinks();

    window.majorManager = {
        getFirstRoundMatchesForStage,
        getMajorScopedKey
    };
})();
