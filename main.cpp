#include <iostream>
#include <vector>
#include <string>

using namespace std;

struct Team {
    string name;
    int wins = 0;
    int losses = 0;
};

struct Match {
    int teamA;
    int teamB;
};

int main() {

    vector<Team> teams;

    cout << "Enter 16 team names:" << endl;

    for (int i = 0; i < 16; i++) {
        Team t;
        cin >> t.name;
        teams.push_back(t);
    }

    cout << endl;
    cout << "Teams:" << endl;

    for (int i = 0; i < teams.size(); i++) {
        cout << i << ": " << teams[i].name << endl;
    }

    vector<Match> round1;

    cout << endl;
    cout << "Enter Round 1 matchups:" << endl;

    for (int i = 0; i < 8; i++) {

        Match m;

        cout << "Match " << i + 1 << endl;

        cout << "Team A index: ";
        cin >> m.teamA;

        cout << "Team B index: ";
        cin >> m.teamB;

        round1.push_back(m);
    }

    cout << endl;
    cout << "Round 1 Matches:" << endl;

    for (int i = 0; i < round1.size(); i++) {

        cout
        << teams[round1[i].teamA].name
        << " vs "
        << teams[round1[i].teamB].name
        << endl;
    }

    return 0;
}
