import React, { useEffect, useState } from "react";
import axios from "axios";
import { DatePicker } from "antd"; // Import Ant Design DatePicker
import dayjs from "dayjs"; // For date formatting
import DispatchLayout from "../Layout/DispatchLayout";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const DetailsReporting = () => {
  const [userData, setUserData] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [holdMoneyIssueCount, setHoldMoneyIssueCount] = useState(0);
  const [productNotAvailableCount, setProductNotAvailableCount] = useState(0);
  const [totalOrdersHold, setTotalOrdersHold] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date

  // Fetch user data and orders from the backend
  const getUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getalluserss`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const users = response.data.users || [];
      setUserData(users);

      let totalOrders = 0;
      let holdMoneyIssue = 0;
      let productNotAvailable = 0;
      let totalHoldOrders = 0;
      let allOrders = [];

      users.forEach((user) => {
        const orders = user.orders || [];
        totalOrders += orders.length;

        orders.forEach((order) => {
          let orderHasHold = false;
          allOrders.push(order); // Add all orders

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
      setFilteredOrders(allOrders); // Display all orders initially
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUserData(); // Fetch data when the component is mounted
  }, []);

  const filterOrders = (type) => {
    let filtered = [];

    userData.forEach((user) => {
      const orders = user.orders || [];

      orders.forEach((order) => {
        // Filter by paymentStatus or productNotAvailable
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
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? date.format("YYYY-MM-DD") : null);

    let filtered = [];
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

        filtered.push(order); // Add filtered orders for the table
      });
    });

    setFilteredOrders(filtered); // Display filtered orders based on date
  };

  return (
    <DispatchLayout>
      <div className="relative max-w-7xl mx-auto pb-20 min-h-screen">
        {/* Date Filter */}
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

        {/* Manager Performance Dashboard */}
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
                Hold: Money Issue - {holdMoneyIssueCount}
              </p>
            </button>

            <button
              className="w-full p-4 bg-green-100 rounded-lg hover:bg-green-200 active:bg-green-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("productNotAvailable")}
            >
              <p className="text-lg font-medium text-green-800">
                Hold: Product Not Available - {productNotAvailableCount}
              </p>
            </button>
          </div>
          <br />

          <div className="grid grid-cols-2 gap-4">
            <button className="w-full p-4 bg-blue-100 rounded-lg hover:bg-blue-200 active:bg-blue-300 transition duration-150 ease-in-out">
              <p className="text-lg font-medium text-blue-800">
                Total Orders - {totalOrdersCount}
              </p>
            </button>

            <button className="w-full p-4 bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300 transition duration-150 ease-in-out">
              <p className="text-lg font-medium text-red-800">
                Total Orders Hold - {totalOrdersHold}
              </p>
            </button>
          </div>
        </div>

        {/* Display Filtered Orders */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center underline">
            Orders
          </h2>
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Payment Status</th>
                    <th className="px-4 py-2">Total Price</th>
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
                      <td className="px-4 py-2 font-semibold">
                        {order.finalAmount}
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
                              className={`${
                                item.productAction === "Available"
                                  ? "text-green-500"
                                  : "text-red-500"
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
        </div>
      </div>
    </DispatchLayout>
  );
};

export default DetailsReporting;
