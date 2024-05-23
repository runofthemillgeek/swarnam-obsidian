import type * as CODE_MIRROR from "codemirror"

declare const CodeMirror: typeof CODE_MIRROR

type State = {
    curSegment: "html" | "css" | "js"
    htmlState: any,
    cssState: any,
    jsState: any
}

function advance(state: State) {
    if(state.curSegment === "html") {
        state.curSegment = "css"
    } else if(state.curSegment === "css") {
        state.curSegment = "js"
    }
}

export function SwarnamMode() {
    CodeMirror.defineMode("swarnam", (config) => {
        const htmlMode = CodeMirror.getMode(config, "htmlmixed")
        const cssMode = CodeMirror.getMode(config, "css")
        const jsMode = CodeMirror.getMode(config, "javascript")

        return {
            startState(): State {
                const htmlState = CodeMirror.startState(htmlMode)
                const cssState = CodeMirror.startState(cssMode)
                const jsState = CodeMirror.startState(jsMode)

                return {
                    curSegment: "html",
                    htmlState,
                    cssState,
                    jsState
                }
            },

            token(stream, state: State): string | null {
                let style = null;

                if(stream.string.trim() === "---*---") {
                    stream.skipToEnd()
                    advance(state)
                }else if(state.curSegment === "html") {
                    style = htmlMode.token(stream, state.htmlState)
                }else if(state.curSegment === "css") {
                    style = cssMode.token(stream, state.cssState)
                }else if(state.curSegment === "js") {
                    style = jsMode.token(stream, state.jsState)
                }
                
                return style
            },
        }
        }, 
        //@ts-ignore
        "html", "css", "javascript"
    )
    
    return () => {
        delete CodeMirror.modes.swarnam
    }
}
