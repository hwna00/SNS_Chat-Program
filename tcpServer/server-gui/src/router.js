import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import RegisterPage from "./views/RegisterPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
]);

export default router;
