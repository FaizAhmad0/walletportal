import React, { useEffect, useState } from "react";
import DispatchLayout from "../Layout/DispatchLayout";
import { Link } from "react-router-dom";
import { Modal, Button, Table, message, Select, Radio, Input } from "antd";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArchiveIcon from "@mui/icons-material/Archive";
import { FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import moment from "moment"; // Make sure to install moment.js via npm or yarn

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const DispatchDash = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [shippingPartnerFilter, setShippingPartnerFilter] = useState("");
  const handleShippingPartnerFilter = (value) => {
    setShippingPartnerFilter(value);
  };
  const [productStatusFilter, setProductStatusFilter] = useState(null);
  const handleProductStatusFilter = (value) => {
    setProductStatusFilter(value);
  };
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
  const role = localStorage.getItem("role");
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search

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
  const handleArchiveClick = async (orderItems, finalAmount, orderId) => {
    console.log(orderId, finalAmount);

    try {
      const response = await axios.put(
        `${backendUrl}/orders/archive/${orderId}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Order status changes successfully!");
      getOrders();
    } catch (error) {
      console.error("Error in order status:", error);
      message.error("Could not change order status, Please try again");
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

    // Apply Shipping Partner Filter
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

    // Apply Time Filter
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

    // Apply Search Filter
    if (searchQuery.trim() !== "") {
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderId = order.orderId?.toString().toLowerCase() || "";
            const sku = order.sku?.toString().toLowerCase() || "";
            const enrollment = user.enrollment?.toString().toLowerCase() || "";
            const manager = user.manager?.toString().toLowerCase() || "";
            const amazonOrderId =
              order.items[0]?.amazonOrderId?.toString().toLowerCase() || "N/A";
            const trackingId =
              order.items[0]?.trackingId?.toString().toLowerCase() || "N/A";

            return (
              orderId.includes(searchQuery.toLowerCase()) ||
              enrollment.includes(searchQuery.toLowerCase()) ||
              manager.includes(searchQuery.toLowerCase()) ||
              amazonOrderId.includes(searchQuery.toLowerCase()) ||
              trackingId.includes(searchQuery.toLowerCase()) ||
              sku.includes(searchQuery.toLowerCase())
            );
          }),
        }))
        .filter((user) => user.orders.length > 0);
    }

    setFilteredOrders(filtered);
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
      title: <span className="text-sm text-black">Brand Name</span>,
      dataIndex: "brandName",
      key: "brandName",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">User Amount.</span>,
      dataIndex: "amount",
      key: "amount",
      render: (text) => {
        const formattedAmount = Number(text).toFixed(2); // Convert to number and format with 2 decimal places
        return <span className="text-sm text-black">₹ {formattedAmount}</span>;
      },
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
              const selectedValue = e.target.value;
              setSelectedKeys(selectedValue ? [selectedValue] : []); // Reset or apply the filter
              handleShippingPartnerFilter(selectedValue); // Apply the filter logic
              confirm();
            }}
          >
            <Radio value="DTDC">DTDC</Radio>
            <Radio value="Tirupati">Tirupati</Radio>
            <Radio value="Maruti">Maruti</Radio>
            <Radio value="Delivery">Delivery</Radio>
            <Radio value="">All</Radio> {/* This removes the filter */}
          </Radio.Group>
        </div>
      ),
      onFilter: (value, record) => {
        if (value === "") {
          return true; // Return true to show all records when no filter is applied
        }
        return record.shippingPartner === value;
      },
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
      title: (
        <span className="text-sm text-black">
          Product Status
          <span style={{ marginLeft: 5 }}>
            <Button
              type="link"
              icon={<FilterOutlined />}
              onClick={() =>
                setProductStatusFilter(productStatusFilter ? null : "")
              }
              style={{ padding: 0 }}
            />
          </span>
        </span>
      ),
      dataIndex: "items",
      key: "productAction",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div className="p-2">
          <Radio.Group
            value={selectedKeys[0]}
            onChange={(e) => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
              handleProductStatusFilter(e.target.value);
              confirm();
            }}
          >
            <Radio value="Available">Available</Radio>
            <Radio value="Unavailable">Unavailable</Radio>
          </Radio.Group>
        </div>
      ),
      onFilter: (value, record) => {
        const allAvailable = record.items.every(
          (item) => item.productAction === "Available"
        );
        return value === "Available" ? allAvailable : !allAvailable;
      },
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
          <Button
            type="primary"
            className="text-sm text-white"
            onClick={() =>
              handleRowClick(record.items, record.finalAmount, record._id)
            }
          >
            <DriveFileRenameOutlineIcon style={{ fontSize: "16px" }} />
          </Button>
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

          <Button
            type="primary"
            className="text-sm text-white"
            style={{ background: "green" }}
            onClick={() =>
              handleArchiveClick(record.items, record.finalAmount, record._id)
            }
          >
            <ArchiveIcon style={{ fontSize: "16px" }} />
          </Button>
          {/* {role === "shippingmanager" ? (
            <Button
              type="primary"
              className="text-sm text-black"
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
                handleShippedClick(record.items, record.finalAmount, record._id)
              }
            >
              Shipped
            </Button>
          )} */}
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
  const dataSource = filteredOrders
    .flatMap((user) =>
      user.orders
        .filter((order) => order.archive === false && order.shipped === false) // Only include non-archived orders
        .map((order) => ({
          key: order._id,
          name: user.name,
          amount: user.amount,
          orderId: order.orderId,
          enrollment: user.enrollment,
          amazonOrderId: order.items[0]?.amazonOrderId || "N/A",
          brandName: order.items[0]?.brandName || "N/A",

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

  // Trigger filtering whenever filters or orders change
  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatusFilter, timeFilter, searchQuery, orders]);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handlers for filters
  const handlePaymentStatusFilter = (value) => {
    setPaymentStatusFilter(value);
  };

  const handleTimeFilter = (e) => {
    setTimeFilter(e.target.value);
  };

  // const handleDeleteClick = async (orderItems, finalAmount, orderId) => {
  //   try {
  //     await axios.delete(`${backendUrl}/orders/delete/${orderId}`, {
  //       headers: {
  //         Authorization: localStorage.getItem("token"),
  //       },
  //     });
  //     message.success("Order deleted successfully!");
  //     getOrders();
  //   } catch (error) {
  //     console.error("Error deleting order:", error);
  //     message.error("Could not delete order, Please try again");
  //   }
  // };

  // Handlers for modal and actions
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
    setSelectedOrderId("");
    setEditingItem(null); // Reset editing item
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
      message.error("Insufficient user amount. Please try again.");
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

  const handleEditClick = (item) => {
    setEditingItem(item._id);
    // Populate the form with the item details
    setEditValues({
      amazonOrderId: item.amazonOrderId,
      trackingId: item.trackingId,
      sku: item.sku,
      name: item.name,
      shippingPrice: item.shippingPrice,
      price: item.price,
      quantity: item.quantity,
      pincode: item.pincode,
      shippingPartner: item.shippingPartner,
      totalPrice: item.totalPrice,
    });
  };

  // Save changes to the edited item
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

  const handleChange = (e) => {
    setEditValues({
      ...editValues,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DispatchLayout>
      <div className="relative w-full lg:max-w-full mx-auto bg-white shadow-md rounded-lg">
        <div className="w-full pb-2 px-4 mb-3 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">
            Dispatch Dashboard
          </h1>
        </div>
        {/* Filter Row */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-3">
            <label
              htmlFor="paymentStatus"
              className="text-sm font-medium text-gray-600"
            >
              Payment Status:
            </label>
            <Select
              id="paymentStatus"
              value={paymentStatusFilter}
              style={{ width: 100 }}
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
          </div>
          {/* Create Order Button */}
          <div className="pl-4">
            <Link to="/create-order">
              <Button
                type="primary"
                className="text-sm text-white md:text-sm font-semibold py-2"
              >
                Create Order
              </Button>
            </Link>
          </div>
          {/* Time Filter */}
          <div className="text-sm text-black">
            <Radio.Group
              buttonStyle="solid"
              onChange={handleTimeFilter}
              value={timeFilter}
            >
              <Radio.Button value="yesterday">Yesterday</Radio.Button>{" "}
              {/* New option added */}
              <Radio.Button value="today">Today</Radio.Button>
              <Radio.Button value="week">This Week</Radio.Button>
              <Radio.Button value="month">This Month</Radio.Button>
              <Radio.Button value="year">This Year</Radio.Button>
            </Radio.Group>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-auto">
            <Search
              placeholder="Search by Order ID, Enrollment No., Amazon Order ID"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ width: 150 }}
              className="text-sm text-black md:text-sm"
              enterButton
            />
          </div>
          <h2
            className="text-lg font-bold bg-blue-50 text-blue-800 px-4 py-1 rounded-md"
            style={{
              display: "inline-block",
            }}
          >
            Total Orders: {dataSource?.length}
          </h2>
        </div>
        {/* Orders Table */}
        <div className="overflow-x-auto mb-16 text-sm text-black">
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            rowClassName={getRowClassName}
            pagination={{ pageSize: 10 }}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
            className="shadow-lg rounded-lg"
          />
        </div>
      </div>

      {/* Order Details Modal */}
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
                    Shipping Price:
                  </label>
                  <Input
                    name="shippingPrice"
                    value={editValues.shippingPrice || ""}
                    onChange={handleChange}
                    className="mb-3"
                  />

                  <label className="block mb-2 font-semibold">Quantity:</label>
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
                    <strong>Shipping Price:</strong> {item.shippingPrice}
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
                    <strong>Product Availability:</strong> {item.productAction}
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
    </DispatchLayout>
  );
};

export default DispatchDash;
