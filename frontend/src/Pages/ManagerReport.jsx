import React, { useEffect, useState, useRef } from "react";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import ManagerLayout from "../Layout/ManagerLayout";
import { DatePicker } from "antd";
import dayjs from "dayjs";
const backendUrl = process.env.REACT_APP_BACKEND_URL;


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const ManagerReport = () => {
  const [userData, setUserData] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [holdMoneyIssueCount, setHoldMoneyIssueCount] = useState(0);
  const [productNotAvailableCount, setProductNotAvailableCount] = useState(0);
  const [totalOrdersHold, setTotalOrdersHold] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [manager, setManager] = useState("");
  console.log(manager);
  const modalRef = useRef(null);

  const getUserData = async () => {
    const manager = localStorage.getItem("name");
    try {
      const response = await axios.get(
        `${backendUrl}/user/getallmanageruserss/${manager}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      const users = response.data.users || [];
      setUserData(users);

      let totalOrders = 0;
      let holdMoneyIssue = 0;
      let productNotAvailable = 0;
      let totalHoldOrders = 0;

      users.forEach((user) => {
        const orders = user.orders || [];
        totalOrders += orders.length;

        orders.forEach((order) => {
          let orderHasHold = false;

          if (order.paymentStatus === false) {
            holdMoneyIssue += 1;
            orderHasHold = true;
          }

          const items = order.items || [];
          const productHold = items.some(
            (item) => item.productAction !== "Available"
          );

          if (productHold) {
            productNotAvailable += 1;
            orderHasHold = true;
          }

          if (orderHasHold) {
            totalHoldOrders += 1;
          }
        });
      });

      setTotalOrdersCount(totalOrders);
      setHoldMoneyIssueCount(holdMoneyIssue);
      setProductNotAvailableCount(productNotAvailable);
      setTotalOrdersHold(totalHoldOrders);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getManagerData = async () => {
    const manager = localStorage.getItem("name");
    try {
      const response = await axios.get(
        `${backendUrl}/user/getManagerData/${manager}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setManager(response.data.manager);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    getUserData();
    getManagerData();
  }, []);

  const filterOrders = (type) => {
    let filtered = [];

    userData.forEach((user) => {
      const orders = user.orders || [];

      orders.forEach((order) => {
        // Filter by date
        if (selectedDate) {
          const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
          if (orderDate !== selectedDate) {
            return;
          }
        }

        if (type === "paymentStatus") {
          if (order.paymentStatus === false) {
            filtered.push(order);
          }
        } else if (type === "productNotAvailable") {
          if (order.items.some((item) => item.productAction !== "Available")) {
            filtered.push(order);
          }
        }
      });
    });

    setFilteredOrders(filtered);
    setIsModalVisible(true);
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const managerData = {
    name: "Manish",
    totalOrders: totalOrdersCount,
    totalOrdersHold: totalOrdersHold,
    holdMoneyIssue: holdMoneyIssueCount,
    holdProductNotAvailable: productNotAvailableCount,
    gms: {
      today: 5000,
      yesterday: 4500,
      thisWeek: 30000,
      thisMonth: 120000,
      custom: 15000,
    },
    hold: {
      today: 2,
      yesterday: 3,
      thisWeek: 10,
      thisMonth: 40,
      custom: 5,
    },
  };

  const gmsData = {
    labels: ["Today", "Yesterday", "This Week", "This Month", "Custom"],
    datasets: [
      {
        label: "Gross Merchandise Sales (GMS)",
        data: [
          managerData.gms.today,
          managerData.gms.yesterday,
          managerData.gms.thisWeek,
          managerData.gms.thisMonth,
          managerData.gms.custom,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const holdData = {
    labels: ["Today", "Yesterday", "This Week", "This Month", "Custom"],
    datasets: [
      {
        label: "Holds",
        data: [
          managerData.hold.today,
          managerData.hold.yesterday,
          managerData.hold.thisWeek,
          managerData.hold.thisMonth,
          managerData.hold.custom,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <ManagerLayout>
      <div className="relative max-w-7xl mx-auto p-6 mt-8 pb-20 min-h-screen">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-1">
          Manager Performance Dashboard
        </h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              className="w-full p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200 active:bg-yellow-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("paymentStatus")}
            >
              <p className="text-lg font-medium text-yellow-800">
                Hold: Money Issue - {managerData.holdMoneyIssue}
              </p>
            </button>

            <button
              className="w-full p-4 bg-green-100 rounded-lg hover:bg-green-200 active:bg-green-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("productNotAvailable")}
            >
              <p className="text-lg font-medium text-green-800">
                Hold: Product Not Available -{" "}
                {managerData.holdProductNotAvailable}
              </p>
            </button>
          </div>
          <br />

          <div className="grid grid-cols-2 gap-4">
            <button className="w-full p-4 bg-blue-100 rounded-lg hover:bg-blue-200 active:bg-blue-300 transition duration-150 ease-in-out">
              <p className="text-lg font-medium text-blue-800">
                Total Orders - {managerData.totalOrders}
              </p>
            </button>

            <button className="w-full p-4 bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300 transition duration-150 ease-in-out">
              <p className="text-lg font-medium text-red-800">
                Total Orders Hold - {managerData.totalOrdersHold}
              </p>
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center underline">
            GMS and Hold Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Gross Merchandise Sales (GMS)
              </h3>
              <Line
                data={gmsData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                }}
              />
            </div>
            {/* Holds Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Hold Analytics
              </h3>
              <Bar
                data={holdData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                }}
              />
            </div>
          </div>
        </div>

        {isModalVisible && (
          <div
            ref={modalRef}
            className="bg-white shadow-md rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center underline">
              Filtered Orders
            </h2>
            {filteredOrders.length > 0 ? (
              <div>
                {filteredOrders.map((order, index) => (
                  <div
                    key={index}
                    className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg mb-6 transition duration-300 hover:shadow-xl"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Order ID: {order._id}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.paymentStatus
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.paymentStatus ? "Paid" : "Not Paid"}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <h4 className="font-medium text-gray-600 mb-2">
                        Products:
                      </h4>
                      <ul className="space-y-1 text-gray-600">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex items-center">
                            <span className="text-sm">{item.name}</span>
                            <span
                              className={`ml-auto px-2 py-1 text-xs rounded-full ${
                                item.productAction === "Available"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.productAction}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No orders found</p>
            )}
            <button
              className="mt-4 p-2 bg-red-500 text-white rounded"
              onClick={() => setIsModalVisible(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerReport;
