import secrets
import string
import pymongo

# initalize flask application

# initalize mongodb connection
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["url_shortner"]
mycol = mydb["urls"]
# shortned url length = 8
# youtube.com

def get_url(url, length):
    unique_id = generate_unique_id(length)
    mycol.insert_one({"url": url, "shortned_url_id": unique_id})
    return unique_id


def find_short_link(unique_id):
    url_info = mycol.find_one({"shortned_url_id": unique_id})
    return url_info


def generate_unique_id(length):
    alphabet = string.ascii_letters+string.digits

    return "".join(secrets.choice(alphabet) for _ in range(length))
