import React, { useEffect, useState } from "react";
import ManagerLayout from "../Layout/ManagerLayout";
import axios from "axios";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ManagerDash = () => {
  const [userData, setUserData] = useState("");
  console.log(userData);
  const getUserData = async () => {
    const id = localStorage.getItem("id");
    try {
      const response = await axios.get(`${backendUrl}/user/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  useEffect(() => {
    getUserData();
  }, []);
  return (
    <>
      <ManagerLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontWeight: "bold", fontSize: "20px" }}>
              {localStorage.getItem("name")} <br />
              {userData?.user?.enrollment}
            </h2>
            <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}></p>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3
              style={{
                margin: 0,
                fontWeight: "bold",
                fontSize: "large",
                animation: "upDown 2s ease-in-out infinite",
              }}
            >
              Tiar - Gold{" "}
              <span role="img" aria-label="crown">
                👑
              </span>
            </h3>
          </div>

          <style>
            {`
                @keyframes upDown {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-5px);
                }
                }
            `}
          </style>

          <div style={{ textAlign: "right" }}>
            <h2 style={{ margin: 0 }}></h2>
            <p style={{ color: "#b076ff", fontWeight: "bold", margin: 0 }}>
              GMS: {userData?.user?.gms}
            </p>
          </div>
        </div>
        <div className="flex justify-center pt-20">
          <img
            src="https://support.saumiccraft.com/wp-content/uploads/2023/05/logo-saumic-new.png"
            alt="Saumic craft logo"
          />
        </div>
      </ManagerLayout>
    </>
  );
};

export default ManagerDash;
