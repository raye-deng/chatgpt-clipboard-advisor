import {ipcRenderer, contextBridge} from "electron";

export interface OpenAIClient {

    complete: (prompt: string, model?: (answer: string) => void) => Promise<string>,
    checkOpenAIKey: (callback: (result: boolean) => void) => void,
    setOpenAIKey: (key: string) => void
    initOpenAIClient: () => void

    minusWindow: () => void

    maximizeWindow: () => void
}

declare global {
    interface Window {
        ipc: ipcRenderer,
        openAIClient: OpenAIClient
    }
}