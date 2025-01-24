import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Table, Typography, Divider, Button } from "antd";
import numberToWords from "number-to-words";
import ForwardIcon from "@mui/icons-material/Forward";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import "./InvoicePage.css";

const { Title, Text } = Typography;

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const InvoicePage = () => {
  const location = useLocation();
  const { orderId, customer } = location.state || {};

  const [orderDetails, setOrderDetails] = useState([]);

  const getOrders = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/orders/getorderforinvoice/${orderId}`
      );
      setOrderDetails(response.data.order);
    } catch (err) {
      console.log("Error", err);
    }
  };

  useEffect(() => {
    if (orderId) {
      getOrders(orderId);
    }
  }, [orderId]);

  const calculateTotal = () => {
    return (
      orderDetails.items?.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      ) || 0
    );
  };

  const calculateTotalShipping = () => {
    return (
      orderDetails.items?.reduce(
        (total, item) => total + (parseFloat(item.shippingPrice) || 0),
        0
      ) || 0
    );
  };
  const calculateGst = () => {
    return (
      orderDetails.items?.reduce(
        (total, item) => total + (parseFloat(item.gstRate) || 0),
        0
      ) || 0
    );
  };
  const gstRate = calculateGst();
  const totalAmount = calculateTotal();
  const totalShipping = calculateTotalShipping(); // Calculate total shipping from all items

  const columns = [
    {
      title: "S.No.",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price.toFixed(2)}`,
    },
    {
      title: "Amount",
      key: "amount",
      render: (item) => `₹${(item.quantity * item.price).toFixed(2)}`,
    },
  ];

  return (
    <>
      <div>
        <Button
          style={{
            display: "flex",
            position: "absolute",
            right: "200px",
            top: "20px",
          }}
          onClick={() => {
            window.print();
          }}
        >
          Download
        </Button>
      </div>
      <div className="invoice-container">
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col>
            <img
              src="https://support.saumiccraft.com/wp-content/uploads/2023/05/logo-saumic-new.png"
              alt="Company Logo"
              className="logo"
            />
          </Col>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              TAX INVOICE
            </Title>
            <div>
              <Text>Invoice No: {orderDetails.orderId}</Text>
              <br />
              <Text>
                Date: {new Date(orderDetails.createdAt).toLocaleDateString()}
              </Text>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Title level={4}>Bill To:</Title>
            <Text strong>Name: {customer.name}</Text>
            <br />
            <Text>
              <strong>Add:</strong> {customer.address}
            </Text>
            <br />
            <Text>
              <strong>Email:</strong> {customer.email}
            </Text>
            <br />
            <Text>
              <strong>Phone:</strong> {customer.mobile}
            </Text>
            <br />
            <Text>
              <strong>State:</strong> {customer.state},{" "}
              <strong>Country:</strong>
              {customer.country}
            </Text>
            <br />
            <Text>
              <strong>Pincode:</strong> {customer.pincode}
            </Text>
            <br />
            <Text>
              <strong>GST:</strong> {customer.gst}
            </Text>
          </Col>

          <Col span={12}>
            <Text strong>Payment Mode: Instamojo wallet</Text>
            <br />
            <Text>Transaction ID: {orderDetails._id}</Text>
            <br />
            <Text>
              Transaction Date:{" "}
              {new Date(orderDetails.createdAt).toLocaleDateString()}
            </Text>
            <br />
            <Text>Amount: ₹{orderDetails.finalAmount}</Text>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={orderDetails.items}
          pagination={false}
          bordered
          summary={() => (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={5} align="right">
                  <Text strong>Total Amount: </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>₹{totalAmount.toFixed(2)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={5} align="right">
                  <Text strong>Shipping: </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>₹{totalShipping.toFixed(2)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={5} align="right">
                  <Text strong>Tax Amount ({gstRate}% GST):</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>
                    ₹
                    {(((totalAmount + totalShipping) * gstRate) / 100).toFixed(
                      2
                    )}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={5} align="right">
                  <Text strong>Payable Amount including GST ({gstRate}%):</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>₹{orderDetails?.finalAmount}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )}
          rowKey={(item) => item.name}
        />
        <Divider />
        <Row justify="end">
          <Text strong>
            {" "}
            {orderDetails.finalAmount &&
            !isNaN(parseFloat(orderDetails.finalAmount))
              ? numberToWords
                  .toWords(parseFloat(orderDetails.finalAmount))
                  .toUpperCase()
              : "INVALID AMOUNT"}{" "}
            RUPEES ONLY
          </Text>
        </Row>

        <Divider />

        <Row>
          <Col span={12}>
            <Title level={4}>Terms & Conditions</Title>
            <Text> Online download only. No physical delivery.</Text>
            <br />
            <Text>Goods Once Sold will not be taken back or exchange.</Text>
            <br />
            <Text>Seller is not responsible for any loss or damage of </Text>
            <Text>goods in transit.</Text>
            <br />
            <Text>Thank you for your order!</Text>
          </Col>

          <Col span={12} style={{ textAlign: "right" }}>
            <Title level={4}>Company Details</Title>
            <Text>Company PAN: CANPJ3390R</Text>
            <br />
            <Text>Company GSTIN/UN: 08CANPJ3390R1ZT</Text>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default InvoicePage;
