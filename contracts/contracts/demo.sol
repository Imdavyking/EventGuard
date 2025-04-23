// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract demo is Ownable {
    string hostName;

    function setHostName(string memory _hostname) public onlyOwner {
        hostName = _hostname;
    }

    function getUrlFromFlightId(
        uint256 flightId
    ) public view returns (string memory expectedUrl) {
        expectedUrl = string(
            abi.encodePacked(hostName, "/api/flight/status/", flightId)
        );
    }
}
