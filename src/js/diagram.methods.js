/**
 * @file diagram.methods.js
 * @author justKD
 * @fileoverview `export const diagramMethods`
 * Various functionality for the GoJS diagram.
 */

const shiftNodesToEmptySpaces = () => {
  const diagram = window["diagram"];
  const go = window["go"];
  diagram.selection.each(function(node) {
    if (!(node instanceof go.Node)) return;
    // look for Parts overlapping the node
    while (true) {
      var exist = diagram
        .findObjectsIn(
          node.actualBounds,
          // only consider Parts
          function(obj) {
            return obj.part;
          },
          // ignore Links and the dropped node itprops
          function(part) {
            return part instanceof go.Node && part !== node;
          },
          // check for any overlap, not complete containment
          true,
        )
        .first();
      if (exist === null) break;
      // try shifting down beyond the existing node to see if there's empty space
      node.position = new go.Point(
        node.actualBounds.x,
        exist.actualBounds.bottom + 10,
      );
    }
  });
};

// this is a click event handler that adds a node and a link to the diagram,
// connecting with the node on which the click occurred
const addNodeAndLink = (e, obj) => {
  const go = window["go"];
  const props = window["diagramProps"];
  // get the node data for which the user clicked the button
  const fromNode = obj.part;
  const fromData = fromNode.data;

  const diagram = fromNode.diagram;
  const updatemodel = diagram.model;

  diagram.startTransaction("Add State");
  props.model = diagram.model.toJson();

  const j = JSON.parse(props.model).nodeDataArray;
  const sID = j[0].fields[1].info;
  const baseID = sID * 1000;

  let makeNode = true;
  let category, fields;

  const setAsAnswer = () => {
    // handle new nodes from the starting node
    const handleFromStart = () => {
      const startFields = [
        new props.Field("QuestionID", baseID + 1),
        new props.Field("ScenarioID", fromData.fields[1].info),
      ];
      updatemodel.startTransaction("updateStartingID");
      updatemodel.setDataProperty(fromData, "fields", startFields);
      updatemodel.commitTransaction("updateStartingID");
    };
    fromData.category === "Start" && handleFromStart();

    // account for any previously deleted answers and reuse those ids first
    const hasDeletedAnswers = () => {
      return props.deletedAnswers[0] && props.deletedAnswers.shift();
    };
    const noDeletedAnswers = () => {
      props.lastAnswerID = props.lastAnswerID + 1;
      return props.lastAnswerID;
    };
    const aID =
      props.deletedAnswers.length > 0
        ? hasDeletedAnswers()
        : noDeletedAnswers();

    category = "Answer";
    fields = [
      new props.Field("AnswerID", aID + baseID),
      new props.Field("QuestionID", fromData.fields[0].info),
      new props.Field("NextQID", "-1"),
      new props.Field("PopupID", "&"),
      new props.Field("Points", "2"),
    ];
  };

  const setAsQuestion = () => {
    // check if the answer already has a question, and only allow 1 question per answer
    const checkForLink = () => {
      fromNode.linksConnected.Ac.n.map(link => {
        return link.fromNode === fromNode && (makeNode = false);
      });
    };
    fromNode.linksConnected.Ac && checkForLink();

    const makeQuestion = () => {
      // account for any previously deleted questions and reuse those ids first
      const hasDeletedQuestions = () => {
        return props.deletedQuestions[0] && props.deletedQuestions.shift();
      };
      const noDeletedQuestions = () => {
        props.lastQuestionID = props.lastQuestionID + 1;
        return props.lastQuestionID;
      };
      const qID =
        props.deletedQuestions.length > 0
          ? hasDeletedQuestions()
          : noDeletedQuestions();

      // update fields for from Answer
      const updatefields = [
        new props.Field("AnswerID", fromData.fields[0].info),
        new props.Field("QuestionID", fromData.fields[1].info),
        new props.Field("NextQID", qID + baseID),
        new props.Field("PopupID", fromData.fields[3].info),
        new props.Field("Points", fromData.fields[4].info),
      ];

      updatemodel.startTransaction("updateNextQID");
      updatemodel.setDataProperty(fromData, "fields", updatefields);
      updatemodel.commitTransaction("updateNextQID");

      category = "Question";
      fields = [new props.Field("QuestionID", qID + baseID)];
    };

    makeNode && makeQuestion();
  };

  const commitNewNodeAndLinks = () => {
    // create a new "State" data object, positioned off to the right of the fromNode
    const p = fromNode.location.copy();
    p.x += diagram.toolManager.draggingTool.gridSnapCellSize.width;
    const toData = {
      text: "new",
      category: category,
      loc: go.Point.stringify(p),
      fields: fields,
    };
    // add the new node data to the model
    const model = diagram.model;
    model.addNodeData(toData);
    // create a link data from the old node data to the new node data
    const linkdata = {
      from: model.getKeyForNodeData(fromData),
      to: model.getKeyForNodeData(toData),
    };
    // and add the link data to the model
    model.addLinkData(linkdata);
    // select the new Node
    const newnode = diagram.findNodeForData(toData);
    diagram.select(newnode);
    // snap the new node to a valid location
    newnode.location = diagram.toolManager.draggingTool.computeMove(newnode, p);
    // then account for any overlap and commit
    shiftNodesToEmptySpaces();
    diagram.commitTransaction("Add State");
  };

  fromData.category === "Start" || fromData.category === "Question"
    ? setAsAnswer()
    : setAsQuestion();
  makeNode && commitNewNodeAndLinks();
};

const lowlight = () => {
  const props = window["diagramProps"];
  // remove any highlight
  const lowlightPort = () => {
    props.oldTarget.scale = 1.0;
    props.oldTarget = null;
  };
  props.oldTarget && lowlightPort();
};

// Highlight ports when they are targets for linking or relinking.
const highlight = port => {
  const props = window["diagramProps"];
  const highlightPort = () => {
    lowlight(); // remove highlight from any old port
    props.oldTarget = port;
    port.scale = 1.3; // highlight by enlarging
  };
  props.oldTarget !== port && highlightPort();
};

const handleLinking = e => {
  const diagram = window["diagram"];
  const props = window["diagramProps"];

  const fromNode = e.subject.fromNode;
  const toNode = e.subject.toNode;
  const fromData = fromNode.data;
  const toData = toNode.data;
  const updatemodel = diagram.model;

  // automatically set the qid properties for an answer when re-linked to a question
  const doUpdateModel = (data, fields) => {
    updatemodel.startTransaction("updateNextQID");
    updatemodel.setDataProperty(data, "fields", fields);
    updatemodel.commitTransaction("updateNextQID");
  };

  // update the current answer NextQID
  const isFromAnswer = () => {
    const fields = [
      new props.Field("AnswerID", fromData.fields[0].info),
      new props.Field("QuestionID", fromData.fields[1].info),
      new props.Field("NextQID", toData.fields[0].info),
      new props.Field("PopupID", fromData.fields[3].info),
      new props.Field("Points", fromData.fields[4].info),
    ];

    doUpdateModel(fromData, fields);
  };

  // update the target answer QuestionID
  const isFromQuestion = () => {
    const fields = [
      new props.Field("AnswerID", toData.fields[0].info),
      new props.Field("QuestionID", fromData.fields[0].info),
      new props.Field("NextQID", toData.fields[2].info),
      new props.Field("PopupID", toData.fields[3].info),
      new props.Field("Points", toData.fields[4].info),
    ];

    doUpdateModel(toData, fields);
  };

  fromData.category === "Start" || fromData.category === "Question"
    ? isFromQuestion()
    : isFromAnswer();
};

const commonLinkingToolInit = tool => {
  const go = window["go"];
  // the temporary link drawn during a link drawing operation (LinkingTool) is thick and blue
  tool.temporaryLink = go.GraphObject.make(
    go.Link,
    {
      layerName: "Tool",
    },
    go.GraphObject.make(go.Shape, {
      stroke: "dodgerblue",
      strokeWidth: 2,
    }),
  );

  // change the standard proposed ports feedback from blue rectangles to transparent circles
  tool.temporaryFromPort.figure = "Circle";
  tool.temporaryFromPort.stroke = null;
  tool.temporaryFromPort.strokeWidth = 0;
  tool.temporaryToPort.figure = "Circle";
  tool.temporaryToPort.stroke = null;
  tool.temporaryToPort.strokeWidth = 0;

  // provide customized visual feedback as ports are targeted or not
  tool.portTargeted = function(realnode, realport, tempnode, tempport, toend) {
    realport === null && lowlight(); // no valid port nearby
    toend && highlight(realport); // has potential target, so highlight it
  };
};

export const diagramMethods = () => {
  return {
    shiftNodesToEmptySpaces: shiftNodesToEmptySpaces,
    addNodeAndLink: addNodeAndLink,
    lowlight: lowlight,
    highlight: highlight,
    handleLinking: handleLinking,
    commonLinkingToolInit: commonLinkingToolInit,
  };
};
