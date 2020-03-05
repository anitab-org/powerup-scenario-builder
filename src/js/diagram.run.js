/**
 * @file diagram.run.js
 * @author justKD
 * @fileoverview
 * Diagram startup script.
 */

import { diagramMethods } from "./diagram.methods";
import { diagramTemplates } from "./diagram.templates";

window["diagramProps"] = {
  helpOpen: false,
  lastQuestionID: 1,
  lastAnswerID: 0,
  deletedQuestions: [],
  deletedAnswers: [],
  colors: {
    selectedColor: "#feca57",
    startColor: "#1dd1a1",
    questionColor: "#00d2d3",
    answerColor: "#a29bfe",
  },
  oldTarget: null,
  ltool: null,
  rtool: null,
  model: null,
  Field: class {
    constructor(name, info) {
      this.name = name;
      this.info = info;
    }
  },
};

const go = window["go"];
const $ = go.GraphObject.make;
const methods = diagramMethods();

const loader = {
  load: () => {
    const props = window["diagramProps"];
    const diagram = window["diagram"];

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

  layout: () => {
    const diagram = window["diagram"];
    diagram.layoutDiagram(true);
  },

  initialLoad: () => {
    const props = window["diagramProps"];
    props.model = {
      class: "go.GraphLinksModel",
      nodeDataArray: [
        {
          key: 1,
          text: "Starting Question",
          category: "Start",
          fields: [
            {
              name: "QuestionID",
              info: "1",
            },
            {
              name: "ScenarioID",
              info: "0",
            },
          ],
        },
      ],
      linkDataArray: [],
    };
  },
};

const run = {
  startup: () => {
    run.setDiagramTemplates();
    run.setLinkingTools();
    run.setupLinkValidation();
    run.addDiagramListeners();
    run.createCustomDragTool();

    loader.initialLoad(); // load initial diagram
    loader.load();
    loader.layout();
  },

  setDiagramTemplates: () => {
    // here, `diagram` is a reference previously declared by GoJS
    window["diagram"] = diagramTemplates.diagramTemplate();
    window["diagram"].nodeTemplate = diagramTemplates.defaultNodeTemplate();
    window["diagram"].nodeTemplateMap.add(
      "Start",
      diagramTemplates.startNodeTemplate(),
    );
    window["diagram"].nodeTemplateMap.add(
      "Question",
      diagramTemplates.questionNodeTemplate(),
    );
    window["diagram"].nodeTemplateMap.add(
      "Answer",
      diagramTemplates.answerNodeTemplate(),
    );
    window["diagram"].linkTemplate = diagramTemplates.linkTemplate();
  },

  setLinkingTools: () => {
    const diagram = window["diagram"];
    const props = window["diagramProps"];
    props.ltool = diagram.toolManager.linkingTool;
    props.rtool = diagram.toolManager.relinkingTool;
    methods.commonLinkingToolInit(props.ltool);
    methods.commonLinkingToolInit(props.rtool);
    // do not allow links to be drawn starting at the "to" port
    props.ltool.direction = go.LinkingTool.ForwardsOnly;
    // change the standard relink handle to be a shape that takes the shape of the link
    props.rtool.toHandleArchetype = $(go.Shape, {
      isPanelMain: true,
      fill: null,
      stroke: "dodgerblue",
      strokeWidth: 5,
    });
  },

  setupLinkValidation: () => {
    const props = window["diagramProps"];
    // // do not allow linking between nodes of the same category
    const linkValidationForSameCategory = (
      fromnode,
      fromport,
      tonode,
      toport,
    ) => {
      let link = true;

      if (fromnode.data.category === tonode.data.category) return false;

      if (
        fromnode.data.category === "Start" &&
        tonode.data.category === "Question"
      )
        return false;

      // check if the answer already has links, only allow 1 to and from per answer
      const checkAnswerLinks = () => {
        const links = fromnode.linksConnected.Ac.n;
        for (let i in links) {
          if (links[i].fromNode === fromnode) link = false;
        }
      };

      // check if the question already has links, don't allow it to connect to questions, but otherwise allow multiple links
      const checkQuestionLinks = () => {
        const links = tonode.linksConnected.Ac.n;
        for (let i in links) {
          if (
            links[i].fromNode.data.category === "Question" ||
            links[i].fromNode.data.category === "Start"
          )
            link = false;
        }
      };

      fromnode.data.category === "Answer" &&
        fromnode.linksConnected.count > 0 &&
        checkAnswerLinks();
      fromnode.data.category === "Question" &&
        tonode.linksConnected.count > 0 &&
        checkQuestionLinks();

      return link;
    };

    props.rtool.linkValidation = linkValidationForSameCategory;
    props.ltool.linkValidation = linkValidationForSameCategory;
  },

  addDiagramListeners: () => {
    const diagram = window["diagram"];
    // when the document is modified, add a "*" to the document title for visual feedback
    diagram.addDiagramListener("Modified", function(e) {
      const idx = document.title.indexOf("*");
      const showStar = () => idx < 0 && (document.title += "*");
      const noStar = () =>
        idx >= 0 && (document.title = document.title.substr(0, idx));

      diagram.isModified ? showStar() : noStar();
    });

    diagram.addDiagramListener("SelectionDeleted", function(e) {
      const props = window["props"];
      const data = e.subject.Ea.key.data;
      if (data.fields) {
        props.model = diagram.model.toJson();

        const j = JSON.parse(props.model).nodeDataArray;
        const sID = j[0].fields[1].info;
        const baseID = sID * 1000;
        const currentID = data.fields[0].info;
        const newID = currentID - baseID;

        data.category === "Answer" && props.deletedAnswers.push(newID);
        data.category === "Question" && props.deletedQuestions.push(newID);
      }
    });

    diagram.addDiagramListener("LinkDrawn", function(e) {
      methods.handleLinking(e);
    });

    diagram.addDiagramListener("LinkRelinked", function(e) {
      methods.handleLinking(e);
    });

    // detect when dropped onto an occupied cell
    diagram.addDiagramListener(
      "SelectionMoved",
      methods.shiftNodesToEmptySpaces,
    );

    diagram.toolManager.mouseWheelBehavior = go.ToolManager.WheelZoom;
  },

  createCustomDragTool: () => {
    const diagram = window["diagram"];
    // Define a custom tool that changes a drag operation on a Link to a relinking operation,
    // but that operates like a normal DraggingTool otherwise.
    function DragLinkingTool() {
      go.DraggingTool.call(this);
      this.isGridSnapEnabled = false;
      this.isGridSnapRealtime = false;
      this.gridSnapCellSize = new go.Size(240, 1);
      this.gridSnapOrigin = new go.Point(5.5, 0);
    }
    go.Diagram.inherit(DragLinkingTool, go.DraggingTool);

    // Handle dragging a link specially -- by starting the RelinkingTool on that Link
    /** @override */
    DragLinkingTool.prototype.doActivate = function() {
      const diagram = this.diagram;
      if (diagram === null) return;

      this.standardMouseSelect();
      const main = this.currentPart; // this is set by the standardMouseSelect

      const handleLink = () => {
        const relinkingtool = diagram.toolManager.relinkingTool;
        // tell the RelinkingTool to work on this Link, not what is under the mouse
        relinkingtool.originalLink = main;
        // start the RelinkingTool
        diagram.currentTool = relinkingtool;
        // can activate it right now, because it already has the originalLink to reconnect
        relinkingtool.doActivate();
        relinkingtool.doMouseMove();
      };

      main instanceof go.Link
        ? handleLink()
        : go.DraggingTool.prototype.doActivate.call(this);
    };

    // use DraggingTool to cause the dragging of a Link to start relinking it
    diagram.toolManager.draggingTool = new DragLinkingTool();
  },
};
run.startup();
