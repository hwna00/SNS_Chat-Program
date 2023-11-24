import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./layout/DefaultLayout";
import RegisterPage from "./views/RegisterPage";
import MainPage from "./views/MainPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "",
        element: <MainPage />,
      },
      {
        path: "enter-page",
        element: <RegisterPage />,
      },
    ],
  },
]);

export default router;
