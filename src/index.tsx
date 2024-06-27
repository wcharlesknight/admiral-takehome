import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";

if (process.env.NODE_ENV !== "test") {
  const { worker } = require("./backend");
  worker.start();
}

const queryClient = new QueryClient();

// Select the root element
const rootElement = document.getElementById("root");
// Create a root. Note that this can be null as default, we know this exists so we typecast it defined.
const root = ReactDOM.createRoot(rootElement as HTMLElement);
// Note: React.StrictMode causes double rendering, which led to some
// problems in dev environment. Most notably in the DoneStep.tsx when everything
// is sent to the backend. For this assessment, I've commented it out to
// mock a "production" like experience.
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Router>
          <App />
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
