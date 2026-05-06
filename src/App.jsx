import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

import AdminLayout from "./AdminLayout";

/* ============== Legacy frontend (public site) components ============== */
/* These live in src/frontend/components/ — currently stubs that show a
   "paste your old component here" placeholder. Replace each file with the
   real implementation from the old project and the route auto-uses it. */
import Navbar                  from "./frontend/components/Navbar";
import ExhibitorNavbar         from "./frontend/components/ExhibitorNavbar";
import LandingPageWrapper      from "./frontend/components/LandingPageWrapper";
import HomePageWrapper         from "./frontend/components/HomePageWrapper";
import AboutUs                 from "./frontend/components/AboutUs";
import MetroMap                from "./frontend/components/MetroMap";
import ExhibitionMap           from "./frontend/components/ExhibitionMap";
import WeatherInfo             from "./frontend/components/WeatherInfo";
import TouristSpots            from "./frontend/components/TouristSpots";
import WhyExhibit              from "./frontend/components/exhibitorArea/WhyExhibit";
import BecomeExhibitor         from "./frontend/components/exhibitorArea/BecomeExhibitor";
import RulesPolicy             from "./frontend/components/exhibitorArea/RulesPolicy";
import ExhibitorList           from "./frontend/components/ExhibitorList";
import PressRelease            from "./frontend/components/PressRelease";
import MediaGallery            from "./frontend/components/MediaGallery";
import AboutCEP                from "./frontend/components/AboutCEP";
import Topics                  from "./frontend/components/Topics";
import Testimonials            from "./frontend/components/Testimonials";
import Contact                 from "./frontend/components/Contact";
import IncreaseVisibility      from "./frontend/components/exhibitorArea/IncreaseVisibility";
import Login                   from "./frontend/components/Login";
import FloatingCard            from "./frontend/components/FloatingCard";
import ExhibitorDashboardLegacy from "./frontend/components/ExhibitorDashboard";
import ExhibitorLogin          from "./frontend/components/exhibitorArea/ExhibitorLogin";
import CustomEditor            from "./frontend/components/CustomEditor";
import VisitorGuide            from "./frontend/components/VisitorGuide";
import ForExhibitors           from "./frontend/components/exhibitorArea/ForExhibitors";
import Press                   from "./frontend/components/Press";
import TravelInfo              from "./frontend/components/TravelInfo";
import ExhibitorExhibitionMap  from "./frontend/components/exhibitorArea/ExhibitorExhibitionMap";
import UnSubscribe             from "./frontend/components/UnSubscribe";
import Benefactors             from "./frontend/components/Benefactors";
import AdminBadges             from "./frontend/components/List/AdminBadges";
import AdminOnePanel           from "./frontend/components/AdminOnePanel";
import AdminOneLogin           from "./frontend/components/AdminOneLogin";
import AdminTwoPanel           from "./frontend/components/AdminTwoPanel";
import AdminTwoLogin           from "./frontend/components/AdminTwoLogin";
import AdminThreeLogin         from "./frontend/components/AdminThreelogin";
import AdminThreePanel         from "./frontend/components/AdminThreePanel";

/* ============== Routes ============== */

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/"                              element={<LandingPageWrapper />} />
        <Route path="/home"                          element={<HomePageWrapper />} />
        <Route path="/about"                         element={<AboutUs />} />

        <Route path="/visitor-guide"                 element={<VisitorGuide />} />
        <Route path="/visitor-guide/metro-map"       element={<MetroMap />} />
        <Route path="/visitor-guide/exhibition-map"  element={<ExhibitionMap />} />
        <Route path="/visitor-guide/weather"         element={<WeatherInfo />} />
        <Route path="/visitor-guide/tourist-spots"   element={<TouristSpots />} />
        <Route path="/visitor-guide/exhibitor-list"  element={<ExhibitorList />} />

        <Route path="/exhibitor-login"               element={<ExhibitorLogin />} />
        <Route path="/why-exhibit"                   element={<WhyExhibit />} />
        <Route path="/become-exhibitor"              element={<BecomeExhibitor />} />
        <Route path="/rules-policy"                  element={<RulesPolicy />} />

        <Route path="/press"                         element={<Press />} />
        <Route path="/press/press-release"           element={<PressRelease />} />
        <Route path="/press/media-gallery"           element={<MediaGallery />} />

        <Route path="/about-cep"                     element={<AboutCEP />} />
        <Route path="/topics"                        element={<Topics />} />
        <Route path="/testimonials"                  element={<Testimonials />} />
        <Route path="/contact"                       element={<Contact />} />
        <Route path="/increase-visibility"           element={<IncreaseVisibility />} />

        <Route path="/admin-login"                   element={<Login />} />

        {/* 🔥 The new bright-crm admin (sidebar + tabs) */}
        <Route path="/dashboard"                element={<AdminLayout />} />

        {/* legacy exhibitor dashboard kept on its own path */}
        <Route path="/exhibitor-dashboard"           element={<ExhibitorDashboardLegacy />} />

        <Route path="/custom-editor"                 element={<CustomEditor />} />
        <Route path="/for-exhibitors"                element={<ForExhibitors />} />
        <Route path="/reach-venue"                   element={<TravelInfo />} />

        <Route path="/exhibitor-exhibition-map"      element={<ExhibitorExhibitionMap />} />
        <Route path="/unsubscribe"                   element={<UnSubscribe />} />
        <Route path="/benefactors"                   element={<Benefactors />} />
        <Route path="/exhibit-badges"                element={<AdminBadges />} />

        <Route path="/sachin"                        element={<AdminOneLogin />} />
        <Route path="/sachin-dashboard"              element={<AdminOnePanel />} />
        <Route path="/exhibitor-badges-printing"     element={<AdminTwoLogin />} />
        <Route path="/exhibitor-badges-dashboard"    element={<AdminTwoPanel />} />
        <Route path="/powerload"                     element={<AdminThreeLogin />} />
        <Route path="/power-dashboard"               element={<AdminThreePanel />} />
      </Routes>
    </AnimatePresence>
  );
}

/* ============== Layout (decides navbar / floating card) ============== */

function NavbarAndRoutes() {
  const location = useLocation();
  const path = location.pathname.replace(/\/+$/, "") || "/";

  const hideNavbarRoutes = [
    "/",
    "/dashboard",
    "/exhibitor-dashboard",
    "/exhibitor-loginexhibitor-login",
    "/unsubscribe",
    "/sachin-dashboard",
    "/sachin",
    "/exhibitor-badges-dashboard",
    "/exhibitor-badges-printing",
    "/power-dashboard",
    "/powerload",
  ];

  // Show FloatingCard on all public pages — hide only on admin/login dashboards
  const hideFloatingCardRoutes = [
    "/admindashboard",
    "/dashboard",
    "/exhibitor-dashboard",
    "/exhibitor-login",
    "/admin-login",
    "/sachin-dashboard",
    "/sachin",
    "/exhibitor-badges-dashboard",
    "/exhibitor-badges-printing",
    "/power-dashboard",
    "/powerload",
  ];

  const exhibitorRoutes = [
    "/for-exhibitors",
    "/why-exhibit",
    "/become-exhibitor",
    "/rules-policy",
    "/increase-visibility",
    "/exhibitor-login",
    "/exhibitor-exhibition-map",
  ];

  const showNavbar        = !hideNavbarRoutes.includes(path);
  const showFloatingCard  = !hideFloatingCardRoutes.includes(path);

  let isExhibitorRoute = exhibitorRoutes.includes(path);
  if (path === "/reach-venue") {
    isExhibitorRoute = !!location.state?.fromExhibitor;
  }

  return (
    <>
      {showNavbar && (isExhibitorRoute ? <ExhibitorNavbar /> : <Navbar />)}
      {showFloatingCard && <FloatingCard />}
      <AnimatedRoutes />
    </>
  );
}

/* ============== App root ============== */

export default function App() {
  return (
    <Router>
      <NavbarAndRoutes />
      <Toaster position="top-center" reverseOrder={false} />
    </Router>
  );
}
