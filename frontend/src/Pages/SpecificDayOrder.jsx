import React, { useEffect, useState } from "react";
import { Table, Input } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { useParams } from "react-router-dom"; // Import useParams to get route params
import AdminLayout from "../Layout/AdminLayout";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const SpecificDayOrder = () => {
  const { date } = useParams(); // Get the date from the URL parameters
  const [orders, setOrders] = useState([]);
  const [searchInput, setSearchInput] = useState(""); // Search state

  console.log(orders);

  const fetchOrdersByDate = async () => {
    try {
      console.log("Fetching orders for date:", date); // Log the date being passed
      const response = await axios.get(`${backendUrl}/orders/getOrdersByDate`, {
        params: { date }, // Send the date as a query parameter
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setOrders(response.data.users); // Update this based on your API response structure
    } catch (error) {
      console.error("Error fetching orders for date:", error);
    }
  };

  useEffect(() => {
    fetchOrdersByDate();
  }, [date]);
  const columns = [
    {
      title: <span className="text-sm text-black">Date</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span className="text-sm text-black">
          {dayjs(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: <span className="text-sm text-black">Enrollment</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Amazon Order ID</span>,
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
      title: <span className="text-sm text-black">Tracking ID</span>,
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
      title: <span className="text-sm text-black">Address</span>,
      dataIndex: "address",
      key: "address",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => <span className="text-sm text-black">₹ {text}</span>,
    },
  ];
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value); // Update search input state
  };

  const filteredDataSource = orders
    .flatMap((user) =>
      user.orders.map((order) => ({
        key: order._id,
        name: user.name,
        enrollment: user.enrollment,
        createdAt: order.createdAt,
        amazonOrderId: order.items[0].amazonOrderId,
        manager: user.manager,
        shippingPartner: order.items[0].shippingPartner,
        trackingId: order.items[0].trackingId,
        sku: order.items[0]?.sku,
        address: user.address,
        finalAmount: order.finalAmount,
        paymentStatus: order.paymentStatus,
        items: order.items,
        _id: order._id,
      }))
    )
    .filter((item) => {
      // Dynamic filtering logic based on search input
      return (
        item.enrollment.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.amazonOrderId.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.trackingId.toLowerCase().includes(searchInput.toLowerCase())
      );
    })
    .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

  return (
    <AdminLayout>
      <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
        <h1 className="text-2xl pt-4 font-bold text-white">
          {date} All Orders
        </h1>
      </div>{" "}
      <div className="flex items-center justify-between">
        <Input.Search
          placeholder="Search by Enrollment, Amazon Order ID, or Tracking ID"
          value={searchInput}
          onChange={handleSearchChange}
          onSearch={(value) => setSearchInput(value)} // Optional: handle search button click
          className="w-full sm:w-1/2" // Adjust width for responsiveness
          allowClear // Optional: add a clear button to the input
          enterButton // Adds a search button to the right of the input
          style={{
            borderRadius: "5px", // Rounded corners
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
            borderColor: "#d9d9d9", // Ant Design default border color
          }}
        />
        <h2
          className="text-lg font-bold bg-blue-50 text-blue-800 py-1 mt-3 px-4 rounded-md"
          style={{
            display: "inline-block",
          }}
        >
          Total Orders: {filteredDataSource?.length}
        </h2>
      </div>
      <div className="overflow-x-auto bg-gray-50 rounded-md shadow-sm">
        <Table
          bordered
          style={{ cursor: "pointer" }}
          columns={columns}
          dataSource={filteredDataSource} // Use filtered data source here
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          className="rounded-md"
        />
      </div>
    </AdminLayout>
  );
};

export default SpecificDayOrder;
