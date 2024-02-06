// action creator

import {reduxStoreActions} from "./reduxStoreConstants";

export const updateLoadingGif = (status) => {
    return {
        type: reduxStoreActions.action_update_loading_gif,
        data: {
            loadingGif: status
        }
    }
};

/**
 * If the hash is #/hash1/hash2
 * @param hash array of hashes ["hash1", "hash2"]
 * @return {{data: {currentHash: array}, type: string}}
 */
export const hashChange = (hash) => {
    return {
        type: reduxStoreActions.action_hash,
        data:
            {currentHash: hash}
    };
};

/**
 * @param ws
 * @return {{data: {ws: *}, type: string}}
 */
export const updateWS = (ws) => {
    return {
        type: reduxStoreActions.action_new_ws,
        data:
            {ws: ws}
    };
};

/**
 * @param xmlFiles
 * @return {{data: {xmlFiles: []}, type: string}}
 */
export const updateXmlFiles = (xmlFiles) => {
    return {
        type: reduxStoreActions.action_update_xml_files,
        data:
            {xmlFiles: xmlFiles}
    }
};

/**
 * @param newTagTable
 * @return {{data: {tagTable: []}, type: string}}
 */
export const updateTagTable = (newTagTable) => {
    return {
        type: reduxStoreActions.action_update_tag_table,
        data: {tagTable: newTagTable}
    };
};

/**
 * @param newRuleTable
 * @return {{data: {ruleTable: []}, type: string}}
 */
export const updateRuleTable = (newRuleTable) => {
    return {
        type: reduxStoreActions.action_update_rule_table,
        data: {ruleTable: newRuleTable}
    };
};


export const updateRule = () => {
    return {type: reduxStoreActions.action_update_rule};
};


export const submitNewTag = () => {
    return {type: reduxStoreActions.action_new_tag}
};

/**
 * @param hierarchyData
 * @return {{data: {hierarchyData: *}, type: string}}
 */
export const updateProjectHierarchyData = (hierarchyData) => {
    return {
        type: reduxStoreActions.action_hierarchy_data,
        data: {hierarchyData: hierarchyData}
    };
};

/**
 * @param projectPath string
 * @return {{data: {projectPath: string}, type: string}}
 */
export const updateProjectPath = (projectPath) => {
    return {
        type: reduxStoreActions.action_project_path,
        data: {projectPath: projectPath}
    }
};

/*
    file Handling
 */

/**
 *
 * @param shouldIgnore boolean
 * @return {{data: {shouldIgnore: boolean}, type: string}}
 */
export const ignoreFileChange = (shouldIgnore) => {
    return {
        type: reduxStoreActions.action_ignore_file,
        data: {shouldIgnore: shouldIgnore}
    };
};


/**
 * @param filePath
 * @return {{data: {openFilePath: string}, type: string}}
 */
export const updateFilePath = (filePath) => {
    return {
        type: reduxStoreActions.action_file_path_update,
        data: {openFilePath: filePath}
    };
};


/*
    nav-bar navigation
 */


export const clickedOnForward = () => {
    return {type: reduxStoreActions.action_click_forward};
};

export const clickedOnBack = () => {
    return {type: reduxStoreActions.action_click_back};
};

