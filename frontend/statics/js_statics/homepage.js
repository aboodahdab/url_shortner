const $urlInput = document.querySelector("#url-input");
const $submitButton = document.querySelector("#submit-btn");
const $enterYourUrl = document.querySelector("#enter-your-url-label");
const $myForm = document.getElementById("my-form");

const $errorDiv = document.querySelector("#error-div");
const $topErrorParagraph = document.querySelector("#top-error-p");
const $underErrorParagraph = document.querySelector("#under-error-p");
const $inputDiv = document.getElementById("input-div");
const $copyBtn = document.getElementById("copy-btn");
const $originalURLDiv = document.getElementById("original-url-div");
const $originalURL = document.getElementById("original-url");
const $copiedMsg = document.getElementById("copied-successfly-msg-div");
console.log($inputDiv);
let isErrorShown = false;
let isTheWebsiteShown = false;
let shortLink = "";

function showTheError(msg, msg2) {
  $enterYourUrl.classList.add("hidden");
  $errorDiv.classList.remove("hidden");
  isErrorShown = true;

  $topErrorParagraph.textContent = msg;
  $underErrorParagraph.textContent = msg2;
}
function ShowTheVerfication() {
  $enterYourUrl.classList.remove("hidden");
  $errorDiv.classList.add("hidden");
}
async function isUrlReacbale(url) {
  const response = await fetch("/is_url_reachable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url }),
  });
  const jsoned_fetch = await response.json();
  console.log(jsoned_fetch);
  if (response.ok) {
    console.log("good website url");
    return true;
  }

  return false;
}
async function isUrlMalicious(url) {
  try {
    const response = await fetch("/check_url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url }),
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function isTheUrlValid(input) {
  try {
    // validator js library
    // urlhaus api
    console.log(input, !input);
    if (!input) {
      showTheError("Missing URL", "Please enter a URL to shorten");
      return false;
    }
    const regex = /^https?:\/\//i.test(input);
    const checkedUrl = regex ? input : `https://${input}`;
    console.log(checkedUrl);
    const isUrl = validator.isURL(checkedUrl, {
      require_protocol: true, // must exist (now it always does)
      require_tld: true, // blocks sljlfj.
      require_valid_protocol: true, // blocks abc://
      protocols: ["http", "https"], // only allow these
      allow_underscores: false,
      disallow_auth: true,
    });

    console.log(isUrl);
    if (!isUrl) {
      console.log("hold up that is no valid");
      showTheError("invalid URL", "The URL you entered is not valid");

      return false;
    } // Format invalid
    const isRechable = await isUrlReacbale(checkedUrl);
    if (!isRechable) {
      showTheError("unreachable url", "This url is unreachable ");
      return false;
    }
    console.log("waiting for the fetched", isRechable);
    const isUrlSafe = await isUrlMalicious(checkedUrl);
    if (!isUrlSafe) {
      showTheError("Malicious URL", "This url is not safe");

      return false;
    }
    return true;
  } catch (error) {
    console.log("error url", error);
    return false;
  }
}
function showTheCopiedMsg() {
  $copiedMsg.classList.remove("translate-y-full");
  $copiedMsg.classList.remove("bottom-0");
  $copiedMsg.classList.add("bottom-8");
  setTimeout(() => {
    $copiedMsg.classList.add("translate-y-full");
    $copiedMsg.classList.add("bottom-0");
    $copiedMsg.classList.remove("bottom-8");
  }, 4000);
}

function toggleMode(booleanObj) {
  if (booleanObj) {
    $enterYourUrl.textContent = "Your shortened URL";
    $submitButton.classList = $submitButton.dataset.styleB;
    $originalURLDiv.classList.remove("hidden");
    $copyBtn.classList.remove("hidden");
    $urlInput.readOnly = true;

    ShowTheVerfication();
    return;
  }
  $urlInput.value = "";
  $urlInput.readOnly = false;
  $submitButton.classList = $submitButton.dataset.styleA;
  $enterYourUrl.textContent = "Enter your URL";
  $originalURLDiv.classList.add("hidden");
  $copyBtn.classList.add("hidden");
  $submitButton.innerHTML =
    'Shorten another URL <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right h-4 w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg> ';
}
async function callTheServer(url_input) {
  try {
    if (isTheWebsiteShown) {
      return;
    }
    const response = await fetch("/send_url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        url: url_input,
      }),
    });
    const responseStatus = response.status;
    if (!response.ok) {
      throw new Error(`http error status:${responseStatus}`);
    }
    const jsonResponse = await response.json();
    console.log(jsonResponse, jsonResponse.status);
    const url_id = jsonResponse.unique_url_id;
    console.log(url_id);
    shortLink = url_id;
    $urlInput.classList.add("text-sm");
    $urlInput.value = window.location.host + `/${shortLink}`;
    console.log(url_input, $urlInput.value);
    isTheWebsiteShown = true;
    console.log($originalURL, url_input);
    $originalURL.textContent = url_input;

    $submitButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw h-4 w-4"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg> Shorten another URL';

    toggleMode(isTheWebsiteShown);
  } catch (error) {
    console.log("new error", error);
  }
}
$urlInput.addEventListener("input", () => {
  if (isErrorShown) {
    ShowTheVerfication();
  }
});
$copyBtn.addEventListener("click", () => {
  if (isTheWebsiteShown) {
    showTheCopiedMsg();
    $copyBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check h-4 w-4"><path d="M20 6 9 17l-5-5"></path></svg> Copied';
    setTimeout(() => {
      $copyBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg> Copy';
    }, 1500);
    const currentUrl = window.location.host + `/${shortLink}`;
    console.log(currentUrl);
    navigator.clipboard.writeText(currentUrl);
    ShowTheVerfication("Short url copied successfly!");
    return;
  }
});
$submitButton.addEventListener("click", async (e) => {
  let offline = false;
  addEventListener("offline", (event) => {
    offline = true;
    showTheError(
      "No internet connection!",
      "Please connect to internet to continue",
    );
  });
  addEventListener("online", (event) => {
    offline = false;

    ShowTheVerfication();
  });
  if (offline) {
    return;
  }
  e.preventDefault();
  if (isTheWebsiteShown) {
    // Reset to create a new short URL
    isTheWebsiteShown = false;
    toggleMode(false);
    return;
  }

  const isUrlValid = await isTheUrlValid($urlInput.value);
  // found out a weird problem because of the timing of the async functions so you MUST store the input value or else the value will get cleared and the $originalURL text content is just going to be "" +already knew problem but claude fixed it + if you want to know why the problem is happening check line 121 in toggleMode func+ multiple event listeners were listening at the same time which caused the function to get called multiple times and
  const storedInputValue = $urlInput.value;

  if (!isUrlValid) {
    return;
  }

  callTheServer(storedInputValue);
});
