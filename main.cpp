#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <random>
#include <iomanip>

using namespace std;

// =======================
// 队伍结构体
// 用来存储每支队伍的信息
// =======================
struct Team {

    // 队伍名字
    string name;

    // 用户给的实力评分（1-10）
    double rating = 5.0;

    // 当前胜场
    int wins = 0;

    // 当前败场
    int losses = 0;

    // 在所有模拟中晋级了多少次
    int advanceCount = 0;

    // 是否已经3胜晋级
    bool advanced = false;

    // 是否已经3败淘汰
    bool eliminated = false;

    // 记录以前打过哪些队
    // 用于避免重复对阵
    vector<int> opponents;
};

// =======================
// 比赛结构体
// a 和 b 存储队伍编号
// =======================
struct Match {
    int a;
    int b;
};

// =======================
// 根据队名寻找队伍
// 如果不存在，就创建新队伍
// 返回队伍编号
// =======================
int findTeam(vector<Team>& teams, string name) {

    // 遍历所有队伍
    for (int i = 0; i < teams.size(); i++) {

        // 如果找到同名队伍
        if (teams[i].name == name) {
            return i;
        }
    }

    // 如果不存在，就创建新队伍
    Team newTeam;
    newTeam.name = name;

    teams.push_back(newTeam);

    // 返回新队伍编号
    return teams.size() - 1;
}

// =======================
// 检查两支队伍以前是否交过手
// =======================
bool playedBefore(const Team& team, int opponentIndex) {

    // 遍历历史对手
    for (int x : team.opponents) {

        // 如果找到相同对手
        if (x == opponentIndex) {
            return true;
        }
    }

    return false;
}

// =======================
// 根据双方rating计算胜率
// =======================
double winProb(double ratingA, double ratingB) {

    // 初始50%
    // 每高1分，多5%胜率
    double p = 0.5 + (ratingA - ratingB) * 0.05;

    // 最低5%
    if (p < 0.05) {
        p = 0.05;
    }

    // 最高95%
    if (p > 0.95) {
        p = 0.95;
    }

    return p;
}

// =======================
// 模拟一场比赛
// 并更新战绩
// =======================
void playMatch(vector<Team>& teams, Match m, mt19937& rng) {

    // 计算A队胜率
    double p = winProb(
        teams[m.a].rating,
        teams[m.b].rating
    );

    // 生成0-1随机数
    uniform_real_distribution<double> dist(0.0, 1.0);

    double randomNumber = dist(rng);

    int winner;
    int loser;

    // 如果随机数小于胜率
    // 则A队获胜
    if (randomNumber < p) {

        winner = m.a;
        loser = m.b;

    } else {

        // 否则B队获胜
        winner = m.b;
        loser = m.a;
    }

    // 更新战绩
    teams[winner].wins++;
    teams[loser].losses++;

    // 记录双方交过手
    teams[winner].opponents.push_back(loser);
    teams[loser].opponents.push_back(winner);

    // 3胜晋级
    if (teams[winner].wins == 3) {
        teams[winner].advanced = true;
    }

    // 3败淘汰
    if (teams[loser].losses == 3) {
        teams[loser].eliminated = true;
    }
}

// =======================
// 自动生成下一轮瑞士轮对阵
// =======================
vector<Match> generateNextRound(vector<Team>& teams) {

    vector<Match> matches;

    // 瑞士轮按相同战绩分组
    // 例如：
    // 1-0
    // 1-1
    // 2-1

    for (int w = 0; w <= 2; w++) {

        for (int l = 0; l <= 2; l++) {

            vector<int> group;

            // 找到所有当前战绩为 w-l 的队伍
            for (int i = 0; i < teams.size(); i++) {

                if (
                    !teams[i].advanced &&
                    !teams[i].eliminated &&
                    teams[i].wins == w &&
                    teams[i].losses == l
                ) {
                    group.push_back(i);
                }
            }

            // 如果人数不足2
            // 无法组成比赛
            if (group.size() < 2) {
                continue;
            }

            // 按rating排序
            // 强队在前
            sort(
                group.begin(),
                group.end(),
                [&](int x, int y) {
                    return teams[x].rating > teams[y].rating;
                }
            );

            // 开始组内配对
            while (group.size() >= 2) {

                // 当前最强队
                int a = group.front();

                int bIndex = -1;

                // 从后往前找对手
                // 尽量避免重复对阵
                for (int i = group.size() - 1; i >= 1; i--) {

                    if (!playedBefore(teams[a], group[i])) {

                        bIndex = i;
                        break;
                    }
                }

                // 如果所有人都打过
                // 允许重复对阵
                if (bIndex == -1) {
                    bIndex = group.size() - 1;
                }

                int b = group[bIndex];

                // 创建比赛
                matches.push_back({a, b});

                // 删除已配对队伍
                group.erase(group.begin() + bIndex);
                group.erase(group.begin());
            }
        }
    }

    return matches;
}

// =======================
// 主函数
// =======================
int main() {

    // 原始队伍列表
    vector<Team> originalTeams;

    // 第一轮比赛
    vector<Match> round1;

    cout << "请输入第一轮对阵：" << endl;

    // 输入8场第一轮比赛
    for (int i = 0; i < 8; i++) {

        string teamAName;
        string teamBName;

        cout << endl;
        cout << "比赛 " << i + 1 << endl;

        cout << "队伍A: ";
        cin >> teamAName;

        cout << "队伍B: ";
        cin >> teamBName;

        // 自动创建队伍
        int teamAIndex = findTeam(originalTeams, teamAName);
        int teamBIndex = findTeam(originalTeams, teamBName);

        // 保存比赛
        round1.push_back({
            teamAIndex,
            teamBIndex
        });
    }

    cout << endl;
    cout << "请输入每支队伍的rating（1-10）：" << endl;

    // 输入每支队伍评分
    for (int i = 0; i < originalTeams.size(); i++) {

        cout << originalTeams[i].name << ": ";

        cin >> originalTeams[i].rating;
    }

    int simulations;

    cout << endl;
    cout << "请输入模拟次数: ";

    cin >> simulations;

    // 随机数生成器
    random_device rd;
    mt19937 rng(rd());

    // =======================
    // Monte Carlo模拟
    // =======================
    for (int sim = 0; sim < simulations; sim++) {

        // 每次模拟重新复制队伍
        vector<Team> teams = originalTeams;

        // 当前轮次
        vector<Match> currentRound = round1;

        // 只要还有比赛
        while (!currentRound.empty()) {

            // 打完当前轮
            for (Match m : currentRound) {

                if (
                    !teams[m.a].advanced &&
                    !teams[m.a].eliminated &&
                    !teams[m.b].advanced &&
                    !teams[m.b].eliminated
                ) {

                    playMatch(teams, m, rng);
                }
            }

            // 自动生成下一轮
            currentRound = generateNextRound(teams);
        }

        // 统计晋级队伍
        for (int i = 0; i < teams.size(); i++) {

            if (teams[i].advanced) {

                originalTeams[i].advanceCount++;
            }
        }
    }

    cout << fixed << setprecision(2);

    cout << endl;
    cout << "晋级概率：" << endl;

    // 按晋级次数排序
    sort(
        originalTeams.begin(),
        originalTeams.end(),
        [](Team a, Team b) {
            return a.advanceCount > b.advanceCount;
        }
    );

    // 输出结果
    for (Team t : originalTeams) {

        double percent =
            100.0 * t.advanceCount / simulations;

        cout
        << setw(20)
        << left
        << t.name
        << percent
        << "%"
        << endl;
    }

    return 0;
}