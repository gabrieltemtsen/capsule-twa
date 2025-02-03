# **Capsule Wallet Mini App & Bot Integration**

This project integrates a **Vite React Mini App** and a **Next.js Backend Server** to provide seamless wallet management through a Telegram bot using Capsule's infrastructure. The system enables users to manage their crypto wallets, perform transactions, and receive real-time* updates* on their wallet balance and activity*.

---

## **Project Overview**

### **1. Vite React Mini App** (/twa)
This is the **frontend interface** that users access through Telegram's web app feature.

#### **Key Features:**
- Authenticate users using **Capsule Modal**.
- Display wallet details (address, balance, transaction history).
- Provide **interactive bot controls** for initiating wallet operations.
- Show real-time session status and activation options.
  
#### **Main Components:**
- `HomeScreen.tsx`: Displays wallet details and bot control options.
- `BotCard.tsx`: Handles the bot session status and activation UI.
  
#### **Tech Stack:**
- **Vite**, **React**, **Tailwind CSS**
- Capsule Client SDK (`@usecapsule/react-sdk`, `ethers.js`)

---

### **2. Next.js Backend Server** (/server)
This is the **server-side bot handler** that connects with Telegram to manage wallet-related operations.

#### **Key Features:**
- Handle commands like `/balance`, `/transfer`, and `/history`.
- Authenticate and manage wallet sessions via Capsule's server SDK.
- Communicate with Redis for caching and session storage.
- Send real-time responses to Telegram users through the bot.

#### **Main Functionalities:**
- **Bot Commands**:
  - `/balance`: Fetch the user's wallet balance.
  - `/transfer <address> <amount>`: Initiate a wallet transfer.
  - `/history`: Retrieve the user's recent transaction history.
  - `/info`: Display bot usage instructions.
- **Session Management**:
  - Use Redis to store and verify user sessions.
  - Auto-refresh expired sessions and handle session errors gracefully.
  
#### **Tech Stack:**
- **Next.js**, **Node.js**, **Telegram Bot API**
- Capsule Server SDK (`@usecapsule/server-sdk`)
- **Redis** for session management

---

## **How It Works**

1. **User Activation**:
   - The React mini app displays a session activation button that sends the user's serialized session to the backend server.
   - The bot verifies and activates the session.

2. **Wallet Operations**:
   - Users can interact with the bot to perform wallet operations like checking balance, transferring funds, and viewing transaction history.

3. **Session Management**:
   - The backend manages sessions using Capsule's server SDK and Redis.
   - If a session is inactive or expired, the bot prompts the user to re-activate through the mini app.

---

