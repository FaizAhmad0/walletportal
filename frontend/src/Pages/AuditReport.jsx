import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import axios from "axios";
import { Row, Col, Card, Typography, List } from "antd"; // Using Ant Design for the layout

const { Title } = Typography;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AuditReport = () => {
  const [orders, setOrders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalGMS, setTotalGMS] = useState(0);
  const [topProducts, setTopProducts] = useState([]); // State for top-selling products
  const [topManagers, setTopManagers] = useState([]); // State for top managers

  const calculateTotals = (allOrders) => {
    let sales = 0;
    let ordersCount = 0;
    let gmsTotal = 0;
    const productCount = {}; // Object to count each product's sales

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
      });
    });

    // Sort products by sales count and get the top 5
    const sortedProducts = Object.entries(productCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setTotalSales(sales);
    setTotalOrders(ordersCount);
    setTotalGMS(gmsTotal);
    setTopProducts(sortedProducts); // Set top 5 products
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

  return (
    <AdminLayout>
      <div style={{ backgroundColor: "#f5f5f5", padding: "20px" }}>
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 mb-3 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">Audit Report</h1>
        </div>
        {/* Row for Cards */}
        <Row gutter={[8, 8]} justify="space-between">
          {/* Box 1: Total Sales */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Total Sales"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ color: "#1890ff" }}>
                ₹ {totalSales.toFixed(2)}
              </Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Net Sales"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ color: "#1890ff" }}>
                ₹ {totalSales.toFixed(2)}
              </Title>
            </Card>
          </Col>

          {/* Box 2: Total Orders */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Total Orders"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ color: "#52c41a" }}>
                {totalOrders}
              </Title>
            </Card>
          </Col>

          {/* Box 3: Company GMS */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Company GMS"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ color: "#faad14" }}>
                ₹ {totalGMS.toFixed(2)}
              </Title>
            </Card>
          </Col>

          {/* Box 4: Products Sold */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Products Sold"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ color: "#f5222d" }}>
                10000
              </Title>
            </Card>
          </Col>

          {/* Box 5: Variations Sold */}
          <Col xs={24} sm={12} md={4}>
            <Card
              title="Variations Sold"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ color: "#13c2c2" }}>
                6000
              </Title>
            </Card>
          </Col>
        </Row>

        {/* New Row for Top 5 Selling Products and Top 5 Managers */}
        <Row gutter={[8, 8]} justify="start" style={{ marginTop: "20px" }}>
          {/* Top Selling Products */}
          <Col xs={24} sm={12} md={12}>
            <Card
              title="Top Selling Products"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={topProducts}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={`Sold ${item.count} times`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Top Managers */}
          <Col xs={24} sm={12} md={12}>
            <Card
              title="Top Managers"
              bordered={false}
              style={{
                backgroundColor: "white",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={topManagers}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={`GMS: ₹ ${item.gms.toFixed(2)}`}
                    />
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
