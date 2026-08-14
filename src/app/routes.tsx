import { createBrowserRouter } from "react-router";
import { Root } from "./layouts/Root";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { Projects } from "./pages/Projects";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { Portal } from "./pages/Portal";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "portal", Component: Portal },
      { path: "about", Component: About },
      { path: "services", Component: Services },
      { path: "projects", Component: Projects },
      { path: "contact", Component: Contact },
    ],
  },
  {
    path: "/adminblc",
    Component: Admin,
  },
]);
