import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./layout/DefaultLayout";
import RegisterPage from "./views/RegisterPage";
import MainPage from "./views/MainPage";
import ChatRoom from "./views/ChatRoom";

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
      {
        path: "rooms/:roomName",
        element: <ChatRoom />,
      },
    ],
  },
]);

export default router;
