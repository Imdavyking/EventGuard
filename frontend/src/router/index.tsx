import { useRoutes } from "react-router-dom";
import Home from "../views/home/main";
import HowItWorks from "../views/how-it-works/main";
import NotFound from "../views/not-found/main";
import FlightTickets from "../views/flight-tickets/tickets";
import AdminDashboard from "../views/admin/main";
import GetFlights from "../views/flight-tickets/get-flights";
import Mint from "../views/mint/main";
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
      path: "/tickets",
      element: <FlightTickets />,
    },
    {
      path: "/flights",
      element: <GetFlights />,
    },
    {
      path: "/admin",
      element: <AdminDashboard />,
    },
    {
      path: "/mint",
      element: <Mint />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ];
  return useRoutes(routes);
}

export default Router;
