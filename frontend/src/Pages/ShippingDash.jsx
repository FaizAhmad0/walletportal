import React, { useEffect, useState } from "react";
import ShippingLayout from "../Layout/ShippingLayout";
import InfiniteScroll from "react-infinite-scroll-component";

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
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axios from "axios";
import moment from "moment"; // Make sure to install moment.js via npm or yarn

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const ShippingDash = () => {
  const [trackingId, setTrackingId] = useState("");

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [shippingPartnerFilter, setShippingPartnerFilter] = useState("");
  const handleShippingPartnerFilter = (value) => {
    setShippingPartnerFilter(value);
  };
  // const [orders, setOrders] = useState([]);
  // const [filteredOrders, setFilteredOrders] = useState([]);
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
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const limit = 50; // fetch 50 users at a time
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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

  useEffect(() => {
    filterOrders();
  }, [
    searchQuery,
    paymentStatusFilter,
    shippingPartnerFilter,
    timeFilter,
    orders,
  ]);

  const handleTrackingIdSearch = async () => {
    if (!trackingId.trim()) return;

    try {
      const response = await axios.get(
        `${backendUrl}/orders/by-tracking/${trackingId}`
      );
      // console.log(response.data);
      setFilteredOrders(response.data.orders); // assuming your backend sends an array
    } catch (error) {
      console.error("Error fetching order by tracking ID:", error);
      message.error("Order not found or server error.");
    }
  };

  const handleSaveClick = async () => {
    try {
      console.log(editValues);
      await axios.put(
        `${backendUrl}/orders/update/${editingItem}`,
        editValues,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Order updated successfully!");
      getOrders();
      setEditingItem(null); // Exit editing mode
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Failed to update order. Please try again.");
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Payment Status Filter
    if (paymentStatusFilter !== "") {
      const isPaid = paymentStatusFilter === "true";
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => order.paymentStatus === isPaid),
        }))
        .filter((user) => user.orders.length > 0);
    }

    // Shipping Partner Filter
    if (shippingPartnerFilter !== "") {
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter(
            (order) => order.shippingPartner === shippingPartnerFilter
          ),
        }))
        .filter((user) => user.orders.length > 0);
    }

    // Time Filter
    if (timeFilter !== "") {
      const now = moment();
      const yesterday = moment().subtract(1, "day");

      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderDate = moment(order.createdAt);
            switch (timeFilter) {
              case "today":
                return orderDate.isSame(now, "day");
              case "yesterday":
                return orderDate.isSame(yesterday, "day");
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

    // Search Filter
    if (searchQuery.trim() !== "") {
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderId = order.orderId?.toString().toLowerCase() || "";
            const sku = order.items?.[0]?.sku?.toString().toLowerCase() || "";
            const enrollment = user.enrollment?.toString().toLowerCase() || "";
            const manager = user.manager?.toString().toLowerCase() || "";
            const amazonOrderId =
              order.items?.[0]?.amazonOrderId?.toString().toLowerCase() || "";
            const trackingId =
              order.items?.[0]?.trackingId?.toString().toLowerCase() || "";

            const query = searchQuery.toLowerCase();

            return (
              orderId.includes(query) ||
              sku.includes(query) ||
              enrollment.includes(query) ||
              manager.includes(query) ||
              amazonOrderId.includes(query) ||
              trackingId.includes(query)
            );
          }),
        }))
        .filter((user) => user.orders.length > 0);
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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div className="p-2">
          <Radio.Group
            value={selectedKeys[0]}
            onChange={(e) => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
              handleShippingPartnerFilter(e.target.value);
              confirm();
            }}
          >
            <Radio value="DTDC">DTDC</Radio>
            <Radio value="Tirupati">Tirupati</Radio>
            <Radio value="Maruti">Maruti</Radio>
            <Radio value="Delivery">Delivery</Radio>
          </Radio.Group>
        </div>
      ),
      onFilter: (value, record) => record.shippingPartner === value,
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
        <div className="text-sm text-black flex gap-1">
          {role === "dispatch" ? (
            <Button
              type="primary"
              className="text-sm text-black"
              onClick={() =>
                handleRowClick(record.items, record.finalAmount, record._id)
              }
            >
              <DriveFileRenameOutlineIcon style={{ fontSize: "16px" }} />
            </Button>
          ) : (
            <Button
              type="primary"
              className="text-sm text-white"
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
              className="text-sm text-white"
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
              className="text-sm text-white"
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
                className="text-sm text-black"
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
          {/* <Button
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
          </Button> */}
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
      setSearchQuery("");
      // getOrders();
      window.location.reload();
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
  const handleChange = (e) => {
    setEditValues({
      ...editValues,
      [e.target.name]: e.target.value,
    });
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrderItems([]);
    setSelectedOrderAmount(0);
    setSelectedOrderId("");
    setEditingItem(null); // Reset editing item
  };
  const handleEditClick = (item) => {
    setEditingItem(item._id);
    // Populate the form with the item details
    setEditValues({
      amazonOrderId: item.amazonOrderId,
      trackingId: item.trackingId,
      sku: item.sku,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      pincode: item.pincode,
      shippingPartner: item.shippingPartner,
      totalPrice: item.totalPrice,
    });
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

  return (
    <ShippingLayout>
      <div className="relative max-w-full mx-auto pb-20">
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">All Order's</h1>
        </div>{" "}
        <div className="flex items-center space-x-4 mt-4">
          <Input.Search
            placeholder="Search by Tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onSearch={handleTrackingIdSearch}
            enterButton
            className="text-sm text-black"
            style={{ width: 300 }}
          />
        </div>
        {/* Search Input */}
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-between space-x-4">
              {" "}
              {/* <div className="text-sm">
                <label htmlFor="paymentStatus">Payment Status: </label>
                <Select
                  id="paymentStatus"
                  value={paymentStatusFilter}
                  style={{ width: 200 }}
                  onChange={handlePaymentStatusFilter}
                  className="text-sm text-black"
                  placeholder="Select Status"
                  allowClear
                >
                  <Option value="true" className="text-sm text-black">
                    Paid
                  </Option>
                  <Option value="false" className="text-sm text-black">
                    Unpaid
                  </Option>
                </Select>
              </div> */}
              {/* Time Filter */}
              <div className="text-sm text-black items-end">
                <Radio.Group
                  buttonStyle="solid"
                  onChange={handleTimeFilter}
                  value={timeFilter}
                >
                  <Radio.Button value="yesterday">Yesterday</Radio.Button>{" "}
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
                  className="text-sm text-black"
                  enterButton // Adds a search icon/button next to the input
                />
              </div>
              <h2
                className="text-lg font-bold bg-blue-50 text-blue-800 px-4 py-1 rounded-md mt-3"
                style={{
                  display: "inline-block",
                }}
              >
                Total Orders: {dataSource?.length}
              </h2>{" "}
            </div>
          </div>
        </div>
        {/* Orders Table */}
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
        <Modal
          title="Order Details"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Close
            </Button>,
            editingItem && (
              <Button key="save" type="primary" onClick={handleSaveClick}>
                Save
              </Button>
            ),
          ]}
          className="rounded-lg"
        >
          <ul className="space-y-6">
            {selectedOrderItems.map((item, index) => (
              <li key={index} className="text-sm pb-6">
                {editingItem === item._id ? (
                  <>
                    <label className="block mb-2 font-semibold">
                      Amazon Order ID:
                    </label>
                    <Input
                      name="amazonOrderId"
                      value={editValues.amazonOrderId || ""}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">
                      Tracking ID:
                    </label>
                    <Input
                      name="trackingId"
                      value={editValues.trackingId || ""}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">SKU:</label>
                    <Input
                      name="sku"
                      value={editValues.sku || ""}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">Name:</label>
                    <Input
                      name="name"
                      value={editValues.name || ""}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">Price:</label>
                    <Input
                      name="price"
                      value={editValues.price || ""}
                      type="number"
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">
                      Quantity:
                    </label>
                    <Input
                      name="quantity"
                      value={editValues.quantity || ""}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">Pincode:</label>
                    <Input
                      name="pincode"
                      value={editValues.pincode || ""}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">
                      Shipping Partner:
                    </label>
                    <Input
                      name="shippingPartner"
                      value={editValues.shippingPartner || ""}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">
                      Total Price:
                    </label>
                    <Input
                      name="totalPrice"
                      value={editValues.totalPrice || ""}
                      type="number"
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <label className="block mb-2 font-semibold">
                      Product Availability:
                    </label>
                    <Select
                      name="productAction"
                      placeholder="Select product status"
                      value={editValues.productAction || "Available"}
                      onChange={(value) =>
                        setEditValues({ ...editValues, productAction: value })
                      }
                      className="mb-3"
                    >
                      <Option value="Available">Available</Option>
                      <Option value="Product not available">
                        Product not available
                      </Option>
                    </Select>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Amazon Order ID:</strong> {item.amazonOrderId}
                    </p>
                    <p>
                      <strong>Tracking ID:</strong> {item.trackingId}
                    </p>
                    <p>
                      <strong>SKU:</strong> {item.sku}
                    </p>
                    <p>
                      <strong>Name:</strong> {item.name}
                    </p>
                    <p>
                      <strong>Price:</strong> {item.price}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Pincode:</strong> {item.pincode}
                    </p>
                    <p>
                      <strong>Delivery Partner:</strong> {item.shippingPartner}
                    </p>
                    <p>
                      <strong>Total Price:</strong> {item.totalPrice}
                    </p>
                    <p>
                      <strong>Product Availability:</strong>{" "}
                      {item.productAction}
                    </p>
                    <Button
                      type="primary"
                      onClick={() => handleEditClick(item)}
                      className="mt-4"
                    >
                      Edit
                    </Button>
                    {item.productAction !== "Available" && (
                      <Button
                        type="primary"
                        className="ml-4 mt-4"
                        onClick={() => handleMarkAvailableClick(item._id)}
                      >
                        Mark Available
                      </Button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </Modal>
      </div>
    </ShippingLayout>
  );
};

export default ShippingDash;
