import { useRoutes } from "react-router-dom";
import Home from "../views/home/main";
import HowItWorks from "../views/how-it-works/main";
import NotFound from "../views/not-found/main";
import FlightTickets from "../views/flight-tickets/main";
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
      path: "/flight-tickets",
      element: <FlightTickets />,
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
