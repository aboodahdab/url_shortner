import secrets
import string
import pymongo
from datetime import datetime, timedelta

# initalize mongodb connection

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["url_shortner"]
mycol = mydb["urls"]

# shortned url length = 8


def get_url(url, length, cache_duration):
    start = datetime.now()
    date = start+timedelta(days=cache_duration)
    print(start)
    print(date)
    unique_id = generate_unique_id(length)
    mycol.insert_one(
        {"url": url, "shortned_url_id": unique_id, "cached_until": date})
    return unique_id


def find_link(url):

    url_info = mycol.find_one({"url": url.split("/")[2]})

    return url_info


def delete_something(unique_id):
    query = {"shortned_url_id": unique_id}
    mycol.delete_one(query)


def find_short_link(unique_id):
    url_info = mycol.find_one({"shortned_url_id": unique_id})
    return url_info


def update_all_caches(url):
    mycol.update_many(
        {"url": url.split("/")[2]},
        {"$set": {"cached_until": datetime.now() + timedelta(days=3)}}
    )


def generate_unique_id(length):
    alphabet = string.ascii_letters+string.digits

    return "".join(secrets.choice(alphabet) for _ in range(length))
