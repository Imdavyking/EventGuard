import { useRoutes } from "react-router-dom";
import Home from "../views/home/main";
import HowItWorks from "../views/how-it-works/main";
import NotFound from "../views/not-found/main";
import Events from "../views/events/main";
import MyTickets from "../views/tickets/main";
import RefundStatus from "../views/refund-status/main";
import AdminDashboard from "../views/admin/main";
function Router() {
  const routes = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/how-it-works",
      element: <HowItWorks />,
    },
    {
      path: "/events",
      element: <Events />,
    },
    {
      path: "/my-tickets",
      element: <MyTickets />,
    },
    {
      path: "/refund-status",
      element: <RefundStatus />,
    },
    {
      path: "/admin",
      element: <AdminDashboard />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ];
  return useRoutes(routes);
}

export default Router;
