import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import para from "../../constant/paraClient";

const IDLE_TIMEOUT = 60 * 60 * 1000;

const AuthRoute = ({ element }) => {
  const isLoggedIn = para.isFullyLoggedIn();

  if (!isLoggedIn) {
    toast.info("Session expired. Please login again.");
    return <Navigate to="/login" replace />;
  }

  return element;
};

const IdleTimeout = () => {
  const location = useLocation();
  let timeout;

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        para.logout();
        window.location.href = "/login";
      }, IDLE_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timeout);
    };
  }, [location]);

  return null;
};

export { AuthRoute, IdleTimeout };
