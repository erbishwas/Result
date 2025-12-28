import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import { ChangeProvider } from "./components/auth/ChangeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChangeProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            
              <App />
            
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ChangeProvider>
  </React.StrictMode>
);

