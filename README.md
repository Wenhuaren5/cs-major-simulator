CS Major Swiss Stage Simulator

一个基于 Monte Carlo Simulation 的 CS Major 瑞士轮 Pick’Em 模拟工具。

该项目最初的目标，是帮助玩家根据自己对战队实力的主观判断，更合理地完成 Major Pick’Em 作业。随着项目迭代，它逐渐发展成了一个完整的 Swiss Stage 分析工具。

⸻

当前功能（v2.4）

瑞士轮模拟

* 根据用户输入的 Stage 1 对阵自动生成队伍
* 支持完整 Swiss Stage 推演
* 支持 BO1 / BO3 胜负模拟

Monte Carlo 概率分析

* 通过大量随机模拟计算：
    * 3-0 概率
    * 晋级概率
    * 0-3 概率

Pick’Em 推荐系统

* 基础推荐：
    * 自动推荐 3-0、晋级与 0-3 队伍
* 保5优化推荐：
    * 基于 Monte Carlo 结果寻找“保5成功率”最高的 Pick’Em 方案

用户自定义评分系统

* 玩家可以手动输入每支队伍的实力评分
* 所有模拟结果都基于用户自己的判断

本地评分保存

* 支持保存与读取评分
* 使用 localStorage 在浏览器本地存储数据

⸻

项目目标

这个项目并不是为了完全复刻 HLTV 或 Valve 官方 Swiss 规则，而是希望提供一个：

* 可交互
* 可调整
* 面向玩家主观预测

的概率分析工具。

因此，用户可以自由调整队伍评分，并根据自己的理解重新模拟比赛结果。

⸻

未来计划（v3.0）

v3.0 的核心目标是：

实时 Pick’Em 通过率追踪器（Live Pick’Em Tracker）

用户可以：

* 输入自己已经提交的 Pick’Em
* 根据现实比赛结果手动推进 Swiss Stage
* 实时查看自己“保5成功”的概率

计划中的功能包括：

* 点击队伍名称即可推进比赛结果
* 动态生成后续 Swiss 对阵
* 根据当前赛况重新进行 Monte Carlo 模拟
* 实时计算 Pick’Em 存活率

未来还可能加入：

* 更完整的 Swiss 可视化界面
* 多赛事支持
* 自定义规则
* 历史数据分析
* 更复杂的评分系统

⸻

技术栈

* HTML
* CSS
* JavaScript

⸻

项目状态

当前版本：v2.4

v2 系列已基本完成。
v3.0 将重点开发实时赛事追踪系统。



CS Major Swiss Stage Simulator

A web-based CS Major Swiss Stage Pick’Em simulator powered by Monte Carlo simulation.

The project originally started as a simple tool to help players make better Pick’Em predictions based on their own team ratings. Over time, it gradually evolved into a more complete Swiss Stage probability analysis tool.

⸻

Current Features (v2.4)

Swiss Stage Simulation

* Automatically generates teams from Stage 1 matchups
* Full Swiss Stage progression simulation
* Supports BO1 / BO3 match simulation

Monte Carlo Probability Analysis

Calculates:

* 3-0 probability
* Qualification probability
* 0-3 probability

through large-scale random simulations.

Pick’Em Recommendation System

* Basic recommendation mode:
    * Automatically suggests 3-0, advancing, and 0-3 picks
* Optimized “5 correct picks” recommendation:
    * Searches for the Pick’Em combination with the highest survival probability

Custom Team Rating System

* Users can manually assign ratings to every team
* All simulations are based on the user’s own assumptions

Local Rating Save System

* Supports saving and loading ratings
* Uses browser localStorage for persistent data storage

⸻

Project Goal

This project is not intended to perfectly replicate HLTV or official Valve Swiss rules.

Instead, the goal is to create a:

* customizable
* interactive
* player-oriented

probability analysis tool for Pick’Em predictions.

Users are encouraged to freely adjust team ratings and simulate tournaments based on their own understanding of the teams.

⸻

Future Plans (v3.0)

The main goal of v3.0 is:

Live Pick’Em Survival Tracker

Users will be able to:

* input their submitted Pick’Em picks
* manually advance real match results
* track their current probability of getting 5 correct picks

Planned features include:

* clickable team buttons for match progression
* dynamic Swiss pairing generation
* live Monte Carlo re-simulation
* real-time Pick’Em survival probability tracking

Possible future additions:

* improved Swiss visualization UI
* multi-event support
* customizable Swiss rules
* historical data analysis
* more advanced rating systems

⸻

Tech Stack

* HTML
* CSS
* JavaScript

⸻

Project Status

Current version: v2.4

The v2 series is considered mostly complete.
Development focus is now shifting toward the v3.0 live tracking system.