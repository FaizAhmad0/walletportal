import React, { useEffect, useState } from "react";
import { Modal, Button, Table, message, Radio, Input, Skeleton } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import axios from "axios";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const TotalSale = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  const getOrders = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const allUsers = response.data.orders;
      const filteredOrders = allUsers
        .map((user) => {
          const filteredUserOrders = user.orders.filter((order) => {
            const orderDate = dayjs(order.createdAt);
            const now = dayjs();
            const yesterday = now.subtract(1, "day").startOf("day");

            if (filter === "today") {
              return orderDate.isSame(now, "day");
            } else if (filter === "yesterday") {
              return orderDate.isSame(yesterday, "day");
            } else if (filter === "week") {
              return orderDate.isSame(now, "week");
            } else if (filter === "month") {
              return orderDate.isSame(now, "month");
            } else if (filter === "year") {
              return orderDate.isSame(now, "year");
            }
            return true;
          });

          return {
            ...user,
            orders: filteredUserOrders,
          };
        })
        .filter((user) => user.orders.length > 0);

      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    getOrders();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
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
        finalAmount: parseFloat(order.finalAmount),
        paymentStatus: order.paymentStatus,
        items: order.items,
        _id: order._id,
      }))
    )
    .filter((item) => {
      return (
        item.enrollment.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.amazonOrderId.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.trackingId.toLowerCase().includes(searchInput.toLowerCase())
      );
    })
    .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

  // Calculate daily report
  const dailyReport = filteredDataSource.reduce((acc, order) => {
    const date = dayjs(order.createdAt).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = { date, totalAmount: 0, totalItems: 0, gsm: 0 };
    }
    acc[date].totalAmount += order.finalAmount;
    acc[date].totalItems += 1;
    return acc;
  }, {});

  const dailyReportData = Object.values(dailyReport);

  const reportColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Total Items",
      dataIndex: "totalItems",
      key: "totalItems",
    },
    {
      title: "Total Sale",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text) => `₹ ${text.toFixed(2)}`,
    },
    {
      title: "Net Sale",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text) => {
        const netSale = text / 1.18;
        return `₹ ${netSale.toFixed(2)}`;
      },
    },
    {
      title: "GSM",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text) => `${text.toFixed(2)}`,
    },
    {
      title: "Return",
      dataIndex: "data",
      key: "data",
      render: (text) => `${text || 0}`,
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 bg-white rounded shadow">
        <div className="w-full pb-2 mb-3 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">Total Sale</h1>
        </div>
        <div className="mb-4 flex justify-between">
          <Radio.Group onChange={handleFilterChange} value={filter}>
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="today">Today</Radio.Button>
            <Radio.Button value="yesterday">Yesterday</Radio.Button>
            <Radio.Button value="week">This Week</Radio.Button>
            <Radio.Button value="month">This Month</Radio.Button>
            <Radio.Button value="year">This Year</Radio.Button>
          </Radio.Group>
          <Input.Search
            placeholder="Search by Enrollment, Order ID, Tracking ID"
            value={searchInput}
            onChange={handleSearchChange}
            className="w-1/3"
          />
        </div>
        <h2 className="text-xl font-semibold mt-8">Daily Report Summary</h2>
        {loading ? (
          <Skeleton active paragraph={{ rows: 11 }} />
        ) : (
          <Table
            columns={reportColumns}
            dataSource={dailyReportData}
            pagination={false}
            rowClassName={(record, index) =>
              index % 2 === 0
                ? "hoverable-row even-row"
                : "hoverable-row odd-row"
            }
            onRow={(record) => ({
              onClick: () => {
                navigate(`/orders/${record.date}`);
              },
            })}
          />
        )}
        <style jsx>{`
          .hoverable-row {
            cursor: pointer;
          }
          .hoverable-row:hover {
            background-color: rgba(0, 123, 255, 0.1);
          }
          .even-row {
            background-color: #f9f9f9;
          }
          .odd-row {
            background-color: #ffffff;
          }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default TotalSale;
