import React, { useEffect, useState } from "react";
import { Modal, Button, Table, message, Radio } from "antd";
import dayjs from "dayjs"; // Import dayjs for date manipulation
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"; // Import required plugin
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import AdminLayout from "../Layout/AdminLayout";
import axios from "axios";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  console.log(orders);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [filter, setFilter] = useState("all"); // Default filter set to "all"

  const getOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const allUsers = response.data.orders; // Assuming `orders` is an array of users

      // Get filtered orders based on the selected filter
      const filteredOrders = allUsers
        .map((user) => {
          const filteredUserOrders = user.orders.filter((order) => {
            const orderDate = dayjs(order.createdAt);
            const now = dayjs();

            if (filter === "today") {
              return orderDate.isSame(now, "day");
            } else if (filter === "week") {
              return orderDate.isSame(now, "week");
            } else if (filter === "month") {
              return orderDate.isSame(now, "month");
            } else if (filter === "year") {
              return orderDate.isSame(now, "year");
            }
            return true; // "all" filter should return all orders
          });

          return {
            ...user, // Keep the user information
            orders: filteredUserOrders, // Replace the user's orders with filtered ones
          };
        })
        .filter((user) => user.orders.length > 0); // Remove users with no matching orders

      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    getOrders();
  }, [filter]); // Refetch orders whenever the filter changes

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

  const handleFilterChange = (e) => {
    setFilter(e.target.value); // Update filter state
  };

  const columns = [
    {
      title: <span className="text-xs">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Enrollment</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Amazon Order ID</span>,
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
      title: <span className="text-xs">Tracking ID</span>,
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
        <>
          <Button
            type="primary"
            onClick={() =>
              handleRowClick(record.items, record.finalAmount, record._id)
            }
            className="mr-2 text-xs italic"
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
              className="text-xs italic"
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
              className="text-xs italic"
            >
              Done
            </Button>
          )}
        </>
      ),
    },
  ];

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

  const dataSource = orders.flatMap((user) =>
    user.orders.map((order) => ({
      key: order._id, // Ensure order._id is set properly
      name: user.name,
      enrollment: user.enrollment,
      amazonOrderId: order.items[0].amazonOrderId,
      manager: user.manager,
      shippingPartner: order.items[0].shippingPartner,
      trackingId: order.items[0].trackingId,
      sku: order.items[0]?.sku,
      address: user.address,
      finalAmount: order.finalAmount,
      paymentStatus: order.paymentStatus,
      items: order.items,
      _id: order._id, // This ensures that order._id is accessible in the `columns` render function
    }))
  );

  return (
    <AdminLayout>
      <div className="relative max-w-full mx-auto pb-10 px-2 bg-white shadow-lg rounded-lg">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-6 italic">
          A Detailed List of Orders
        </h1>

        {/* Radio Group for Filtering */}
        <div className="mb-6 flex justify-between items-center">
          <Radio.Group
            onChange={handleFilterChange}
            buttonStyle="solid"
            value={filter}
            className="bg-gray-100 p-2 rounded-md shadow-sm"
          >
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="today">Today</Radio.Button>
            <Radio.Button value="week">This Week</Radio.Button>
            <Radio.Button value="month">This Month</Radio.Button>
            <Radio.Button value="year">This Year</Radio.Button>
          </Radio.Group>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-gray-50 rounded-md shadow-sm">
          <Table
            bordered
            style={{ cursor: "pointer" }}
            columns={columns}
            dataSource={dataSource}
            rowClassName={getRowClassName}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
            className="rounded-md"
          />
        </div>
      </div>

      {/* Modal for Order Items */}
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
        {/* List of Ordered Items */}
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
                <strong>Product Status:</strong> {item.productAction}
                {item.productAction === "Product not available" && (
                  <Button
                    type="primary"
                    className="ml-2"
                    onClick={() => handleMarkAvailableClick(item._id)}
                  >
                    Mark Available
                  </Button>
                )}
              </p>
              <p className="text-md font-semibold">
                <strong>Total:</strong> {item.quantity} * ₹{item.price} = ₹
                {item.totalPrice}
              </p>
            </li>
          ))}
        </ul>

        {/* Final Amount */}
        <p className="text-right font-bold text-xl mt-4">
          Final Amount: ₹ {selectedOrderAmount}
        </p>
      </Modal>
    </AdminLayout>
  );
};

export default AllOrders;
