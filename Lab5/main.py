from flask import Flask, request
import requests
from newsapi import NewsApiClient
from db import *
import validators

app = Flask(__name__)
TOKEN = '6083687819:AAEFSiQEVaFfAu3PCJST6SACMw92ROb4x1Q'
NEWSAPI_KEY = '7e7ed1c2b6d64e6f9359bd598c3bdeec'
QUOTE_KEY = 'qDdx1WyyXiS7OdKNao26Ag==CzEYIZJ3SkfJFjQa'
QUOTE_API_URL = 'https://api.api-ninjas.com/v1/quotes'

@app.route('/', methods=['POST'])
def webhook():
    data = request.get_json()
    chat_id = data['message']['chat']['id']
    text = data['message'].get('text')
    first_name = data['message']['chat']['first_name']
    last_name = data['message']['chat'].get('last_name')

    if text:
        process_text_message(chat_id, text, first_name, last_name)
    else:
        process_non_text_message(chat_id)
    return 'OK'

def send_message(chat_id, text):
    url = f'https://api.telegram.org/bot{TOKEN}/sendMessage'
    payload = {
        'chat_id': chat_id,
        'text': text
    }
    response = requests.post(url, json=payload)
    if response.status_code != 200:
        print(f"Failed to send message. Response: {response.text}")

def  process_text_message(chat_id, text, first_name, last_name):
    if text == '/start':
        send_welcome_message(chat_id, first_name, last_name)
        
    elif text == '/saved_news':
        send_saved_news(chat_id)
        
    elif text == '/get_quote':
        send_random_quote(chat_id) 
        
    elif text.startswith('/latest_news'):
        topic = text.split(' ', 1)[1].strip() if len(text.split()) > 1 else None
        send_latest_news(chat_id, topic)
        
    elif text.startswith('/save_news'):
        try:
            url = text.split(' ', 1)[1].strip()
            if not validators.url(url):
                send_message(chat_id, "Send a proper URL.")
            else:
                save_news(chat_id, url)
                send_message(chat_id, "URL saved successfully!")
        except:
            send_message(chat_id, "Please provide a valid URL.")
            
    elif text.startswith('/delete_news'):
        try:
            arg = text.split(' ', 1)[1].strip()
            if arg.lower() == 'all':
                delete_news_table(chat_id)
                send_message(chat_id, "All news deleted successfully!")
            else:
                news_id = int(arg.strip())
                delete_saved_news(chat_id, news_id)
                send_message(chat_id, f"News URL {news_id} deleted successfully!")
        except:
            send_message(chat_id, "Please provide a valid news ID or 'all'.")       
    
def process_non_text_message(chat_id):
    send_message(chat_id, "Sorry, I can only process text messages.")

def send_welcome_message(chat_id, first_name, last_name):
    message = f'Hello {first_name}'
    if last_name:
        message += f' {last_name}'
    message += '! Welcome to the news bot.'
    send_message(chat_id, message)
    
def send_random_quote(chat_id):
    response = requests.get(QUOTE_API_URL, headers={'X-Api-Key': QUOTE_KEY})
    if response.status_code == 200:
        quote = response.json()[0]
        message = f"Here's a random quote for you:\n\n{quote['quote']}\n- {quote['author']}"
    else:
        message = "Failed to fetch a random quote."

    send_message(chat_id, message)
    
def send_latest_news(chat_id, topic):
    newsapi = NewsApiClient(api_key=NEWSAPI_KEY)

    if topic:
        response = newsapi.get_everything(qintitle=topic, language='en', sources='bbc-news, fox-news, mtv-news, national-geographic, news24', sort_by='publishedAt')
    else:
        response = newsapi.get_everything(language='en', sources='bbc-news, fox-news, mtv-news, national-geographic, news24', sort_by='publishedAt')

    articles = response['articles'][:5]  # Get the first 5 articles
    if len(articles) > 0:
        message = f"Here are the latest news{' on ' + topic if topic else ''}:\n\n"
        for i, article in enumerate(articles, start =1):
            message += f"{i}. {article['title']}\n{article['url']}\n\n"
    else:
        message = "No news found."

    send_message(chat_id, message)

def send_saved_news(chat_id):
    urls = get_saved_news(chat_id)

    if urls:
        message = "Here are the saved news URLs:\n\n"
        for i, url in enumerate(urls, start=1):
            message += f"{i}. {url[0]}\n"
    else:
        message = "No news URLs saved yet."

    send_message(chat_id, message)   


if __name__ == '__main__':
    initialize_database()
    app.run(debug=True, port=80)