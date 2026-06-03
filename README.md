# CS Major Simulator

一个基于 Monte Carlo Simulation 的 CS Major Pick'Em 分析工具。

## 项目简介

CS Major Simulator 最初诞生于我对 Major Pick'Em 的一个简单想法：

> 如果我能根据自己对队伍实力的判断来模拟整个瑞士轮，那么我是否能得到比纯凭感觉更合理的 Pick'Em 结果？

随着项目不断迭代，它逐渐从一个简单的瑞士轮模拟器发展成了一个完整的 Major Swiss Stage 分析工具。

目前项目已经支持：

* 瑞士轮完整模拟
* Monte Carlo 概率分析
* Pick'Em 推荐
* 保5最优推荐
* Pick'Em 生存率计算
* 当前赛事状态追踪

---

## 当前版本

### v3.3 — Pick'Em Survival Tracker

---

## Stage 1 Simulator

模拟整个 Major Stage 1 瑞士轮。

功能包括：

* 自定义 Stage 1 首轮对阵
* 自定义队伍评分
* 自动生成后续轮次
* 支持 BO1 与 BO3 对局
* Monte Carlo 多次随机模拟

输出内容：

* 3-0 概率
* 晋级概率
* 0-3 概率

---

## Pick'Em Recommendation

根据模拟结果自动生成 Pick'Em 推荐。

推荐内容：

### Recommended 3-0

自动选择最适合作为 3-0 的队伍。

### Recommended Advance

自动选择最有可能晋级的队伍。

### Recommended 0-3

自动选择最有可能被淘汰的队伍。

---

## Best 5-Correct Recommendation

这是 v3.2 引入的重要功能。

与传统推荐不同：

传统推荐追求：

> 哪些队伍最有可能晋级？

而 Best 5-Correct Recommendation 追求：

> 如何最大化获得至少 5 个正确 Pick'Em 的概率？

系统会尝试不同 Pick'Em 组合，并计算：

* Pass Chance（通过概率）
* 最优 3-0 组合
* 最优晋级组合
* 最优 0-3 组合

目标不是追求完美预测，而是提高作业通过率。

---

## Rating System

用户可以为每支队伍设置自己的实力评分。

评分会影响：

* 每场比赛胜率
* Monte Carlo 模拟结果
* 推荐系统结果

支持：

* 保存评分
* 加载评分
* 跨页面共享评分

评分保存在浏览器本地。

---

## Stage 1 Test Lab

用于赛事进行中的分析。

当比赛已经进行到一半时：

传统模拟器无法反映当前真实情况。

Test Lab 可以：

* 输入当前比赛结果
* 输入当前队伍状态
* 从当前局面继续模拟剩余赛事

帮助用户分析：

* 哪些队伍最可能晋级
* 哪些队伍最可能淘汰
* 当前局势变化对 Pick'Em 的影响

---

## Pick'Em Survival Tracker

v3.3 新增功能。

用户可以输入：

### 3-0 Picks

自己选择的 3-0 队伍。

### Advance Picks

自己选择的晋级队伍。

### 0-3 Picks

自己选择的 0-3 队伍。

系统会结合：

* 当前赛事状态
* Monte Carlo 模拟
* 用户评分

计算：

### Pass Chance

达到至少 5 个正确 Pick'Em 的概率。

如果没有保存评分：

系统将自动使用默认 50/50 胜率继续模拟，并给予提示。

---

## 技术实现

前端：

* HTML
* CSS
* JavaScript

算法：

* Swiss Stage Pairing
* Monte Carlo Simulation
* Probability Analysis

数据存储：

* LocalStorage

部署：

* GitHub Pages

---

## 未来计划

### v3.4

* Stage 2 Test Lab
* Stage 2 Survival Tracker
* 更完善的赛事状态管理

### v3.5

* Stage 3 支持
* 自动生成完整 Pick'Em 页面

### v4.0

* Pick'Em Dashboard
* 历史模拟记录
* 用户配置导入导出
* 更快的 Monte Carlo 引擎
* 移动端界面优化

---

## 项目目标

这个项目并不是为了预测未来。

它更像是一个实验：

> 如果把玩家对队伍的主观判断转化为概率模型，我们是否能做出更合理的 Pick'Em 决策？

希望它能帮助更多玩家以数据分析的方式参与 Major Pick'Em，而不仅仅依赖直觉。

---

作者：

Wenhuaren5

项目地址：

https://github.com/Wenhuaren5/cs-major-simulator
