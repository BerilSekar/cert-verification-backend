from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv()
# Infura bağlantısı (Sepolia)
INFURA_URL = f"https://sepolia.infura.io/v3/{os.getenv('INFURA_PROJECT_ID')}"
PRIVATE_KEY = os.getenv("PRIVATE_KEY")  # .env'den alabilirsin
ACCOUNT_ADDRESS = os.getenv("WALLET_ADDRESS")

# Sözleşme adresi ve ABI
CONTRACT_ADDRESS = "0x6f3e59B1915FAdf41C2191432CC6D28EF791a09D"
with open("CertificateRegistryABI.json", "r") as f:
    ABI = json.load(f)

# Web3 bağlantısı
w3 = Web3(Web3.HTTPProvider(INFURA_URL))
contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=ABI)

def submit_certificate(certificate_id):
    nonce = w3.eth.get_transaction_count(ACCOUNT_ADDRESS)
    txn = contract.functions.submitCertificate(certificate_id).build_transaction({
        'from': ACCOUNT_ADDRESS,
        'nonce': nonce,
        'gas': 200000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })

    signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    return tx_hash.hex()

def is_certificate_submitted(certificate_id):
    return contract.functions.isCertificateSubmitted(certificate_id).call()
