import React, { useEffect, useState } from "react";
import ShippingLayout from "../Layout/ShippingLayout";
import { Link } from "react-router-dom";
import {
  Modal,
  Button,
  Table,
  message,
  Select,
  Radio,
  Input,
  Tooltip,
} from "antd";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axios from "axios";
import moment from "moment"; // Make sure to install moment.js via npm or yarn

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const ShippingDash = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState(""); // Initialize with empty string for no filter
  const [editingItem, setEditingItem] = useState(null); // Track the editing item
  const [editValues, setEditValues] = useState({}); // Store edit values for the item
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search
  const role = localStorage.getItem("role");

  // Fetch orders from backend
  const getOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setOrders(response.data.orders);
      setFilteredOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders. Please try again.");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const filterOrders = () => {
    let filtered = [...orders];

    // Apply Payment Status Filter
    if (paymentStatusFilter !== "") {
      const isPaid = paymentStatusFilter === "true";
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => order.paymentStatus === isPaid),
        }))
        .filter((user) => user.orders.length > 0);
    }

    // Apply Time Filter
    if (timeFilter !== "") {
      const now = moment();
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderDate = moment(order.createdAt);
            switch (timeFilter) {
              case "today":
                return orderDate.isSame(now, "day");
              case "week":
                return orderDate.isSame(now, "week");
              case "month":
                return orderDate.isSame(now, "month");
              case "year":
                return orderDate.isSame(now, "year");
              default:
                return true;
            }
          }),
        }))
        .filter((user) => user.orders.length > 0);
    }

    // Apply Search Filter
    // Apply Search Filter
    if (searchQuery.trim() !== "") {
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderId = order.orderId?.toString().toLowerCase() || "";
            const enrollment = user.enrollment?.toString().toLowerCase() || "";
            const amazonOrderId =
              order.items[0]?.amazonOrderId?.toString().toLowerCase() || "N/A";
            const trackingId =
              order.items[0]?.trackingId?.toString().toLowerCase() || "N/A";

            return (
              orderId.includes(searchQuery.toLowerCase()) ||
              enrollment.includes(searchQuery.toLowerCase()) ||
              amazonOrderId.includes(searchQuery.toLowerCase()) ||
              trackingId.includes(searchQuery.toLowerCase()) // Add trackingId to search logic
            );
          }),
        }))
        .filter((user) => user.orders.length > 0); // Ensure to filter out users with no orders left after filtering
    }

    setFilteredOrders(filtered);
  };

  // Trigger filtering whenever filters or orders change
  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatusFilter, timeFilter, searchQuery, orders]);

  const handlePaymentStatusFilter = (value) => {
    setPaymentStatusFilter(value);
  };

  const handleTimeFilter = (e) => {
    setTimeFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const columns = [
    {
      title: <span className="text-xs">Order Id</span>,
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Amazon Order Id</span>,
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
      title: <span className="text-xs">Tracking Id</span>,
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
      title: <span className="text-xs">Pincode</span>,
      dataIndex: "pincode",
      key: "pincode",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => <span className="text-xs">₹ {text}</span>,
    },
    {
      title: <span className="text-xs">Product Status</span>,
      dataIndex: "items",
      key: "productAction",
      render: (items) => {
        const allAvailable = items.every(
          (item) => item.productAction === "Available"
        );
        return allAvailable ? (
          <span className="text-xs text-green-500">Available</span>
        ) : (
          <span className="text-xs text-red-500">Unavailable</span>
        );
      },
    },
    {
      title: <span className="text-xs">Action</span>,
      key: "action",
      render: (_, record) => (
        <div className="text-xs flex gap-1">
          {role === "dispatch" ? (
            <Button
              type="primary"
              className="text-xs"
              onClick={() =>
                handleRowClick(record.items, record.finalAmount, record._id)
              }
            >
              <DriveFileRenameOutlineIcon style={{ fontSize: "16px" }} />
            </Button>
          ) : (
            <Button
              disabled={true}
              type="primary"
              className="text-xs"
              onClick={() =>
                handleRowClick(record.items, record.finalAmount, record._id)
              }
            >
              <DriveFileRenameOutlineIcon style={{ fontSize: "16px" }} />
            </Button>
          )}
          {!record.paymentStatus ? (
            <Button
              type="primary"
              className="text-xs"
              onClick={() =>
                handlePaymentClick(
                  record.finalAmount,
                  record._id,
                  record.enrollment
                )
              }
            >
              Pay
            </Button>
          ) : (
            <></>
          )}

          {record.paymentStatus ? (
            <Button
              type="primary"
              className="text-xs"
              style={{
                marginRight: "5px",
                background: "green",
                color: "white",
              }}
              onClick={() =>
                handleShippedClick(record.items, record.finalAmount, record._id)
              }
            >
              Shipped
            </Button>
          ) : (
            <Tooltip title="Payment is not completed yet">
              <Button
                disabled={true}
                type="primary"
                className="text-xs"
                style={{
                  marginRight: "5px",
                  background: "green",
                  color: "white",
                }}
                onClick={() =>
                  handleShippedClick(
                    record.items,
                    record.finalAmount,
                    record._id
                  )
                }
              >
                Shipped
              </Button>
            </Tooltip>
          )}
          <Button
            type="primary"
            onClick={() =>
              showDeleteConfirm(
                record._id,
                record.orderId,
                record.orderItems,
                record.finalAmount
              )
            }
            style={{ background: "red" }}
          >
            <DeleteOutlineIcon style={{ fontSize: "16px" }} />
          </Button>
        </div>
      ),
    },
  ];
  const showDeleteConfirm = (orderId, recordId, orderItems, finalAmount) => {
    confirm({
      title: "Are you sure you want to delete this order?",
      icon: <DeleteOutlineIcon />,
      content: `This action will permanently remove the order with ID: ${recordId}.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeleteclick(orderItems, finalAmount, orderId); // Pass necessary parameters
      },
      onCancel() {
        console.log("Deletion canceled");
      },
    });
  };
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
  const dataSource = filteredOrders
    .flatMap((user) =>
      user.orders
        .filter((order) => order.archive === false && order.shipped === false) // Only include non-archived orders
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
      message.error("Insufficient user amount. Please try again.");
    }
  };
  const handleRowClick = (orderItems, finalAmount, orderId) => {
    setSelectedOrderItems(orderItems);
    setSelectedOrderAmount(finalAmount);
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };
  const handleShippedClick = async (orderItems, finalAmount, orderId) => {
    console.log(orderId, finalAmount);

    try {
      const response = await axios.put(
        `${backendUrl}/orders/shipped/${orderId}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Order shipped successfully!");
      getOrders();
    } catch (error) {
      console.error("Error in order shipping:", error);
      message.error("Could not ship the order, Please try again");
    }
  };
  const handleDeleteclick = async (orderItems, finalAmount, orderId) => {
    // Log order details for debugging or auditing purposes
    console.log("Delete initiated by user");
    console.log("Order ID:", orderId);
    console.log("Final Amount:", finalAmount);
    console.log("Order Items:", orderItems);

    try {
      const response = await axios.delete(
        `${backendUrl}/orders/delete/${orderId}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Order deleted successfully!");
      getOrders(); // Refresh the list of orders after deletion
    } catch (error) {
      console.error("Error deleting order:", error);
      message.error("Could not delete order. Please try again.");
    }
  };

  return (
    <ShippingLayout>
      <div className="relative max-w-full mx-auto pb-20">
        <h1 className="text-xl font-semibold text-black-600 mb-4">
          Shipping Dashboard
        </h1>

        {/* Search Input */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center justify-between space-x-4">
              {" "}
              <div className="text-sm">
                <label htmlFor="paymentStatus">Payment Status: </label>
                <Select
                  id="paymentStatus"
                  value={paymentStatusFilter}
                  style={{ width: 200 }}
                  onChange={handlePaymentStatusFilter}
                  className="text-xs"
                  placeholder="Select Status"
                  allowClear
                >
                  <Option value="true" className="text-xs">
                    Paid
                  </Option>
                  <Option value="false" className="text-xs">
                    Unpaid
                  </Option>
                </Select>
              </div>
              {/* Time Filter */}
              <div className="text-xs items-end">
                <Radio.Group
                  buttonStyle="solid"
                  onChange={handleTimeFilter}
                  value={timeFilter}
                >
                  <Radio.Button value="today">Today</Radio.Button>
                  <Radio.Button value="week">This Week</Radio.Button>
                  <Radio.Button value="month">This Month</Radio.Button>
                  <Radio.Button value="year">This Year</Radio.Button>
                </Radio.Group>
              </div>
              <div>
                <Search
                  placeholder="Search by Order ID, Enrollment No., Amazon Order ID"
                  value={searchQuery}
                  onChange={handleSearchChange} // This will still handle input change
                  style={{ width: 300 }}
                  className="text-xs"
                  enterButton // Adds a search icon/button next to the input
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto mb-16 text-xs">
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            rowClassName={getRowClassName}
            pagination={{ pageSize: 10 }}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
    </ShippingLayout>
  );
};

export default ShippingDash;
