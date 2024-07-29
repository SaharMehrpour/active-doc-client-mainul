/**
 * Created by saharmehrpour on 9/5/17.
 */

import Utilities from "./utilities";
import {nsResolver} from "./coreConstants";
import {fileFolderConstraints, processFileFolder, queryType, relatives, ruleProperties} from "./ruleExecutorConstants";

/**
 * verify the rules for all xml files
 * @param xmlFiles {{filePath, xml}[]}
 * @param ruleTable {{index:number, title:string, description:string, tags:[], grammar:string, 
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN", 
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string, 
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[], 
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[], 
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}}, 
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}], 
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]}, 
 * filePath:string
 * }]}[]
 * |{index, checkForFilesFoldersConstraints, checkForFilesFolders, processFilesFolders:"WITHIN", quantifierXPathQuery, constraintXPathQuery}[]
 * }
 * retrieved from ruleJson.txt
 */
export const checkRulesForAll = (xmlFiles, ruleTable) => {
    for (let i = 0; i < ruleTable.length; i++) {
        if(!isValidXPathQueries(ruleTable[i])) {
            ruleTable[i].xPathQueryResult = [];
            ruleTable[i].description += " <XPATH query is not valid. Check out the XPATH in ruleJson.txt>";
        }
        else
            ruleTable[i] = runRulesByTypes(xmlFiles, ruleTable[i]);
    }
    return ruleTable;
};

/**
 * re-run the xpath queries and detect changes for one file.
 * @param xmlFiles {{filePath, xml}[]}
 * @param ruleTable {{index:number, title:string, description:string, tags:[], grammar:string, 
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN", 
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string, 
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[], 
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[], 
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}}, 
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}], 
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]}, 
 * filePath:string
 * }]}[]}
 * @param filePath
 */
export const checkRulesForFile = (xmlFiles, ruleTable, filePath) => {
    let targetXml = xmlFiles.filter((d) => {
        return d.filePath === filePath
    });
    for (let i = 0; i < ruleTable.length; i++) {
        if (ruleTable[i].xPathQueryResult.filter((d) => {
                return d.filePath === filePath || d.filePath === processFileFolder.mixed;
            }).length === 0)
            continue;

        let ruleResultI = ruleTable[i].xPathQueryResult.filter((d) => {
            return d.filePath === filePath || d.filePath === processFileFolder.mixed;
        })[0].data;

        let prevQuantifierResult = ruleResultI.quantifierResult.slice(0);
        let prevSatisfiedResult = ruleResultI.satisfiedResult.slice(0);
        let prevSatisfied = ruleResultI.satisfied;
        let prevViolated = ruleResultI.violated;

        ruleTable[i] = runRulesByTypes(ruleTable[i].xPathQueryResult[0].filePath === processFileFolder.mixed
            ? xmlFiles : targetXml, ruleTable[i]);

        ruleResultI = ruleTable[i].xPathQueryResult.filter((d) => {
            return d.filePath === filePath || d.filePath === processFileFolder.mixed;
        })[0].data;

        ruleResultI.changed = (!Utilities.ResultArraysEqual(prevQuantifierResult, ruleResultI.quantifierResult) ||
            !Utilities.ResultArraysEqual(prevSatisfiedResult, ruleResultI.satisfiedResult) ||
            prevSatisfied !== ruleResultI.satisfied ||
            prevViolated !== ruleResultI.violated);

        ruleResultI.violatedChanged = (prevViolated < ruleResultI.violated ? relatives.greater :
            prevViolated > ruleResultI.violated ? relatives.smaller : relatives.none);
        ruleResultI.satisfiedChanged = (prevSatisfied < ruleResultI.satisfied ? relatives.greater :
            prevSatisfied > ruleResultI.satisfied ? relatives.smaller : relatives.none);
        ruleResultI.allChanged = ((prevSatisfied + prevViolated) < (ruleResultI.violated + ruleResultI.satisfied) ? 
            relatives.greater :
            (prevSatisfied + prevViolated) > (ruleResultI.violated + ruleResultI.satisfied) ? 
                relatives.smaller : relatives.none);
    }
    return ruleTable;
};


/**
 * find relevant xml files based on the rule "checkFor" property
 * and call respective methods based on "processFilesFolders" property of the rule.
 * @param xmlFiles {{filePath, xml}[]}
 * @param ruleI {{index:number, title:string, description:string, tags:[], grammar:string, 
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN", 
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string, 
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[], 
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[], 
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}}, 
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}], 
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]}, 
 * filePath:string
 * }]}}
 * @returns {{index:number, title:string, description:string, tags:[], grammar:string, 
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN", 
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string, 
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[], 
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[], 
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}}, 
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}], 
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]}, 
 * filePath:string
 * }]}}
 */
export const runRulesByTypes = (xmlFiles, ruleI) => {

    let xmlFilesToVerify = [];
    let checkForFilesFolders = ruleI.checkForFilesFolders.slice(0); // deep copy

    switch (ruleI.checkForFilesFoldersConstraints) {
        case fileFolderConstraints.none:
            xmlFilesToVerify = xmlFiles.slice(0); // deep copy
            break;

        case fileFolderConstraints.include:
            for (let j = 0; j < checkForFilesFolders.length; j++)
                // Warning
                // This can lead to error if the target folder is X 
                // in ruleJson.txt and there exists also a folder Xy
                xmlFilesToVerify = xmlFilesToVerify
                    .concat(xmlFiles.filter((d) => 
                        d.filePath.indexOf(checkForFilesFolders[j]) !== -1));
            break;

        case fileFolderConstraints.exclude:
            xmlFilesToVerify = xmlFilesToVerify.filter((d) => {
                for (let j = 0; j < checkForFilesFolders.length; j++)
                    // Warning
                    // This can lead to error if fileName is saved as X.java 
                    // in ruleJson.txt and there exists also aX.java
                    if (d.filePath.endsWith(checkForFilesFolders[j]))
                        return false;
                return true;
            });
            break;

        default:
            console.log("error in XML: ruleTable[index=" + ruleI.index + "]['constraint']");
            return ruleI;
    }

    if (ruleI.processFilesFolders === processFileFolder.within) {
        for (let j = 0; j < xmlFilesToVerify.length; j++)
            ruleI = runXPathQueryWithin(xmlFilesToVerify[j], ruleI);
    }
    else if (ruleI.processFilesFolders === processFileFolder.between) {
        ruleI = runXpathQueryBetween(xmlFilesToVerify, ruleI);
    }
    else if (ruleI.processFilesFolders === processFileFolder.mixed) {
        ruleI = runXpathQueryMixed(xmlFilesToVerify, ruleI);
    }
    // if the file and folders are not valid, this property is not created
    if (!ruleI.xPathQueryResult) ruleI.xPathQueryResult = [];
    return ruleI;
};

/**
 * run xPath queries for rules that hold for each file independently
 * @param xmlFile {{filePath, xml}}
 * @param ruleI {{index:number, title:string, description:string, tags:[], grammar:string, 
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN", 
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string, 
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[], 
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[], 
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}}, 
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}], 
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]}, 
 * filePath:string
 * }]}}
 * @returns  {{index:number, title:string, description:string, tags:[], grammar:string, 
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN", 
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string, 
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[], 
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[], 
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}}, 
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}], 
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]}, 
 * filePath:string
 * }]}}
 */
const runXPathQueryWithin = (xmlFile, ruleI) => {
    let quantifierResult = runXPathQuery(xmlFile, ruleI.quantifierXPathQuery[0]);
    let satisfiedResult = runXPathQuery(xmlFile, ruleI.constraintXPathQuery[0]);
    // compare results
    let violatedResult = violatedResults(quantifierResult, satisfiedResult);
    let resultData = {
        quantifierResult: quantifierResult,
        satisfiedResult: satisfiedResult,
        violatedResult: violatedResult,
        satisfied: quantifierResult.length - violatedResult.length,
        violated: violatedResult.length
    };
    if (!ruleI.hasOwnProperty(ruleProperties.xPathQueryResult))
        ruleI.xPathQueryResult = [];
    let resultArray = ruleI.xPathQueryResult.filter((d) => {
        return d.filePath === xmlFile.filePath
    });
    if (resultArray.length === 0)
        ruleI.xPathQueryResult.push({filePath: xmlFile.filePath, data: resultData});
    else {
        if (ruleI.xPathQueryResult.filter((d) => {
                return d.filePath === xmlFile.filePath
            }).length > 0)
            ruleI.xPathQueryResult.filter((d) => {
                return d.filePath === xmlFile.filePath
            })[0].data = resultData;
    }
    return ruleI;
};

/**
 * << NOT tested yet >>
 * run xPath queries for rules that depends on several files
 * @param xmlFiles {{filePath, xml}[]}
 * @param ruleI {{index:number, title:string, description:string, tags:[], grammar:string, 
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN", 
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string, 
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[], 
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[], 
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}}, 
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}], 
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]}, 
 * filePath:string
 * }]}}
 * @returns  {{index:number, title:string, description:string, tags:[], grammar:string, 
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN", 
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string, 
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[], 
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[], 
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}}, 
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}], 
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]}, 
 * filePath:string
 * }]}}
 */
const runXpathQueryBetween = (xmlFiles, ruleI) => {
    if (!ruleI.hasOwnProperty(ruleProperties.xPathQueryResult))
        ruleI.xPathQueryResult = [];
    for (let j = 0; j < xmlFiles.length; j++) {
        let quantifierResult = runXPathQuery(xmlFiles[j], ruleI.quantifierXPathQuery[0]);
        let constraintResult = runXPathQuery(xmlFiles[j], ruleI.constraintXPathQuery[0]);
        // compare results
        let violatedResult = violatedResults(quantifierResult, constraintResult);
        let resultData = {
            quantifierResult: quantifierResult,
            satisfiedResult: constraintResult,
            violatedResult: violatedResult,
            satisfied: quantifierResult.length - violatedResult.length,
            violated: violatedResult.length
        };
        ruleI.xPathQueryResult.push({filePath: xmlFiles[j].filePath, data: resultData});
    }
    return ruleI;
};


/**
 * run Xpath query when a group has multiple XPath queries
 * @param xmlFiles {{filePath, xml}[]}
 * @param ruleI {{index:number, title:string, description:string, tags:[], grammar:string,
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN",
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string,
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[],
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[],
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}},
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}],
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]},
 * filePath:string
 * }]}}
 * @returns  {{index:number, title:string, description:string, tags:[], grammar:string,
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE", processFilesFolders:"WITHIN",
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string,
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string, filesFolders:[],
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[],
 * graphicalEditorState:{guiTree:{},  guiElements:{},  ruleType:string}},
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,  snippet:string,  xml:{fileName:string,  xml:string}}],
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]},
 * filePath:string
 * }]}}
 */
const runXpathQueryMixed = (xmlFiles, ruleI) => {

    let quantifierResultArray = [];
    let constraintResultArray = [];

    if (ruleI.hasOwnProperty(ruleProperties.quantifierQueryType) && ruleI.quantifierQueryType === queryType.next_file)
        quantifierResultArray = findFromText(xmlFiles, ruleI.quantifierXPathQuery);
    else if (ruleI.hasOwnProperty(ruleProperties.quantifierQueryType) && ruleI.quantifierQueryType === queryType.first_file)
        quantifierResultArray = findAndReturnToBase(xmlFiles, ruleI.quantifierXPathQuery);
    else {
        for (let j = 0; j < xmlFiles.length; j++) {
            quantifierResultArray.push({filePath: xmlFiles[j],
                results: runXPathQuery(xmlFiles[j], ruleI.quantifierXPathQuery[0])});
        }
    }

    if (ruleI.hasOwnProperty(ruleProperties.constraintQueryType) && ruleI.constraintQueryType === queryType.next_file)
        constraintResultArray = findFromText(xmlFiles, ruleI.constraintXPathQuery);
    else if (ruleI.hasOwnProperty(ruleProperties.constraintQueryType) && ruleI.constraintQueryType === queryType.first_file)
        constraintResultArray = findAndReturnToBase(xmlFiles, ruleI.constraintXPathQuery);
    else {
        for (let j = 0; j < xmlFiles.length; j++) {
            constraintResultArray.push({filePath: xmlFiles[j],
                results: runXPathQuery(xmlFiles[j], ruleI.constraintXPathQuery[0])});
        }
    }

    if (!ruleI.hasOwnProperty(ruleProperties.xPathQueryResult))
        ruleI.xPathQueryResult = [];

    for (let j = 0; j < xmlFiles.length; j++) {
        // compare results
        let violatedResult = containResults(constraintResultArray[j].results, quantifierResultArray[j].results);
        let resultData = {
            quantifierResult: quantifierResultArray[j].results,
            satisfiedResult: constraintResultArray[j].results,
            violatedResult: violatedResult,
            satisfied: quantifierResultArray[j].results.length - violatedResult.length,
            violated: violatedResult.length
        };
        ruleI.xPathQueryResult.push({filePath: xmlFiles[j].filePath, data: resultData});
    }
    return ruleI;

};


/**
 * When a group consists of two XPath queries, the first query
 * @param xmlFiles {{filePath, xml}[]}
 * @param xpathQueries
 * @returns {{filePath, results}[]}
 */
const findFromText = (xmlFiles, xpathQueries) => {
    let result1 = [], result2 = [];
    let xpathQuery = xpathQueries[0];
    for (let j = 0; j < xmlFiles.length; j++) {
        mergeArraysUnique(result1, runXPathQuery(xmlFiles[j], xpathQuery));
    }
    for (let j = 0; j < xmlFiles.length; j++) {
        result2.push({filePath: xmlFiles[j], results: []});
    }
    for (let i = 0; i < result1.length; i++) {
        xpathQuery = xpathQueries[1].replaceAll("<TEMP>", result1[i].snippet);
        for (let j = 0; j < xmlFiles.length; j++) {
            mergeArraysUnique(result2[j].results, runXPathQuery(xmlFiles[j], xpathQuery));
        }
    }
    return result2;
};



/**
 * When a group consists of 3 queries, the first and last queries are executed on the same file
 * @param xmlFiles {{filePath, xml}[]}
 * @param xpathQueries
 * @returns {{filePath, results}[]}
 */
const findAndReturnToBase = (xmlFiles, xpathQueries) => {
    let result1, result2, result3 = [];
    for (let j = 0; j < xmlFiles.length; j++) {
        result3.push({filePath: xmlFiles[j], results: []});
    }
    for (let base = 0; base < xmlFiles.length; base++) {
        let xpathQuery = xpathQueries[0];
        result1 = runXPathQuery(xmlFiles[base], xpathQuery);
        for (let i = 0; i < result1.length; i++) {
            for (let j = 0; j < xmlFiles.length; j++) {
                xpathQuery = xpathQueries[1].replaceAll("<TEMP>", result1[i].snippet);
                result2 = runXPathQuery(xmlFiles[j], xpathQuery);

                for (let k = 0; k < result2.length; k++) {
                    xpathQuery = xpathQueries[2].replaceAll("<TEMP>", result2[k].snippet);
                    mergeArraysUnique(result3[base].results, runXPathQuery(xmlFiles[base], xpathQuery));
                }
            }
        }
    }
    return result3;
};

/**
 * Merge two arrays of objects without duplicates based on the xml.xml property.
 * @param {{filePath, xml: {fileName, xml}, snippet,surroundingNodes}[]} mainArray
 * The primary array of objects.
 * @param {{filePath, xml: {fileName, xml}, snippet,surroundingNodes}[]} addition
 * The secondary array of objects to be merged into the primary array.
 * @returns {Array} - The merged array with unique entries.
 */
function mergeArraysUnique(mainArray, addition) {
    const existingXmlValues = new Set(mainArray.map(obj => obj.xml.xml));
    addition.forEach(obj => {
        if (!existingXmlValues.has(obj.xml.xml)) {
            mainArray.push(obj);
            existingXmlValues.add(obj.xml.xml); // Add the new xml.xml value to the set
        }
    });
    return mainArray;
}

/**
 * runs the XPath query and compare results
 * @param xmlFile {{filePath, xml}}
 * @param xpathQuery {string}
 */
const runXPathQuery = (xmlFile, xpathQuery) => {
    let parser = new DOMParser();
    let result = [];
    // checks validity of the XML
    let xml = parser.parseFromString(xmlFile.xml, "text/xml");
    if (!xml.evaluate) {
        console.log("error in xml.evaluate");
        return;
    }

    // run xpath queries
    let foundNodes = xml.evaluate(xpathQuery, xml, nsResolver, XPathResult.ANY_TYPE, null);
    let node = foundNodes.iterateNext();
    let index = 0;
    while (node) {
        let xmlAndText = getXmlData(xml, xpathQuery, index);
        result.push({
            filePath: xmlFile.filePath,
            xml: xmlAndText.xmlJson,
            snippet: xmlAndText.snippet,
            surroundingNodes: xmlAndText.surroundingNodes
        });
        node = foundNodes.iterateNext();
        index += 1;
    }
    return result;
};


/**
 * compare the quantifier and the result
 * @param quantifierResult
 * @param satisfiedResult
 */
const violatedResults = (quantifierResult, satisfiedResult) => {

    let mismatches = [];
    let sliceArr = satisfiedResult.slice(0);
    for (let i = 0; i < quantifierResult.length; i++) {
        let found = false;
        for (let j = 0; j < sliceArr.length; j++) {
            if (quantifierResult[i].snippet === sliceArr[j].snippet) {
                sliceArr.splice(j, 1);
                found = true;
                break;
            }
        }
        if (!found) {
            mismatches.push(quantifierResult[i]);
        }
    }
    return mismatches;
};


/**
 * check if all elements of a sample array exists in the container array
 * repetition is allowed
 * @param containerResult
 * @param sampleResult
 * @returns {Array}
 */
const containResults = (containerResult, sampleResult) => {
    let mismatches = [];

    for (let i = 0; i < sampleResult.length; i++) {
        let found = false;
        for (let j = 0; j < containerResult.length; j++) {
            if (sampleResult[i].snippet === containerResult[j].snippet) {
                found = true;
                break;
            }
        }
        if (!found) {
            mismatches.push(sampleResult[i]);
        }
    }
    return mismatches;
};


/**
 * remove the following nodes.The resulting xml is sent to the server to be processed by srcML
 * and find the line number.
 * @param mainXml
 * @param query
 * @param index
 */
const getXmlData = (mainXml, query, index) => {

    // passing the nodes and working with that changes the main XML
    // and produces error for next nodes in the same query.

    let xml = Utilities.cloneXML(mainXml);
    let xmlCopy = Utilities.cloneXML(mainXml);

    let nodes = xml.evaluate(query, xml, nsResolver, XPathResult.ANY_TYPE, null);
    let nodesCopy = xml.evaluate(query, xmlCopy, nsResolver, XPathResult.ANY_TYPE, null);
    let res = nodes.iterateNext();
    let resNodes = nodesCopy.iterateNext();
    let i = 0;
    while (i < index) {
        res = nodes.iterateNext();
        resNodes = nodesCopy.iterateNext();
        i += 1;
    }

    let surroundingNodes = getSurroundingNodes(resNodes);
    let surroundingNodesText = new XMLSerializer().serializeToString(surroundingNodes)
            .replace(/<package[^>]*>.*?<\/package>\s*\n?/g, '')
            .replace(/<import[^>]*>.*?<\/import>\s*\n?/g, '')
            .replaceAll("(?m)^\\s*\\r?\\n", ""); // remove empty lines after removing tags

    // Serialize the XML and remove unwanted tags
    let serializedRes = new XMLSerializer().serializeToString(res);
    let cleanedRes = serializedRes
        .replace(/<annotation[^>]*>.*?<\/annotation>\s*\n?/g, '')
        .replace(/<comment[^>]*>.*?<\/comment>\s*\n?/g, '');

    // Get the first two lines
    let resTextArray = cleanedRes.split(/\r?\n/).filter(line => line.trim() !== '');
    let resText = resTextArray.length > 1 ? resTextArray[0] + "\n" + resTextArray[1] : resTextArray[0];

    let par = res, nameIndex, fileName = "";
    if (res.children) {
        for (nameIndex = 0; nameIndex < res.children.length; nameIndex++)
            if (res.children[nameIndex].tagName.toString() === "name") {
                break;
            }

        // remove the extra children
        if (res.firstChild && res.firstChild.nodeType !== -1 && nameIndex !== -1 && nameIndex !== res.children.length)
            par = removeSiblings(res.children[nameIndex]);

        // if there is no extra children, remove sibling
        else if (res.nextSibling)
            par = removeSiblings(res.nextSibling);
        else {
            par = res;
            // until we reach a sibling or the main ancestor, go up in the tree
            while (!par.nextSibling && par.nodeName !== "unit") {
                par = par.parentNode;
            }
            par = removeSiblings(res.parentNode);
        }
        fileName = par.getAttribute("filename");
    }

    return {
        xmlJson: {
            fileName: fileName,
            xml: new XMLSerializer().serializeToString(par)
        },
        xmlText: new XMLSerializer().serializeToString(par),
        surroundingNodes: surroundingNodesText,
        snippet: resText
    };

};

/**
 * remove first node sib, sib, parent sib, grandparent sib, grand-grandparent sib, ... <- recursive
 * @param node
 * @returns {*}
 */
const removeSiblings = (node) => {
    if (node.nodeName === "unit")
        return node;
    let sib = node.nextSibling;
    while (sib && sib.nodeType !== -1) {
        node.parentNode.removeChild(sib);
        sib = node.nextSibling;
    }
    return removeSiblings(node.parentNode);
}

/**
 * Get the root node by removing children of siblings of each ancestor node.
 * @param {Node} node - The node from which to start.
 * @return {Node} - The root node.
 */
const getSurroundingNodes = (node) => {
    // case 1: static class
    // Grab all code within static class
    if (isStaticClass(node)) {
        return node;
    }

    // case 2: class, field
    // Grab all fields and function/nested class signatures
    if (isClassOrField(node)) {
        // find the parent class
        while (node && node.tagName && node.tagName.toLowerCase() !== "class" && node.parentNode) {
            node = node.parentNode;
        }
        removeFunctionBodies(node);
        return node;
    }

    // case 3: other, statements (starting node within method or at method signature)
    // Grab all code within method and function signatures and fields adjacent/same level as method
    else {
        // find the parent function
        while (node && node.tagName && node.tagName.toLowerCase() !== "function" && node.parentNode) {
            node = node.parentNode;
        }
        removeSiblingFunctionBodies(node);
        // find the parent class
        if (node.parentNode) {
            node = node.parentNode;
        }
        while (node && node.tagName && node.tagName.toLowerCase() !== "class" && node.parentNode) {
            node = node.parentNode;
        }
        return node;
    }
};

/** check if the node is a static class
 * @param node {Node}
 * @return {boolean}
 */
const isStaticClass = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE || node.tagName.toLowerCase() !== "class") {
        return false;
    }
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.nodeType === Node.ELEMENT_NODE &&
            child.tagName.toLowerCase() === "specifier" &&
            child.textContent.trim() === "static") {
            return true;
        }
    }
    return false;
}

/**
 * check if the node is a class or a field.
 * @param node {Node}
 * @return {boolean}
 */
function isClassOrField(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return false;
    }
    const tagName = node.tagName.toLowerCase();
    return tagName === "class" || tagName === "decl_stmt";
}

/**
 * remove function or constructor bodies
 * @param node {Node}
 */
export const removeFunctionBodies = (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    if (node.tagName.toLowerCase() === "function" || node.tagName.toLowerCase() === "constructor") {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.tagName && child.tagName.toLowerCase() === "block") {
                node.removeChild(child);
                return;
            }
        }
    } else {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            removeFunctionBodies(child);
        }
    }
}

/**
 * remove bodies of sibling functions
 * @param node {Node}
 */
export const removeSiblingFunctionBodies = (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    let currentNode = node;
    // Loop over previous siblings
    while (currentNode.previousSibling) {
        currentNode = currentNode.previousSibling;
        removeFunctionBodies(currentNode);
    }
    // Reset currentNode to the original node
    currentNode = node;

    // Loop over next siblings
    while (currentNode.nextSibling) {
        currentNode = currentNode.nextSibling;
        removeFunctionBodies(currentNode)
    }

    removeSiblingFunctionBodies(node.parentNode);
}

/**
 * validate the xpath queries in ruleI
 * @param ruleI
 * @return {boolean}
 */
const isValidXPathQueries = (ruleI) => {
    let parser = new DOMParser();
    let xml = parser.parseFromString("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
        "<unit xmlns=\"http://www.srcML.org/srcML/src\" revision=\"0.9.5\" language=\"Java\" filename=\"validate.java\"/>",
        "text/xml");

    try {
        for (let i=0; i< ruleI.quantifierXPathQuery.length; i++)
            xml.evaluate(ruleI.quantifierXPathQuery[i], xml, nsResolver, XPathResult.ANY_TYPE, null);

        for (let i=0; i< ruleI.constraintXPathQuery.length; i++)
            xml.evaluate(ruleI.constraintXPathQuery[i], xml, nsResolver, XPathResult.ANY_TYPE, null);

    } catch (XPathException) {
        return false;
    }
    return true;
};

/**
 * validate the xpath queries in ruleI
 * @param xpathQuery {string}
 * @return {boolean}
 */
export const isValidXPathQuery = (xpathQuery) => {
    let parser = new DOMParser();
    let xml = parser.parseFromString("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
        "<unit xmlns=\"http://www.srcML.org/srcML/src\" revision=\"0.9.5\" language=\"Java\" filename=\"validate.java\"/>",
        "text/xml");
    try {
        xml.evaluate(xpathQuery, xml, nsResolver, XPathResult.ANY_TYPE, null);
    } catch (XPathException) {
        return false;
    }
    return true;
};


/**
 * runs the XPath query and compare results
 * @param xmlFiles {{filePath, xml}[]}
 * @param fileGroup {string}
 * @param projectPath {string}
 * @param xpathQuery {string}
 * @returns {{snippets: {filePath: string, xml: string, snippet: string}[], files: {all: string[], found: string[]}}}
 */
export const runXpathQueryOnFileGroup = (xmlFiles, fileGroup,
                                         projectPath, xpathQuery) => {
    let snippets = [];
    let files = {all: [], found: []};
    let xmlFilesToVerify = xmlFiles.filter((d) => d.filePath.startsWith(projectPath + fileGroup));
    files.all = xmlFilesToVerify.map(d => d.filePath.replace(projectPath, ""));

    for (let j = 0; j < xmlFilesToVerify.length; j++) {
        try {
            let results = runXPathQuery(xmlFilesToVerify[j], xpathQuery);
            if (results.length > 0) {
                snippets = snippets.concat(results);
                files.found.push(xmlFilesToVerify[j].filePath.replace(projectPath, ""))
            }
        } catch (e) {
            console.log(`Error happened in running ${xpathQuery} on file ${xmlFilesToVerify[j].filePath}`);
            console.log(e);
        }
    }
    return {snippets, files};
}


/**
 * @param xmlFiles {{filePath, xml}[]}
 * @param projectPath {string}
 * @param identifierGroupValue {{children: {}, constraintsXPathQuery: {}, filesFolders: string[],
 * identifierFeatureInfo: {}, parent: {}, quantifierXPathQuery: string,
 * quantifierSnippets?: [], constraintsSnippets?: {} }}
 * @returns {{children: {}, constraintsXPathQuery: {}, filesFolders: string[],
 * identifierFeatureInfo: {}, parent: {}, quantifierXPathQuery: string,
 * quantifierSnippets: *[], constraintsSnippets: {}}}
 */
export const runXpathQueryMinedRules = (xmlFiles, projectPath, identifierGroupValue) => {
    let newIdentifierGroupValue = JSON.parse(JSON.stringify(identifierGroupValue));

    // the quantifier xpath is already completed and the snippets are found
    if (!newIdentifierGroupValue.quantifierSnippets) {
        // first check the quantifier
        let quantifierXPathQuery = newIdentifierGroupValue.quantifierXPathQuery;
        quantifierXPathQuery = quantifierXPathQuery.startsWith("src:unit/") ? quantifierXPathQuery
            : "src:unit/" + quantifierXPathQuery;
        // received all messages
        if (isValidXPathQuery(quantifierXPathQuery)) {
            newIdentifierGroupValue.quantifierSnippets = [];
            for (let fileGroup of newIdentifierGroupValue.filesFolders) {
                let results = runXpathQueryOnFileGroup(xmlFiles, fileGroup, projectPath, quantifierXPathQuery);
                newIdentifierGroupValue.quantifierSnippets
                    .push({fileGroup, snippets: results.snippets, files: results.files});
            }
        }
    }

    let childrenKeys = Object.keys(newIdentifierGroupValue.constraintsXPathQuery);
    // create an array of false elements for constraints
    if (!newIdentifierGroupValue.constraintsSnippets) {
        newIdentifierGroupValue.constraintsSnippets = {};
        for (let key of childrenKeys) {
            newIdentifierGroupValue.constraintsSnippets[key] =
                new Array(newIdentifierGroupValue.constraintsXPathQuery[key].length).fill(false);
        }
    }

    for (let key of childrenKeys) {
        newIdentifierGroupValue.constraintsXPathQuery[key].forEach((cXpath, index) => {
            // if the constraint query is not checked yet
            if (!newIdentifierGroupValue.constraintsSnippets[key][index]) {
                let constraintXPathQuery = newIdentifierGroupValue.constraintsXPathQuery[key][index];
                constraintXPathQuery = constraintXPathQuery.startsWith("src:unit/") ? constraintXPathQuery
                    : "src:unit/" + constraintXPathQuery;
                // received all messages
                if (isValidXPathQuery(constraintXPathQuery)) {
                    newIdentifierGroupValue.constraintsSnippets[key][index] = [];
                    for (let fileGroup of newIdentifierGroupValue.filesFolders) {
                        let results = runXpathQueryOnFileGroup(xmlFiles, fileGroup, projectPath,
                            constraintXPathQuery);
                        newIdentifierGroupValue.constraintsSnippets[key][index]
                            .push({fileGroup, snippets: results.snippets, files: results.files});
                    }
                }
            }
        })
    }
    return newIdentifierGroupValue;
}
