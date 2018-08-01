class Field {
    constructor(name, info) {
        this.name = name
        this.info = info
    }
}

const self = {
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
}

const methods = {
    // this is a click event handler that adds a node and a link to the diagram,
    // connecting with the node on which the click occurred
    addNodeAndLink: (e, obj) => {

        // get the node data for which the user clicked the button
        const fromNode = obj.part
        const fromData = fromNode.data

        const diagram = fromNode.diagram
        const updatemodel = diagram.model

        diagram.startTransaction("Add State")
        self.model = diagram.model.toJson()

        const j = JSON.parse(self.model).nodeDataArray
        const sID = j[0].fields[1].info
        const baseID = sID * 1000

        let makeNode = true
        let category, fields

        const setAsAnswer = _ => {
            // handle new nodes from the starting node
            const handleFromStart = _ => {
                const startFields = [
                    new Field("QuestionID", baseID + 1),
                    new Field("ScenarioID", fromData.fields[1].info),
                ]
                updatemodel.startTransaction("updateStartingID")
                updatemodel.setDataProperty(fromData, "fields", startFields)
                updatemodel.commitTransaction("updateStartingID")
            }
            fromData.category == "Start" && handleFromStart()

            // account for any previously deleted answers and reuse those ids first
            const hasDeletedAnswers = _ => {
                return self.deletedAnswers[0] && self.deletedAnswers.shift()
            }
            const noDeletedAnswers = _ => {
                self.lastAnswerID = self.lastAnswerID + 1
                return self.lastAnswerID
            }
            const aID = self.deletedAnswers.length > 0 ? hasDeletedAnswers() : noDeletedAnswers()

            category = "Answer"
            fields = [
                new Field("AnswerID", aID + baseID),
                new Field("QuestionID", fromData.fields[0].info),
                new Field("NextQID", "-1"),
                new Field("PopupID", "&"),
                new Field("Points", "2"),
            ]
        }

        const setAsQuestion = _ => {
            // check if the answer already has a question, and only allow 1 question per answer
            const checkForLink = _ => {
                fromNode.linksConnected.Ac.n.map(link => {
                    link.fromNode == fromNode && (makeNode = false)
                })
            }
            fromNode.linksConnected.Ac && checkForLink()

            const makeQuestion = _ => {
                // account for any previously deleted questions and reuse those ids first
                const hasDeletedQuestions = _ => {
                    return self.deletedQuestions[0] && self.deletedQuestions.shift()
                }
                const noDeletedQuestions = _ => {
                    self.lastQuestionID = self.lastQuestionID + 1
                    return self.lastQuestionID
                }
                const qID = self.deletedQuestions.length > 0 ? hasDeletedQuestions() : noDeletedQuestions()

                // update fields for from Answer
                const updatefields = [
                    new Field("AnswerID", fromData.fields[0].info),
                    new Field("QuestionID", fromData.fields[1].info),
                    new Field("NextQID", qID + baseID),
                    new Field("PopupID", fromData.fields[3].info),
                    new Field("Points", fromData.fields[4].info),
                ]

                updatemodel.startTransaction("updateNextQID")
                updatemodel.setDataProperty(fromData, "fields", updatefields)
                updatemodel.commitTransaction("updateNextQID")

                category = "Question"
                fields = [
                    new Field("QuestionID", qID + baseID),
                ]
            }

            makeNode && makeQuestion()
        }

        const commitNewNodeAndLinks = _ => {
            // create a new "State" data object, positioned off to the right of the fromNode
            const p = fromNode.location.copy()
            p.x += diagram.toolManager.draggingTool.gridSnapCellSize.width
            const toData = {
                text: "new",
                category: category,
                loc: go.Point.stringify(p),
                fields: fields,
            }
            // add the new node data to the model
            const model = diagram.model
            model.addNodeData(toData)
            // create a link data from the old node data to the new node data
            const linkdata = {
                from: model.getKeyForNodeData(fromData),
                to: model.getKeyForNodeData(toData)
            }
            // and add the link data to the model
            model.addLinkData(linkdata)
            // select the new Node
            const newnode = diagram.findNodeForData(toData)
            diagram.select(newnode)
            // snap the new node to a valid location
            newnode.location = diagram.toolManager.draggingTool.computeMove(newnode, p)
            // then account for any overlap and commit
            methods.shiftNodesToEmptySpaces()
            diagram.commitTransaction("Add State")
        }

        fromData.category == "Start" || fromData.category == "Question" ? setAsAnswer() : setAsQuestion()
        makeNode && commitNewNodeAndLinks()
    },

    shiftNodesToEmptySpaces: _ => {
        diagram.selection.each(function (node) {
            if (!(node instanceof go.Node)) return
            // look for Parts overlapping the node
            while (true) {
                var exist = diagram.findObjectsIn(node.actualBounds,
                    // only consider Parts
                    function (obj) {
                        return obj.part
                    },
                    // ignore Links and the dropped node itself
                    function (part) {
                        return part instanceof go.Node && part !== node
                    },
                    // check for any overlap, not complete containment
                    true).first()
                if (exist === null) break
                // try shifting down beyond the existing node to see if there's empty space
                node.position = new go.Point(node.actualBounds.x, exist.actualBounds.bottom + 10)
            }
        })
    },

    // Highlight ports when they are targets for linking or relinking.
    highlight: port => {
        const highlightPort = _ => {
            methods.lowlight() // remove highlight from any old port
            self.oldTarget = port
            port.scale = 1.3 // highlight by enlarging
        }
        self.oldTarget !== port && highlightPort()
    },

    lowlight: _ => { // remove any highlight
        const lowlightPort = _ => {
            self.oldTarget.scale = 1.0
            self.oldTarget = null
        }
        self.oldTarget && lowlightPort()
    },

    handleLinking: e => {

        const fromNode = e.subject.fromNode
        const toNode = e.subject.toNode
        const fromData = fromNode.data
        const toData = toNode.data
        const updatemodel = diagram.model

        // automatically set the qid properties for an answer when re-linked to a question 
        const doUpdateModel = (data, fields) => {
            updatemodel.startTransaction("updateNextQID")
            updatemodel.setDataProperty(data, "fields", fields)
            updatemodel.commitTransaction("updateNextQID")
        }

        // update the current answer NextQID
        const isFromAnswer = _ => {
            const fields = [
                new Field("AnswerID", fromData.fields[0].info),
                new Field("QuestionID", fromData.fields[1].info),
                new Field("NextQID", toData.fields[0].info),
                new Field("PopupID", fromData.fields[3].info),
                new Field("Points", fromData.fields[4].info),
            ]

            doUpdateModel(fromData, fields)
        }

        // update the target answer QuestionID
        const isFromQuestion = _ => {
            const fields = [
                new Field("AnswerID", toData.fields[0].info),
                new Field("QuestionID", fromData.fields[0].info),
                new Field("NextQID", toData.fields[2].info),
                new Field("PopupID", toData.fields[3].info),
                new Field("Points", toData.fields[4].info),
            ]

            doUpdateModel(toData, fields)
        }

        fromData.category == "Start" || fromData.category == "Question" ? isFromQuestion() : isFromAnswer()
    },

    commonLinkingToolInit: tool => {
        // the temporary link drawn during a link drawing operation (LinkingTool) is thick and blue
        tool.temporaryLink = $(
            go.Link, {
                layerName: "Tool",
            },
            $(go.Shape, {
                stroke: "dodgerblue",
                strokeWidth: 2,
            }),
        )

        // change the standard proposed ports feedback from blue rectangles to transparent circles
        tool.temporaryFromPort.figure = "Circle"
        tool.temporaryFromPort.stroke = null
        tool.temporaryFromPort.strokeWidth = 0
        tool.temporaryToPort.figure = "Circle"
        tool.temporaryToPort.stroke = null
        tool.temporaryToPort.strokeWidth = 0

        // provide customized visual feedback as ports are targeted or not
        tool.portTargeted = function (realnode, realport, tempnode, tempport, toend) {
            realport === null && methods.lowlight() // no valid port nearby
            toend && methods.highlight(realport) // has potential target, so highlight it
        }
    },

}

const run = {
    startup: _ => {
        run.setDiagramTemplates()
        run.setLinkingTools()
        run.setupLinkValidation()
        run.addDiagramListeners()
        run.createCustomDragTool()


        toolbar.initialLoad() // load initial diagram
        toolbar.load()
        toolbar.layout()
    },

    setDiagramTemplates: _ => {
        // here, `diagram` is a reference previously declared by GoJS
        diagram = templates.diagramTemplate()
        diagram.nodeTemplate = templates.defaultNodeTemplate()
        diagram.nodeTemplateMap.add("Start", templates.startNodeTemplate())
        diagram.nodeTemplateMap.add("Question", templates.questionNodeTemplate())
        diagram.nodeTemplateMap.add("Answer", templates.answerNodeTemplate())
        diagram.linkTemplate = templates.linkTemplate()
    },

    setLinkingTools: _ => {

        self.ltool = diagram.toolManager.linkingTool
        self.rtool = diagram.toolManager.relinkingTool
        methods.commonLinkingToolInit(self.ltool)
        methods.commonLinkingToolInit(self.rtool)
        // do not allow links to be drawn starting at the "to" port
        self.ltool.direction = go.LinkingTool.ForwardsOnly
        // change the standard relink handle to be a shape that takes the shape of the link
        self.rtool.toHandleArchetype = $(
            go.Shape, {
                isPanelMain: true,
                fill: null,
                stroke: "dodgerblue",
                strokeWidth: 5
            }
        )
    },

    setupLinkValidation: _ => {
        // // do not allow linking between nodes of the same category
        const linkValidationForSameCategory = (fromnode, fromport, tonode, toport) => {

            let link = true

            if (fromnode.data.category === tonode.data.category)
                return false

            if (fromnode.data.category === "Start" && tonode.data.category === "Question")
                return false

            // check if the answer already has links, only allow 1 to and from per answer
            const checkAnswerLinks = _ => {
                const links = fromnode.linksConnected.Ac.n
                for (let i in links) {
                    if (links[i].fromNode == fromnode)
                        link = false
                }
            }

            // check if the question already has links, don't allow it to connect to questions, but otherwise allow multiple links
            const checkQuestionLinks = _ => {
                const links = tonode.linksConnected.Ac.n
                for (let i in links) {
                    if (links[i].fromNode.data.category == "Question" || links[i].fromNode.data.category == "Start")
                        link = false
                }
            }

            fromnode.data.category == "Answer" && fromnode.linksConnected.count > 0 && checkAnswerLinks()
            fromnode.data.category == "Question" && tonode.linksConnected.count > 0 && checkQuestionLinks()

            return link
        }

        self.rtool.linkValidation = linkValidationForSameCategory
        self.ltool.linkValidation = linkValidationForSameCategory
    },

    addDiagramListeners: _ => {
        // when the document is modified, add a "*" to the document title for visual feedback
        diagram.addDiagramListener("Modified", function (e) {
            const idx = document.title.indexOf("*")
            const showStar = _ => (idx < 0) && (document.title += "*")
            const noStar = _ => (idx >= 0) && (document.title = document.title.substr(0, idx))

            diagram.isModified ? showStar() : noStar()
        })

        diagram.addDiagramListener("SelectionDeleted", function (e) {
            const data = e.subject.Ea.key.data
            if (data.fields) {
                self.model = diagram.model.toJson()

                const j = JSON.parse(self.model).nodeDataArray
                const sID = j[0].fields[1].info
                const baseID = sID * 1000
                const currentID = data.fields[0].info
                const newID = currentID - baseID

                data.category == "Answer" && self.deletedAnswers.push(newID)
                data.category == "Question" && self.deletedQuestions.push(newID)
            }
        })

        diagram.addDiagramListener("LinkDrawn", function (e) {
            methods.handleLinking(e)
        })

        diagram.addDiagramListener("LinkRelinked", function (e) {
            methods.handleLinking(e)
        })

        // detect when dropped onto an occupied cell
        diagram.addDiagramListener("SelectionMoved", methods.shiftNodesToEmptySpaces)

        diagram.toolManager.mouseWheelBehavior = go.ToolManager.WheelZoom
    },

    createCustomDragTool: _ => {
        // Define a custom tool that changes a drag operation on a Link to a relinking operation,
        // but that operates like a normal DraggingTool otherwise.
        function DragLinkingTool() {
            go.DraggingTool.call(this)
            this.isGridSnapEnabled = false
            this.isGridSnapRealtime = false
            this.gridSnapCellSize = new go.Size(240, 1)
            this.gridSnapOrigin = new go.Point(5.5, 0)
        }
        go.Diagram.inherit(DragLinkingTool, go.DraggingTool)

        // Handle dragging a link specially -- by starting the RelinkingTool on that Link
        /** @override */
        DragLinkingTool.prototype.doActivate = function () {
            const diagram = this.diagram
            if (diagram === null) return

            this.standardMouseSelect()
            const main = this.currentPart // this is set by the standardMouseSelect

            const handleLink = _ => {
                const relinkingtool = diagram.toolManager.relinkingTool
                // tell the RelinkingTool to work on this Link, not what is under the mouse
                relinkingtool.originalLink = main
                // start the RelinkingTool
                diagram.currentTool = relinkingtool
                // can activate it right now, because it already has the originalLink to reconnect
                relinkingtool.doActivate()
                relinkingtool.doMouseMove()
            }

            main instanceof go.Link ? handleLink() : go.DraggingTool.prototype.doActivate.call(this)
        }

        // use DraggingTool to cause the dragging of a Link to start relinking it
        diagram.toolManager.draggingTool = new DragLinkingTool()
    },

}

run.startup()