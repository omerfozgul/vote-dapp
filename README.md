# 🗳️ Verdict - Blockchain Voting Platform

A decentralized voting platform built on Solana blockchain that enables users to create polls and vote transparently with complete immutability and security.

![Verdict Platform](https://img.shields.io/badge/Blockchain-Solana-blueviolet)
![Smart Contract](https://img.shields.io/badge/Smart%20Contract-Rust-orange)
![Backend](https://img.shields.io/badge/Backend-Go-blue)
![Frontend](https://img.shields.io/badge/Frontend-React-61dafb)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791)

## 🌟 Features

### 🔗 Blockchain Integration
- **Solana Smart Contract** deployed on Devnet
- **Immutable voting records** stored on blockchain
- **Duplicate vote prevention** using Program Derived Addresses (PDA)
- **Real-time transaction logging** with explorer links

### 🛡️ Security & Performance
- **Rate limiting** (10 requests per minute per IP)
- **Input validation** on all endpoints
- **CORS protection** for secure cross-origin requests
- **Wallet address validation** using Solana standards

### 🎨 Modern User Interface
- **Single Page Application** built with React & TypeScript
- **Responsive design** following modern UI/UX principles
- **Real-time updates** for poll results
- **Figma-based design** with smooth animations

### 📊 Data Management
- **PostgreSQL database** for logging and caching
- **Comprehensive audit trail** (wallet addresses, transaction IDs, timestamps)
- **Blockchain synchronization** with local database

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React App     │◄──►│   Go Backend    │◄──►│ Solana Contract │
│   (Frontend)    │    │   (API Server)  │    │   (Blockchain)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │                 │
                        │  PostgreSQL     │
                        │  (Database)     │
                        │                 │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Go** 1.21+
- **PostgreSQL** 14+
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd vote-dapp
```

### 2. Setup Backend

```bash
cd backend

# Install Go dependencies
go mod tidy

# Run backend server
go run main.go
```

**Backend will start on `http://localhost:8080`**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend will start on `http://localhost:3000`**

### 4. Setup Database

```bash
# Create PostgreSQL database
createdb vote_db
```

## 📡 API Endpoints

| Method | Endpoint | Description | Rate Limited |
|--------|----------|-------------|--------------|
| `GET` | `/ping` | Health check & system status | ✅ |
| `POST` | `/polls` | Create a new poll | ✅ |
| `GET` | `/polls` | Get all polls | ✅ | 

## 🔧 Smart Contract

**Program ID:** `HrcYHz2aTi7YT6QJcUbsD3eEF4UDXt7qo1S12b4B9rz6`

**Deployed on:** Solana Devnet




**🎉 Verdict - Where every vote counts on the blockchain!**
