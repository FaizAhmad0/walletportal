import React, { useEffect, useState } from "react";
import DispatchLayout from "../Layout/DispatchLayout";
import { Link } from "react-router-dom";
import { Modal, Button, Table, message, Select, Radio } from "antd";
import axios from "axios";
import moment from "moment"; // Make sure to install moment.js via npm or yarn

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const { Option } = Select;

const DispatchDash = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState(""); // Initialize with empty string for no filter

  // Fetch orders from backend
  const getOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setOrders(response.data.orders);
      setFilteredOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders. Please try again.");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  // Centralized filtering function
  const filterOrders = () => {
    let filtered = [...orders];

    // Apply Payment Status Filter
    if (paymentStatusFilter !== "") {
      const isPaid = paymentStatusFilter === "true";
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => order.paymentStatus === isPaid),
        }))
        .filter((user) => user.orders.length > 0);
    }

    // Apply Time Filter
    if (timeFilter !== "") {
      const now = moment();
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderDate = moment(order.createdAt);
            switch (timeFilter) {
              case "today":
                return orderDate.isSame(now, "day");
              case "week":
                return orderDate.isSame(now, "week");
              case "month":
                return orderDate.isSame(now, "month");
              case "year":
                return orderDate.isSame(now, "year");
              default:
                return true;
            }
          }),
        }))
        .filter((user) => user.orders.length > 0);
    }

    setFilteredOrders(filtered);
  };

  // Trigger filtering whenever filters or orders change
  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatusFilter, timeFilter, orders]);

  // Handlers for filters
  const handlePaymentStatusFilter = (value) => {
    setPaymentStatusFilter(value);
  };

  const handleTimeFilter = (e) => {
    setTimeFilter(e.target.value);
  };

  // Handlers for modal and actions
  const handleRowClick = (orderItems, finalAmount, orderId) => {
    setSelectedOrderItems(orderItems);
    setSelectedOrderAmount(finalAmount);
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrderItems([]);
    setSelectedOrderAmount(0);
    setSelectedOrderId("");
  };

  const handlePaymentClick = async (amount, id, enrollment) => {
    try {
      await axios.post(
        `${backendUrl}/orders/pay/${amount}`,
        { enrollment, id },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Payment completed successfully!");
      getOrders();
    } catch (error) {
      console.error("Error initiating payment:", error);
      message.error("Insufficient user amount. Please try again.");
    }
  };

  const handleMarkAvailableClick = async (id) => {
    try {
      await axios.put(
        `${backendUrl}/orders/markavailable/${id}`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Item marked as available successfully!");
      getOrders();
    } catch (error) {
      console.error("Error marking item as available:", error);
      message.error("Failed to mark item as available. Please try again.");
    }
  };

  // Define table columns
  const columns = [
    {
      title: <span className="text-xs">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Amazon Order Id</span>,
      dataIndex: "amazonOrderId",
      key: "amazonOrderId",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Manager</span>,
      dataIndex: "manager",
      key: "manager",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Delivery Partner</span>,
      dataIndex: "shippingPartner",
      key: "shippingPartner",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Tracking Id</span>,
      dataIndex: "trackingId",
      key: "trackingId",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">SKU</span>,
      dataIndex: "sku",
      key: "sku",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Address</span>,
      dataIndex: "address",
      key: "address",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => <span className="text-xs">₹ {text}</span>,
    },
    {
      title: <span className="text-xs">Action</span>,
      key: "action",
      render: (_, record) => (
        <div className="text-xs flex gap-2">
          <Button
            type="primary"
            className="text-xs"
            onClick={() =>
              handleRowClick(record.items, record.finalAmount, record._id)
            }
            style={{ marginRight: "10px" }}
          >
            View
          </Button>
          {!record.paymentStatus ? (
            <Button
              type="primary"
              className="text-xs"
              onClick={() =>
                handlePaymentClick(
                  record.finalAmount,
                  record._id,
                  record.enrollment
                )
              }
            >
              Pay Now
            </Button>
          ) : (
            <Button
              type="primary"
              className="text-xs"
              disabled={true}
              style={{
                background: "green",
                paddingLeft: "26px",
                paddingRight: "26px",
                color: "white",
              }}
            >
              Done
            </Button>
          )}
        </div>
      ),
    },
    {
      title: <span className="text-xs">Product Status</span>,
      dataIndex: "items",
      key: "productAction",
      render: (items) => {
        const allAvailable = items.every(
          (item) => item.productAction === "Available"
        );
        return allAvailable ? (
          <span className="text-xs text-green-500">Available</span>
        ) : (
          <span className="text-xs text-red-500">Product not available</span>
        );
      },
    },
  ];

  // Prepare data for the table
  const dataSource = filteredOrders
    .flatMap((user) =>
      user.orders.map((order) => ({
        key: order._id,
        name: user.name,
        enrollment: user.enrollment,
        amazonOrderId: order.items[0]?.amazonOrderId || "N/A",
        manager: user.manager,
        shippingPartner: order.items[0]?.shippingPartner || "N/A",
        trackingId: order.items[0]?.trackingId || "N/A",
        sku: order.items[0]?.sku || "N/A",
        address: user.address,
        finalAmount: order.finalAmount,
        paymentStatus: order.paymentStatus,
        items: order.items,
        _id: order._id,
        createdAt: order.createdAt,
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <DispatchLayout>
      <div className="relative max-w-6xl mx-auto pb-20">
        <h1 className="text-xl font-semibold text-center text-gray-600 mb-4">
          Dispatch Dashboard
        </h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center justify-between space-x-4">
            {" "}
            <div className="text-sm">
              <label htmlFor="paymentStatus">Payment Status: </label>
              <Select
                id="paymentStatus"
                value={paymentStatusFilter}
                style={{ width: 200 }}
                onChange={handlePaymentStatusFilter}
                className="text-xs"
                placeholder="Select Status"
                allowClear
              >
                <Option value="true" className="text-xs">
                  Paid
                </Option>
                <Option value="false" className="text-xs">
                  Unpaid
                </Option>
              </Select>
            </div>
            <div>
              <Link to="/create-order">
                <Button type="primary" className="text-xs ">
                  Create Order
                </Button>
              </Link>
            </div>
            {/* Time Filter */}
            <div className="text-xs">
              <Radio.Group
                onChange={handleTimeFilter}
                value={timeFilter}
                buttonStyle="solid"
              >
                <Radio.Button value="today">Today</Radio.Button>
                <Radio.Button value="week">This Week</Radio.Button>
                <Radio.Button value="month">This Month</Radio.Button>
                <Radio.Button value="year">This Year</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto mb-16 text-xs">
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        title="Order Details"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button type="primary" key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        <ul>
          {selectedOrderItems.map((item, index) => (
            <li key={index} className="text-sm pb-6">
              <strong>Amazon Order ID:</strong> {item.amazonOrderId || "N/A"}
              <br />
              <strong>Tracking ID:</strong> {item.trackingId || "N/A"}
              <br />
              <strong>SKU:</strong> {item.sku || "N/A"}
              <br />
              <strong>Delivery Partner:</strong> {item.shippingPartner || "N/A"}
              <br />
              <strong>Product Status:</strong>{" "}
              {item.productAction === "Available" ? (
                <span className="text-green-500">Available</span>
              ) : (
                <span className="text-red-500">Not Available</span>
              )}
              {item.productAction !== "Available" && (
                <Button
                  type="primary"
                  className="text-xs mt-2"
                  onClick={() => handleMarkAvailableClick(item._id)}
                >
                  Mark Available
                </Button>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <strong>Total Amount:</strong> ₹ {selectedOrderAmount}
        </p>
      </Modal>
    </DispatchLayout>
  );
};

export default DispatchDash;
