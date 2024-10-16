import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import {
  Modal,
  Input,
  message,
  Table,
  Button,
  Typography,
  Space,
  List,
} from "antd";
import moment from "moment"; // For formatting timestamps

const { Search } = Input;
const { Title } = Typography;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const WalletAction = () => {
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [actionType, setActionType] = useState(""); // To identify Add or Deduct action
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [isTransactionModalVisible, setIsTransactionModalVisible] =
    useState(false); // For showing transactions
  const [totalSpend, setTotalSpend] = useState(0); // State for total spend calculation

  const getClients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallclients`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setClients(response.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  const handleActionClick = (client, type) => {
    setSelectedClient(client);
    setActionType(type);
    setIsModalVisible(true);
  };

  const handleShowTransactions = (client) => {
    setSelectedClient(client);
    setIsTransactionModalVisible(true);

    // Calculate total spend (sum of all debit transactions)
    const spend = client.transactions
      .filter((transaction) => transaction.debit) // Filter only debit transactions
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0); // Sum all debit amounts
    setTotalSpend(spend);
  };

  const handleSubmit = async () => {
    if (!amount || !reason) {
      message.error("Please fill in all fields");
      return;
    }

    try {
      const data = {
        clientId: selectedClient._id,
        amount,
        reason,
        actionType,
      };

      const response = await axios.post(
        `${backendUrl}/wallet-action/${actionType}`,
        data,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success(response.data.message);

      setIsModalVisible(false);
      setAmount("");
      setReason("");
      getClients(); // Refresh client data after update
    } catch (error) {
      message.error("Error performing action");
      console.error("Error performing wallet action:", error);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
    },
    {
      title: "Phone",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Balance",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => parseFloat(amount).toFixed(3),
    },
    {
      title: "Action",
      key: "action",
      render: (text, client) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => handleActionClick(client, "add")}
          >
            Add
          </Button>
          <Button
            style={{ background: "red", color: "white" }}
            onClick={() => handleActionClick(client, "deduct")}
          >
            Deduct
          </Button>
          <Button onClick={() => handleShowTransactions(client)}>
            Show Transactions
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 pt-0">
        <Title level={2} className="font-bold mb-6">
          Manage Client Wallet
        </Title>

        <Search
          style={{ width: "40%", marginBottom: "16px" }}
          placeholder="Search clients by name, email, or enrollment"
          onChange={(e) => setSearchTerm(e.target.value)}
          enterButton
        />

        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 5 }}
          bordered
          className="wallet-table"
        />

        {/* Add/Deduct Money Modal */}
        <Modal
          title={actionType === "add" ? "Add Money" : "Deduct Money"}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleSubmit}
          okText="Submit"
        >
          <div className="mb-4">
            <label>Amount:</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{ marginBottom: "8px" }}
            />
          </div>
          <div>
            <label>Reason:</label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason"
            />
          </div>
        </Modal>

        {/* Transaction Modal */}
        <Modal
          title="Client Transactions"
          visible={isTransactionModalVisible}
          onCancel={() => setIsTransactionModalVisible(false)}
          footer={null} // No default buttons
        >
          <List
            itemLayout="horizontal"
            dataSource={selectedClient?.transactions || []}
            renderItem={(transaction) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <span
                      style={{
                        color: transaction.credit ? "green" : "red",
                      }}
                    >
                      {transaction.amount} - {transaction.description}
                    </span>
                  }
                  description={
                    !transaction.credit
                      ? `Debited on ${moment(transaction.createdAt).format(
                          "MMMM Do YYYY, h:mm:ss a"
                        )}`
                      : `Credited on ${moment(transaction.createdAt).format(
                          "MMMM Do YYYY, h:mm:ss a"
                        )}`
                  }
                />
              </List.Item>
            )}
          />
          <div style={{ marginTop: "16px", fontWeight: "bold" }}>
            Total Spend: <span>{totalSpend.toFixed(3)}</span>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default WalletAction;
