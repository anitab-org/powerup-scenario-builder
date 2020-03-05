/**
 * @file diagram.toolbar.js
 * @author justKD
 * @fileoverview `export const diagramToolbar`
 * Methods called by the toolbar components.
 */
const svg2pdf = require("svg2pdf.js");
const jsPDF = require("jspdf-yworks");

const pvt = {
  download: (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], {
      type: contentType,
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  },
  parseFile: () => {
    const diagram = window["diagram"];
    const props = window["diagramProps"];
    const go = window["go"];

    diagram.clear();
    diagram.model = go.Model.fromJson(props.model);

    props.lastQuestionID = 0;
    props.lastAnswerID = 0;

    // update lastQuestionID and lastAnswerID when loading a model
    const nodes = diagram.model.nodeDataArray;
    for (let i in nodes) {
      const data = nodes[i];
      const category = data.category;

      if (category === "Question" || category === "Start") {
        const currentID = parseInt(data.fields[0].info, 10);
        if (currentID > props.lastQuestionID) {
          props.lastQuestionID = currentID;
        }
      }
      if (category === "Answer") {
        const currentID = parseInt(data.fields[0].info, 10);
        if (currentID > props.lastQuestionID) {
          props.lastAnswerID = currentID;
        }
      }
    }
  },

  getSVG: () => {
    const diagram = window["diagram"];
    const svg = diagram.makeSvg({
      scale: 1,
    });
    return svg;
  },
};

/**
 * Toolbar functionality.
 */
export const diagramToolbar = {
  /**
   * Save a JSON of the current map.
   */
  save: () => {
    const diagram = window["diagram"];
    const props = window["diagramProps"];
    props.model = diagram.model.toJson();
    diagram.isModified = false;

    const data = {
      model: props.model,
      lastQuestionID: props.lastQuestionID,
      lastAnswerID: props.lastAnswerID,
      deletedQuestions: props.deletedQuestions,
      deletedAnswers: props.deletedAnswers,
    };

    pvt.download(JSON.stringify(data), "powerup-map.json", "text/plain");
  },

  /**
   * Export either a question of answer CSV formatted for use with PowerUp.
   * @param {number} target = Pass a `0` for questions or `1` for answers.
   */
  exportCSV: target => {
    const diagram = window["diagram"];
    const props = window["diagramProps"];

    props.model = diagram.model.toJson();

    const records = JSON.parse(props.model).nodeDataArray;
    const sID = records[0].fields[1].info;
    const arr = [];
    let fileName;

    const handleQuestions = () => {
      records.forEach(record => {
        if (record.category === "Start" || record.category === "Question") {
          const ScenarioID = sID,
            QuestionID = record.fields[0].info,
            QDescription = record.text,
            newRecord = {
              QuestionID: QuestionID,
              ScenarioID: ScenarioID,
              QDescription: QDescription,
            };
          arr.push(newRecord);
        }
      });
      fileName = "powerup-map-questions.csv";
    };

    const handleAnswers = () => {
      let answers = [];
      records.forEach(record => {
        if (record.category === "Answer") answers.push(record);
      });
      if (answers.length > 0) {
        answers.forEach(record => {
          const AnswerID = record.fields[0].info,
            QuestionID = record.fields[1].info,
            ADescription = record.text,
            NextQID = record.fields[2].info,
            Points = record.fields[4].info,
            PopupID = record.fields[3].info,
            newRecord = {
              AnswerID: AnswerID,
              QuestionID: QuestionID,
              ADescription: ADescription,
              NextQID: NextQID,
              Points: Points,
              PopupID: PopupID,
            };
          arr.push(newRecord);
        });
      } else {
        alert("You'll need to add some Answers first!");
      }
      fileName = "powerup-map-answers.csv";
    };

    const makeCSV = () => {
      const replacer = (key, value) => (value === null ? "" : value);
      const header = Object.keys(arr[0]);
      const csv = arr.map(row =>
        header
          .map(fieldName => JSON.stringify(row[fieldName], replacer))
          .join(","),
      );
      csv.unshift(header.join(","));
      const csvString = csv.join("\r\n");

      pvt.download(csvString, fileName);
    };

    target ? handleQuestions() : handleAnswers();
    arr.length > 0 && makeCSV();
  },

  /**
   * Create a hidden file input element and open the file dialog. Once a valid
   * JSON file is selected, parse the data into the local model and update the
   * diagram.
   */
  load: () => {
    if (typeof window.FileReader !== "function") {
      alert("The file API isn't supported on this browser yet.");
      return;
    }

    var input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
      }
    };
    document.body.appendChild(input);

    const receivedText = e => {
      const lines = e.target.result;
      const data = JSON.parse(lines);
      const props = window["diagramProps"];

      props.model = data.model;
      props.lastQuestionID = data.lastQuestionID;
      props.lastAnswerID = data.lastAnswerID;
      props.deletedQuestions = data.deletedQuestions;
      props.deletedAnswers = data.deletedAnswers;
      document.body.removeChild(input);
      pvt.parseFile();
    };

    if (!input) {
      alert("Couldn't find the fileinput element.");
      return;
    } else if (!input.files) {
      alert(
        "This browser doesn't seem to support the `files` property of file inputs.",
      );
      return;
    } else if (!input.files[0]) {
      input.click();
    }
  },

  /**
   * Download the current graph as an SVG file.
   */
  exportSVG: () => {
    const svg = pvt.getSVG(),
      serializer = new XMLSerializer(),
      source = serializer.serializeToString(svg);

    pvt.download(source, "powerup-map.svg");
  },

  /**
   * Download the current graph as a PDF file.
   */
  exportPDF: () => {
    const svg = pvt.getSVG();
    const margin = 200;
    const width = svg.width.baseVal.value + margin;
    const height = svg.height.baseVal.value + margin;
    const pdf = new jsPDF("l", "pt", [width, height]);
    svg2pdf(svg, pdf, {
      xOffset: margin / 2,
      yOffset: margin / 2,
      scale: 1,
    });
    pdf.save("powerup-map.pdf");
  },

  /**
   * Attempt to automatically layout the diagram.
   */
  layout: () => {
    const diagram = window["diagram"];
    diagram.layoutDiagram(true);
  },
};
