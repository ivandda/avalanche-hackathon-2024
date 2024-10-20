# Vouch4Edu

## Contracts

The deployed contracts are located in the ```contracts``` folder. Below is a list of the files found in this directory:

### Contracts Overview
1. CheckAcademicStatus.sol: Responsible for checking and validating the academic status of students. Uses Chainlink Functions
2. CheckPoolFunds.sol: Manages and verifies the available funds in the pool for various operations. Uses Chainlink Functions
3. Voucher.sol: Implements the voucher system, allowing all parties to manage educational vouchers. It's a ERC1155 Token. Connects to the other two via ICM.
4. OnlyChainlinkIntegration.sol: Example only integrated with chainlink.

#### For ICM:
1. ITeleporterMessenger.sol: Interface for the Teleporter messenger, facilitating communication between contracts.
2. ITeleporterReceiver.sol: Interface for receiving messages from the Teleporter, handling incoming data and actions.
3. SenderAction.sol: Enum to communication with two different messages.

### ABI Folder
The ```abi``` folder contains the Application Binary Interfaces (ABIs) for the deployed contracts. These ABIs are essential for interacting with the contracts from the frontend or other applications.

### Constants File
The constants file includes all necessary configurations and constants required to run the contracts effectively. This may include addresses, network configurations, and any other settings essential for deployment and interaction.


## Web App

First, run the development server:

```bash
npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The web app has integration with Thirdweb for web3 auth. But is not finished and is not integrated with our contracts