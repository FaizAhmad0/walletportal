import React, { useEffect, useState } from "react";
import { Modal, Button, Table, message, Radio, Input } from "antd";
import dayjs from "dayjs";
import ManagerLayout from "../Layout/ManagerLayout";
import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  const getOrders = async () => {
    const name = localStorage.getItem("name");

    try {
      const response = await axios.get(
        `${backendUrl}/orders/getmanagerorders/${name}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      const allUsers = response.data.orders;
      setOrders(allUsers);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

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
      message.error("Insufficient user amount, Please try again.");
    }
  };

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
        finalAmount: order.finalAmount,
        paymentStatus: order.paymentStatus,
        shipped: order.shipped,
        items: order.items,
        _id: order._id,
      }))
    )
    .filter((item) => {
      if (filter === "shipped") return item.shipped === true;
      if (filter === "holdMoneyIssue") return item.paymentStatus === false;
      if (filter === "productNotAvailable")
        return item.items.some(
          (subItem) => subItem.productAction === "Product not available"
        );
      return true;
    })
    .filter((item) => {
      return (
        item.enrollment.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.amazonOrderId.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.trackingId.toLowerCase().includes(searchInput.toLowerCase())
      );
    })
    .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

  const downloadOrdersAsExcel = () => {
    const header = [
      "Date",
      "Enrollment",
      "Amazon Order ID",
      "Manager",
      "Delivery Partner",
      "Tracking ID",
      "SKU",
      "Amount",
      "Payment Status",
      "Shipped",
    ];

    const csvRows = [
      header.join(","), // Add headers
      ...filteredDataSource.map((row) =>
        [
          dayjs(row.createdAt).format("DD/MM/YYYY"),
          row.enrollment,
          row.amazonOrderId,
          row.manager,
          row.shippingPartner,
          row.trackingId,
          row.sku,
          row.finalAmount,
          row.paymentStatus ? "Paid" : "Pending",
          row.shipped ? "Yes" : "No",
        ].join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      title: <span className="text-sm text-black">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => <span className="text-sm text-black">₹ {text}</span>,
    },
    {
      title: <span className="text-sm text-black">Action</span>,
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            onClick={() =>
              handleRowClick(record.items, record.finalAmount, record._id)
            }
            className="mr-2 text-sm text-white "
          >
            View
          </Button>
          {record.paymentStatus === false ? (
            <Button
              type="primary"
              onClick={() =>
                handlePaymentClick(
                  record.finalAmount,
                  record._id,
                  record.enrollment
                )
              }
              className="text-sm text-white "
            >
              Pay Now
            </Button>
          ) : (
            <Button
              type="primary"
              disabled={true}
              style={{
                background: "green",
                paddingLeft: "26px",
                paddingRight: "26px",
                color: "white",
              }}
              className="text-sm text-black "
            >
              Done
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <ManagerLayout>
      <div className="relative max-w-full mx-auto pb-10 px-2 bg-white shadow-lg rounded-lg">
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">All Orders</h1>
        </div>
        <div className="mb-6 flex justify-between items-center">
          <Radio.Group
            onChange={handleFilterChange}
            buttonStyle="solid"
            value={filter}
            className="bg-gray-100 p-2 rounded-md shadow-sm"
          >
            <Radio.Button value="all">Total Orders</Radio.Button>
            <Radio.Button value="shipped">Shipped</Radio.Button>
            <Radio.Button value="productNotAvailable">
              Product Not Available
            </Radio.Button>
            <Radio.Button value="holdMoneyIssue">Hold Money Issue</Radio.Button>
          </Radio.Group>
          <Input.Search
            placeholder="Search by Enrollment, Amazon Order ID, or Tracking ID"
            value={searchInput}
            onChange={handleSearchChange}
            onSearch={(value) => setSearchInput(value)}
            className=" sm:w-1/2"
            allowClear
            enterButton
            style={{
              width: 250,
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              borderColor: "#d9d9d9",
            }}
          />
          <Button
            type="primary"
            onClick={downloadOrdersAsExcel}
            className="ml-4"
          >
            Download
          </Button>
          <h2 className="text-lg font-bold bg-blue-50 text-blue-800 py-1 mt-3 px-4 rounded-md">
            Total Orders: {filteredDataSource?.length}
          </h2>
        </div>
        <div className="overflow-x-auto bg-gray-50 rounded-md shadow-sm">
          <Table
            bordered
            style={{ cursor: "pointer" }}
            columns={columns}
            dataSource={filteredDataSource}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
            className="rounded-md"
          />
        </div>
      </div>
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
        <ul className="space-y-4">
          {selectedOrderItems.map((item, index) => (
            <li key={index} className="border-b pb-4">
              <p className="text-lg">
                <strong>Product:</strong> {item.name}
              </p>
              <p className="text-md">
                <strong>Price:</strong> ₹ {item.price}
              </p>
              <p className="text-md">
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p className="text-md">
                <strong>GST Rate:</strong> {item.gstRate}%
              </p>
              <p className="text-md">
                <strong>Shipping Price:</strong> {item.shippingPrice}
              </p>
              <p className="text-md">
                <strong>Product Status:</strong> {item.productAction}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-lg mt-4">
          <strong>Total Amount:</strong> ₹ {selectedOrderAmount}
        </p>
        <Button
          type="primary"
          className="mt-4"
          onClick={() =>
            handlePaymentClick(selectedOrderAmount, selectedOrderId)
          }
        >
          Mark as Paid
        </Button>
      </Modal>
    </ManagerLayout>
  );
};

export default OrderHistory;
