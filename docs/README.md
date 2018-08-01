
PowerUp Scenario Builder is a web app for creating question and answer tables for PowerUp ([iOS](https://github.com/systers/powerup-iOS), [Android](https://github.com/systers/powerup-android)), a text-adventure style mobile game by [Systers Open Source](https://github.com/systers).

***

# Basic Use

#### Contents
- [Starting a New Scenario](#Starting-a-New-Scenario)
    - [Set the Scenario ID](#Set-the-Scenario-ID)
    - [Set the Text for the First Question](#Set-the-Text-for-the-First-Question)



Opening the web app will always present a fresh page, but we'll show you how to _save and load_ your work soon.

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/1-just-opened.png?raw=true)




## Starting a New Scenario


#### Set the Scenario ID
Each graph represents the questions and answers for a single scenario in PowerUp.

When starting a new graph, the first thing you'll want to do is **set your scenario ID**.

> The first card in every graph is unique. It serves as the first question presented to the player, but it also sets the _ScenarioID_ for all subsequent cards.

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/2-set-scenario-id.png?raw=true)

Double-click on the value next to _ScenarioID_ and change it to match the _ScenarioID_ of the scenario you're working on.

> _You can edit the values of non-italicized text by double-clicking on it._

- This is an important first step when you start a new work session.
    - This value is inherited by subsequent question cards.
    - It also creates a name space for numbering questions and answers.
    - If you forget to set it first, you may need to manually update the IDs for some cards.



#### Set the Text for the First Question

