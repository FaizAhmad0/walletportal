import React, { useEffect, useState } from "react";
import { Modal, Button, Table, message, Radio, Input } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import AdminLayout from "../Layout/AdminLayout";
import axios from "axios";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState(""); // Search state

  const getOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const allUsers = response.data.orders;

      // Get filtered orders based on the selected filter
      const filteredOrders = allUsers
        .map((user) => {
          const filteredUserOrders = user.orders.filter((order) => {
            const orderDate = dayjs(order.createdAt);
            const now = dayjs();

            // Date filtering logic
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
            ...user,
            orders: filteredUserOrders,
          };
        })
        .filter((user) => user.orders.length > 0);

      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    getOrders();
  }, [filter]);

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
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value); // Update search input state
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
              className="text-sm text-black "
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

  const getRowClassName = (record) => {
    // Your getRowClassName logic remains unchanged
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
    .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))); // Sort by createdAt in descending order

  return (
    <AdminLayout>
      <div className="relative max-w-full mx-auto pb-10 px-2 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold">Order Details</h1>
        {/* Search Input */}

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
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-gray-50 rounded-md shadow-sm">
          <Table
            bordered
            style={{ cursor: "pointer" }}
            columns={columns}
            dataSource={filteredDataSource} // Use filtered data source here
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

        <p className="mt-4 text-lg font-semibold">
          Total Amount: ₹{selectedOrderAmount}
        </p>
        {/* <Button
          type="primary"
          onClick={() =>
            handlePaymentClick(selectedOrderAmount, selectedOrderId)
          }
        >
          Pay Now
        </Button> */}
      </Modal>
    </AdminLayout>
  );
};

export default AllOrders;
