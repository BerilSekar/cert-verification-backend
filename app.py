from flask_bcrypt import Bcrypt
import json
from flask_cors import CORS
from ai_analysis import ask_about_certificate
from ai_analysis import get_certificate_analysis
from flask import Flask, request, jsonify
from web3 import Web3
from dotenv import load_dotenv
import os
from blockchain_utils import submit_certificate, is_certificate_submitted
from datetime import datetime
import sqlite3

DB_PATH = "users.db"

def log_verification(username, certificate_id):
    try:
        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        timestamp = datetime.utcnow().isoformat() + "Z"
        c.execute("""
            INSERT INTO verified_logs (username, certificate_id, timestamp)
            VALUES (?, ?, ?)
        """, (username, certificate_id, timestamp))
        conn.commit()
    except Exception as e:
        print(f"[log_verification] Error: {e}")
    finally:
        conn.close()


def log_question(username, certificate_id, question, lang, answer):
    try:
        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        timestamp = datetime.utcnow().isoformat() + "Z"
        c.execute("""
            INSERT INTO questions_logs (username, certificate_id, question, lang, answer, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (username, certificate_id, question, lang, answer, timestamp))
        conn.commit()
    except Exception as e:
        print(f"[log_question] Error: {e}")
    finally:
        conn.close()


load_dotenv()
app = Flask(__name__)
CORS(app)

VERIFIED_LOGS_FILE = "logs/verified_logs.json"
QUESTIONS_LOGS_FILE = "logs/questions_logs.json"

bcrypt = Bcrypt(app)

INFURA_URL = os.getenv("INFURA_URL")
w3 = Web3(Web3.HTTPProvider(INFURA_URL))

print("INFURA_URL:", INFURA_URL)
print("Web3 Provider connected?:", w3.is_connected())


@app.route('/')
def home():
    if w3.is_connected():
        return "✅ Connected to Ethereum via Infura!"
    else:
        return "❌ Connection to Infura failed."


@app.route('/submit', methods=['POST'])
def submit_certificate_route():
    data = request.get_json()
    cert_id = data.get("certificate_id")

    if not cert_id:
        return {"error": "certificate_id is required"}, 400

    already_submitted = is_certificate_submitted(cert_id)

    if already_submitted:
        return {
            "message": "Certificate already submitted.",
            "on_chain": True
        }, 200

    try:
        tx_hash = submit_certificate(cert_id)
    except Exception as e:
        return {"error": f"Blockchain error: {str(e)}"}, 500

    return {
        "message": "Certificate submitted successfully.",
        "tx_hash": tx_hash
    }, 200


@app.route('/verify', methods=['POST'])
def verify_certificate():
    data = request.get_json()
    cert_id = data.get("certificate_id")
    username = data.get("username") or "guest"

    if not cert_id:
        return {"error": "certificate_id is required"}, 400

    try:
        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        c.execute("""
            SELECT * FROM verified_logs 
            WHERE LOWER(username) = LOWER(?) AND certificate_id = ?
        """, (username, cert_id))
        cached_result = c.fetchone()
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}, 500
    finally:
        conn.close()

    if cached_result:
        return {"status": "Certificate Verified"}, 200

    # Eğer blockchain'de yoksa
    exists = is_certificate_submitted(cert_id)
    if not exists:
        return {"status": "Certificate Not Found"}, 404

    # Sadece guest olmayan kullanıcılar için kayıt
    if username.lower() != "guest":
        try:
            conn = sqlite3.connect("users.db")
            c = conn.cursor()
            timestamp = datetime.utcnow().isoformat() + "Z"
            c.execute("""
                INSERT INTO verified_logs (username, certificate_id, timestamp)
                VALUES (?, ?, ?)
            """, (username, cert_id, timestamp))
            conn.commit()
        except Exception as e:
            return {"error": f"Logging error: {str(e)}"}, 500
        finally:
            conn.close()

    return {"status": "Certificate Verified"}, 200


@app.route('/ask-ai', methods=['POST'])
def ask_ai_about_certificate():
    data = request.get_json()
    cert_id = data.get("certificate_id")
    question = data.get("question")
    lang = data.get("lang", "en")
    username = data.get("username")

    if not cert_id or not question:
        return {"error": "certificate_id and question are required"}, 400

    answer = ask_about_certificate(cert_id, question, lang)

    log_question(username or "anonymous", cert_id, question, lang, answer)

    return {"answer": answer}


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    try:
        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        c.execute("SELECT username, password, role FROM users WHERE username = ?", (username,))
        result = c.fetchone()
        conn.close()
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    if result:
        db_username, db_hashed_password, db_role = result
        if bcrypt.check_password_hash(db_hashed_password, password):
            return jsonify({
                "message": "Login successful",
                "username": db_username,
                "role": db_role
            }), 200

    return jsonify({"error": "Invalid username or password!"}), 401


@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")
    secret_word = data.get("secret_word")
    email = data.get("email")
    institution_domain = data.get("institution_domain")
    role_code = data.get("role_code")

    if not username or not password or not role or not secret_word:
        return {"error": "All fields are required"}, 400

    # Registrar doğrulaması (sadece registrar rolü için)
    if role == "registrar":
        if not email or not institution_domain or not role_code:
            return {"error": "Email, code, and institution are required for registrar role"}, 400
        if not email.endswith("@" + institution_domain):
            return {"error": "Email domain does not match selected institution"}, 400

        try:
            with open("institutions.json", "r", encoding="utf-8") as f:
                institutions = json.load(f)
        except Exception:
            return {"error": "Institution data not available"}, 500

        matched = next((inst for inst in institutions if inst["domain"] == institution_domain), None)
        if not matched:
            return {"error": "Institution not found"}, 400

        if matched["code"] != role_code:
            return {"error": "Invalid registrar code"}, 403
    else:
        role = "verifier"  # yanlış veya eksikse default'a düş

    # Kullanıcı adı kontrolü (SQLite)
    conn = sqlite3.connect("users.db")
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    if c.fetchone():
        conn.close()
        return {"error": "Username already exists"}, 409

    # Parola hashleme
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    # Veritabanına ekle
    try:
        c.execute("""
            INSERT INTO users (username, password, role, secret_word, email, institution_domain)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            username,
            hashed_password,
            role,
            secret_word,
            email if role == "registrar" else None,
            institution_domain if role == "registrar" else None
        ))
        conn.commit()
    except Exception as e:
        conn.close()
        return {"error": "Database error: " + str(e)}, 500

    conn.close()
    return {"message": "Registration successful"}, 201



@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    username = data.get("username")
    secret = data.get("secret")
    new_password = data.get("new_password")

    if not username or not secret or not new_password:
        return {"error": "All fields are required"}, 400

    try:
        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE username = ? AND secret_word = ?", (username, secret))
        result = c.fetchone()

        if not result:
            conn.close()
            return {"error": "Invalid username or secret"}, 404

        user_id = result[0]
        hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")

        c.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, user_id))
        conn.commit()
        conn.close()

        return {"message": "Password reset successful"}, 200

    except Exception as e:
        return {"error": f"Database error: {str(e)}"}, 500


@app.route("/verifier-history", methods=["POST"])
def verifier_history():
    data = request.get_json()
    username = data.get("username")

    if not username:
        return {"error": "Username is required"}, 400

    try:
        conn = sqlite3.connect("users.db")
        c = conn.cursor()

        # Doğrulama logları
        c.execute("""
            SELECT certificate_id, timestamp 
            FROM verified_logs 
            WHERE LOWER(username) = LOWER(?)
        """, (username,))
        verified_rows = c.fetchall()

        user_verified = [
            {
                "certificate_id": cert_id,
                "timestamp": ts,
                "username": username
            }
            for cert_id, ts in verified_rows
        ]

        # AI soru-cevap logları
        c.execute("""
            SELECT certificate_id, question, answer, lang, timestamp 
            FROM questions_logs 
            WHERE LOWER(username) = LOWER(?)
        """, (username,))
        question_rows = c.fetchall()

        user_questions = [
            {
                "certificate_id": cert_id,
                "question": question,
                "answer": answer,
                "lang": lang,
                "timestamp": ts,
                "username": username
            }
            for cert_id, question, answer, lang, ts in question_rows
        ]

        all_logs = user_verified + user_questions
        all_logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        conn.close()
        return jsonify(all_logs)

    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/institution-request', methods=['POST'])
def institution_request():
    data = request.get_json()
    name = data.get("name")
    domain = data.get("domain")
    email = data.get("email")
    message = data.get("message")

    if not name or not domain or not email:
        return {"error": "Name, domain and email are required"}, 400

    request_entry = {
        "name": name,
        "domain": domain,
        "email": email,
        "message": message or ""
    }

    try:
        with open("pending_institutions.json", "r", encoding="utf-8") as f:
            pending = json.load(f)
    except:
        pending = []

    pending.append(request_entry)

    try:
        with open("pending_institutions.json", "w", encoding="utf-8") as f:
            json.dump(pending, f, indent=4, ensure_ascii=False)
    except Exception as e:
        return {"error": f"Failed to save request: {str(e)}"}, 500

    return {"message": "Institution request submitted successfully"}, 201


@app.route('/approve-institution', methods=['POST'])
def approve_institution():
    data = request.get_json()
    domain_to_approve = data.get("domain")

    if not domain_to_approve:
        return {"error": "Domain is required"}, 400

    # pending_institutions.json oku
    try:
        with open("pending_institutions.json", "r", encoding="utf-8") as f:
            pending = json.load(f)
    except:
        return {"error": "Could not read pending institution list"}, 500

    # eşleşen başvuru var mı
    matched = next((inst for inst in pending if inst["domain"] == domain_to_approve), None)

    if not matched:
        return {"error": "No matching institution found"}, 404

    # institutions.json oku
    try:
        with open("institutions.json", "r", encoding="utf-8") as f:
            institutions = json.load(f)
    except:
        institutions = []

    # Aynı domain veya aynı name varsa reddet
    for inst in institutions:
        if inst["domain"].lower() == matched["domain"].lower() or inst["name"].strip().lower() == matched["name"].strip().lower():
            return {"error": "Institution with same name or domain already exists"}, 409

    # CODE oluştur
    import random
    random_code = f"CERT-{random.randint(1000, 9999)}"

    # Yeni kurum olarak ekle
    new_entry = {
        "name": matched["name"],
        "domain": matched["domain"],
        "code": random_code
    }
    institutions.append(new_entry)

    # institutions.json güncelle
    try:
        with open("institutions.json", "w", encoding="utf-8") as f:
            json.dump(institutions, f, indent=4, ensure_ascii=False)
    except Exception as e:
        return {"error": f"Failed to write to institutions.json: {str(e)}"}, 500

    # pending_institutions.json'dan sil
    updated_pending = [inst for inst in pending if inst["domain"] != domain_to_approve]
    try:
        with open("pending_institutions.json", "w", encoding="utf-8") as f:
            json.dump(updated_pending, f, indent=4, ensure_ascii=False)
    except Exception as e:
        return {"error": f"Failed to update pending list: {str(e)}"}, 500

    return {"message": "Institution approved and added to list", "code": random_code}, 200



@app.route('/pending-institutions', methods=['GET'])
def get_pending_institutions():
    try:
        with open("pending_institutions.json", "r", encoding="utf-8") as f:
            pending = json.load(f)
    except FileNotFoundError:
        pending = []
    except Exception as e:
        return {"error": f"Failed to read pending institutions: {str(e)}"}, 500

    return jsonify(pending), 200


@app.route("/institutions", methods=["GET"])
def get_institutions():
    try:
        with open("institutions.json", "r", encoding="utf-8") as f:
            institutions = json.load(f)
        return jsonify(institutions)
    except:
        return jsonify({"error": "Failed to load institutions"}), 500


@app.route('/reject-institution', methods=['POST'])
def reject_institution():
    data = request.get_json()
    domain_to_reject = data.get("domain")

    if not domain_to_reject:
        return {"error": "Domain is required"}, 400

    try:
        with open("pending_institutions.json", "r", encoding="utf-8") as f:
            pending = json.load(f)
    except:
        return {"error": "Could not read pending institution list"}, 500

    # Silinecek domain dışındaki tüm kayıtları koru
    updated_pending = [inst for inst in pending if inst["domain"] != domain_to_reject]

    try:
        with open("pending_institutions.json", "w", encoding="utf-8") as f:
            json.dump(updated_pending, f, indent=4, ensure_ascii=False)
    except Exception as e:
        return {"error": f"Failed to update list: {str(e)}"}, 500

    return {"message": "Institution request rejected"}, 200


if __name__ == '__main__':
    app.run(debug=True)

