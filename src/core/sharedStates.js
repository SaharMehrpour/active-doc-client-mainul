// sharedStates.js

let fileContentToSendToGPT = '';

export const getFileContentToSendToGPT = () => fileContentToSendToGPT;
export const setFileContentToSendToGPT = (content) => {
    console.log("Setting new file content")
    fileContentToSendToGPT = content;
    console.log(fileContentToSendToGPT);
};
