// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract EduChainAssetPoolChecker is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    error UnexpectedRequestID(bytes32 requestId);

    event AssetPoolChecked(
        bytes32 indexed requestId,
        string totalValue,
        bytes response,
        bytes err
    );

    // Router address - Hardcoded for Fuji (Avalanche Testnet)
    // You may need to update this for the correct network
    address router = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;

    // JavaScript source code
    string source =
        "const walletAddress = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://vouch4edu.vercel.app/api/pool?walletAddress=${walletAddress}`,"
        "method: 'GET'"
        "});"
        "if (apiResponse.error) {"
        "throw Error('API request failed');"
        "}"
        "const { data } = apiResponse;"
        "return Functions.encodeString(data.totalUsdValue);";

    uint32 gasLimit = 300000;

    // donID - Hardcoded for Fuji
    // You may need to update this for the correct network
    bytes32 donID =
        0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;

    string public totalValue;

    constructor() FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    function checkAssetsPool(
        uint64 subscriptionId,
        string calldata walletAddress
    ) external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        string[] memory args = new string[](1);
        args[0] = walletAddress;
        req.setArgs(args);

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        return s_lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        s_lastResponse = response;
        totalValue = string(response);
        s_lastError = err;

        emit AssetPoolChecked(requestId, totalValue, s_lastResponse, s_lastError);
    }
}