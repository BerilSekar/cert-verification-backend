import sqlite3

def create_tables():
    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    # USERS TABLOSU
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        secret_word TEXT NOT NULL,
        email TEXT,
        institution_domain TEXT
    )
    """)

    # VERIFIED_LOGS TABLOSU
    c.execute("""
    CREATE TABLE IF NOT EXISTS verified_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        certificate_id TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # QUESTIONS_LOGS TABLOSU
    c.execute("""
    CREATE TABLE IF NOT EXISTS questions_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        certificate_id TEXT NOT NULL,
        question TEXT,
        lang TEXT,
        answer TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_tables()
    print("✅ users.db initialized with all tables.")
