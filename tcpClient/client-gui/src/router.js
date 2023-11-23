import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./layout/DefaultLayout";
import RegisterPage from "./views/RegisterPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "",
        element: <RegisterPage />,
      },
    ],
  },
]);

export default router;
