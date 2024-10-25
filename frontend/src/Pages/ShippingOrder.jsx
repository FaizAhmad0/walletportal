import React, { useEffect, useState } from "react";
import { Table, Radio, Input } from "antd";
import DispatchLayout from "../Layout/DispatchLayout";
import axios from "axios";
import moment from "moment";

const { Search } = Input; // Destructure Search from Input
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ShippingOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState(""); // Add searchText state

  const getOrders = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/orders/getallshippedorder`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

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
      case "all":
      default:
        return true;
    }
  };

  const filteredOrders = orders
    .flatMap((user) =>
      user.orders
        .filter((order) => order.shipped === true && filterOrdersByDate(order))
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
    .filter((order) => {
      // Convert all values to strings before applying search filtering
      const searchString = searchText.toLowerCase();
      return (
        String(order.name).toLowerCase().includes(searchString) ||
        String(order.orderId).toLowerCase().includes(searchString) ||
        String(order.amazonOrderId).toLowerCase().includes(searchString) ||
        String(order.manager).toLowerCase().includes(searchString) ||
        String(order.shippingPartner).toLowerCase().includes(searchString) ||
        String(order.sku).toLowerCase().includes(searchString) ||
        String(order.pincode).toLowerCase().includes(searchString)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const columns = [
    {
      title: <span className="text-sm text-black">Order ID</span>,
      dataIndex: "orderId",
      key: "orderId",
      width: 150, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Name</span>,
      dataIndex: "name",
      key: "name",
      width: 200, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      width: 200, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Amazon Order Id</span>,
      dataIndex: "amazonOrderId",
      key: "amazonOrderId",
      width: 200, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Manager</span>,
      dataIndex: "manager",
      key: "manager",
      width: 150, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Delivery Partner</span>,
      dataIndex: "shippingPartner",
      key: "shippingPartner",
      width: 200, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Tracking Id</span>,
      dataIndex: "trackingId",
      key: "trackingId",
      width: 200, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">SKU</span>,
      dataIndex: "sku",
      key: "sku",
      width: 150, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Pincode</span>,
      dataIndex: "pincode",
      key: "pincode",
      width: 150, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      width: 150, // Adjust width as needed
      render: (text) => <span className="text-sm text-black">₹ {text}</span>,
    },
    {
      title: <span className="text-sm text-black">Product Status</span>,
      dataIndex: "items",
      key: "productAction",
      width: 200, // Adjust width as needed
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
      <div className="relative max-w-full mx-auto pb-20">
        <h1 className="text-2xl font-bold text-black-800">Shipped Orders</h1>

        <div className="flex justify-between items-center mb-4">
          {/* Search Input */}
          <Search
            placeholder="Search orders..."
            allowClear
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          {/* Radio Filter */}
          <Radio.Group
            buttonStyle="solid"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="today">Today</Radio.Button>
            <Radio.Button value="week">This Week</Radio.Button>
            <Radio.Button value="month">This Month</Radio.Button>
            <Radio.Button value="year">This Year</Radio.Button>
          </Radio.Group>
        </div>
        {/* <Table
          bordered
          columns={columns}
          dataSource={filteredOrders}
          pagination={{ pageSize: 10 }}
        /> */}
        <Table
          bordered
          columns={columns}
          dataSource={filteredOrders}
          tableLayout="fixed" // Ensure consistent column width
          scroll={{ x: "max-content" }} // Optional, allows horizontal scrolling if needed
        />
      </div>
    </DispatchLayout>
  );
};

export default ShippingOrder;
