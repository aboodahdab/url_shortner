from flask import redirect, Flask, render_template, request, jsonify
from main import get_url, find_short_link
from dotenv import load_dotenv
import requests
import os
load_dotenv()

app = Flask(__name__, template_folder="../frontend/temps",
            static_folder="../frontend/statics",)

GOOGLE_CHECK_API_KEY = os.getenv("GOOGLE_CHECK_FOR_SAFE_URL_API_KEY")

SHORT_URL_LENGTH = 8


@app.route("/", methods=["GET"])
def homepage():

    return render_template("homepage.html", file="homepage.js", css_file="css_statics/homepage_style.css")


@app.route("/check_url", methods=["POST"])
def check_url():
    if request.method == "POST":
        if request.is_json:
            json_data = request.get_json()
            url = json_data.get("url")
            print(url)
            apiUrl = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_CHECK_API_KEY}"
            body_json = {
                "client": {
                    "clientId": "url-shortner-485718",
                    "clientVersion": "1.0.0"
                },
                "threatInfo": {
                    "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [
                        {"url": url}
                    ]
                }
            }

            r = requests.post(apiUrl, json=body_json)
            jsoned_r = r.json()
            print(r.status_code)
            print(jsoned_r)
            wanted_key = "matches"
            if wanted_key in jsoned_r:
                print("maliciuos you big cat")

                return jsonify({"status": "fail", "message": "url contains malicious content"}), 404

            return jsonify({"status": "success", "message": "successfly url is not malicious and operation was a success"}), 200
        return jsonify({"status": "fail", "message": "request is not json"}), 415
#  flask supportes 405 error code
    return jsonify({"status": "fail", "message": "method is not POST"})


@app.route("/is_url_reachable", methods=["POST"])
def check_if_url_is_reachable(timeout=5):
    if request.method == "POST":
        if request.is_json:
            try:
                data = request.get_json()
                url = data.get("url")
                print("url is here", url)
                requested_url = requests.head(url, timeout=timeout)

                print(requested_url, requested_url.status_code)
                return jsonify({"status": "success", "message": "url is reachable "}), 200
            except requests.exceptions.RequestException as e:
                print("request exceptoin ", e)
                return jsonify({"status": "fail", "message": "url is unreachable "}), 404
            except Exception as e:
                print("error server internal ",e)
                return jsonify({"status": "fail", "message": "server internal error "}), 500


@app.route("/send_url", methods=["POST"])
def get_sended_url():

    if request.method == "POST":
        if request.is_json:
            data = request.get_json()
            print(data)
            url = data["url"]
            unique_id = get_url(url, SHORT_URL_LENGTH)
            print(unique_id)
            return jsonify({"status": "success", "message": "successfly got the url", "unique_url_id": unique_id}), 200
        return jsonify({"status": "fail", "message": "request is not json"}), 415
#  flask supportes 405 error code
    return jsonify({"status": "fail", "message": "method is not POST"})


@app.route("/<unique_id>",)
def redirect_to_url(unique_id):
    print(unique_id, "uniqo id")
    url_info = find_short_link(unique_id)
    if not url_info:
        return jsonify({"status": "fail", "message": "URL not found"}), 404
    url = url_info["url"]
    print(url)
    print("what")
    if url:

        if "://" not in url:
            url = f"https://{url}"
        return redirect(url)


if __name__ == "__main__":
    app.run(debug=True, port=3000)
