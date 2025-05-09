import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import para from "../../constant/paraClient";

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await para.isFullyLoggedIn();
      // console.log(loggedIn);
      if (loggedIn) {
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  return children;
};

export default AuthWrapper;
