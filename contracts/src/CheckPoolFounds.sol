// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ITeleporterReceiver} from "./icm/ITeleporterReceiver.sol";
import {ITeleporterMessenger, TeleporterMessageInput, TeleporterFeeInfo} from "./icm/ITeleporterMessenger.sol";
import "./icm/SenderAction.sol";

// The IntegratedAssetPoolChecker contract is a key component of the EduChain system,
// deployed on the Avalanche C-Chain (mainnet/testnet). This smart contract is responsible
// for monitoring and reporting the total value of the government's asset pool dedicated to
// educational funding. Assets can be multiple types, Cryptocurrencies on various chains,
// Tokenized real-world assets, or even Traditional financial assets (represented on-chain)

contract IntegratedAssetPoolChecker is FunctionsClient, ConfirmedOwner, ITeleporterReceiver {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    string public totalValue;

    // Teleporter messenger
    ITeleporterMessenger public immutable messenger;

    // Store the last Teleporter message details
    bytes32 public lastSourceBlockchainID;
    address public lastOriginSenderAddress;

    // Chainlink Functions variables
    address private immutable i_router;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_donId;
    uint32 private constant FUNCTIONS_GAS_LIMIT = 300000;

    string private constant SOURCE = "const walletAddress = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://vouch4edu.vercel.app/api/founding-pool-mock-api?walletAddress=${walletAddress}`,"
        "method: 'GET'"
        "});"
        "if (apiResponse.error) {"
        "throw Error('API request failed');"
        "}"
        "const { data } = apiResponse;"
        "return Functions.encodeString(data.totalUsdValue);";

    event AssetPoolChecked(bytes32 indexed requestId, string totalValue, bytes response, bytes err);

    constructor(
        address router,
        uint64 subscriptionId,
        bytes32 donId,
        address _messenger
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        i_router = router;
        i_subscriptionId = subscriptionId;
        i_donId = donId;
        messenger =  ITeleporterMessenger(0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf);
    }

    function receiveTeleporterMessage(
        bytes32 sourceBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override {
        require(msg.sender == address(messenger), "Unauthorized");

        // Store the Teleporter message details
        lastSourceBlockchainID = sourceBlockchainID;
        lastOriginSenderAddress = originSenderAddress;

        // Decode the wallet address from the message
        string memory walletAddress = abi.decode(message, (string));

        // Trigger the Chainlink function
        checkAssetsPool(walletAddress);
    }

    function checkAssetsPool(string memory walletAddress) private {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(SOURCE);

        string[] memory args = new string[](1);
        args[0] = walletAddress;
        req.setArgs(args);

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            i_subscriptionId,
            FUNCTIONS_GAS_LIMIT,
            i_donId
        );
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        s_lastResponse = response;
        s_lastError = err;
        totalValue = string(response);

        emit AssetPoolChecked(requestId, totalValue, s_lastResponse, s_lastError);

        // Send the response back via Teleporter
        sendTeleporterResponse();
    }

    function sendTeleporterResponse() private {
        require(lastSourceBlockchainID != bytes32(0) && lastOriginSenderAddress != address(0), "No pending Teleporter request");

        messenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: lastSourceBlockchainID,
                destinationAddress: lastOriginSenderAddress,
                feeInfo: TeleporterFeeInfo({feeTokenAddress: address(0), amount: 0}),
                requiredGasLimit: 100000,
                allowedRelayerAddresses: new address[](0),
                message: abi.encode(SenderAction.pool, totalValue)
            })
        );

        // Reset the stored Teleporter message details
        lastSourceBlockchainID = bytes32(0);
        lastOriginSenderAddress = address(0);
    }
}