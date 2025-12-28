import "./App.css";
import { ThemeProvider } from "./components/theme/ThemeContext";
import AppRouter from "./Router";

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}
