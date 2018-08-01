const toolbar = {

    save: _ => {
        self.model = diagram.model.toJson()
        diagram.isModified = false

        const data = {
            model: self.model,
            lastQuestionID: self.lastQuestionID,
            lastAnswerID: self.lastAnswerID,
            deletedQuestions: self.deletedQuestions,
            deletedAnswers: self.deletedAnswers,
        }

        toolbar.download(JSON.stringify(data), 'powerup-map.json', 'text/plain')
    },

    exportCSV: target => {
        self.model = diagram.model.toJson()

        const j = JSON.parse(self.model).nodeDataArray
        const sID = j[0].fields[1].info
        const arr = []
        let fileName

        const handleQuestions = _ => {
            for (let i in j) {
                const record = j[i];
                if (record.category == "Start" || record.category == "Question") {
                    const ScenarioID = sID,
                        QuestionID = record.fields[0].info,
                        QDescription = record.text,
                        newRecord = {
                            QuestionID: QuestionID,
                            ScenarioID: ScenarioID,
                            QDescription: QDescription
                        }
                    arr.push(newRecord)
                }
            }

            fileName = "powerup-map-questions.csv"
        }

        const handleAnswers = _ => {
            for (let i in j) {
                const record = j[i]
                if (record.category == "Answer") {
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
                            PopupID: PopupID
                        }
                    arr.push(newRecord)
                }
            }

            fileName = "powerup-map-answers.csv"
        }

        const makeCSV = _ => {
            const replacer = (key, value) => value === null ? '' : value
            const header = Object.keys(arr[0])
            let csv = arr.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
            csv.unshift(header.join(','))
            csv = csv.join('\r\n')

            toolbar.download(csv, fileName)
        }

        target ? handleQuestions() : handleAnswers()
        arr.length > 0 && makeCSV()
    },

    download: (content, fileName, contentType) => {
        const a = document.createElement("a")
        const file = new Blob([content], {
            type: contentType
        })
        a.href = URL.createObjectURL(file)
        a.download = fileName
        a.click()
    },

    loadFile: _ => {
        let input, file, fr

        if (typeof window.FileReader !== 'function') {
            alert("The file API isn't supported on this browser yet.")
            return
        }

        input = document.getElementById('fileInput')
        if (!input) {
            alert("Um, couldn't find the fileinput element.")
        } else if (!input.files) {
            alert("This browser doesn't seem to support the `files` property of file inputs.")
        } else if (!input.files[0]) {
            alert("Please select a file before clicking 'Load'")
        } else {
            file = input.files[0]
            fr = new FileReader()
            fr.onload = receivedText
            fr.readAsText(file)
        }

        function receivedText(e) {
            const lines = e.target.result
            const data = JSON.parse(lines)
            self.model = data.model
            self.lastQuestionID = data.lastQuestionID
            self.lastAnswerID = data.lastAnswerID
            self.deletedQuestions = data.deletedQuestions
            self.deletedAnswers = data.deletedAnswers
            toolbar.load()
        }
    },

    resetFile: _ => {
        const input = document.getElementById('fileInput')
        input.value = ""
    },

    load: _ => {
        diagram.clear()
        diagram.model = go.Model.fromJson(self.model)

        self.lastQuestionID = 0
        self.lastAnswerID = 0

        // update lastQuestionID and lastAnswerID when loading a model
        const nodes = diagram.model.nodeDataArray
        for (let i in nodes) {
            const data = nodes[i]
            const category = data.category

            if (category == "Question" || category == "Start") {
                const currentID = parseInt(data.fields[0].info, 10)
                if (currentID > self.lastQuestionID) {
                    self.lastQuestionID = currentID
                }
            }
            if (category == "Answer") {
                const currentID = parseInt(data.fields[0].info, 10)
                if (currentID > self.lastQuestionID) {
                    self.lastAnswerID = currentID
                }
            }
        }
    },

    getSVG: _ => {
        const svg = diagram.makeSvg({
            scale: 1
        })
        return svg
    },

    exportSVG: _ => {
        const svg = toolbar.getSVG(),
            serializer = new XMLSerializer(),
            source = serializer.serializeToString(svg)

        toolbar.download(source, "powerup-map.svg")
    },

    exportPDF: _ => {
        const svg = toolbar.getSVG(),
            margin = 200,
            width = svg.width.baseVal.value + margin,
            height = svg.height.baseVal.value + margin,
            pdf = new jsPDF('l', 'pt', [width, height])

        svg2pdf(svg, pdf, {
            xOffset: margin / 2,
            yOffset: margin / 2,
            scale: 1
        })

        pdf.save('powerup-map.pdf')
    },

    layout: _ => {
        diagram.layoutDiagram(true)
    },


    initialLoad: _ => {
        self.model = {
            "class": "go.GraphLinksModel",
            "nodeDataArray": [{
                "key": 1,
                "text": "Starting Question",
                "category": "Start",
                "fields": [{
                        name: "QuestionID",
                        info: "1"
                    },
                    {
                        name: "ScenarioID",
                        info: "0"
                    }
                ]
            }],
            "linkDataArray": [],
        }
    },

    toggleHelpMenu: _ => {
        const value = (self.helpOpen ? "-300px" : "0")
        self.helpOpen = !self.helpOpen
        document.getElementById("leftSideMenu").style.left = value
    },

}