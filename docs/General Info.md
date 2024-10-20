# Educational Funding System MVP Plan

## Core Functionalities

1. Government Asset Pool
2. Digital Vouchers
3. University Payment System
4. Simplified Student Performance Tracking
5. Basic User Interface

## Technology Stack

### Blockchain Layer
- **Avalanche L1**: Deployed custom L1 chain for the educational funding system
  - Used AvaCloud for no-code deployment
  - Benefit: Tailored blockchain for educational purposes with high scalability

### Smart Contracts
- **Solidity**: Implement core logic for vouchers, payments, and performance tracking
  - Deploy on the custom Avalanche L1

### Cross-Chain Communication
- **Teleporter**: Enable communication between Avalanche Fuji testnet and custom L1
  - Use case: Transfer student and Funds Pool information between chains

### Oracle Integration
- **Chainlink Functions**: Integrate with external systems for data verification
  - Use case: Verify student enrollment status and Funds Pool garantee

### Frontend
- **Next.js 14**: Develop user interfaces for students, universities, and government officials

## MVP Components Breakdown

1. **Digital Vouchers**
   - Implemented as fractionalized non-fungible tokens (ERC1155) on a Custom Avalanche L1
   - Metadata: value, expiration, basic performance criteria
   - Deplyment function for government use
   - Minting functio for student use

2. **Simplified Student Performance Tracking**
   - Basic smart contract for universities to update student status
   - Deployed in Fuji to take advantage of Chainlink Functions
   - Simple pass/fail criteria based on predefined thresholds
   - Using Teleporter to communicate info info between Fuji and custom L1

3. **Simplified Government Funds Tracking**
   - Basic smart contract that connects off-chain to get information across multiple chains.
   - Deployed in Fuji to take advantage of Chainlink Functions
   - Value summed up in USD
   - Using Teleporter to communicate info info between Fuji and custom L1

4. **User Interface (Next.js 14)**
   - Student dashboard: View voucher status, make payments
   - University dashboard: Accept payments, update student status
   - Government dashboard: Mint vouchers, manage asset pool