const $urlInput = document.querySelector("#url-input");
const $submitButton = document.querySelector("#submit-button");
const $myForm = document.getElementById("my-form");
const $aDiv = document.getElementById("a-div");
const $buttonDiv = document.getElementById("button-div");
const $errorDiv = document.querySelector(".display-error-div");
const $errorParagraph = document.querySelector(".error-p");
const $badOrGoodP = document.querySelector(".bad-or-good-p");
let isTheWebsiteShown = false;
let shortLink = "";

function showTheError(msg) {
  $errorDiv.classList.remove("error-div-green");
  $badOrGoodP.textContent = "Oops!";
  $errorParagraph.textContent = msg;
  $errorDiv.style.display = "flex";
  setTimeout(() => {
    $errorDiv.style.display = "none";
  }, 4000);
}
function ShowTheVerfication(msg) {
  $badOrGoodP.textContent = "Yay!";

  $errorDiv.classList.add("error-div-green");
  $errorParagraph.textContent = msg;
  $errorDiv.style.display = "flex";
  setTimeout(() => {
    $errorDiv.style.display = "none";
  }, 4000);
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
      console.log("hodl up that is no valid");
      showTheError("invalid url");

      return false;
    } // Format invalid
    const isRechable = await isUrlReacbale(checkedUrl);
    if (!isRechable) {
      showTheError("unreachable url");
      return false;
    }
    console.log("waiting for the fetched", isRechable);
    const isUrlSafe = await isUrlMalicious(checkedUrl);
    if (!isUrlSafe) {
      console.log("very potato not lotato");
      showTheError("malicious url");

      return false;
    }
    return true;
  } catch (error) {
    console.log("error url", error);
    return false;
  }
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
    const $newA = document.createElement("a");
    $newA.classList.add("short-link-a");

    $newA.href = url_id;
    $newA.target = "_blank";
    $newA.textContent = `${url_input}`;
    $aDiv.append($newA);
    $urlInput.value = window.location.host + `/${shortLink}`;
    $urlInput.readOnly = true;
    ShowTheVerfication("short url generated successfly");

    isTheWebsiteShown = true;

    $submitButton.textContent = "copy link";
    $submitButton.id = "copy-button";

    const $NewSubmitButton = document.createElement("button");

    $NewSubmitButton.textContent = "shorten another url";
    $NewSubmitButton.id = "submit-button";
    $buttonDiv.append($NewSubmitButton);
    $NewSubmitButton.addEventListener("click", () => {
      isTheWebsiteShown = false;
      $urlInput.value = "";
      $urlInput.readOnly = false;
      console.log($aDiv);
      $errorDiv.style.display = "none";

      $submitButton.textContent = "Shorten url";
      $NewSubmitButton.remove();
      $newA.remove();
    });
  } catch (error) {
    console.log("new error", error);
  }
}
$submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  if (isTheWebsiteShown) {
    const currentUrl = window.location.host + `/${shortLink}`;
    console.log(currentUrl);
    navigator.clipboard.writeText(currentUrl);
    ShowTheVerfication("Short url copied successfly!");
    return;
  }
  const isUrlValid = await isTheUrlValid($urlInput.value);

  if (!isUrlValid) {
    return;
  }

  callTheServer($urlInput.value);
});
