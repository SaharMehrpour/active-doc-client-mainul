// sharedStates.js

let fileContentToSendToGPT = null;

export const getFileContentToSendToGPT = () => fileContentToSendToGPT;
export const setFileContentToSendToGPT = (content) => {
    fileContentToSendToGPT = content;
};
