import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import Index from "./pages/index";

// Отдельный чанк: код админки не нужен посетителям сайта, а сам файл
// не должен раздувать главный бандл — крупные файлы обрываются
// при передаче некоторыми провайдерами.
const Admin = lazy(() => import("./components/admin/Admin"));

function App() {
  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/admin">
        <Suspense fallback={null}>
          <Admin />
        </Suspense>
      </Route>
    </Switch>
  );
}

export default App;
