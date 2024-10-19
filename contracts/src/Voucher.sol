// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {ITeleporterReceiver} from "./icm/ITeleporterReceiver.sol";
import {ITeleporterMessenger, TeleporterMessageInput, TeleporterFeeInfo} from "./icm/ITeleporterMessenger.sol";
import "./icm/SenderAction.sol";


// This contract is deployed on our Layer 1 blockchain. 
// Represents a ERC1155 voucher that is deployed by the government for each student. Th fractions are minted by the student
// and burned by the university. The voucher can be used by the student to pay for their tuition fees. The voucher is only valid if the student
// has a grade above a certain threshold and is not receiving any other financial assistance. The voucher can be revoked by the government
// if the student is found to be cheating or if the student is doing badly in school.
contract Voucher is ERC1155, AccessControl, ERC1155Burnable, ERC1155Supply, ITeleporterReceiver {
    
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE"); // funding entity
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // student
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE"); // university

    uint256 public MAX_SUPPLY; // total supply of credits for the voucher
    address public RECEIVING_UNIVERSITY;
    uint256 public STUDENT_ID;
    uint256 public VOUCHER_EXPIRATION;
    uint256 public GRADE_THRESHOLD;
    uint256 public ASSISTANCE_THRESHOLD;
    uint256 public status; //0 granted and inactive, 1 granted and in use, 2 out of supply, 3 expired, 4 deactivated
    uint256 public mintedSoFar;
    uint256 public averageGrade;
    uint256 public assistancePercentage;
    uint256 public currentPoolSize;
    address public government;
    address public poolApi;
    address public studentApi;

    error MethodNotAllowed(string message);

    struct Message {
        address sender;
        string message;
    }
    mapping(bytes32 => Message) private messages;
    error Unauthorized();

    ITeleporterMessenger public immutable teleporterMessenger = ITeleporterMessenger(0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf);

    constructor(address _defaultAdmin, address _minter, uint256 _maxSupply, address _university, uint256 _expiration,
    uint256 _studentId, uint256 minGrade, uint256 minAssistance) 
        ERC1155("") {
        require(_expiration > block.timestamp, "Expiration must be in the future");
        require(_maxSupply > 0, "Supply should be positive");
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(URI_SETTER_ROLE, _defaultAdmin);
        _grantRole(MINTER_ROLE, _minter);
        _grantRole(BURNER_ROLE, _university);

        MAX_SUPPLY = _maxSupply;
        RECEIVING_UNIVERSITY = _university;
        STUDENT_ID = _studentId;
        VOUCHER_EXPIRATION = _expiration;
        GRADE_THRESHOLD = minGrade;
        ASSISTANCE_THRESHOLD = minAssistance;
        government = _defaultAdmin;

        status = 0;
        mintedSoFar = 0;
        currentPoolSize = 100;
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function uintToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function mint(uint256 amount)
        public
        onlyRole(MINTER_ROLE)
    {
        require(mintedSoFar+amount < MAX_SUPPLY, "Not enough credits");
        //update funds and user status
        string memory gov = addressToString(government);
        string memory student = uintToString(STUDENT_ID);
        sendMessage(poolApi, gov);
        sendMessage(studentApi, student);

        require(status != 4, "Student got their voucher revoked");
        require(status != 3, "Students voucher expired");
        require(status != 2, "Students voucher is out of supply");
        require(currentPoolSize > amount,  "Government doesn't have enough funds");

        if(mintedSoFar+amount == MAX_SUPPLY) status = 2;
        mintedSoFar += amount;
        if(status == 0) status = 1;
        _mint(RECEIVING_UNIVERSITY, STUDENT_ID, amount, "");
    }

    function burn(address owner, uint256 id, uint256 value)
        public
        override(ERC1155Burnable)
        onlyRole(BURNER_ROLE)
    {
        _burn(owner, id, value);
    }

    // The following functions allow ICM to work 
    
    function receiveTeleporterMessage(bytes32, address, bytes calldata message) external {
        // Only the Teleporter receiver can deliver a message.
        require(
            msg.sender == address(teleporterMessenger), "VoucherMessanger: unauthorized TeleporterMessenger"
        );

        // Decoding the Action type:
        (SenderAction actionType, bytes memory paramsData) = abi.decode(message, (SenderAction, bytes));

        // Route to the appropriate function.
        if (actionType == SenderAction.pool) {
            (uint256 pool) = abi.decode(paramsData, (uint256));
            currentPoolSize = pool;
        } else if (actionType == SenderAction.student) {
            (uint256 studentCanMint) = abi.decode(paramsData, (uint256));
            if(studentCanMint == 0) status = 4;
        } else {
            revert("ReceiverOnSubnet: invalid action");
        }
    }

    function sendMessage(address destinationAddress, string memory message) internal {
        teleporterMessenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: 0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5,
                destinationAddress: destinationAddress,
                feeInfo: TeleporterFeeInfo({feeTokenAddress: address(0), amount: 0}),
                requiredGasLimit: 200000,
                allowedRelayerAddresses: new address[](0),
                message: abi.encode(message)
            })
        );
    }


    // The following functions are overrides to make the token non-transferable.

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) 
        public pure 
        override(ERC1155) 
    {
        revert MethodNotAllowed("Token not transferable");
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public pure override(ERC1155) {
        revert MethodNotAllowed("Token not transferable");
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}