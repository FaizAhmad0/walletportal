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
        // Filter by selected date if any
        if (selectedDate) {
          const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
          if (orderDate !== selectedDate) {
            return; // Skip this order if the date doesn't match
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

    setFilteredOrders(filtered); // Update the filtered orders state
    setIsModalVisible(true); // Show the modal with filtered orders

    // Scroll to the modal
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? date.format("YYYY-MM-DD") : null);

    let filtered = [];
    let moneyIssueCount = 0;
    let productNotAvailableCount = 0;
    let totalHoldOrders = 0;
    let totalOrders = 0;

    userData.forEach((user) => {
      const orders = user.orders || [];

      orders.forEach((order) => {
        // Filter by date
        if (date) {
          const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
          if (orderDate !== date.format("YYYY-MM-DD")) {
            return;
          }
        }

        totalOrders += 1; // Count total orders for the selected date
        let orderHasHold = false;

        if (order.paymentStatus === false) {
          moneyIssueCount += 1; // Count hold money issues
          orderHasHold = true;
        }

        const productHold = order.items.some(
          (item) => item.productAction !== "Available"
        );
        if (productHold) {
          productNotAvailableCount += 1; // Count product not available holds
          orderHasHold = true;
        }

        if (orderHasHold) {
          totalHoldOrders += 1; // Count total holds
        }

        filtered.push(order); // Add filtered orders for the modal
      });
    });

    setFilteredOrders(filtered);
    setTotalOrdersCount(totalOrders); // Update total orders count dynamically
    setHoldMoneyIssueCount(moneyIssueCount); // Update money issue count dynamically
    setProductNotAvailableCount(productNotAvailableCount); // Update product not available count dynamically
    setTotalOrdersHold(totalHoldOrders); // Update total holds dynamically
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
      <div className="relative max-w-7xl mx-auto p-6 pb-20 min-h-screen">
        <div className="w-full pb-2 px-4 bg-gradient-to-r mb-3 from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">
            Manager Performance Dashboard
          </h1>
        </div>{" "}
        <div className="mb-4">
          <label htmlFor="date-picker" className="mr-2">
            Filter By Date:
          </label>
          <DatePicker
            id="date-picker"
            format="YYYY-MM-DD"
            onChange={handleDateChange}
            placeholder="Select Date"
          />
        </div>
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
        {isModalVisible && (
          <div
            ref={modalRef}
            className="bg-white shadow-md rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center underline">
              Filtered Orders
            </h2>
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2">Order ID</th>
                      <th className="px-4 py-2">Payment Status</th>
                      <th className="px-4 py-2">Product Name</th>
                      <th className="px-4 py-2">Product Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 font-semibold">
                          {order.orderId}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              order.paymentStatus
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {order.paymentStatus ? "Paid" : "Not Paid"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <ul>
                            {order.items.map((item, i) => (
                              <li key={i}>{item.name}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-2">
                          <ul>
                            {order.items.map((item, i) => (
                              <li
                                key={i}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  item.productAction === "Available"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {item.productAction}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
