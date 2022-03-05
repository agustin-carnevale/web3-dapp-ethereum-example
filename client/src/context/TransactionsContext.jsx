import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransationProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionsCount, setTransactionsCount] = useState(localStorage.getItem('transactionCount'))
  const [availableTransactions, setAvailableTransactions] = useState([])
  const [formData, setFormData] = useState({
    addressTo: '',
    amount: '',
    keyword: '',
    message: ''
  })

  const handleChange = (event, name) => {
    setFormData((prevState)=>({...prevState, [name]: event.target.value}))
  }

  const getAllTransactions = async () => {
    try {
      if(!ethereum) return alert("Please install Metamask");
      const transactionContract = getEthereumContract();
      const availableTXs = await transactionContract.getAllTransactions();
      const structeredTXs = availableTXs.map(tx => ({
        addressTo: tx.receiver,
        addressFrom: tx.sender,
        timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
        message: tx.message,
        keyword: tx.keyword,
        amount: parseInt(tx.amount._hex) / (10 ** 18),
      }));

      setAvailableTransactions(structeredTXs);

    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object.");
    }

  }

  const checkIfWalletIsConnected = async () => {
    try {
      if(!ethereum) return alert("Please install Metamask");

      const accounts = await ethereum.request({ method: 'eth_accounts'});
  
      if(accounts.length){
        setCurrentAccount(accounts[0]);
  
        getAllTransactions();
      }else{
        console.log('No accounts found');
      }
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object.");
    }

  }
  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionsCounter = await transactionContract.getTransactionsCount();
      window.localStorage.setItem('transactionCount', transactionsCounter);

    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object.");
    }

  }

  const connectWallet = async () => {
    try {
      if(!ethereum) return alert("Please install Metamask");
      const accounts = await ethereum.request({ method: 'eth_requestAccounts'});

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object.");
    }
  }

  const sendTransaction = async () => {
    try {
      if(!ethereum) return alert("Please install Metamask");

      const {addressTo, amount, keyword, message} = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);
      
      await ethereum.request({ 
        method: 'eth_sendTransaction', 
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: '0x5208', //hex -> 21000 GWEI
          value: parsedAmount._hex,
        }]
      });

      const transaction = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

      setIsLoading(true);
      console.log(`Processing -> ${transaction.hash}`)
      await transaction.wait();
      setIsLoading(false);
      console.log(`Success -> ${transaction.hash}`)

      const transactionsCounter = await transactionContract.getTransactionsCount();
      setTransactionsCount(transactionsCounter.toNumber());

      window.reload();
      
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object.");
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, availableTransactions, isLoading }}>
      {children}
    </TransactionContext.Provider>
  );
};
