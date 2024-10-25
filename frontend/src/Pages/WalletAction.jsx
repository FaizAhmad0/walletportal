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
      title: <span className="text-sm text-black">Client Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm text-black">{text}</span>, // Apply class to body
    },
    {
      title: <span className="text-sm text-black">Email</span>,
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-sm text-black">{text}</span>, // Apply class to body
    },
    {
      title: <span className="text-sm text-black">Enrollment</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-sm text-black">{text}</span>, // Apply class to body
    },
    {
      title: <span className="text-sm text-black">Phone</span>,
      dataIndex: "mobile",
      key: "mobile",
      render: (text) => <span className="text-sm text-black">{text}</span>, // Apply class to body
    },
    {
      title: <span className="text-sm text-black">Balance</span>,
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="text-sm text-black">
          {parseFloat(amount).toFixed(3)}
        </span> // Apply class to body
      ),
    },
    {
      title: <span className="text-sm text-black">Action</span>,
      key: "action",
      render: (text, client) => (
        <Space size="middle">
          <Button
            type="primary"
            className=" text-sm text-white" // Decreased font size
            onClick={() => handleActionClick(client, "add")}
          >
            Add
          </Button>
          <Button
            className="text-sm text-black"
            style={{
              background: "red",
              color: "white",
              fontStyle: "",
            }} // Decreased font size
            onClick={() => handleActionClick(client, "deduct")}
          >
            Deduct
          </Button>
          <Button
            className=" text-sm text-black" // Decreased font size
            onClick={() => handleShowTransactions(client)}
          >
            Show Transactions
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-2 bg-white shadow-lg rounded-lg">
        {/* Page Title */}
        <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">
            Manage Client's Wallet
          </h1>
        </div>

        {/* Search Input */}
        <div className="my-4 flex justify-between items-center">
          <Search
            style={{ width: "40%" }}
            placeholder="Search clients by name, email, or enrollment"
            onChange={(e) => setSearchTerm(e.target.value)}
            enterButton
            className="shadow-md rounded-md"
          />
        </div>

        {/* Clients Table */}
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 6 }}
          bordered
          className="wallet-table shadow-sm rounded-lg"
        />

        {/* Add/Deduct Money Modal */}
        <Modal
          title={actionType === "add" ? "Add Money" : "Deduct Money"}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleSubmit}
          okText="Submit"
          className="rounded-lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-md font-medium text-gray-700">
                Amount:
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1 rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-md font-medium text-gray-700">
                Reason:
              </label>
              <Input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason"
                className="mt-1 rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
              />
            </div>
          </div>
        </Modal>

        {/* Transaction Modal */}
        <Modal
          title="Client Transactions"
          visible={isTransactionModalVisible}
          onCancel={() => setIsTransactionModalVisible(false)}
          footer={null}
          className="rounded-lg"
        >
          <Table
            dataSource={selectedClient?.transactions || []}
            pagination={false} // Disable pagination if not required
            rowKey={(record) => record.id || record._id} // Assuming each transaction has a unique id
            columns={[
              {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                render: (amount, transaction) => (
                  <span
                    className={`${
                      transaction.credit ? "text-green-600" : "text-red-600"
                    } font-semibold`}
                  >
                    ₹{amount}
                  </span>
                ),
              },
              {
                title: "Description",
                dataIndex: "description",
                key: "description",
              },
              {
                title: "Date",
                dataIndex: "createdAt",
                key: "createdAt",
                render: (createdAt) =>
                  moment(createdAt).format("MMMM Do YYYY, h:mm:ss a"),
              },
              {
                title: "Type",
                key: "type",
                render: (_, transaction) => (
                  <span>{transaction.credit ? "Credit" : "Debit"}</span>
                ),
              },
            ]}
            className="bg-gray-50 rounded-lg shadow-sm p-4"
          />

          <div className="mt-6 text-right font-bold text-lg">
            Total Spend: ₹<span>{totalSpend.toFixed(2)}</span>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default WalletAction;
