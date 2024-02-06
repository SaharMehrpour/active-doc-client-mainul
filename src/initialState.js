
export const initial_state = {
    ws: null,

    /*
    index: "1",
    title: "",
    description: "",
    tags: [],
    grammar: "",
    checkForFilesFolders: [""],
    checkForFilesFoldersConstraints: "INCLUDE", // or EXCLUDE
    processFilesFolders: "WITHIN",
    quantifierXPathQuery: [],
    constraintXPathQuery: [],

    quantifierQueryType: "",
    constraintQueryType: "",

    xPathQueryResult: [
        {
            data: {
                quantifierResult: [{filePath: "", snippet: "", xml: {fileName: "", xml: ""}}],
                satisfied: 0,
                satisfiedResult: [],
                violated: 0,
                violatedResult: []
            },
            filePath: ""
        }
     ]
     */
    ruleTable: [],
    tagTable: [],
    xmlFiles: [],
    projectHierarchy: {},
    projectPath: "",
    currentHash: ["index"],
    ignoreFileChange: false, // ignore the file switching in the IDE
    displayEditRuleTutorial: true, // display the tour guide for edit rule
    message: "init",
    openFilePath: "",
    hashManager: {
        history: ["#/index"],
        activeHashIndex: 0,
        forwardDisable: "disabled",
        backDisable: "disabled",
        clickedOnButtons: false
    },
    loadingGif: false,
};