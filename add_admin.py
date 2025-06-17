import sqlite3
from flask_bcrypt import Bcrypt
from flask import Flask

app = Flask(__name__)
bcrypt = Bcrypt(app)

conn = sqlite3.connect("users.db")
c = conn.cursor()

username = "admin"
password = "admin123"
hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
role = "admin"
secret_word = "admin-secret"
email = "admin@example.com"
institution_domain = "admin.edu.tr"

try:
    c.execute("""
        INSERT INTO users (username, password, role, secret_word, email, institution_domain)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (username, hashed_password, role, secret_word, email, institution_domain))
    conn.commit()
    print("✅ Admin kullanıcısı eklendi.")
except Exception as e:
    print("❌ Hata:", e)

conn.close()
