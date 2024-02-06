import {initial_state} from "./initialState";
import {reduxStoreActions, reduxStoreMessages} from "./reduxStoreConstants";


/**
 * using default_state as a default value surprisingly changes its value
 * Any incoming variable through arguments must be cloned and mutated,
 * Direct mutation doesn't work properly (UPDATE_RULE_TABLE)
 * @param state
 * @param action
 * @returns {*} new state
 */
const reducer = (state = JSON.parse(JSON.stringify(initial_state)), action) => {
    // console.log("reducer running", action);

    let rules = [];

    switch (action.type) {
        case reduxStoreActions.action_update_loading_gif:
            return Object.assign({}, state, {
                loadingGif: action.data["loadingGif"]
            });

        case reduxStoreActions.action_hash:
            if (!state.hashManager.clickedOnButtons) {
                return Object.assign({}, state, {
                    currentHash: action.data["currentHash"],
                    message: reduxStoreMessages.hash_msg,
                    hashManager: {
                        history: [...state.hashManager.history, "#/" + action.data["currentHash"].join("/")],
                        activeHashIndex: state.hashManager.activeHashIndex + 1,
                        forwardDisable: "disabled",
                        backDisable: state.hashManager.activeHashIndex === 0 ? "disabled" : "",
                        clickedOnButtons: false
                    }
                });
            }
            return Object.assign({}, state, {
                currentHash: action.data["currentHash"],
                message: reduxStoreMessages.hash_msg,
                hashManager: {
                    history: state.hashManager.history,
                    activeHashIndex: state.hashManager.activeHashIndex,
                    forwardDisable: state.hashManager.forwardDisable,
                    backDisable: state.hashManager.backDisable,
                    clickedOnButtons: false
                }
            });

        case reduxStoreActions.action_new_ws:
            return Object.assign({}, state, {ws: action.data["ws"], message: reduxStoreMessages.ws_msg});

        case reduxStoreActions.action_update_xml_files:
            return Object.assign({}, state, {xmlFiles: action.data["xmlFiles"], message: reduxStoreMessages.update_xml_files_msg});

        case reduxStoreActions.action_update_tag_table:
            return Object.assign({}, state, {tagTable: action.data["tagTable"], message: reduxStoreMessages.update_tag_table_msg});

        case reduxStoreActions.action_update_rule_table:
            rules = JSON.parse(JSON.stringify(action.data["ruleTable"]));
            return Object.assign({}, state, {
                loadingGif: false,
                ruleTable: rules,
                message: reduxStoreMessages.update_rule_table_msg
            });

        case reduxStoreActions.action_update_rule:
            return Object.assign({}, state, {
                message: reduxStoreMessages.update_rule_msg
            });

        case reduxStoreActions.action_hierarchy_data:
            return Object.assign({}, state, {
                projectHierarchy: action.data["hierarchyData"],
                message: reduxStoreMessages.hierarchy_data_msg
            });

        case reduxStoreActions.action_project_path:
            return Object.assign({}, state, {
                projectPath: action.data["projectPath"],
                message: reduxStoreMessages.project_path_msg
            });

        /*
         file handling
          */

        case reduxStoreActions.action_ignore_file:
            return Object.assign({}, state, {ignoreFileChange: action.data["shouldIgnore"], message: reduxStoreMessages.ignore_file_msg});

        case reduxStoreActions.action_file_path_update:
            if (state.ignoreFileChange) return Object.assign({}, state, {message: reduxStoreMessages.file_path_update_msg});
            return Object.assign({}, state, {openFilePath: action.data["openFilePath"], message: reduxStoreMessages.file_path_update_msg});

        /*
         nav-bar navigation
          */

        case reduxStoreActions.action_click_forward:
            return Object.assign({}, state, {
                hashManager: {
                    history: state.hashManager.history,
                    activeHashIndex: state.hashManager.activeHashIndex + 1,
                    forwardDisable: state.hashManager.activeHashIndex === state.hashManager.history.length - 2 ? "disabled" : "",
                    backDisable: "",
                    clickedOnButtons: true
                },
                message: reduxStoreMessages.click_forward_msg
            });

        case reduxStoreActions.action_click_back:
            return Object.assign({}, state, {
                hashManager: {
                    history: state.hashManager.history,
                    activeHashIndex: state.hashManager.activeHashIndex - 1,
                    forwardDisable: "",
                    backDisable: state.hashManager.activeHashIndex === 1 ? "disabled" : "",
                    clickedOnButtons: true
                },
                message: reduxStoreMessages.click_back_msg
            });

        default:
            return Object.assign({}, state);
    }
};

export default reducer;