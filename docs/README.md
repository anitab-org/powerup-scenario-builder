
PowerUp Scenario Builder is a web app for creating question and answer tables for PowerUp ([iOS](https://github.com/systers/powerup-iOS), [Android](https://github.com/systers/powerup-android)), a text-adventure style mobile game by [Systers Open Source](https://github.com/systers).

**Best experienced in Chrome.**
_Also works in Safari and Firefox. Possibly with quirks._

***

<a class="button" href="https://rawgit.com/systers/powerup-scenario-builder/master/index.html">
  <span class="away">Powerup Scenario Builder</span>
  <span class="over">Live App</span>
</a>

***

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

#### Contents
- [Setup](#setup)
    - [Set the Scenario ID](#set-the-scenario-id)
    - [Set the Text for the First Question](#set-the-text-for-the-first-question)
- [Cards](#cards)
    - [Adding and Editing Cards](#adding-and-editing-cards)
        - Adding a New Card
        - Editing Fields
    - [Moving Cards](#moving-cards)
    - [Deleting Cards](#deleting-cards)
    - [Card Types](#card-types)
        - [Question Cards](#question-cards)
        - [Answer Cards](#answer-cards)
    - [Re-linking Cards](#re-linking-cards)
- [Ending the Scenario](#ending-the-scenario)
- [Menu Options](#menu-options)
    - Save/Load
    - Export Tables
    - Export PDF/SVG
    - Auto Layout
- [Navigating the Work Area](#navigating-the-work-area)
    - Pan
    - Zoom
    - Undo/Redo

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

***

## Setup

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/1-just-opened.png?raw=true)


<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

#### Set the Scenario ID
Each graph represents the questions and answers for a single scenario in PowerUp.

When starting a new graph, the first thing you'll want to do is **set your scenario ID**.

> The first card in every graph is unique. It serves as the first question presented to the player, but it also sets the `ScenarioID` for all subsequent cards.

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/2-set-scenario-id.png?raw=true)

Double-click on the value next to `ScenarioID` and change it to match the `ScenarioID` of the scenario you're working on.

> You can edit the values of non-italicized text by double-clicking on it.

- This is an important first step when you start a new work session.
    - This value is inherited by subsequent question cards.
    - It also creates a name space for numbering questions and answers.
    - If you forget to set it first, you may need to manually update the IDs for some cards.

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

#### Set the Text for the First Question

Double-click on the text at the top of the first card to edit it.

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/3-set-starting-question.png?raw=true)

_You don't need to set the `QuestionID` at this time._

Add your first answer card, and it will automatically set the starting `QuestionID`.

***

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

## Cards

#### Adding and Editing Cards

##### Add a New Card

Click the plus icon to add a new child card.

- Cards will automatically alternate type (question or answer).
>
- Every question can have multiple answer cards attached to either end.
>
- Each answer card can only have one question attached to either end.
    - This is to simplify Q&A relationships in order to avoid mistakes or unnecessary redundancies.
>
- Cards can not be linked in a way that would ever create an infinite loop. This rule is further enforced when [re-linking](#re-linking-cards).
>
- Cards will attempt to automatically set their `ID` fields.
>
- Questions will attempt to update the `NextQID` field of parent answers.

> You can manually edit the values in these fields, but doing so may result in undesired behavior from the automatic numbering system. Always check your work if you make manual edits.

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/4-adding-more-cards.png?raw=true)

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

##### Editing Fields

Double-click on non-italicized text to change it.

> Like the starting card, the text at the top of each card is the actual Question or Answer text. Change the default `"new"` to be the appropriate text that should appear in PowerUp.

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

#### Moving Cards

To move a card, click and drag on an empty area inside the card.

You can move a card anywhere within the work area, but overlapping cards will be automatically re-positioned.

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

#### Deleting Cards

To delete a card, click inside any empty space in the card to select it, and press your `delete` key.

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

#### Card Types

- ##### Question Cards
    - `QuestionID` is a unique numerical identifier for that particular question card.

- ##### Answer Cards
    - `AnswerID` is a unique numerical identifier for that particular answer card.
        - When adding an answer, the `AnswerID` will be automatically assigned based on the `ScenarioID` set in the starting card.
        - This value can be manually changed if necessary, but new answers will continue to use the internal counter to set the default `AnswerID`.
        >
    - `QuestionID` is the identifier for the preceding question.
        - It should always match the `QuestionID` of the question card connected to the left port of the answer card.
        >
    - `NextQID` is the identifier for the resulting question.
        - It should always match the `QuestionID` of the question card connected to the right port of the answer card.
        - This value is automatically assigned when a question is connected.
        - This field must be manually set in order to [end the scenario](#ending-the-scenario).
            - A terminating answer should not be connected to a child question.
        >
    - `PopupID` determines if selecting this answer will launch a popup event.
        - These are popup events managed by the PowerUp class `PopupEventPlayer`.
        - This value should match the appropriate value in `Popups.json`, found in the PowerUp repository.
        - Set this value to a non-numerical character if there is no popup associated with this answer.
            - e.g. `&`
        >
    - `Points` is the amount of karma points given to the player when this answer is selected.
        - Defaults to `2`.

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

#### Re-linking Cards

You can delete a link by clicking to select it and pressing your `Delete` key.

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/5-relink-cards.png?raw=true)

Click and drag on the plus icon (right-side port of a card) to start re-linking a card.

Drag the new link to the left-side port of the target card, and release to create the link.

Re-linking follows the same rules as [adding cards](#adding-and-editing-cards). Attempts to create illegal links are ignored.

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/6-relink-drag.png?raw=true)

> Manually create links in order to assign multiple answers to the left-side port of a question.

![](https://github.com/justKD/Powerup-Scenario-Builder/blob/master/docs/images/7-multiple-answers-to-question.png?raw=true)

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

***

## Ending the Scenario

End a scenario by manually setting the appropriate value in the `NextQID` field of a terminating answer.

- Set this value to a negative integer to end the scenario and launch a mini-game.
    - Each mini-game has a unique negative integer as an identifier.
    - As of `Aug. 1, 2018`:
        - Minesweeper `-1`
        - Sink to Swim `-2`
        - Vocab Matching `-3`
>
- Set this value to a non-numerical character to end the scenario without a mini-game.
    - e.g. `$`

***

## Menu Options

- `?` Opens and closes the quick help panel.
    - The quick help panel is scrollable.
>
- `Save JSON` downloads a local copy of your current work session to your normal web downloads folder.
    - The file is a representation of the current state of your work session, including all values and card positions.
    - The file name defaults to `powerup-map.json`, but, after downloading, it can be renamed to something more descriptive.
>
- `Do Layout` automatically cleans up the layout of your work area. 
    - Beware, this will undo any intentional manual layout changes.
>
- `Export Answers` will download all answers as a CSV table.
    - This format matches the database in the Android version of PowerUp.
    - _For the iOS version, the table will need to be imported into the SQLite database._
        - The easiest way is probably to use a GUI editor such as [DB Browser for SQLite](https://sqlitebrowser.org/).
>
- `Export Questions` will download all questions as a CSV table.
    - Otherwise, the details are the same as `Export Answers`.
>
- `Export SVG` will download the current work session as an editable SVG.
    - The exported SVG can not be imported, so any editing done to the SVG map is strictly for convenience.
    - This feature is meant to make it easier to embed the map in other documents, or to share with other reviewers/editors.
    - Large maps may not be printer-friendly. The SVG can be split up into smaller sections using most vector graphics editors.
>
- `Export PDF` will download the current work session as a PDF image.
    - This feature serves a similar purpose as the `Export SVG` option.
    - Unless there is a reason to share SVG, this option will typically be better for viewing a static map.
>
- `Open JSON` will open a file finder dialog.
    - Select a previously saved JSON downloaded with the `Save JSON` option, and the work session will be restored.
    - The file name does not matter. Only the structure of the JSON data.

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

***

## Navigating the Work Area

- Pan
    - Click and drag in empty white space
    - Arrow keys
>
- Zoom
    - Middle mouse wheel to zoom
    - Zoom in/out gestures on a touch pad
    - `ctrl +` and `ctrl -`
>
- Undo
    - `ctrl z` or `cmd z` on macOS
>
- Redo
    - `ctrl y` or `cmd y` on macOS
>
- Zoom-To-Fit
    - `shift z`

<!-- **************************** -->
<!-- **************************** -->
<!-- **************************** -->

>
>
>
<style>
.button {
  box-sizing: border-box;
  height: 50px;
  width: 400px;
  display: table;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.55);
  transition: background .5s;
  cursor: pointer;
}

.button a {
    text-decoration: none;
}

.button span {
  width: 100%;
  height: 100%;
  padding: 20px;
  color: #2D3142;
  box-shadow: 0 0 0 3px #2D3142 inset;
  background: transparent;
}

.button .away {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.button .over {
  display: none;
}

.button:hover span.away {
  display: none;
}

.button:hover span.over {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  color: white;
  box-shadow: none;
}

.button:hover {
  background: #2D3142;
}
</style>