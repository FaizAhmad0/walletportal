import React, { useEffect, useState } from "react";
import { Table, Radio, Input, DatePicker, message, Skeleton } from "antd";
import DispatchLayout from "../Layout/DispatchLayout";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";
import ShippingLayout from "../Layout/ShippingLayout";
import InfiniteScroll from "react-infinite-scroll-component";

const { Search } = Input; // Destructure Search from Input
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ShippedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [customDate, setCustomDate] = useState(null); // Add state for custom date

  const limit = 50; // fetch 50 users at a time
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [loading, setLoading] = useState(false);

  const getOrders = async (pageNo = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/orders/getallorders?page=${pageNo}&limit=${limit}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      const newUsers = response.data.orders;
      console.log(newUsers);

      if (newUsers.length === 0) {
        setHasMore(false);
      } else {
        setFilteredOrders((prev) => [...prev, ...newUsers]);
        setOrders((prev) => [...prev, ...newUsers]);
      }

      setPage(pageNo + 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders(1);
  }, []);
  const getRowClassName = (record) => {
    const allUnavailable = record.items.some(
      (item) => item.productAction !== "Available"
    );
    const isPaymentPending = !record.paymentStatus;

    if (allUnavailable && isPaymentPending) {
      return "bg-red-100"; // Light red
    } else if (allUnavailable) {
      return "bg-yellow-100"; // Light yellow
    } else if (isPaymentPending) {
      return "bg-pink-100"; // Light pink
    } else {
      return ""; // Default row color
    }
  };

  const filterOrdersByDate = (order) => {
    const orderDate = moment(order.createdAt);
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "day").startOf("day");

    switch (filter) {
      case "today":
        return orderDate.isSame(today, "day");
      case "yesterday":
        return orderDate.isSame(yesterday, "day");
      case "week":
        return orderDate.isSame(today, "week");
      case "month":
        return orderDate.isSame(today, "month");
      case "year":
        return orderDate.isSame(today, "year");
      case "custom":
        return customDate && orderDate.isSame(moment(customDate), "day");
      case "all":
      default:
        return true;
    }
  };

  const dataSource = filteredOrders
    .flatMap((user) =>
      user.orders
        .filter((order) => order.archive === false && order.shipped != false) // Only include non-archived orders
        .map((order) => ({
          key: order._id,
          name: user.name,
          orderId: order.orderId,
          enrollment: user.enrollment,
          amazonOrderId: order.items[0]?.amazonOrderId || "N/A",
          manager: user.manager,
          archive: order.archive,
          shipped: order.shipped,
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
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm">{text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-sm">{text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Amazon Order Id</span>,
      dataIndex: "amazonOrderId",
      key: "amazonOrderId",
      render: (text) => <span className="text-sm">{text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Manager</span>,
      dataIndex: "manager",
      key: "manager",
      render: (text) => <span className="text-sm">{text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Delivery Partner</span>,
      dataIndex: "shippingPartner",
      key: "shippingPartner",
      render: (text) => <span className="text-sm">{text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Tracking Id</span>,
      dataIndex: "trackingId",
      key: "trackingId",
      render: (text) => <span className="text-sm">{text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">SKU</span>,
      dataIndex: "sku",
      key: "sku",
      render: (text) => <span className="text-sm">{text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Pincode</span>,
      dataIndex: "pincode",
      key: "pincode",
      render: (text) => <span className="text-sm">{text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => <span className="text-sm">₹ {text}</span>,
      width: "auto",
      ellipsis: true,
    },
    {
      title: <span className="text-sm">Product Status</span>,
      dataIndex: "items",
      key: "productAction",
      render: (items) => {
        const allAvailable = items.every(
          (item) => item.productAction === "Available"
        );
        return allAvailable ? (
          <span className="text-sm text-green-500">Available</span>
        ) : (
          <span className="text-sm text-red-500">Unavailable</span>
        );
      },
      width: "auto",
      ellipsis: true,
    },
  ];

  return (
    <ShippingLayout>
      <div className="relative max-w-full mx-auto pb-20">
        <div className="w-full mb-3 pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">Shipped Orders</h1>
        </div>
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
            onChange={(e) => {
              setFilter(e.target.value);
              setCustomDate(null); // Reset custom date on filter change
            }}
          >
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="yesterday">Yesterday</Radio.Button>
            <Radio.Button value="today">Today</Radio.Button>
            <Radio.Button value="week">This Week</Radio.Button>
            <Radio.Button value="month">This Month</Radio.Button>
            <Radio.Button value="year">This Year</Radio.Button>
            <Radio.Button value="custom">Custom Date</Radio.Button>
          </Radio.Group>
          {/* DatePicker for custom date */}
          {filter === "custom" && (
            <DatePicker
              onChange={(date) => setCustomDate(date)}
              disabledDate={(current) =>
                current && current > moment().endOf("day")
              }
            />
          )}
          <h2 className="text-lg font-bold bg-blue-50 text-blue-800 px-4 py-1 rounded-md mt-3">
            Total Orders: {filteredOrders.length}
          </h2>
        </div>
        <div className="overflow-x-auto mb-16 text-sm text-black">
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            rowClassName={getRowClassName}
            pagination={{ pageSize: 20 }}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
            className="shadow-lg rounded-lg"
          />
        </div>
      </div>
    </ShippingLayout>
  );
};

export default ShippedOrders;
