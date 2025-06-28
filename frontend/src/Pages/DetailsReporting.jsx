import React, { useEffect, useState } from "react";
import axios from "axios";
import { DatePicker, Table, Radio, Button, Select, Input } from "antd"; // Import Ant Design DatePicker
import dayjs from "dayjs"; // For date formatting
import DispatchLayout from "../Layout/DispatchLayout";
import { FilterOutlined } from "@ant-design/icons";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
const { Option } = Select;

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const DetailsReporting = () => {
  const [userData, setUserData] = useState([]);
  const [managers, setManagers] = useState([]);
  const [managerFilter, setManagerFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update the search term on input change
  };
  const handleManagerFilter = (manager) => {
    setManagerFilter(manager);
  };
  const [shippingPartnerFilter, setShippingPartnerFilter] = useState(null);

  const handleShippingPartnerFilter = (value) => {
    setShippingPartnerFilter(value);
    // You can add any additional logic here to handle the filter if necessary
  };

  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [shippedCount, setShippedCount] = useState(0);
  const [levelNotFoundCount, setLevelNotFoundCount] = useState(0);
  const [holdMoneyIssueCount, setHoldMoneyIssueCount] = useState(0);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [productNotAvailableCount, setProductNotAvailableCount] = useState(0);
  const [totalOrdersHold, setTotalOrdersHold] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [productStatusFilter, setProductStatusFilter] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null); // State for selected date
  const handleProductStatusFilter = (value) => {
    setProductStatusFilter(value);
  };
  const handleRowClick = (orderItems, finalAmount, orderId) => {
    setSelectedOrderItems(orderItems);
    setSelectedOrderAmount(finalAmount);
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  // Fetch user data and orders from the backend
  const getUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getalluserss`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const users = response.data.users || [];
      setUserData(users);

      let totalOrders = 0;
      let holdMoneyIssue = 0;
      let productNotAvailable = 0;
      let totalHoldOrders = 0;
      let shippedCount = 0;
      let levelNotFound = 0; // Initialize levelNotFound count
      let allOrders = [];

      users.forEach((user) => {
        const orders = user.orders || [];
        totalOrders += orders.length;

        orders.forEach((order) => {
          let orderHasHold = false;
          allOrders.push(order);

          // Count hold money issue orders
          if (order.paymentStatus === false) {
            holdMoneyIssue += 1;
            orderHasHold = true;
          }

          // Count product not available orders
          const items = order.items || [];
          const productHold = items.some(
            (item) => item.productAction !== "Available"
          );

          if (productHold) {
            productNotAvailable += 1;
            orderHasHold = true;
          }

          // Count shipped orders
          if (order.shipped === true) {
            shippedCount += 1;
          }

          // Count levelNotFound orders
          if (order.paymentStatus === true && order.shipped === false && ! productHold) {
            levelNotFound += 1;
          }

          // Count total hold orders
          if (orderHasHold) {
            totalHoldOrders += 1;
          }
        });
      });

      setTotalOrdersCount(totalOrders);
      setHoldMoneyIssueCount(holdMoneyIssue);
      setProductNotAvailableCount(productNotAvailable);
      setTotalOrdersHold(totalHoldOrders);
      setShippedCount(shippedCount);
      setLevelNotFoundCount(levelNotFound); // Update levelNotFound count state
      setFilteredOrders(allOrders); // Display all orders initially
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getallmanagers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallmanagers`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setManagers(response.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    getUserData(); // Fetch data when the component is mounted
    getallmanagers();
  }, []);

  const filterOrders = (type) => {
    setFilterType(type); // Set the filterType state

    let filtered = [];

    userData.forEach((user) => {
      const orders = user.orders || [];
      orders.forEach((order) => {
        // If there is a selected date, only match orders with that date
        if (selectedDate) {
          const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
          if (orderDate !== selectedDate) return;
        }

        // Filter based on the selected type
        if (type === "shippedCount" && order.shipped === true) {
          filtered.push(order);
        } else if (type === "paymentStatus" && order.paymentStatus === false) {
          filtered.push(order);
        } else if (
          type === "levelNotFound" &&
          order.paymentStatus === true &&
          order.shipped === false &&
          order.items.some((item) => item.productAction == "Available")
        ) {
          filtered.push(order);
        } else if (
          type === "productNotAvailable" &&
          order.items.some((item) => item.productAction !== "Available")
        ) {
          filtered.push(order);
        }
      });
    });

    setFilteredOrders(filtered); // Update filtered orders state
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? date.format("YYYY-MM-DD") : null);

    let filtered = [];
    let moneyIssueCount = 0;
    let productNotAvailableCount = 0;
    let totalHoldOrders = 0;
    let totalOrders = 0;
    let levelNotFound = 0;
    let shippedCount = 0;

    userData.forEach((user) => {
      const orders = user.orders || [];

      orders.forEach((order) => {
        // Filter by date
        if (date) {
          const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
          if (orderDate !== date.format("YYYY-MM-DD")) {
            return;
          }
        }

        totalOrders += 1; // Count total orders for the selected date
        let orderHasHold = false;
        if (order.shipped === true) {
          shippedCount += 1;
        }
        

        if (order.paymentStatus === false) {
          moneyIssueCount += 1; // Count hold money issues
          orderHasHold = true;
        }

        const productHold = order.items.some(
          (item) => item.productAction !== "Available"
        );
        if (productHold) {
          productNotAvailableCount += 1; // Count product not available holds
          orderHasHold = true;
        }
        if (order.paymentStatus === true && order.shipped === false && !productHold) {
          levelNotFound += 1;
        }

        if (orderHasHold) {
          totalHoldOrders += 1; // Count total holds
        }

        filtered.push(order); // Add filtered orders for the modal
      });
    });

    setFilteredOrders(filtered);
    setLevelNotFoundCount(levelNotFound);
    setShippedCount(shippedCount);
    setTotalOrdersCount(totalOrders); // Update total orders count dynamically
    setHoldMoneyIssueCount(moneyIssueCount); // Update money issue count dynamically
    setProductNotAvailableCount(productNotAvailableCount); // Update product not available count dynamically
    setTotalOrdersHold(totalHoldOrders); // Update total holds dynamically
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
      title: (
        <span className="text-sm text-black">
          Manager
          <span style={{ marginLeft: 5 }}>
            <Button
              type="link"
              icon={<FilterOutlined />}
              onClick={() => setManagerFilter(managerFilter ? null : "")}
              style={{ padding: 0 }}
            />
          </span>
        </span>
      ),
      dataIndex: "manager",
      key: "manager",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div className="p-2">
          <Select
            placeholder="Filter by Manager"
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
              handleManagerFilter(value);
              confirm();
            }}
            style={{ width: 200 }}
            allowClear
          >
            {managers.map((manager) => (
              <Option key={manager.name} value={manager.name}>
                {manager.name}
              </Option>
            ))}
          </Select>
        </div>
      ),
      onFilter: (value, record) => (value ? record.manager === value : true),
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
              setSelectedKeys(selectedValue ? [selectedValue] : []);
              handleShippingPartnerFilter(selectedValue); // Apply the filter logic
              confirm();
            }}
          >
            <Radio value="DTDC">DTDC</Radio>
            <Radio value="Tirupati">Tirupati</Radio>
            <Radio value="Maruti">Maruti</Radio>
            <Radio value="Delivery">Delivery</Radio>
            <Radio value="">All</Radio> {/* To clear the filter */}
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
  ];

  const dataSource = userData
    .flatMap((user) =>
      (user.orders || []).map((order) => ({
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
        shipped: order.shipped,
        items: order.items,
        _id: order._id,
        createdAt: order.createdAt,
      }))
    )
    .filter((order) => {
      const searchTermLower = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
      return (
        order.amazonOrderId.toLowerCase().includes(searchTermLower) ||
        order.trackingId.toLowerCase().includes(searchTermLower) ||
        order.enrollment.toLowerCase().includes(searchTermLower)
      );
    })
    .filter((order) => {
      if (selectedDate) {
        const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
        if (orderDate !== selectedDate) return false;
      }
      if (filterType === "paymentStatus" && order.paymentStatus === false) {
        return true;
      } else if (filterType === "shippedCount" && order.shipped === true)
        return true;
      else if (
        filterType === "productNotAvailable" &&
        order.items.some((item) => item.productAction !== "Available")
      ) {
        return true;
      } else if (
        filterType === "levelNotFound" &&
        order.paymentStatus === true &&
        order.shipped === false &&
        order.items.some((item) => item.productAction == "Available")
      ) {
        return true;
      }
      if (managerFilter) {
        return order.manager === managerFilter;
      }
      return filterType === null;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <DispatchLayout>
      <div className="relative max-w-7xl mx-auto pb-20 min-h-screen">
        <div className="w-full pb-2 px-4 bg-gradient-to-r mb-3 from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">
            Order detail report
          </h1>
        </div>{" "}
        {/* Date Filter */}
        <div className="mb-4 flex items-center space-x-4">
          <div>
            <label htmlFor="date-picker" className="mr-2 text-black">
              Filter By Date:
            </label>
            <DatePicker
              id="date-picker"
              format="YYYY-MM-DD"
              onChange={handleDateChange}
              placeholder="Select Date"
            />
          </div>

          <div>
            <Input.Search
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by Amazon Order ID, Tracking ID, or Enrollment"
              allowClear
              style={{ width: 300 }}
            />
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              className="w-full p-2 bg-gradient-to-r from-yellow-100 to-yellow-300 rounded-md hover:bg-yellow-200 active:bg-yellow-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("paymentStatus")}
            >
              <p className="text-base font-medium text-yellow-800">
                Hold: Money Issue - {holdMoneyIssueCount}
              </p>
            </button>

            <button
              className="w-full p-2 bg-gradient-to-r from-green-100 to-green-300 rounded-md hover:bg-green-200 active:bg-green-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("productNotAvailable")}
            >
              <p className="text-base font-medium text-green-800">
                Hold: Product Not Available - {productNotAvailableCount}
              </p>
            </button>

            <button
              className="w-full p-2 bg-gradient-to-r from-purple-100 to-purple-300 rounded-md hover:bg-purple-200 active:bg-purple-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("levelNotFound")}
            >
              <p className="text-base font-medium text-purple-800">
                Label Not Found - {levelNotFoundCount}
              </p>
            </button>

            <button
              className="w-full p-2 bg-gradient-to-r from-blue-100 to-blue-300 rounded-md hover:bg-blue-200 active:bg-blue-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("shippedCount")}
            >
              <p className="text-base font-medium text-blue-800">
                Total Shipped Orders - {shippedCount}
              </p>
            </button>
          </div>

          <br />

          <div className="grid grid-cols-2 gap-3">
            <button className="w-full p-2 bg-gradient-to-r from-cyan-100 to-cyan-300 rounded-md hover:bg-cyan-200 active:bg-cyan-300 transition duration-150 ease-in-out">
              <p className="text-base font-medium text-cyan-800">
                Total Orders - {totalOrdersCount}
              </p>
            </button>

            <button className="w-full p-2 bg-gradient-to-r from-red-100 to-red-300 rounded-md hover:bg-red-200 active:bg-red-300 transition duration-150 ease-in-out">
              <p className="text-base font-medium text-red-800">
                Total Orders Hold - {totalOrdersHold}
              </p>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto mb-16 text-sm text-black">
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
            className="shadow-lg rounded-lg"
          />
        </div>
      </div>
    </DispatchLayout>
  );
};

export default DetailsReporting;
