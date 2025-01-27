import React, { useState, useEffect } from "react";
import UserLayout from "../Layout/UserLayout";
import axios from "axios";
import { Table, Button, Modal, message } from "antd";

const BodFba = () => {
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Fetch bulk orders for the specific enrollment
  const fetchBulkOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const enrollment = localStorage.getItem("enrollment");

      if (!token) {
        message.error("Authentication token is missing.");
        return;
      }

      if (!enrollment) {
        message.error("Enrollment ID is missing.");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/user/getBulkOrders`,
        { enrollment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBulkOrders(response.data.orders || []);
    } catch (error) {
      message.error("Failed to fetch bulk orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger the fetchBulkOrders function on component mount
  useEffect(() => {
    fetchBulkOrders();
  }, []);

  // Show the modal with order details
  const showModal = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  // Hide the modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  // Define table columns for Ant Design Table
  const columns = [
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Order Type",
      dataIndex: "orderType",
      key: "orderType",
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (shipped) => (shipped ? "Done" : "No"),
    },
    {
      title: "Shipped",
      dataIndex: "shipped",
      key: "shipped",
      render: (shipped) => (shipped ? "Done" : "No"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => showModal(record)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          View SKU Details
        </Button>
      ),
    },
  ];

  return (
    <UserLayout>
      <div className="p-4">
        <div className="w-full pb-2 px-4 bg-gradient-to-r mb-3 from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">Bulk Orders</h1>
          {/* <FaMedal className="ml-3 text-yellow-500" /> */}
        </div>{" "}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Table
            bordered
            className="bg-white shadow-md rounded-lg"
            dataSource={bulkOrders}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
        )}
      </div>

      {/* Modal to display order details */}
      <Modal
        title="Order Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button
            key="close"
            onClick={handleCancel}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Close
          </Button>,
        ]}
        centered
        bodyStyle={{
          padding: "20px",
          maxHeight: "60vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
        className="custom-modal"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <h3 className="font-bold mt-4">SKU Details:</h3>
            <ul className="space-y-2">
              {selectedOrder.sku.map((skuItem, index) => (
                <li
                  key={index}
                  className="p-4 border rounded shadow-sm bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0"
                >
                  <div className="text-sm">
                    <p>
                      <strong>SKU:</strong> {skuItem.sku}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {skuItem.quantity}
                    </p>
                    <p>
                      <strong>Rate:</strong> {skuItem.rate}
                    </p>
                    <p>
                      <strong>Size:</strong> {skuItem.size}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p>
                      <strong>Total Payment:</strong> {skuItem.totalPayment}
                    </p>
                    <p>
                      <strong>Where Received:</strong> {skuItem.whereReceived}
                    </p>
                    <p>
                      <strong>Payment Date:</strong> {skuItem.paymentDate}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </UserLayout>
  );
};

export default BodFba;
