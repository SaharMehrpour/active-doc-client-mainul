import OpenAI from "openai";

export async function suggestFix(
    rule,
    example,
    violation,
    exampleFilePath,
    violationFilePath,
    setState,
) {

    const prompt = `Here is a design rule and its description: ${rule}
    Here is a code example that follows this design rule: ${example}
    The example file path is ${exampleFilePath}
    Now, here is a code snippet that violates this design rule: ${violation}
    The violated code's file path is ${violationFilePath}
    Can you suggest a fix to make this violation follow the given design rule?
    Generate code with surrounding code included that follows the design rule.
    Be sure to maintain proper whitespace with \\t and \\n.
    Give a brief explanation of your fix as well.
    Ensure to include the fileName of where to insert the fix in the format Example.java.
    Strictly output in JSON format. The JSON should have the following format:{"code": "...", "explanation": "...", "fileName": "..."}`;

    let attempt = 1;
    let success = false;

    while (attempt <= 3 && !success) {
        try {
            // Read the API key from localStorage
            const apiKey = localStorage.getItem("OPENAI_API_KEY");

            // Create a new OpenAI instance with the API key from localStorage
            const openai = new OpenAI({
                apiKey,
                dangerouslyAllowBrowser: true,
            });

            const chatCompletion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                temperature: 0.75,
                messages: [{role: "user", content: prompt}],
            });

            const suggestedSnippet = chatCompletion.choices[0].message.content;
            const stripped = suggestedSnippet.replace(/^`json|`json$/g, "").trim();
            const parsedJSON = JSON.parse(stripped);

            // sets the relevant state in the React component that made the request
            // see ../ui/rulePanel.js for more details
            setState({suggestedSnippet: parsedJSON["code"]});
            setState({snippetExplanation: parsedJSON["explanation"]});
            setState({suggestionFileName: parsedJSON["fileName"]});

            const llmModifiedFileContent = {
                command: "LLM_MODIFIED_FILE_CONTENT",
                data: {
                    filePath: `${violationFilePath}`,
                    fileToChange: `${parsedJSON["fileName"]}`,
                    modifiedFileContent: `${parsedJSON["code"]}`,
                    explanation: `${parsedJSON["explanation"]}`,
                },
            };

            // set the modified content state, will be sent plugin
            setState({llmModifiedFileContent: llmModifiedFileContent});

            success = true;
        } catch (error) {
            console.log(error);
            success = false;
            attempt++;
        }
    }
}



export async function editFix(key, getConversationFromSessionStorage, saveConversationToSessionStorage, setState, fileContentToSendToGPT) {
    // Create the additional prompt using the projectPath
    const additionalPrompt = `The solution you provided is excellent, however, I am confused how to incorporate your fix with in the code of the "fileName" variable of your solution. 
    I am providing you with the full content from the "fileName" file. Integrate your "code" within that code base. Be sure to maintain proper whitespace with \\t and \\n.
    Give a brief explanation of your fix as well.
    Strictly output in JSON format. The JSON should have the following format:{"code": "...", "explanation": "...", "fileName": "..."} 
    \n My code - \n ${fileContentToSendToGPT}`;

    // Get conversation history from session storage
    const conversationHistory = getConversationFromSessionStorage(key);
    // Add the new prompt to the conversation history
    const continuedConversation = [...conversationHistory, { role: "user", content: additionalPrompt }];

    let attempt = 1;
    let success = false;

    while (attempt <= 3 && !success) {
        try {
            const apiKey = localStorage.getItem("OPENAI_API_KEY");
            const openai = new OpenAI({
                apiKey,
                dangerouslyAllowBrowser: true,
            });

            // Send the continued conversation to OpenAI
            const chatCompletion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                temperature: 0.75,
                messages: continuedConversation,
            });

            const suggestedSnippet = chatCompletion.choices[0].message.content;
            const stripped = suggestedSnippet.replace(/^`json|`json$/g, "").trim();
            const parsedJSON = JSON.parse(stripped);

            console.log(parsedJSON);

            // Update state with new suggested snippet, explanation, and file name
            setState({
                suggestedSnippet: parsedJSON["code"],
                snippetExplanation: parsedJSON["explanation"],
                suggestionFileName: parsedJSON["fileName"],
                llmModifiedFileContent: {
                    command: "LLM_MODIFIED_FILE_CONTENT",
                    data: {
                        filePath: `${parsedJSON["fileName"]}`, // Assuming the initial prompt contains the file path
                        fileToChange: `${parsedJSON["fileName"]}`,
                        modifiedFileContent: `${parsedJSON["code"]}`,
                        explanation: `${parsedJSON["explanation"]}`,
                    },
                },
            });

            // Update conversation history in session storage
            saveConversationToSessionStorage(key, [...continuedConversation, { role: "assistant", content: suggestedSnippet }]);

            success = true;
        } catch (error) {
            console.log(error);
            success = false;
            attempt++;
        }
    }
}



