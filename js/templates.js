/**
 * for convenience and conciseness in defining templates
 */
const $ = go.GraphObject.make

/**
 * all templates for GoJS
 */
const templates = {
    diagramTemplate: _ => {
        return $(
            go.Diagram, "diagramDiv", {
                allowCopy: false,
                initialContentAlignment: go.Spot.Center,
                initialDocumentSpot: go.Spot.Center,
                initialViewportSpot: go.Spot.Center,
                layout: $(go.LayeredDigraphLayout, {
                    setsPortSpots: false, // Links already know their fromSpot and toSpot
                    columnSpacing: 50,
                    layerSpacing: 10,
                    isInitial: false,
                    isOngoing: false
                }),
                validCycle: go.Diagram.CycleNotDirected,
                "undoManager.isEnabled": true,
                padding: 1000,
            }
        )
    },

    fieldTemplate: _ => {
        return $(
            go.Panel, "TableRow", // this Panel is a row in the containing Table
            $(go.TextBlock, {
                    margin: new go.Margin(0, 5),
                    column: 1,
                    font: "italic 11px sans-serif",
                    alignment: go.Spot.Left,
                    fromLinkable: false,
                    toLinkable: false,
                },
                new go.Binding("text", "name"),
            ),
            $(go.TextBlock, {
                    margin: new go.Margin(0, 5),
                    width: 100,
                    column: 2,
                    font: "11px sans-serif",
                    alignment: go.Spot.Left,
                    wrap: go.TextBlock.WrapFit,
                    editable: true,
                },
                new go.Binding("text", "info").makeTwoWay(),
            ),
        )
    },

    defaultNodeTemplate: _ => {
        return $(
            go.Node, "Auto", {
                selectionAdorned: false,
                textEditable: true,
                locationObjectName: "BODY",
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $(go.Shape, {
                    fill: "white",
                    stroke: "gray",
                    minSize: new go.Size(180, 21),
                },
                new go.Binding("fill", "isSelected", function (s) {
                    return s ? self.colors.selectedColor : "white"
                }).ofObject()),
            $(go.Panel, "Vertical", {
                    name: "BODY",
                },
                $(go.Panel, "Auto", {
                        stretch: go.GraphObject.Horizontal,
                    }, // as wide as the whole node
                    $(go.TextBlock, {
                            stroke: "black",
                            font: "12px sans-serif",
                            editable: true,
                            margin: 3,
                            alignment: go.Spot.Left,
                        },
                        new go.Binding("text").makeTwoWay()),
                ),
                // this Panel holds a Panel for each item object in the itemArray;
                // each item Panel is defined by the itemTemplate to be a TableRow in this Table
                $(go.Panel, "Table", {
                        padding: 10,
                        minSize: new go.Size(180, 21),
                        defaultStretch: go.GraphObject.Horizontal,
                        itemTemplate: templates.fieldTemplate(),
                    },
                    new go.Binding("itemArray", "fields"),
                ), // end Table Panel of items
            ),
            // output port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Right,
                    portId: "from",
                    fromLinkable: true,
                    fromSpot: go.Spot.Right,
                    cursor: "pointer",
                    click: methods.addNodeAndLink,
                },
                $(go.Shape, "Circle", {
                    width: 22,
                    height: 22,
                    fill: "white",
                    stroke: "dodgerblue",
                    strokeWidth: 3,
                }),
                $(go.Shape, "PlusLine", {
                    width: 11,
                    height: 11,
                    fill: null,
                    stroke: "dodgerblue",
                    strokeWidth: 3,
                }),
            ),
            // input port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Left,
                    portId: "to",
                    toLinkable: true,
                    toSpot: go.Spot.Left,
                },
                $(go.Shape, "Circle", {
                    width: 8,
                    height: 8,
                    fill: "white",
                    stroke: "gray",
                }),
                $(go.Shape, "Circle", {
                    width: 4,
                    height: 4,
                    fill: "dodgerblue",
                    stroke: null,
                }),
            ),
        )
    },

    startNodeTemplate: _ => {
        return $(
            go.Node, "Auto", {
                selectionAdorned: false,
                textEditable: true,
                locationObjectName: "BODY",
                deletable: false,
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $(go.Shape, {
                    fill: self.colors.startColor,
                    stroke: "gray",
                    minSize: new go.Size(180, 21),
                },
                new go.Binding("fill", "isSelected", function (s) {
                    return s ? self.colors.selectedColor : self.colors.startColor
                }).ofObject()),
            $(go.Panel, "Vertical", {
                    name: "BODY",
                },
                $(go.Panel, "Auto", {
                        stretch: go.GraphObject.Horizontal
                    }, // as wide as the whole node
                    $(go.TextBlock, {
                            stroke: "black",
                            font: "12px sans-serif",
                            editable: true,
                            margin: 3,
                            alignment: go.Spot.Left,
                        },
                        new go.Binding("text").makeTwoWay()),
                ),
                // this Panel holds a Panel for each item object in the itemArray;
                // each item Panel is defined by the itemTemplate to be a TableRow in this Table
                $(go.Panel, "Table", {
                        padding: 10,
                        minSize: new go.Size(180, 21),
                        defaultStretch: go.GraphObject.Horizontal,
                        itemTemplate: templates.fieldTemplate(),
                    },
                    new go.Binding("itemArray", "fields"),
                ), // end Table Panel of items
            ),
            // output port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Right,
                    portId: "from",
                    fromLinkable: true,
                    fromSpot: go.Spot.Right,
                    cursor: "pointer",
                    click: methods.addNodeAndLink,
                },
                $(go.Shape, "Circle", {
                    width: 22,
                    height: 22,
                    fill: "white",
                    stroke: "dodgerblue",
                    strokeWidth: 3,
                }),
                $(go.Shape, "PlusLine", {
                    width: 11,
                    height: 11,
                    fill: null,
                    stroke: "dodgerblue",
                    strokeWidth: 3,
                }),
            ),
        )
    },

    questionNodeTemplate: _ => {
        return $(
            go.Node, "Auto", {
                selectionAdorned: false,
                textEditable: true,
                locationObjectName: "BODY",
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $(go.Shape, {
                    fill: self.colors.questionColor,
                    stroke: "gray",
                    minSize: new go.Size(180, 21),
                },
                new go.Binding("fill", "isSelected", function (s) {
                    return s ? self.colors.selectedColor : self.colors.questionColor
                }).ofObject()),
            $(go.Panel, "Vertical", {
                    name: "BODY",
                },
                $(go.Panel, "Auto", {
                        stretch: go.GraphObject.Horizontal,
                    }, // as wide as the whole node
                    $(go.TextBlock, {
                            stroke: "black",
                            font: "12px sans-serif",
                            editable: true,
                            margin: 3,
                            alignment: go.Spot.Left,
                        },
                        new go.Binding("text").makeTwoWay()),
                ),
                // this Panel holds a Panel for each item object in the itemArray;
                // each item Panel is defined by the itemTemplate to be a TableRow in this Table
                $(go.Panel, "Table", {
                        padding: 10,
                        minSize: new go.Size(180, 21),
                        defaultStretch: go.GraphObject.Horizontal,
                        itemTemplate: templates.fieldTemplate(),
                    },
                    new go.Binding("itemArray", "fields"),
                ), // end Table Panel of items
            ),
            // output port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Right,
                    portId: "from",
                    fromLinkable: true,
                    fromSpot: go.Spot.Right,
                    cursor: "pointer",
                    click: methods.addNodeAndLink,
                },
                $(go.Shape, "Circle", {
                    width: 22,
                    height: 22,
                    fill: "white",
                    stroke: "dodgerblue",
                    strokeWidth: 3,
                }),
                $(go.Shape, "PlusLine", {
                    width: 11,
                    height: 11,
                    fill: null,
                    stroke: "dodgerblue",
                    strokeWidth: 3,
                })
            ),
            // input port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Left,
                    portId: "to",
                    toLinkable: true,
                    toSpot: go.Spot.Left
                },
                $(go.Shape, "Circle", {
                    width: 8,
                    height: 8,
                    fill: "white",
                    stroke: "gray"
                }),
                $(go.Shape, "Circle", {
                    width: 4,
                    height: 4,
                    fill: "dodgerblue",
                    stroke: null,
                }),
            ),
        )
    },

    answerNodeTemplate: _ => {
        return $(
            go.Node, "Auto", {
                selectionAdorned: false,
                textEditable: true,
                locationObjectName: "BODY",
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // the main body consists of a Rectangle surrounding the text
            $(go.Shape, {
                    fill: self.colors.answerColor,
                    stroke: "gray",
                    minSize: new go.Size(180, 21),
                },
                new go.Binding("fill", "isSelected", function (s) {
                    return s ? self.colors.selectedColor : self.colors.answerColor
                }).ofObject()),
            $(go.Panel, "Vertical", {
                    name: "BODY",
                },
                $(go.Panel, "Auto", {
                        stretch: go.GraphObject.Horizontal,
                    }, // as wide as the whole node
                    $(go.TextBlock, {
                            stroke: "black",
                            font: "12px sans-serif",
                            editable: true,
                            margin: 3,
                            alignment: go.Spot.Left,
                        },
                        new go.Binding("text").makeTwoWay()),
                ),
                // this Panel holds a Panel for each item object in the itemArray;
                // each item Panel is defined by the itemTemplate to be a TableRow in this Table
                $(go.Panel, "Table", {
                        padding: 10,
                        minSize: new go.Size(180, 21),
                        defaultStretch: go.GraphObject.Horizontal,
                        itemTemplate: templates.fieldTemplate(),
                    },
                    new go.Binding("itemArray", "fields"),
                ), // end Table Panel of items
            ),
            // output port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Right,
                    portId: "from",
                    fromLinkable: true,
                    fromSpot: go.Spot.Right,
                    cursor: "pointer",
                    click: methods.addNodeAndLink,
                },
                $(go.Shape, "Circle", {
                    width: 22,
                    height: 22,
                    fill: "white",
                    stroke: "dodgerblue",
                    strokeWidth: 3,
                }),
                $(go.Shape, "PlusLine", {
                    width: 11,
                    height: 11,
                    fill: null,
                    stroke: "dodgerblue",
                    strokeWidth: 3,
                })
            ),
            // input port
            $(go.Panel, "Auto", {
                    alignment: go.Spot.Left,
                    portId: "to",
                    toLinkable: true,
                    toSpot: go.Spot.Left,
                },
                $(go.Shape, "Circle", {
                    width: 8,
                    height: 8,
                    fill: "white",
                    stroke: "gray",
                }),
                $(go.Shape, "Circle", {
                    width: 4,
                    height: 4,
                    fill: "dodgerblue",
                    stroke: null,
                })
            ),
        )
    },

    linkTemplate: _ => {
        return $(
            go.Link, {
                selectionAdorned: false,
                fromPortId: "from",
                toPortId: "to",
                relinkableTo: true,
                routing: go.Link.AvoidsNodes
            },
            $(go.Shape, {
                stroke: "gray",
                strokeWidth: 2
            }, {
                mouseEnter: function (e, obj) {
                    obj.strokeWidth = 5;
                    obj.stroke = "dodgerblue";
                },
                mouseLeave: function (e, obj) {
                    obj.strokeWidth = 2;
                    obj.stroke = "gray";
                }
            }),
            $(go.Shape, // the arrowhead
                {
                    stroke: "gray",
                    strokeWidth: 2
                }, {
                    toArrow: "OpenTriangle",
                    fill: null
                })
        )
    },

}