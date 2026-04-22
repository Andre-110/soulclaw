import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import ForgePage from "../pages/forge/page";
import AvatarPage from "../pages/avatar/page";
import MatchingPage from "../pages/matching/page";
import CommunityPage from "../pages/community/page";
import SettingsPage from "../pages/settings/page";
import AppGate from "../components/feature/AppGate";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppGate />,
  },
  {
    path: "/forge",
    element: <ForgePage />,
  },
  {
    path: "/avatar",
    element: <AvatarPage />,
  },
  {
    path: "/matching",
    element: <MatchingPage />,
  },
  {
    path: "/community",
    element: <CommunityPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
