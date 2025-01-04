import { Outlet } from "react-router-dom";
import Navbar from "../Components/Common/Navbar";
import Footer from "../Components/Common/Footer";
import ScrollToTop from "../Hooks/ScrollToTop";
import InAppBrowserRedirect from "../Components/Common/InAppBrowserRedirect";

export default function MainLayout() {
    return (
        <div className="">
            <ScrollToTop />
            <Navbar />
            <Outlet />
            <Footer />
            <InAppBrowserRedirect />
        </div>
    )
}
