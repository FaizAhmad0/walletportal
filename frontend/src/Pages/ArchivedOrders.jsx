import React, { useEffect, useState } from "react";
import { Table, Radio, Skeleton, Button, message, Input } from "antd";
import DispatchLayout from "../Layout/DispatchLayout";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ArchivedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredDataSource = orders
    .flatMap((user) =>
      user.orders
        .filter(
          (order) =>
            order.archive === true &&
            filterOrdersByDate(order) &&
            (order.items[0]?.amazonOrderId?.includes(searchTerm) ||
              order.items[0]?.trackingId?.includes(searchTerm))
        )
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

  const handleOrderAction = async (enrollment, orderId) => {
    try {
      await axios.post(
        `${backendUrl}/orders/orderAction`,
        { enrollment, orderId },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      message.success("Order action successful!");
    } catch (error) {
      console.error("Error performing order action:", error);
      message.error("Failed to perform order action.");
    }
  };

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
    {
      title: <span className="text-sm text-black">Action</span>,
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleOrderAction(record.enrollment, record.orderId)}
        >
          Unarchive
        </Button>
      ),
    },
  ];

  return (
    <DispatchLayout>
      {loading ? (
        <Skeleton active />
      ) : (
        <div className="relative max-w-full mx-auto pb-20">
          <div className="w-full pb-2 px-4 bg-gradient-to-r mb-3 from-blue-500 to-red-300 shadow-lg rounded-lg">
            <h1 className="text-2xl pt-4 font-bold text-white">
              Archive Orders
            </h1>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
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
              <Input.Search
                placeholder="Search by Amazon Order ID or Tracking ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "250px",
                  marginLeft: "30px",
                  marginTop: "3px",
                }}
              />
              <h2
                className="text-lg font-bold bg-blue-50 text-blue-800 px-4 py-1 rounded-md"
                style={{
                  display: "inline-block",
                }}
              >
                Total Orders: {filteredDataSource?.length}
              </h2>
            </div>
          </div>
          <Table
            bordered
            columns={columns}
            dataSource={filteredDataSource}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </div>
      )}
    </DispatchLayout>
  );
};

export default ArchivedOrders;
