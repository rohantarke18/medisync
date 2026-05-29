from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "medisync.db")


def _conn():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with _conn() as c:
        c.executescript("""
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                age INTEGER,
                allergies TEXT DEFAULT 'None',
                blood_group TEXT DEFAULT 'Unknown',
                phone TEXT,
                emergency_contact TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                diagnosis TEXT,
                treatment TEXT,
                prescription TEXT,
                notes TEXT,
                doctor_name TEXT DEFAULT 'Dr. Smith',
                date TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS bills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                consultation_fee REAL DEFAULT 0,
                medicine_fee REAL DEFAULT 0,
                test_fee REAL DEFAULT 0,
                total REAL DEFAULT 0,
                status TEXT DEFAULT 'Pending',
                date TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)


init_db()


def row_list(rows):
    return [dict(r) for r in rows]


# ── Patients ──────────────────────────────────────────────────────────────────

@app.route("/api/patients", methods=["GET"])
def get_patients():
    q = request.args.get("q", "").lower()
    with _conn() as c:
        rows = c.execute("SELECT * FROM patients ORDER BY name").fetchall()
    patients = row_list(rows)
    if q:
        patients = [p for p in patients if q in p["name"].lower() or q in p["id"].lower()]
    return jsonify(patients)


@app.route("/api/patients/<pid>", methods=["GET"])
def get_patient(pid):
    with _conn() as c:
        row = c.execute("SELECT * FROM patients WHERE id=?", (pid,)).fetchone()
    if not row:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(dict(row))


@app.route("/api/patients", methods=["POST"])
def add_patient():
    d = request.json
    try:
        with _conn() as c:
            c.execute(
                "INSERT INTO patients (id,name,age,allergies,blood_group,phone,emergency_contact) "
                "VALUES (?,?,?,?,?,?,?)",
                (d["id"], d["name"], d.get("age"), d.get("allergies", "None"),
                 d.get("blood_group", "Unknown"), d.get("phone", ""), d.get("emergency_contact", ""))
            )
        return jsonify({"success": True})
    except sqlite3.IntegrityError:
        return jsonify({"error": f"Patient ID '{d['id']}' already exists"}), 409


@app.route("/api/patients/<pid>", methods=["PUT"])
def update_patient(pid):
    d = request.json
    allowed = {"name", "age", "allergies", "blood_group", "phone", "emergency_contact"}
    fields = {k: v for k, v in d.items() if k in allowed}
    if not fields:
        return jsonify({"error": "Nothing to update"}), 400
    clause = ", ".join(f"{k}=?" for k in fields)
    with _conn() as c:
        c.execute(f"UPDATE patients SET {clause} WHERE id=?", [*fields.values(), pid])
    return jsonify({"success": True})


# ── Records ───────────────────────────────────────────────────────────────────

@app.route("/api/patients/<pid>/records", methods=["GET"])
def get_records(pid):
    with _conn() as c:
        rows = c.execute("SELECT * FROM records WHERE patient_id=? ORDER BY date DESC", (pid,)).fetchall()
    return jsonify(row_list(rows))


@app.route("/api/patients/<pid>/records", methods=["POST"])
def add_record(pid):
    d = request.json
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    with _conn() as c:
        c.execute(
            "INSERT INTO records (patient_id,diagnosis,treatment,prescription,notes,doctor_name,date) "
            "VALUES (?,?,?,?,?,?,?)",
            (pid, d.get("diagnosis"), d.get("treatment"), d.get("prescription"),
             d.get("notes"), d.get("doctor_name", "Dr. Smith"), date_str)
        )
    return jsonify({"success": True})


@app.route("/api/records/<int:rid>", methods=["DELETE"])
def delete_record(rid):
    with _conn() as c:
        c.execute("DELETE FROM records WHERE id=?", (rid,))
    return jsonify({"success": True})


# ── Bills ─────────────────────────────────────────────────────────────────────

@app.route("/api/patients/<pid>/bills", methods=["GET"])
def get_bills(pid):
    with _conn() as c:
        rows = c.execute("SELECT * FROM bills WHERE patient_id=? ORDER BY date DESC", (pid,)).fetchall()
    return jsonify(row_list(rows))


@app.route("/api/patients/<pid>/bills", methods=["POST"])
def add_bill(pid):
    d = request.json
    c_fee = float(d.get("consultation_fee", 0))
    m_fee = float(d.get("medicine_fee", 0))
    t_fee = float(d.get("test_fee", 0))
    total = c_fee + m_fee + t_fee
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    with _conn() as c:
        c.execute(
            "INSERT INTO bills (patient_id,consultation_fee,medicine_fee,test_fee,total,date) "
            "VALUES (?,?,?,?,?,?)",
            (pid, c_fee, m_fee, t_fee, total, date_str)
        )
    return jsonify({"success": True, "total": total})


@app.route("/api/bills/<int:bid>/status", methods=["PUT"])
def update_bill_status(bid):
    with _conn() as c:
        c.execute("UPDATE bills SET status=? WHERE id=?", (request.json["status"], bid))
    return jsonify({"success": True})


# ── Stats ─────────────────────────────────────────────────────────────────────

@app.route("/api/stats", methods=["GET"])
def get_stats():
    today = datetime.now().strftime("%Y-%m-%d")
    with _conn() as c:
        patients = c.execute("SELECT COUNT(*) as n FROM patients").fetchone()["n"]
        records  = c.execute("SELECT COUNT(*) as n FROM records").fetchone()["n"]
        revenue  = c.execute("SELECT COALESCE(SUM(total),0) as s FROM bills").fetchone()["s"]
        today_r  = c.execute("SELECT COUNT(*) as n FROM records WHERE date LIKE ?",
                              (f"{today}%",)).fetchone()["n"]
    return jsonify({"total_patients": patients, "total_records": records,
                    "total_revenue": revenue, "today_records": today_r})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
