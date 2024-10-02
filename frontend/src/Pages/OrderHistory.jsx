import React, { useState, useEffect } from "react";
import ManagerLayout from "../Layout/ManagerLayout";
import axios from "axios";
import { Modal, Button, Table, DatePicker, Radio } from "antd";
import moment from "moment";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

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
      const sortedOrders = response.data.orders.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setActiveFilter(null);
    if (date) {
      const filtered = orders.filter((order) => {
        const orderDate = moment(order.createdAt).format("YYYY-MM-DD");
        const selected = date.format("YYYY-MM-DD");
        return orderDate === selected;
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setActiveFilter(filter);
    setSelectedDate(null);

    let filtered = [];
    switch (filter) {
      case "today":
        filtered = orders.filter((order) =>
          moment(order.createdAt).isSame(moment(), "day")
        );
        break;
      case "week":
        filtered = orders.filter((order) =>
          moment(order.createdAt).isBetween(
            moment().startOf("week"),
            moment().endOf("week"),
            null,
            "[]"
          )
        );
        break;
      case "month":
        filtered = orders.filter((order) =>
          moment(order.createdAt).isBetween(
            moment().startOf("month"),
            moment().endOf("month"),
            null,
            "[]"
          )
        );
        break;
      case "year":
        filtered = orders.filter((order) =>
          moment(order.createdAt).isBetween(
            moment().startOf("year"),
            moment().endOf("year"),
            null,
            "[]"
          )
        );
        break;
      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const orderColumns = [
    {
      title: <span className="text-xs">Order ID</span>,
      dataIndex: "orderId",
      key: "orderId",
      width: 150,
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Date</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => {
        const date = new Date(createdAt);
        return <span className="text-xs">{date.toLocaleDateString()}</span>;
      },
      width: 150,
    },
    {
      title: <span className="text-xs">Total Price</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (finalAmount) => <span className="text-xs">${finalAmount}</span>,
      width: 150,
    },
    {
      title: <span className="text-xs">Payment Status</span>,
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (paymentStatus) => (
        <span className="text-xs">
          {paymentStatus ? "Completed" : "Not Completed"}
        </span>
      ),
      width: 150,
    },
    {
      title: <span className="text-xs">Action</span>,
      key: "action",
      render: (text, record) => (
        <Button
          className="text-xs"
          type="primary"
          onClick={() => handleOrderClick(record)}
        >
          View Items
        </Button>
      ),
      width: 150,
    },
  ];

  const itemColumns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 150,
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price}`,
      width: 150,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice) => `$${totalPrice}`,
      width: 150,
    },
    {
      title: "Shipping Partner",
      dataIndex: "shippingPartner",
      key: "shippingPartner",
      width: 200,
    },
    {
      title: "Tracking ID",
      dataIndex: "trackingId",
      key: "trackingId",
      width: 200,
    },
  ];

  return (
    <ManagerLayout>
      <div className="container mx-auto sm:p-6 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold text-center">Order History</h1>

          <div className="flex justify-between items-center mb-6">
            <DatePicker
              style={{ width: "30%", padding: "6px" }}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              value={selectedDate}
            />

            {/* Radio Group for Filter */}
            <Radio.Group
              onChange={handleFilterChange}
              value={activeFilter}
              buttonStyle="solid"
            >
              <Radio.Button value="today">Today</Radio.Button>
              <Radio.Button value="week">This Week</Radio.Button>
              <Radio.Button value="month">This Month</Radio.Button>
              <Radio.Button value="year">This Year</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table
              dataSource={filteredOrders}
              columns={orderColumns}
              rowKey={(record) => record._id}
              pagination={false}
              bordered
              className="custom-table"
            />
          </div>
        ) : (
          <p className="text-center text-gray-600">No orders found.</p>
        )}

        <Modal
          title={`Items for Order`}
          visible={isModalVisible}
          onCancel={handleCloseModal}
          footer={[
            <Button key="close" onClick={handleCloseModal}>
              Close
            </Button>,
          ]}
          bodyStyle={{ overflowX: "auto" }}
        >
          {selectedOrder && selectedOrder.items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                dataSource={selectedOrder.items.sort(
                  (a, b) => a.totalPrice - b.totalPrice
                )}
                columns={itemColumns}
                rowKey={(record) => record.sku}
                pagination={false}
                bordered
                className="custom-table"
              />
            </div>
          ) : (
            <p>No items found for this order.</p>
          )}
        </Modal>
      </div>
    </ManagerLayout>
  );
};

export default OrderHistory;
