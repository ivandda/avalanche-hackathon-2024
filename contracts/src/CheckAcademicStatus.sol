// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ITeleporterReceiver} from "./icm/ITeleporterReceiver.sol";
import {ITeleporterMessenger, TeleporterMessageInput, TeleporterFeeInfo} from "./icm/ITeleporterMessenger.sol";
import "./icm/SenderAction.sol";

// The CheckAcademicStatus contract is a crucial component of the EduChain system,
// deployed on the Avalanche C-Chain (mainnet/testnet). This smart contract serves as a bridge between
// on-chain logic and off-chain academic data, utilizing Chainlink Functions to verify student eligibility
// for government educational assistance. Currently checks minimum grade and assistance percentage,
// with the capability to expand to more complex criteria in the future.
// for simplicity, function returns 1 for eligible, 0 for ineligible.

contract StudentStatusChecker is FunctionsClient, ConfirmedOwner, ITeleporterReceiver {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint256 public studentStatus;

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

    string private constant SOURCE =
        "const studentId = args[0];"
        "const minGrade = args[1];"
        "const minAssistance = args[2];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://vouch4edu.vercel.app/api/university-mock-api?studentId=${studentId}&minGrade=${minGrade}&minAssistance=${minAssistance}`,"
        "method: 'GET'"
        "});"
        "if (apiResponse.error) {"
        "throw Error('API request failed');"
        "}"
        "const { data } = apiResponse;"
        "return Functions.encodeUint256(data.number);";

    event StudentStatusChecked(bytes32 indexed requestId, uint256 status);

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

        // Decode the student details from the message
        (uint256 studentId, uint256 minGrade, uint256 minAssistance) = abi.decode(message, (uint256, uint256, uint256));

        // Trigger the Chainlink function
        checkStudentStatus(studentId, minGrade, minAssistance);
    }

    function checkStudentStatus(uint256 studentId, uint256 minGrade, uint256 minAssistance) private {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(SOURCE);

        string[] memory args = new string[](3);
        args[0] = Strings.toString(studentId);
        args[1] = Strings.toString(minGrade);
        args[2] = Strings.toString(minAssistance);
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
        studentStatus = abi.decode(response, (uint256));

        emit StudentStatusChecked(requestId, studentStatus);

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
                message: abi.encode(SenderAction.student, studentStatus)
            })
        );

        // Reset the stored Teleporter message details
        lastSourceBlockchainID = bytes32(0);
        lastOriginSenderAddress = address(0);
    }
}