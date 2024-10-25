import React, { useEffect, useState } from "react";
import { Table, Radio, Skeleton } from "antd"; // Import Skeleton
import DispatchLayout from "../Layout/DispatchLayout";
import axios from "axios";
import moment from "moment"; // Import moment.js

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ArchivedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all"); // Default to "all"
  const [loading, setLoading] = useState(true); // State for loading
  console.log(orders);

  const getOrders = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/orders/getallarchiveorders`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  // Function to filter the orders based on the createdAt date
  const filterOrdersByDate = (order) => {
    const orderDate = moment(order.createdAt);
    const today = moment();

    switch (filter) {
      case "today":
        return orderDate.isSame(today, "day");
      case "week":
        return orderDate.isSame(today, "week");
      case "month":
        return orderDate.isSame(today, "month");
      case "year":
        return orderDate.isSame(today, "year");
      case "all": // Return all orders when the filter is "all"
      default:
        return true;
    }
  };

  // Data processing to match DispatchDash style
  const dataSource = orders
    .flatMap((user) =>
      user.orders
        .filter((order) => order.archive === true && filterOrdersByDate(order)) // Only include archived orders and apply the filter
        .map((order) => ({
          key: order._id,
          name: user.name,
          orderId: order.orderId,
          enrollment: user.enrollment,
          amazonOrderId: order.items[0]?.amazonOrderId || "N/A",
          manager: user.manager,
          shippingPartner: order.items[0]?.shippingPartner || "N/A",
          trackingId: order.items[0]?.trackingId || "N/A",
          sku: order.items[0]?.sku || "N/A",
          pincode: order.items[0]?.pincode || "N/A",
          address: user.address,
          finalAmount: order.finalAmount,
          paymentStatus: order.paymentStatus,
          items: order.items,
          _id: order._id,
          createdAt: order.createdAt,
        }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Column definitions for the Ant Design Table
  const columns = [
    {
      title: <span className="text-sm text-black">Order Id</span>,
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Amazon Order Id</span>,
      dataIndex: "amazonOrderId",
      key: "amazonOrderId",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Manager</span>,
      dataIndex: "manager",
      key: "manager",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Delivery Partner</span>,
      dataIndex: "shippingPartner",
      key: "shippingPartner",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Tracking Id</span>,
      dataIndex: "trackingId",
      key: "trackingId",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">SKU</span>,
      dataIndex: "sku",
      key: "sku",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Pincode</span>,
      dataIndex: "pincode",
      key: "pincode",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => <span className="text-sm text-black">₹ {text}</span>,
    },
    {
      title: <span className="text-sm text-black">Product Status</span>,
      dataIndex: "items",
      key: "productAction",
      render: (items) => {
        const allAvailable = items.every(
          (item) => item.productAction === "Available"
        );
        return allAvailable ? (
          <span className="text-sm text-black text-green-500">Available</span>
        ) : (
          <span className="text-sm text-black text-red-500">Unavailable</span>
        );
      },
    },
  ];

  return (
    <DispatchLayout>
      {loading ? (
        <Skeleton active />
      ) : (
        <div className="relative max-w-full mx-auto pb-20">
          <h1 className="text-2xl font-bold text-black-800">Archive Orders</h1>

          <div className="text-sm text-black">
            <Radio.Group
              buttonStyle="solid"
              value={filter} // Bind the selected filter to the state
              onChange={(e) => setFilter(e.target.value)} // Update the filter state when the user selects an option
            >
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="today">Today</Radio.Button>
              <Radio.Button value="week">This Week</Radio.Button>
              <Radio.Button value="month">This Month</Radio.Button>
              <Radio.Button value="year">This Year</Radio.Button>
            </Radio.Group>
          </div>
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}
    </DispatchLayout>
  );
};

export default ArchivedOrders;
