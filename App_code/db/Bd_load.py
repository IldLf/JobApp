import mysql.connector
import os

# Конфигурация
config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'port': 3306
}

script_dir = os.path.dirname(os.path.abspath(__file__))
sql_file = os.path.join(script_dir, 'JobAppDatabase.sql')

db_name = 'jobs_db'
#sql_file = 'JobAppDatabase.sql'

try:
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    
    cursor.execute(f"DROP DATABASE IF EXISTS {db_name}")
    cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci")
    cursor.execute(f"USE {db_name}")
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    for statement in sql.split(';'):
        statement = statement.strip()
        if statement and not statement.startswith('--'):
            try:
                cursor.execute(statement)
            except Exception as e:
                print(f"Ошибка в: {statement[:50]}... - {e}")
    
    conn.commit()
    print(f"База данных {db_name} успешно создана!")
    
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
        count = cursor.fetchone()[0]
        print(f"   Таблица {table[0]}: {count} записей")
        
except Exception as e:
    print(f"Ошибка: {e}")
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals() and conn.is_connected():
        conn.close()