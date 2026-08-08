import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Admin from "./components/admin/Admin";

function App() {
  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/admin" component={Admin} />
    </Switch>
  );
}

export default App;
