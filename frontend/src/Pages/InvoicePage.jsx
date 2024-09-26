import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Table, Typography, Divider, Button } from "antd";
import numberToWords from "number-to-words";
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

  const calculateTaxes = (totalAmount) => {
    if (customer.state === "Rajasthan") {
      // Apply CGST and SGST
      const CGST = (totalAmount * 9) / 100;
      const SGST = (totalAmount * 9) / 100;
      return { CGST, SGST, IGST: 0 };
    } else {
      // Apply IGST
      const IGST = (totalAmount * 18) / 100;
      return { CGST: 0, SGST: 0, IGST };
    }
  };

  const totalAmount = calculateTotal();
  const { CGST, SGST, IGST } = calculateTaxes(totalAmount);

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
              <Text>Invoice No: {orderDetails._id}</Text>
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
            <Text strong>{customer.name}</Text>
            <br />
            <Text>{customer.address}</Text>
            <br />
            <Text>{customer.email}</Text>
            <br />
            <Text>{customer.mobile}</Text>
            <br />
            <Text>
              {customer.state} {customer.country}
            </Text>
            <br />
            <Text>{customer.pincode}</Text>
            <br />
            <Text>GST: {customer.gst}</Text>
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
              {customer.state === "Rajasthan" ? (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={5} align="right">
                      <Text>CGST (9%):</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>₹{CGST.toFixed(2)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={5} align="right">
                      <Text>SGST (9%):</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>₹{SGST.toFixed(2)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              ) : (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={5} align="right">
                    <Text>IGST (18%):</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>₹{IGST.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={5} align="right">
                  <Text strong>Payable Amount:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>
                    ₹{(totalAmount + CGST + SGST + IGST).toFixed(2)}
                  </Text>
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
            <Text>Online download only. No physical delivery.</Text>
            <br />
            <Text>Thank you for your business!</Text>
          </Col>

          <Col span={12} style={{ textAlign: "right" }}>
            <Title level={4}>Company Details</Title>
            <Text>Company PAN: CANPJ3390R</Text>
            <br />
            <Text>Company GSTN/UN: 08CANPJ3390R1ZT</Text>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default InvoicePage;
