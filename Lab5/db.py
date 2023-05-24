import sqlite3

DATABASE = 'news_urls.db'

def initialize_database():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS saved_news
                 (chat_id INTEGER, url TEXT)''')
    conn.commit()
    conn.close()

def save_news(chat_id, url):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    table_name = f"saved_news_{chat_id}"
    c.execute(f"CREATE TABLE IF NOT EXISTS {table_name} (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT)")

    c.execute(f"SELECT id FROM {table_name} ORDER BY id DESC LIMIT 1") # Get the last ID from the table
    last_id = c.fetchone()
    if last_id:
        new_id = last_id[0] + 1
    else:
        new_id = 1

    c.execute(f"INSERT INTO {table_name} (id, url) VALUES (?, ?)", (new_id, url))
    conn.commit()
    conn.close()

def get_saved_news(chat_id):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    table_name = f"saved_news_{chat_id}"
    c.execute(f"CREATE TABLE IF NOT EXISTS {table_name} (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT)")
    c.execute(f"SELECT url FROM {table_name}")
    urls = c.fetchall()
    conn.close()
    return urls

def delete_saved_news(chat_id, news_id):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    table_name = f"saved_news_{chat_id}"
    c.execute(f"DELETE FROM {table_name} WHERE id=?", (news_id,))
    conn.commit()
    
    c.execute(f"SELECT COUNT(*) FROM {table_name}") # Update the IDs in the table
    count = c.fetchone()[0]
    if count > 0:
        c.execute(f"UPDATE {table_name} SET id = CASE WHEN id > ? THEN id - 1 ELSE id END", (news_id,))
        conn.commit()

    conn.close()

def delete_news_table(chat_id):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    table_name = f"saved_news_{chat_id}"
    c.execute(f"DROP TABLE {table_name}")
    conn.commit()
    conn.close()
