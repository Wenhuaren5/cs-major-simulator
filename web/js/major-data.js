// =========================
// Major Data Registry
//
// 每个 Major 的主题颜色和各 stage 第一轮对阵都放在这里。
// 以后新增 Major 时，只需要照着同样结构增加一个 key，再在首页加按钮。
// =========================
window.CS_MAJOR_DATA = {
    defaultMajorId: "2026_singapore",

    majors: {
        "2025_budapest": {
            name: "2025 Budapest",
            themeClass: "theme-2025-budapest",
            defaultPath: "./simulator/simulator_stage1/simulator_stage1.html",
            stages: {
                stage1: {
                    firstRoundMatches: [
                        ["Legacy", "Flyquest"],
                        ["Faze", "Lynn Vision"],
                        ["B8", "M80"],
                        ["GamerLegion", "Fluxo"],
                        ["Fnatic", "RED Canids"],
                        ["PARIVISION", "The Huns"],
                        ["Ninjas in Pyjamas", "NRG"],
                        ["Imperial", "Rare Atom"]
                    ]
                },
                stage2: {
                    firstRoundMatches: [
                        ["Aurora", "M80"],
                        ["Natus Vincere", "Flyquest"],
                        ["Team Liquid", "B8"],
                        ["3DMAX", "Fnatic"],
                        ["Astralis", "Ninjas in Pyjamas"],
                        ["Tyloo", "PARIVISION"],
                        ["mibr", "Imperial"],
                        ["Passion UA", "Faze"]
                    ]
                },
                stage3: {
                    firstRoundMatches: [
                        ["FURIA", "Natus Vincere"],
                        ["Vitality", "Faze"],
                        ["Falcons", "B8"],
                        ["The Mongolz", "Imperial"],
                        ["MOUZ", "PARIVISION"],
                        ["Team Spirit", "Team Liquid"],
                        ["G2", "Passion UA"],
                        ["paiN", "3DMAX"]
                    ]
                }
            }
        },

        "2026_cologne": {
            name: "2026 Cologne",
            themeClass: "theme-2026-cologne",
            defaultPath: "./simulator/simulator_stage1/simulator_stage1.html",
            stages: {
                stage1: {
                    firstRoundMatches: [
                        ["GamerLegion", "NRG"],
                        ["B8", "TYLOO"],
                        ["HEROIC", "Sharks"],
                        ["BetBoom", "Gaimin Gladiators"],
                        ["BIG", "Liquid"],
                        ["M80", "Lynn Vision"],
                        ["MIBR", "Thunder dOWNUNDER"],
                        ["SINNERS", "FlyQuest"]
                    ]
                },
                stage2: {
                    firstRoundMatches: [
                        ["FUT", "B8"],
                        ["Team Spirit", "BetBoom"],
                        ["Astralis", "GamerLegion"],
                        ["G2", "M80"],
                        ["Legacy", "mibr"],
                        ["paiN", "Tyloo"],
                        ["Monte", "Big"],
                        ["9z", "Flyquest"]
                    ]
                },
                stage3: {
                    firstRoundMatches: [
                        ["Vitality", "FUT"],
                        ["NAVI", "Team Spirit"],
                        ["Falcons", "G2"],
                        ["The Mongolz", "BetBoom"],
                        ["PARIVISION", "9z"],
                        ["Aurora", "Monte"],
                        ["FURIA", "B8"],
                        ["MOUZ", "Legacy"]
                    ]
                }
            }
        },

        "2026_singapore": {
            name: "PGL Major Singapore 2026",
            themeClass: "theme-2026-singapore",
            defaultPath: "./simulator/simulator_stage1/simulator_stage1.html",
            stages: {
                stage1: {
                    available: true,
                    firstRoundMatches: [
                        ["HEROIC", "Imperial"],
                        ["9z", "Lynn Vision"],
                        ["Ninjas in Pyjamas", "M80"],
                        ["100 Thieves", "Chinggis Warriors"],
                        ["Team Liquid", "BC.Game"],
                        ["PARIVISION", "DENDELE"],
                        ["FaZe", "Wildcard"],
                        ["Eternal Fire", "FlyQuest"]
                    ]
                },
                stage2: {
                    available: false,
                    unavailableReason: "等待 Stage 1 结束并公布 Stage 2 首轮对阵",
                    firstRoundMatches: []
                },
                stage3: {
                    available: false,
                    unavailableReason: "等待 Stage 2 结束并公布 Stage 3 首轮对阵",
                    firstRoundMatches: []
                }
            }
        }
    }
};
