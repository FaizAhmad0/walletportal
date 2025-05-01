import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Table, message, Input, Button, Skeleton } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import * as XLSX from "xlsx";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AllTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const limit = 50; // fetch 50 users at a time
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const getTransactions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const flattenedTransactions = response.data.orders
        .flatMap((user) =>
          user.transactions.map((transaction) => ({
            key: transaction._id,
            userName: user.name,
            enrollment: user.enrollment,
            userEmail: user.email,
            amount: transaction.amount,
            credit: transaction.credit,
            debit: transaction.debit,
            description: transaction.description,
            createdAt: transaction.createdAt,
          }))
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTransactions(response.data.orders); // if needed elsewhere
      setDataSource(flattenedTransactions); // main table or chart source
      setFilteredTransactions(flattenedTransactions); // for filtering/search
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Failed to fetch transactions. Please try again.");
    }
  };

  useEffect(() => {
    getTransactions();
  }, []);

  const handleSearch = (date) => {
    setFilterDate(date);

    if (date) {
      const filtered = dataSource.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
          .toISOString()
          .split("T")[0];
        return transactionDate === date;
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(dataSource);
    }
  };

  const handleDownload = () => {
    const exportData = filteredTransactions.map((transaction) => ({
      Enrollment: transaction.enrollment,
      UserName: transaction.userName,
      Amount: transaction.amount,
      Credit: transaction.credit ? "Yes" : "No",
      Debit: transaction.debit ? "Yes" : "No",
      Description: transaction.description,
      Date: new Date(transaction.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const columns = [
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span style={{ color: "black" }}>
          {new Date(text).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Debit",
      key: "debit",
      render: (_, record) =>
        record.debit ? (
          <span style={{ color: "red" }}>{record.amount}</span>
        ) : null,
    },
    {
      title: "Credit",
      key: "credit",
      render: (_, record) =>
        record.credit ? (
          <span style={{ color: "green" }}>{record.amount}</span>
        ) : null,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
  ];

  return (
    <AdminLayout>
      <div className="w-full pb-2 px-4 mb-3 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
        <h1 className="text-2xl pt-4 font-bold text-white">All Transactions</h1>
      </div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Input.Search
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          onSearch={handleSearch}
          placeholder="Filter by date"
          style={{ width: 250 }}
          enterButton="Search"
        />
        <Button type="primary" onClick={handleDownload}>
          Download as Excel
        </Button>
      </div>
      <div id="scrollableDiv" style={{ height: "80vh", overflow: "auto" }}>
        <InfiniteScroll
          dataLength={dataSource.length}
          next={() => getTransactions(page)}
          hasMore={hasMore}
          loader={
            <div style={{ padding: "20px" }}>
              {/* Simulate 4 skeleton table rows */}
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    gap: "10px",
                  }}
                >
                  {/* You can repeat Skeleton.Input depending on your table columns */}
                  <Skeleton.Input style={{ width: 100 }} active />
                  <Skeleton.Input style={{ width: 150 }} active />
                  <Skeleton.Input style={{ width: 120 }} active />
                  <Skeleton.Input style={{ width: 200 }} active />
                  <Skeleton.Input style={{ width: 100 }} active />
                  <Skeleton.Input style={{ width: 100 }} active />
                </div>
              ))}
            </div>
          }
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>No more orders to show.</b>
            </p>
          }
          scrollableTarget="scrollableDiv"
        >
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
            pagination={false} // NO pagination
            className="shadow-lg rounded-lg"
          />
        </InfiniteScroll>
      </div>
    </AdminLayout>
  );
};

export default AllTransaction;
