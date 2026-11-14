import urllib.request
import json
import re

url = 'https://www.google.com/search?q=' + urllib.parse.quote('6 PCS Christmas Decor Christmas Ornaments Diamond Art Kits For Adults Pearl Wooden Hanging Pendant')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        links = re.findall(r'https?://[^\s\"\'<>]+aliexpress[^\s\"\'<>]+', html)
        print('Aliexpress links found:', len(links))
        for l in links[:5]:
            print(l)
except Exception as e:
    print('Error:', e)

