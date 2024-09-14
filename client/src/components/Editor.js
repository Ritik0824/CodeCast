import React, { useEffect, useRef, useState } from "react";


import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";


function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);
  const [terminalOutput, setTerminalOutput] = useState(""); // State to manage terminal output
  const [terminalSize, setTerminalSize] = useState("300px"); // State to manage terminal size

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: 'javascript', json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      editorRef.current = editor;
      editor.setSize("100%", "100%");
      
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    };

    init();
  }, [onCodeChange, roomId, socketRef]);

  // Receive code updates from the server
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && editorRef.current) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [socketRef]);

  // Function to run the code
  const runCode = async () => {
    const code = editorRef.current.getValue();
    setTerminalOutput("Running...");

    try {
      const response = await fetch("http://localhost:5001/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "cpp",  // Adjust this according to your language (e.g., "cpp" or "py")
          code,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTerminalOutput(result.output);
      } else {
        setTerminalOutput(result.error || "Unknown error occurred.");
      }
    } catch (err) {
      setTerminalOutput("Error connecting to server.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Editor Section */}
      <div style={{ flex: 1 }}>
        <textarea id="realtimeEditor"></textarea>
      </div>
      
      {/* Terminal Section */}
      <div
        style={{
          width: terminalSize,
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #ccc",
          resize: "horizontal", // Enable resizable terminal
          overflow: "auto",
          padding: "10px",
          backgroundColor: "#2b2b2b",
          color: "#fff"
        }}
      >
        <h5 style={{ textAlign: "center", margin: 0, color: "#fff" }}>Output Terminal</h5>
        <hr style={{ border: "1px solid #fff" }} />
        <pre style={{ flex: 1, overflow: "auto" }}>{terminalOutput}</pre>
        <button
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#00ff00",
            color: "#000",
            border: "none",
            cursor: "pointer",
          }}
          onClick={runCode}
        >
          Run
        </button>
      </div>
      
    </div>
  );
}

export default Editor;