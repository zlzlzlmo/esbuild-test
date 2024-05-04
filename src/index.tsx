import * as esbuild from "esbuild-wasm";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { fetchPlugin } from "./plugins/fetch-plugin";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "/esbuild.wasm",
    });
  };

  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    try {
      const res = await ref.current.build({
        entryPoints: ["index.js"],
        bundle: true,
        write: false,
        plugins: [fetchPlugin(input), unpkgPathPlugin()],
        define: {
          "process.env.NODE_ENV": '"production"',
          global: "window",
        },
      });
      console.log(res);
      setCode(res.outputFiles[0].text);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      {code && <pre>{code}</pre>}
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
