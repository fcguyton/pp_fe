import router from "./router";
import store from "./store";

const registerModule = (name, module) => {
  if (module.store) {
    store.registerModule(name, module.store);
  }

  if (module.router) {
    let moduleRoutes = module.router.routes;
    moduleRoutes.forEach(function (route) {
        router.addRoute(route);
    })
  }
};

export const registerModules = modules => {
  Object.keys(modules).forEach(moduleKey => {
    const module = modules[moduleKey];
    registerModule(moduleKey, module);
  });
};