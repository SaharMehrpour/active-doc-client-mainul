/**
 * Created by saharmehrpour on 9/5/17.
 */

import React, {Component} from "react";
import "../App.css";
import {connect} from "react-redux";
import {hashConst} from "./uiConstants";

class TableOfContents extends Component {

    render() {
        return (
            <div>
                <div className={"well well-sm"}>
                    <h4>Tags</h4>
                </div>
                <ul className={"list-inline"} id={"tags_list"}>
                    {this.props.tags.map((tag, i) =>
                        (<li key={i}
                             onClick={() =>
                                 window.location.hash = `#/${hashConst.tag}/${tag.ID}`
                             }>{tag.tagName}</li>)
                    )}
                </ul>

                <div className={"well well-sm"}>
                    <h4>Rules</h4>
                </div>
                <div className={"ist-inline"}>
                    <table>
                        <tbody>
                        {this.props.rules.map((rule, i) =>
                            <tr key={i}>
                                <td className={"list-group-item"}>{rule.title}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

}

/**
 * @param state {{ruleTable:[{index:number, title:string, description:string, tags:[], grammar:string,
 * checkForFilesFolders:[string], checkForFilesFoldersConstraints:"INCLUDE"|"EXCLUDE"|"NONE",
 * processFilesFolders:"WITHIN",
 * quantifierXPathQuery:[], constraintXPathQuery:[], quantifierQueryType:string, constraintQueryType:string,
 * rulePanelState:{editMode:boolean, title:string, description:string, ruleTags:[], folderConstraint:string,
 * filesFolders:[],
 * constraintXPath:string, quantifierXPath:string, autoCompleteArray:[],
 * graphicalEditorState:{guiTree:{}, guiElements:{}, ruleType:string}},
 * xPathQueryResult:[{
 * data:{quantifierResult:[{filePath:string,snippet:string,xml:{fileName:string,
 * xml:string}}],
 * satisfied:number, satisfiedResult:[], violated:number, violatedResult:[]
 * changed:boolean,violatedChanged:string,satisfiedChanged:string,allChanged:string},
 * filePath:string
 * }]}], tagTable: [{ID:string,tagName:string, detail:string}], currentHash:string[]}}
 */
function mapStateToProps(state) {
    return {
        rules: state.ruleTable,
        tags: state.tagTable,
        currentHash: state.currentHash
    }
}

function mapDispatchToProps(dispatch) {}

export default connect(mapStateToProps, mapDispatchToProps)(TableOfContents);