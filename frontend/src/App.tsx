import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import { isAuthenticated } from "./services/auth"

function App() {
  return isAuthenticated()
    ? <Dashboard />
    : <Login />
}

export default App