import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import axios from "axios";
import { Row, Col, Card, Typography, List } from "antd"; // Using Ant Design for the layout
import { Navigate, useNavigate } from "react-router-dom";

const { Title } = Typography;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AuditReport = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [totalGMS, setTotalGMS] = useState(0);
  const [topProducts, setTopProducts] = useState([]); // State for top-selling products
  const [topManagers, setTopManagers] = useState([]); // State for top managers
  const [topUsers, setTopUsers] = useState([]); // State for top users

  const handleTotalSaleClick = () => {
    navigate("/total-sale");
  };
  const calculateTotals = (allOrders) => {
    let sales = 0;
    let ordersCount = 0;
    let gmsTotal = 0;
    const productCount = {}; // Object to count each product's sales
    const userCount = {}; // Object to count orders for each user

    allOrders.forEach((user) => {
      gmsTotal += parseFloat(user.gms) || 0; // Sum up the GMS for all users

      user.orders.forEach((order) => {
        sales += parseFloat(order.finalAmount) || 0; // Ensure it's a number and handle invalid cases
        ordersCount += 1;

        // Count the occurrences of each product
        order.items.forEach((item) => {
          if (productCount[item.name]) {
            productCount[item.name] += 1;
          } else {
            productCount[item.name] = 1;
          }
        });

        // Count orders for each user
        if (userCount[user.enrollment]) {
          userCount[user.enrollment].count += 1; // Increment the count
        } else {
          userCount[user.enrollment] = { name: user.name, count: 1 }; // Initialize count
        }
      });
    });

    // Sort products by sales count and get the top 5
    const sortedProducts = Object.entries(productCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Sort users by order count and get the top 5
    const sortedUsers = Object.values(userCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTotalSales(sales);
    setTotalOrders(ordersCount);
    setTotalGMS(gmsTotal);
    setTopProducts(sortedProducts); // Set top 5 products
    setTopUsers(sortedUsers); // Set top 5 users
  };

  const getOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const allOrders = response.data.orders; // Assuming `orders` is an array of users
      setOrders(allOrders);
      calculateTotals(allOrders); // Calculate totals after setting orders
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const getAllManagers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallmanagers`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const managersList = response.data.clients;
      setManagers(managersList);
      // Update the topManagers after fetching the managers
      const sortedManagers = managersList
        .sort((a, b) => b.gms - a.gms) // Assuming `gms` is a property of the manager
        .slice(0, 5)
        .map((manager) => ({ name: manager.name, gms: manager.gms }));

      setTopManagers(sortedManagers); // Set top 5 managers
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  useEffect(() => {
    getOrders();
    getAllManagers();
  }, []);
  const handleTotalOrderClick = () => {
    navigate("/view-all-orders");
  };

  return (
    <AdminLayout>
      <div style={{ backgroundColor: "#f5f5f5", padding: "20px" }}>
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 mb-3 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">Audit Report</h1>
        </div>
        <Row gutter={[8, 8]} justify="space-between">
          {/* Box 1: Total Sales */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Total Sales"
              bordered={false}
              onClick={handleTotalSaleClick}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow:
                  hoveredCard === "totalSales"
                    ? "0 8px 16px rgba(0, 0, 0, 0.2)"
                    : "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform:
                  hoveredCard === "totalSales"
                    ? "translateY(-5px)"
                    : "translateY(0)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              bodyStyle={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredCard("totalSales")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Title level={4} style={{ color: "#1890ff" }}>
                ₹ {totalSales.toFixed(2)}
              </Title>
            </Card>
          </Col>

          {/* Box 2: Net Sales */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Net Sales"
              bordered={false}
              onClick={handleTotalSaleClick}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow:
                  hoveredCard === "netSales"
                    ? "0 8px 16px rgba(0, 0, 0, 0.2)"
                    : "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform:
                  hoveredCard === "netSales"
                    ? "translateY(-5px)"
                    : "translateY(0)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              bodyStyle={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredCard("netSales")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Title level={4} style={{ color: "#1890ff" }}>
                ₹ {totalSales.toFixed(2)}
              </Title>
            </Card>
          </Col>

          {/* Box 3: Total Orders */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Total Orders"
              bordered={false}
              onClick={handleTotalOrderClick}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow:
                  hoveredCard === "totalOrders"
                    ? "0 8px 16px rgba(0, 0, 0, 0.2)"
                    : "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform:
                  hoveredCard === "totalOrders"
                    ? "translateY(-5px)"
                    : "translateY(0)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              bodyStyle={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredCard("totalOrders")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Title level={4} style={{ color: "#52c41a" }}>
                {totalOrders}
              </Title>
            </Card>
          </Col>

          {/* Box 4: Company GMS */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Company GMS"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow:
                  hoveredCard === "companyGMS"
                    ? "0 8px 16px rgba(0, 0, 0, 0.2)"
                    : "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform:
                  hoveredCard === "companyGMS"
                    ? "translateY(-5px)"
                    : "translateY(0)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              bodyStyle={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredCard("companyGMS")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Title level={4} style={{ color: "#faad14" }}>
                ₹ {totalGMS.toFixed(2)}
              </Title>
            </Card>
          </Col>

          {/* Box 5: Products Sold */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Products Sold"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow:
                  hoveredCard === "productsSold"
                    ? "0 8px 16px rgba(0, 0, 0, 0.2)"
                    : "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform:
                  hoveredCard === "productsSold"
                    ? "translateY(-5px)"
                    : "translateY(0)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              bodyStyle={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredCard("productsSold")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Title level={4} style={{ color: "#f5222d" }}>
                10000
              </Title>
            </Card>
          </Col>

          {/* Box 6: Variations Sold */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Variations Sold"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow:
                  hoveredCard === "variationsSold"
                    ? "0 8px 16px rgba(0, 0, 0, 0.2)"
                    : "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform:
                  hoveredCard === "variationsSold"
                    ? "translateY(-5px)"
                    : "translateY(0)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              bodyStyle={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredCard("variationsSold")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Title level={4} style={{ color: "#13c2c2" }}>
                6000
              </Title>
            </Card>
          </Col>
        </Row>

        {/* New Row for Top 5 Selling Products, Top 5 Managers, and Top 5 Users */}
        <Row gutter={[8, 8]} justify="start" style={{ marginTop: "20px" }}>
          {/* Top Selling Products */}
          <Col xs={24} sm={12} md={8}>
            <Card
              title="Top 5 Selling Products"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "left",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <List
                dataSource={topProducts}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      {item.name}: {item.count} sold
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Top 5 Managers */}
          <Col xs={24} sm={12} md={8}>
            <Card
              title="Top 5 Managers"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "left",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <List
                dataSource={topManagers}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      {item.name}: {item.gms.toFixed(2)}
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Top 5 Users */}
          <Col xs={24} sm={12} md={8}>
            <Card
              title="Top 5 Users by Orders"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "left",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <List
                dataSource={topUsers}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      {item.name}: {item.count} orders
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AuditReport;
