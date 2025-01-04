/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import { useEffect, useState } from "react";
import useAxiosPublic from "../Hooks/useAxiosPublic";

const PrivateRoute = ({ children }) => {
    const axiosPublic = useAxiosPublic(); 
    const { user, loading, logOut } = useAuth();
    const [admin, setAdmin] = useState(null);
    const [adminLoading, setAdminLoading] = useState(true); // Add admin loading state
    const location = useLocation();
    const pathname = location?.pathname;

    useEffect(() => {
        if (user) {
            // Fetch admin data
            axiosPublic.get(`/users/${user?.email}`)
                .then(res => {
                    setAdmin(res?.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch admin data:", error);
                })
                .finally(() => {
                    setAdminLoading(false); // Data fetching completed
                });
        } else {
            setAdminLoading(false); // No user, skip fetching admin
        }
    }, [axiosPublic, user]);

    // Display a loading screen while checking authentication or admin status
    if (loading || adminLoading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <span className="loading loading-ring loading-lg"></span>
            </div>
        );
    }

    // If no user is logged in, redirect to login page
    if (!user) {
        return <Navigate state={{ from: location }} to="/signup" />;
    }

    // If user is trying to access an admin route
    if (pathname?.includes("admin")) {
        // Wait for admin data before checking the role
        if (admin && admin.role === "admin") {
            return children; // User is admin, render children
        }

        if (admin && admin.role !== "admin") {
            logOut(); // Not an admin, log out
            return <Navigate to="/signup" />;
        }

        // If admin data is still null and loading is complete, show loading (avoid premature redirect)
        return (
            <div className="h-screen flex justify-center items-center">
                <span className="loading loading-ring loading-lg"></span>
            </div>
        );
    }

    // If regular route, render children
    return children;
};

export default PrivateRoute;
