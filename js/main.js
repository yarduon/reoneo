// https://yarduon.com
import {
  formatNumber,
  getCurrentTime,
  downloadResults,
  reproduceSound,
  toggleImage,
  addClass,
  addClasses,
  removeClasses,
  createHTML,
  appendChilds,
  maxLengthInput,
  deleteLastItemJSON,
  addItemToJSON,
  changeImage,
  disableHTML,
  activateHTML,
  updateJSON,
  findElement,
  validateInput,
} from "./utility.js";

// Need to import JSON as JS without backend
import languages from "../json/languages.js";
import teams from "../json/teams.js";
import options from "../json/options.js";
import scores from "../json/scores.js";

// Register the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

// Update only when new version is finished
const currentVersion = 1.5;

const templateNames = ["EQUIPO", "ÉQUIPE", "MANNSCHAFT", "TEAM"];

const mainContainer = document.getElementsByClassName("main-container")[0];

let timer;

const timerInputs = [
  {
    minutes: document.getElementById("f-minutes"),
    seconds: document.getElementById("f-seconds"),
  },
  {
    minutes: document.getElementById("s-minutes"),
    seconds: document.getElementById("s-seconds"),
  },
];

const modeInputs = [
  [document.getElementById("w-points"), document.getElementById("label-w")],
  [
    document.getElementById("t-points"),
    document.getElementById("label-t"),
    document.getElementById("t-message"),
    document.getElementById("label-msg"),
  ],
];

const modeCheckbox = Array.from(document.getElementsByClassName("mode"));
const extraModeCheckbox = Array.from(
  document.getElementsByClassName("extramode")
);

const extraModes = [
  document.getElementById("showNames"),
  document.getElementById("download"),
];

// Set all points to zero
function resetScores(currentData) {
  currentData.teams.forEach((e) => {
    e.score = 0;
  });
  localStorage.setItem("teams", JSON.stringify(currentData));
}
function updatePoints(currentLocalStorage, currentIteration, operator) {
  let currentData = JSON.parse(currentLocalStorage);
  if (operator === "+") {
    if (localStorage.getItem("winnerExists") === "false") {
      if (currentData.teams[currentIteration].score < 999) {
        currentData.teams[currentIteration].score++;
      }
    }
  } else {
    // Prevents negative numbers in score
    if (currentData.teams[currentIteration].score > 0) {
      currentData.teams[currentIteration].score--;
    }
  }
  // Upload local storage values
  localStorage.setItem("teams", JSON.stringify(currentData));
  // If both modes are activated, winner mode has priority
  if (modeCheckbox[0].checked) {
    checkWinner(
      JSON.parse(localStorage.getItem("options")).modes[0].points,
      currentData.teams,
      currentData.teams[currentIteration]
    );
  }
  if (modeCheckbox[1].checked) {
    checkTotal(
      JSON.parse(localStorage.getItem("options")).modes[1].points,
      currentData.teams
    );
  }
}

// Translate all items with the class translate
function translatePage(items) {
  // Check user navigator language
  let navigatorLanguage = navigator.language || navigator.userLanguage;
  // Change text of application if language is registered
  for (let p in languages) {
    // We only use the first letters to match variants
    if (navigatorLanguage.includes(p)) {
      // Change language on html tag
      document.getElementById("language").lang = p;
      // Fill texts with detected language
      items.forEach((e, i) => {
        if (e.nodeName === "INPUT") {
          e.value = languages[p][i];
        } else {
          e.innerText = languages[p][i];
        }
      });
    }
  }
}

// Check if one of the teams have the required points
function checkWinner(goal, teams, currentTeam) {
  // Create a default object to ensure the condition works
  let winnerTeam = { score: 0 };
  teams.forEach((e) => {
    // Storage team with the current maximum score
    if (e.score > winnerTeam.score) winnerTeam = e;
  });

  // When the current winning team achieves the goal
  if (
    winnerTeam.score === Number(goal) &&
    winnerTeam.color === currentTeam.color
  ) {
    // Avoid notification spam when try boosting points after a win
    if (localStorage.getItem("winnerExists") === "false") {
      generateAlert(
        '<div class="' +
          winnerTeam.color +
          " tiny-square" +
          '"></div>&nbsp;<div class="title-option-fontsize white-text">' +
          "&#10140;&nbsp;" +
          goal +
          "</div>",
        true,
        "alert"
      );
      // Turn off the possibility of increasing points
      localStorage.setItem("winnerExists", true);
    }
  }

  // When the current winning team decreases points for the goal
  if (winnerTeam.score < Number(goal)) {
    // Turn on the possibility of increasing points
    localStorage.setItem("winnerExists", false);
  }
}

function checkTotal(goal, teams) {
  let total = 0;
  teams.forEach((e) => {
    total += e.score;
  });
  if (total % goal === 0 && total != 0) {
    generateAlert(
      JSON.parse(localStorage.getItem("options")).modes[1].message,
      false,
      "alert"
    );
  }
}

function createTeam(color, text, currentTeam, onLoad) {
  // Need to create them separately to add events
  let modifiers = [
    createHTML("div", null, null, null, "left-side", "max-height"),
    createHTML("div", null, null, null, "right-side", "max-height"),
  ];

  // Need to create separately to add new values
  let nameTeam = createHTML(
    "input",
    null,
    null,
    null,
    "name",
    "absolute",
    "text-center",
    "deactivated",
    "upper",
    text
  );

  // Limit max characters
  nameTeam.maxLength = 12;

  // Don't show names if option is unchecked
  if (!extraModes[0].checked) {
    nameTeam.classList.add("hidden");
    // Deactivate and reset edit button
    document.getElementById("edit").classList.add("hidden");
  }

  // Reset edit button
  Array.from(document.getElementsByClassName("name")).forEach((e, i) => {
    e.classList.add("deactivated");
  });
  document.getElementById("edit").children[0].src = "./img/icons/edit.svg";

  // Only when previous existed element is being loaded
  if (onLoad) {
    // Translate if detect a default team name at first team
    templateNames.forEach((e) => {
      if (
        JSON.parse(localStorage.getItem("teams")).teams[currentTeam].name ===
        e + " " + (currentTeam + 1)
      ) {
        // Generate different default team names according to languages
        let name = "TEAM";
        switch (document.getElementById("language").lang) {
          case "es":
            name = "EQUIPO";
            break;
          case "de":
            name = "MANNSCHAFT";
            break;
          case "fr":
            name = "ÉQUIPE";
            break;
        }
        nameTeam.value = name + " " + (currentTeam + 1);
      } else {
        // Set saved team names
        nameTeam.value = JSON.parse(localStorage.getItem("teams")).teams[
          currentTeam
        ].name;
      }
    });
  }

  // Create HTML containers with styles
  mainContainer.appendChild(
    appendChilds(
      createHTML(
        "div",
        null,
        null,
        null,
        "team",
        "max-width",
        "max-height",
        "medium-fontsize",
        "overflow-hidden",
        "relative",
        "flex",
        "justify-center",
        "align-center",
        text,
        color
      ),
      appendChilds(
        createHTML(
          "div",
          color,
          null,
          null,
          "change-scores",
          "flex",
          "absolute",
          "max-width",
          "max-height",
          "invisible"
        ),
        ...modifiers
      ),
      createHTML("span", null, null, null, "score"),
      nameTeam
    )
  );

  // Increase or decrease score of selected team
  modifiers.forEach((e, i) => {
    e.addEventListener("click", () => {
      try {
        if (i === 1) {
          // Prevent increment when a team or played have won
          updatePoints(localStorage.getItem("teams"), currentTeam, "+");
        } else {
          updatePoints(localStorage.getItem("teams"), currentTeam, "-");
        }
        modifiers[i].parentNode.parentNode.children[1].innerText = JSON.parse(
          localStorage.getItem("teams")
        ).teams[currentTeam].score;
      } catch (ex) {
        window.location.reload();
      }
    });
  });
}

// This is utilised to implement dynamic width, height and names to teams
function resizeTeams(teams, names, total) {
  // Remove all classes from current teams
  removeClasses(teams, 0, teams.length - 1, "width", "height");
  removeClasses(names, 0, names.length - 1, "height", "fontsize");
  switch (total) {
    // If there is one team
    case 1:
      addClasses(teams, 0, 0, "max-width", "max-height");
      addClasses(names, 0, 0, "normal-height", "max-name-fontsize");
      break;
    // If there are two teams
    case 2:
      addClasses(teams, 0, 1, "half-width", "max-height");
      addClasses(names, 0, 1, "normal-height", "normal-name-fontsize");
      break;
    // If there are three teams
    case 3:
      addClasses(teams, 0, 2, "width-by-three", "max-height");
      addClasses(names, 0, 2, "normal-height", "small-name-fontsize");
      break;
    // If there are four teams
    case 4:
      addClasses(teams, 0, 3, "half-width", "half-height");
      addClasses(names, 0, 3, "medium-height", "tiny-name-fontsize");
      break;
    // If there are five teams
    case 5:
      // In this case, there two different layouts inside
      addClasses(teams, 0, 2, "width-by-three", "half-height");
      addClasses(teams, 3, 4, "half-width", "half-height");
      addClasses(names, 0, 4, "medium-height", "tiny-name-fontsize");
      break;
    // If there are six teams
    case 6:
      addClasses(teams, 0, 5, "width-by-three", "half-height");
      addClasses(names, 0, 5, "medium-height", "tiny-name-fontsize");
      break;
    // If there are seven teams
    case 7:
      // In this case, there two different layouts inside
      addClasses(teams, 0, 2, "width-by-three", "height-by-three");
      addClasses(teams, 3, 6, "half-width", "height-by-three");
      addClasses(names, 0, 6, "special-height", "special-name-fontsize");
      break;
    // If there are eight teams
    case 8:
      addClasses(teams, 0, 5, "width-by-three", "height-by-three");
      addClasses(teams, 6, 7, "half-width", "height-by-three");
      addClasses(names, 0, 7, "special-height", "special-name-fontsize");
      break;
    // If there are nine teams
    default:
      addClasses(teams, 0, 8, "width-by-three", "height-by-three");
      addClasses(names, 0, 8, "special-height", "special-name-fontsize");
      break;
  }
}

// Edit behaviour
function editTeam(condition) {
  // When we save info
  if (condition) {
    // Change edit icon
    toggleImage(
      document.getElementById("edit").children[0],
      "./img/icons/",
      "edit.svg",
      "save.svg"
    );
    Array.from(document.getElementsByClassName("name")).forEach((e, i) => {
      // Activate or deactivate inputs
      e.classList.toggle("deactivated");
      // Avoid blink when save
      e.blur();
      try {
        // Avoid empty values from user
        if (e.value.trim() === "") {
          e.value = JSON.parse(localStorage.getItem("teams")).teams[i].name;
        }

        // Save new values
        localStorage.setItem(
          "teams",
          updateJSON(
            localStorage.getItem("teams"),
            "teams",
            i,
            "name",
            e.value.toUpperCase()
          )
        );
      } catch (ex) {
        window.location.reload();
      }
    });
  }
}

async function generateAlert(message, isHTML, mainClass) {
  // Generate an alert according to received message
  let newAlert = createHTML(
    "div",
    null,
    message,
    isHTML,
    mainClass,
    "very-dark-grey",
    "white-text",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
    "flex",
    "justify-center",
    "align-center",
    "absolute"
  );

  // Add current alert to main container with the others
  let fatherContainer = document.getElementById("alert-container");
  fatherContainer.appendChild(newAlert);
  reproduceSound("./audio/alert.mp3");

  // This code will repeat until this is the only child of the container
  do {
    var alertPos = Array.from(
      document.getElementById("alert-container").children
    ).indexOf(newAlert);
    await new Promise((res) => setTimeout(res, Number.POSITIVE_INFINITY));
  } while (alertPos != 0);

  // Display alert on screen
  newAlert.style.top = "0";
  // Wait two seconds before disappearing alert
  await new Promise((res) => setTimeout(res, 2000));
  // Delete elements from the queue that are done
  newAlert.style.top = "-100%";
  // Wait six miliseconds before ending transition
  await new Promise((res) => setTimeout(res, 600));
  document.getElementById("alert-container").removeChild(newAlert);
}

// Storage new values for timer buttons and change texts
function fillTimerButtons(currentData) {
  let maxLimit = { minutes: 99, seconds: 59 };

  for (let i = 0; i < timerInputs.length; i++) {
    for (let p in currentData.timers[i]) {
      // Avoid empty values from user
      if (timerInputs[i][p].value === "") timerInputs[i][p].value = 0;
      //
      if (
        validateInput(timerInputs[i].minutes, 0, 99) &&
        validateInput(timerInputs[i].seconds, 0, 59) &&
        (+timerInputs[i].minutes.value !== 0 ||
          +timerInputs[i].seconds.value !== 0)
      ) {
        currentData.timers[i][p] = timerInputs[i][p].value;
        // Update local values
        localStorage.setItem(
          "options",
          updateJSON(
            localStorage.getItem("options"),
            "timers",
            i,
            p,
            timerInputs[i][p].value
          )
        );
      }

      // Add or remove red outlines to indicate user when info is wrong
      validateInput(timerInputs[i][p], 0, maxLimit[p]) &&
      (+timerInputs[i].minutes.value !== 0 ||
        +timerInputs[i].seconds.value !== 0)
        ? timerInputs[i][p].classList.remove("error")
        : timerInputs[i][p].classList.add("error");
    }
    // Change text of button or refresh if value was wrong
    Array.from(document.getElementsByClassName("button-timer"))[i].innerText =
      +currentData.timers[i].minutes !== 0
        ? currentData.timers[i].minutes + "'"
        : currentData.timers[i].seconds + '"';
  }
}

// Deactive or activate modes according to selected checkbox
function fillModes(modes) {
  Array.from(modes).forEach((e, i) => {
    if (e.checked) {
      changeStatusModes(
        modeInputs[i],
        localStorage.getItem("options"),
        "modes",
        i,
        true
      );
    } else {
      changeStatusModes(
        modeInputs[i],
        localStorage.getItem("options"),
        "modes",
        i,
        false
      );
    }
  });
}

// Storage new values for mode options
function fillModeOptions(currentData) {
  // Refresh JSON file with new values
  currentData.modes.forEach((e, i) => {
    // Avoid empty values from user
    if (findElement(modeInputs[i], "points").value === "") {
      findElement(modeInputs[i], "points").value = 1;
    }

    // Add or remove red outlines to indicate user when info is wrong
    if (validateInput(findElement(modeInputs[i], "points"), 1, 999)) {
      e.points = findElement(modeInputs[i], "points").value;
      findElement(modeInputs[i], "points").classList.remove("error");
    } else {
      findElement(modeInputs[i], "points").classList.add("error");
    }

    // Fill custom message for total mode
    if (findElement(modeInputs[i], "message") != null) {
      // Add or remove red outlines to indicate user when info is wrong
      if (String(findElement(modeInputs[i], "message").value).trim() != "") {
        currentData.modes[i].message = String(
          findElement(modeInputs[i], "message").value
        ).trim();
        findElement(modeInputs[i], "message").classList.remove("error");
      } else {
        findElement(modeInputs[i], "message").classList.add("error");
      }
    }
  });
  // Convert data in JSON and storage in local
  localStorage.setItem("options", JSON.stringify(currentData));
}

// Deactivate or activate extra options according to selected checkbox
function fillExtraModes(options) {
  options.forEach((e, i) => {
    let active;
    active = e.checked ? true : false;
    localStorage.setItem(
      "options",
      updateJSON(
        localStorage.getItem("options"),
        "extraModes",
        i,
        "status",
        active
      )
    );
  });
}

// Activate or deactivate special modes according with boolean
function changeStatusModes(
  inputs,
  options,
  nameLevel,
  currentPosition,
  activate
) {
  if (activate) {
    removeClasses(inputs, 0, inputs.length - 1, "disabled");
    activateHTML(...inputs);
  } else {
    addClasses(inputs, 0, inputs.length - 1, "disabled");
    disableHTML(...inputs);
  }
  // Will change JSON only if received
  if (options) {
    try {
      localStorage.setItem(
        "options",
        updateJSON(options, nameLevel, currentPosition, "status", activate)
      );
    } catch (ex) {
      window.location.reload();
    }
  }
}

function startTimer() {
  // Clean previous timer if were one
  clearInterval(timer);
  timer = setInterval(() => {
    calculateTime();
    if (
      parseInt(localStorage.getItem("minutes")) <= 0 &&
      localStorage.getItem("seconds") <= 0
    ) {
      // Stop the timer, download file, change play button, reproduce sound, and refill local data with default values
      clearInterval(timer);
      if (document.getElementById("download").checked) {
        downloadResults(
          JSON.stringify(JSON.parse(localStorage.getItem("teams")), null, 2),
          getCurrentTime() + ".json"
        );
      }
      changeImage(
        document.getElementById("player").children[0],
        "./img/icons/play.svg",
        "Play button"
      );
      reproduceSound("./audio/finish.mp3");
      // This prevent weird values if reset when timer has ended
      clearTimer();
    }
  }, 1000);
}

// Stop and reset the timer
function clearTimer() {
  localStorage.setItem("minutes", 0);
  localStorage.setItem("seconds", 0);
  localStorage.setItem("timer", false);
}

function calculateTime() {
  // Decrease one second in timer
  localStorage.setItem(
    "seconds",
    parseInt(localStorage.getItem("seconds")) - 1
  );

  if (localStorage.getItem("seconds") < 0) {
    localStorage.setItem("seconds", 59);
    localStorage.setItem(
      "minutes",
      parseInt(localStorage.getItem("minutes")) - 1
    );
    if (localStorage.getItem("minutes") < 0) {
      localStorage.setItem("minutes", 59);
    }
  }

  // Refill HTML container and avoid NaN values
  if (isNaN(localStorage.getItem("seconds") - 1)) {
    clearTimer();
    window.location.reload();
  } else {
    updateTimer();
  }
}

function updateTimer() {
  document.getElementById("timer").innerText =
    formatNumber(localStorage.getItem("minutes")) +
    ":" +
    formatNumber(localStorage.getItem("seconds"));
}

// Fill default values to empty local data and containers
window.onload = () => {
  // Only if load is first time
  if (!sessionStorage.getItem("refresh")) {
    // Reset local data when update is up
    if (Number(localStorage.getItem("currentVersion")) < currentVersion) {
      localStorage.setItem("currentVersion", currentVersion);
      localStorage.clear();
    }
    sessionStorage.setItem("refresh", true);
  }
  // Prevent old local data to appear and save new version to future refresh
  if (!localStorage.getItem("currentVersion")) {
    localStorage.clear();
    localStorage.setItem("currentVersion", currentVersion);
  }
  if (!localStorage.getItem("options")) {
    localStorage.setItem("options", JSON.stringify(options));
  }

  // Identify default language and translate content
  translatePage(Array.from(document.getElementsByClassName("translate")));

  // Set default team after detect browser language
  if (!localStorage.getItem("teams")) {
    localStorage.setItem("teams", JSON.stringify(scores));
    resetNames(null, 0, false);
  }

  // Activate modes at refresh and load parameters
  JSON.parse(localStorage.getItem("options")).modes.forEach((e, i) => {
    if (e.status) {
      modeCheckbox[i].checked = true;
      removeClasses(modeInputs[i], 0, modeInputs[i].length - 1, "disabled");
      activateHTML(...modeInputs[i]);
    } else {
      modeCheckbox[i].checked = false;
    }
    // Load storaged points
    findElement(modeInputs[i], "points").valueOf = e.points;
    // Load storaged message only if exists
    if (findElement(modeInputs[i], "message") != null) {
      findElement(modeInputs[i], "message").valueOf = e.message;
    }
  });

  // Activate extramodes at refresh
  Array.from(JSON.parse(localStorage.getItem("options")).extraModes).forEach(
    (e, i) => {
      if (e.status) {
        extraModeCheckbox[i].checked = true;
      } else {
        extraModeCheckbox[i].checked = false;
      }
    }
  );

  // Load all teams storaged in local
  JSON.parse(localStorage.getItem("teams")).teams.forEach((e, i) => {
    createTeam(e.color, e.text + "-text", i, true);
    // Retrieve all scores from JSON file
    Array.from(document.getElementsByClassName("score")).forEach((e, i) => {
      e.innerText = JSON.parse(localStorage.getItem("teams")).teams[i].score;
    });
    resizeTeams(
      mainContainer.children,
      document.getElementsByClassName("name"),
      mainContainer.children.length
    );
  });

  // Load text of timer buttons
  Array.from(document.getElementsByClassName("button-timer")).forEach(
    (e, i) => {
      e.innerText =
        +JSON.parse(localStorage.getItem("options")).timers[i].minutes !== 0
          ? JSON.parse(localStorage.getItem("options")).timers[i].minutes + "'"
          : JSON.parse(localStorage.getItem("options")).timers[i].seconds + '"';
    }
  );

  // Load selected timers
  for (let i = 0; i < timerInputs.length; i++) {
    for (let p in JSON.parse(localStorage.getItem("options")).timers[i]) {
      timerInputs[i][p].value = JSON.parse(
        localStorage.getItem("options")
      ).timers[i][p];
    }
  }

  if (!localStorage.getItem("winnerExists")) {
    localStorage.setItem("winnerExists", false);
  }
  if (!localStorage.getItem("minutes")) {
    localStorage.setItem("minutes", 15);
  }
  if (!localStorage.getItem("seconds")) {
    localStorage.setItem("seconds", 0);
  }

  if (localStorage.getItem("timer") === "true") {
    startTimer();
    changeImage(
      document.getElementById("player").children[0],
      "./img/icons/stop.svg",
      "Stop button"
    );
  }
  updateTimer();

  // Hide initial screen
  addClass("hidden", document.getElementById("initial-screen"));
};

// Add team
document.getElementById("add").addEventListener("click", () => {
  // Generate different default team names according to languages
  let nameTeam = "TEAM";
  switch (document.getElementById("language").lang) {
    case "es":
      nameTeam = "EQUIPO";
      break;
    case "de":
      nameTeam = "MANNSCHAFT";
      break;
    case "fr":
      nameTeam = "ÉQUIPE";
      break;
  }

  if (mainContainer.children.length < 9) {
    createTeam(
      teams[mainContainer.children.length].name,
      teams[mainContainer.children.length].text + "-text",
      mainContainer.children.length
    );
    // Fill new containers with a zero and default text
    mainContainer.children[
      mainContainer.children.length - 1
    ].children[1].innerText = 0;
    mainContainer.children[
      mainContainer.children.length - 1
    ].children[2].value = nameTeam + " " + mainContainer.children.length;

    // Add new item and update JSON file
    localStorage.setItem(
      "teams",
      addItemToJSON(
        localStorage.getItem("teams"),
        { name: nameTeam + " " + mainContainer.children.length },
        { color: teams[mainContainer.children.length - 1].name },
        { text: teams[mainContainer.children.length - 1].text },
        { score: 0 }
      )
    );
  }
  resizeTeams(
    mainContainer.children,
    document.getElementsByClassName("name"),
    mainContainer.children.length
  );
});

// Delete team
document.getElementById("delete").addEventListener("click", () => {
  try {
    if (mainContainer.children.length > 1) {
      mainContainer.children[mainContainer.children.length - 1].remove(
        mainContainer.children[mainContainer.children.length - 1]
          .lastElementChild
      );
      resizeTeams(
        mainContainer.children,
        document.getElementsByClassName("name"),
        mainContainer.children.length
      );
      // Reset edit button
      Array.from(document.getElementsByClassName("name")).forEach((e, i) => {
        e.classList.add("deactivated");
      });
      document.getElementById("edit").children[0].src = "./img/icons/edit.svg";
      // Delete last item and update JSON file
      localStorage.setItem(
        "teams",
        deleteLastItemJSON(localStorage.getItem("teams"))
      );
    }
  } catch (ex) {
    window.location.reload();
  }
});

// The code will repeat each one second until all values are equal to zero
document.getElementById("player").addEventListener("click", () => {
  try {
    if (
      localStorage.getItem("timer") === "false" &&
      (localStorage.getItem("minutes") != 0 ||
        localStorage.getItem("seconds") != 0)
    ) {
      // Activate timer
      localStorage.setItem("timer", true);
      startTimer();
      changeImage(
        document.getElementById("player").children[0],
        "./img/icons/stop.svg",
        "Stop button"
      );
    } else {
      // Stop timer
      clearInterval(timer);
      localStorage.setItem("timer", false);
      changeImage(
        document.getElementById("player").children[0],
        "./img/icons/play.svg",
        "Play button"
      );
    }
  } catch (ex) {
    window.location.reload();
  }
});

// Activate or deactivate modes temporary when click
Array.from(document.getElementsByClassName("mode")).forEach((e, i) =>
  e.addEventListener("change", () => {
    if (e.checked) {
      changeStatusModes(modeInputs[i], null, null, i, true);
    } else {
      if (i === 0) {
        localStorage.setItem("winnerExists", false);
      }
      changeStatusModes(modeInputs[i], null, null, i, false);
    }
  })
);

// Set default team name according to index
function resetNames(element, currentIndex, fill) {
  let nameTeam = "TEAM";
  // Generate different default team names according to languages
  switch (document.getElementById("language").lang) {
    case "es":
      nameTeam = "EQUIPO";
      break;
    case "de":
      nameTeam = "MANNSCHAFT";
      break;
    case "fr":
      nameTeam = "ÉQUIPE";
      break;
  }
  // Insert default names in code
  if (fill) {
    element.value = nameTeam + " " + (currentIndex + 1);
  }
  try {
    // Set default team names in JSON
    localStorage.setItem(
      "teams",
      updateJSON(
        localStorage.getItem("teams"),
        "teams",
        currentIndex,
        "name",
        nameTeam + " " + (currentIndex + 1)
      )
    );
  } catch (ex) {
    window.location.reload();
  }
}

// Hide or Show names according to selected checkbox
extraModes[0].addEventListener("change", () => {
  if (extraModes[0].checked) {
    Array.from(document.getElementsByClassName("name")).forEach((e) => {
      e.classList.remove("hidden");
    });
    // Activate edit button
    document.getElementById("edit").classList.remove("hidden");
  } else {
    Array.from(document.getElementsByClassName("name")).forEach((e, i) => {
      addClasses([e], 0, 0, "hidden", "deactivated");
      // Set default team names
      resetNames(e, i, true);
    });
    // Deactivate and reset edit button
    document.getElementById("edit").classList.add("hidden");
    document.getElementById("edit").children[0].src = "./img/icons/edit.svg";
  }
});

// Change selected options on burger menu
document.getElementById("submit-changes").addEventListener("click", (e) => {
  // Don't send the form
  e.preventDefault();
  try {
    // Save options
    fillTimerButtons(JSON.parse(localStorage.getItem("options")));
    fillModes(document.getElementsByClassName("mode"));
    fillModeOptions(JSON.parse(localStorage.getItem("options")));
    fillExtraModes(extraModes);
    // Reset winner mode
    localStorage.setItem("winnerExists", false);
    // Save team names
    editTeam(
      document.getElementById("edit").children[0].src.includes("save.svg")
    );
    // Hide burger menu after validating fields
    if (document.getElementsByClassName("error").length <= 0) {
      document.getElementById("burger-checkbox").checked = false;
    }
  } catch (ex) {
    window.location.reload();
  }
});

// Deactive modes when reset form
document.getElementById("form-burger").addEventListener("reset", () => {
  // Reset all values from options
  localStorage.removeItem("options");
  // Reset winner mode
  localStorage.setItem("winnerExists", false);
  // Disable all modes
  Array.from(modeInputs).forEach((e, i) => {
    disableHTML(...modeInputs[i]);
  });
  // Set default team names
  Array.from(document.getElementsByClassName("name")).forEach((e, i) => {
    resetNames(e, i, false);
  });
  location.reload();
});

// Set timer to desired minutes and stop current timer if there was one.
Array.from(document.getElementsByClassName("button-timer")).forEach((e, i) => {
  e.addEventListener("click", () => {
    try {
      localStorage.setItem(
        "minutes",
        JSON.parse(localStorage.getItem("options")).timers[i].minutes
      );
      localStorage.setItem(
        "seconds",
        JSON.parse(localStorage.getItem("options")).timers[i].seconds
      );
      localStorage.setItem("timer", false);
      changeImage(
        document.getElementById("player").children[0],
        "./img/icons/play.svg",
        "Play button"
      );
      clearInterval(timer);
      updateTimer();
    } catch (ex) {
      window.location.reload();
    }
  });
});

// Edit use
document.getElementById("edit").addEventListener("click", () => {
  // Avoid user to type more than 12 characters
  maxLengthInput(Array.from(document.getElementsByClassName("name")), 12);
  editTeam(true);
});

// Check every time any key pressed
document.addEventListener("keydown", (e) => {
  // Avoid user to type more than 12 characters
  maxLengthInput(Array.from(document.getElementsByClassName("name")), 12);
  // Only when user can save text
  editTeam(
    e.key === "Enter" &&
      document.getElementById("edit").children[0].src.includes("save.svg")
  );
});

// Avoid user to type more than the specified number
maxLengthInput(Array.from(document.getElementsByClassName("time")), 2);
maxLengthInput(Array.from(document.getElementsByClassName("points")), 3);

// Reset timer and scores
document.getElementById("reset").addEventListener("click", (e) => {
  try {
    resetScores(JSON.parse(localStorage.getItem("teams")));
    localStorage.setItem("winnerExists", false);
    // Reload website
    window.location.reload();
  } catch (ex) {
    window.location.reload();
  }
});
