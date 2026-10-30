import psycopg
try:
    conn = psycopg.connect(
        dbname = "Aayu_hub",
       user="postgres",
        password="saitama1",
        host="localhost",
        port="5432"
    )

    print("Database connected successfully!")

    conn.close()

except Exception as e:
    print("Connection failed:", e)