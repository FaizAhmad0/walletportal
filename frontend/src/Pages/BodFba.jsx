import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message } from "antd"; // Ant Design for modal and input
import UserLayout from "../Layout/UserLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const BodFba = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "descending", // Default to descending
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [userData, setUserData] = useState("");
  console.log(userData);
  const [amount, setAmount] = useState("");

  const getOrders = async () => {
    const user = localStorage.getItem("enrollment");
    try {
      const response = await axios.get(
        `${backendUrl}/orders/getuserbulk/${user}`,
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  const getUser = async () => {
    const id = localStorage.getItem("id");
    try {
      const response = await axios.get(`${backendUrl}/user/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    getOrders();
    getUser();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });
  };

  const handlePayNowClick = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/orders/bulkorder/pay`,
        {
          orderId: selectedOrderId,
          amount,
          enrollment: localStorage.getItem("enrollment"),
        },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setIsModalVisible(false);

      message.success("Payment successfully completed!");
      setAmount("");
      getOrders(); // Refresh orders after payment
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setAmount("");
  };

  // Function to calculate the total paid amount from the paymentStage array
  const getTotalPaidAmount = (paymentStage) => {
    return paymentStage.reduce((acc, stage) => acc + stage.amount, 0);
  };

  const sortedData = [...orders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-md">
        <h2 className="text-2xl text-center font-bold mb-4">
          B.O.D - Order Details
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 border border-gray-300 rounded"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-blue-50">
                <tr>
                  {[
                    "Order Id",
                    "Shipping Address",
                    "Total Price",
                    "Remaining Amount",
                    "Date of Order",
                    "Date of Shipping",
                    "Status", // Column for Pay Now or Payment Completed
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort(header.toLowerCase().replace(/ /g, "_"))
                      }
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => {
                  const totalPaidAmount = getTotalPaidAmount(item.paymentStage);
                  const remainingAmount = item.totalPrice - totalPaidAmount;

                  return (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {item.orderId}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {item.shippingAddress}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {item.totalPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {remainingAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {totalPaidAmount >= item.totalPrice ? (
                          <span className="text-green-500 font-bold">
                            Payment Completed
                          </span>
                        ) : remainingAmount <= userData.amount ? (
                          <Button
                            type="primary"
                            onClick={() => handlePayNowClick(item.orderId)}
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            onClick={() => {
                              navigate("/wallet");
                            }}
                          >
                            Recharge Now
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        title="Pay Now"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Modal>
    </UserLayout>
  );
};

export default BodFba;
