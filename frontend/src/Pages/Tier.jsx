import React, { useEffect, useState } from "react";
import UserLayout from "../Layout/UserLayout";
import { FaMedal, FaBullseye } from "react-icons/fa";
import axios from "axios";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Tier = () => {
  const [userData, setUserData] = useState({ user: { gms: 0 } }); // Initialize with 0 GMS
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

  const gms = userData.user.gms;
  const stages = [
    { name: "Bronze", gms: 35000 },
    { name: "Silver", gms: 55000 },
    { name: "Gold", gms: 100000 },
    { name: "Platinum", gms: 150000 },
  ];

  // Determine which stage the user has achieved and the next target
  const currentStageIndex = stages.findIndex((stage) => gms < stage.gms);

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto my-8 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-3xl font-bold text-center text-black-800 mb-6 flex items-center justify-center">
          Your Tier Status, {localStorage.getItem("name")}
          <FaMedal className="ml-3 text-yellow-500" />
        </h2>

        <div className="relative border-l border-gray-300 ml-6">
          {stages.map((stage, index) => (
            <div key={index} className="mb-10 ml-4">
              <div
                className={`absolute w-8 h-8 rounded-full -left-4 flex items-center justify-center ${
                  index < currentStageIndex
                    ? "bg-green-500"
                    : index === currentStageIndex
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                }`}
              >
                {index < currentStageIndex && (
                  <span className="text-white font-bold">✓</span>
                )}
              </div>
              <div className="pl-6">
                <h3
                  className={`text-xl font-bold ${
                    index < currentStageIndex
                      ? "text-green-600"
                      : index === currentStageIndex
                      ? "text-yellow-600"
                      : "text-black-600"
                  }`}
                >
                  {stage.name}
                  {index === currentStageIndex && (
                    <span className="ml-2 flex items-center text-red-600">
                      <FaBullseye className="mr-1 text-red-600" /> Next target
                    </span>
                  )}
                </h3>
                <p
                  className={`text-lg ${
                    index < currentStageIndex
                      ? "text-green-600"
                      : index === currentStageIndex
                      ? "text-yellow-600"
                      : "text-black-600"
                  }`}
                >
                  {stage.gms.toLocaleString()} + GMS
                </p>
                {index < currentStageIndex && stage.name === "Gold" && (
                  <p className="mt-2 text-xl font-semibold text-yellow-600">
                    Congratulations! You are currently at the Gold level.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default Tier;
