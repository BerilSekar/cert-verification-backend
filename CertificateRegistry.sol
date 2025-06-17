// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    struct Certificate {
        string certificateId;
        address submitter;
        uint256 timestamp;
    }

    mapping(string => Certificate) private certificates;

    event CertificateSubmitted(string certificateId, address indexed submitter);

    function submitCertificate(string memory certificateId) public {
        require(bytes(certificateId).length > 0, "Certificate ID required");
        require(certificates[certificateId].timestamp == 0, "Already submitted");

        certificates[certificateId] = Certificate({
            certificateId: certificateId,
            submitter: msg.sender,
            timestamp: block.timestamp
        });

        emit CertificateSubmitted(certificateId, msg.sender);
    }

    function isCertificateSubmitted(string memory certificateId) public view returns (bool) {
        return certificates[certificateId].timestamp != 0;
    }
}
