from blockchain_utils import submit_certificate, is_certificate_submitted
import time

def test_certificate_flow():
    certificate_id = "test-cert-001"

    print(f"→ Sertifika kontrol ediliyor: {certificate_id}")
    already_exists = is_certificate_submitted(certificate_id)
    print(f"✅ Daha önce kayıtlı mı?: {already_exists}")

    if already_exists:
        print("⚠️ Bu sertifika zaten gönderilmiş.")
        return

    print("🚀 Sertifika gönderiliyor...")
    tx_hash = submit_certificate(certificate_id)
    print(f"✅ İşlem gönderildi! Tx hash: {tx_hash}")
    
    print("⏳ İşlem onaylanması bekleniyor...")
    time.sleep(15)  # Ağda yoğunluk varsa arttırabilirsin

    print("🔍 Sertifika tekrar kontrol ediliyor...")
    confirmed = is_certificate_submitted(certificate_id)
    print(f"✅ Kayıt başarıyla gerçekleşti mi?: {confirmed}")

if __name__ == "__main__":
    test_certificate_flow()
