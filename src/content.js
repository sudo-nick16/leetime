console.log("hello from leetime.");
var LeetimeColors;
(function (LeetimeColors) {
    LeetimeColors["light_black"] = "#3e3e3e";
    LeetimeColors["orange"] = "#ffa116";
    LeetimeColors["light_gray"] = "#eff1f6bf";
})(LeetimeColors || (LeetimeColors = {}));
let leetcode_parent = null;
const isLoaded = setInterval(() => {
    leetcode_parent = document.querySelector("#__next > div > div > div > nav > div > div");
    if (leetcode_parent) {
        setup_component();
        clearInterval(isLoaded);
    }
}, 500);
const get_leetime_element = (id) => {
    return document.getElementById("leetime-" + id);
};
const create_leetime_element = (type, id, innerHTML) => {
    const ele = document.createElement(type);
    ele.id = id === "" ? "" : "leetime-" + id;
    ele.innerHTML = innerHTML || "";
    return ele;
};
const create_leetime_input = (id, default_val, onchange) => {
    const ele = create_leetime_element("input", id);
    Object.assign(ele.style, {
        "width": "30px",
        "height": "100%",
        "padding": "0px 5px",
        "outline": "none",
    });
    ele.onchange = (e) => {
        onchange && onchange(e);
    };
    ele.placeholder = "00";
    ele.maxLength = 2;
    ele.type = "number";
    ele.value = default_val.padStart(2, "0");
    return ele;
};
const get_leetime_asset = (asset_name) => {
    return chrome.runtime.getURL(`assets/${asset_name}`);
};
const create_leetime_image = (img_path) => {
    const ele = create_leetime_element("img", "img_path", "");
    ele.src = get_leetime_asset(img_path);
    Object.assign(ele.style, {
        "height": "100%",
        "width": "auto",
        "padding": "9px",
        "cursor": "pointer",
    });
    return ele;
};
const PLAY_IMG = get_leetime_asset("play.png");
const PAUSE_IMG = get_leetime_asset("pause.png");
const TOGGLE_BTN = create_leetime_image("play.png");
const RESET_BTN = create_leetime_image("reset.png");
const ALARM = create_leetime_element("audio", "alarm");
ALARM.src = get_leetime_asset("alarm.mp3");
let TIMER = null;
let PLAY = false;
const set_input_element = (id, val) => {
    const ele = document.getElementById("leetime-" + id);
    if (ele) {
        ele.value = val.toString().padStart(2, "0");
    }
};
const get_hours = () => {
    var _a;
    return parseInt(((_a = get_leetime_element("hours")) === null || _a === void 0 ? void 0 : _a.value) || "0");
};
const get_minutes = () => {
    var _a;
    return parseInt(((_a = get_leetime_element("minutes")) === null || _a === void 0 ? void 0 : _a.value) || "0");
};
const get_seconds = () => {
    var _a;
    return parseInt(((_a = get_leetime_element("seconds")) === null || _a === void 0 ? void 0 : _a.value) || "0");
};
const set_hours = (val) => {
    val = Math.abs(val);
    if (val >= 24) {
        val = val % 24;
    }
    set_input_element("hours", val);
};
const set_minutes = (val) => {
    val = Math.abs(val);
    if (val >= 60) {
        set_hours(get_hours() + Math.floor(val / 60));
        val = val % 60;
    }
    set_input_element("minutes", val);
};
const set_seconds = (val) => {
    val = Math.abs(val);
    if (val >= 60) {
        set_minutes(get_minutes() + Math.floor(val / 60));
        val = val % 60;
    }
    set_input_element("seconds", val);
};
const setup_component = () => {
    const container = document.createElement('div');
    container.id = "leetime-container";
    Object.assign(container.style, {
        "width": "fit-content",
        "overflow": "hidden",
        "height": "35px",
        "border": `0px solid ${LeetimeColors.orange}`,
        "background": LeetimeColors.light_black,
        "borderRadius": "7px",
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "center",
        "columnGap": "5px",
    });
    const values_container = document.createElement('div');
    Object.assign(values_container.style, {
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "center",
        "columnGap": "5px",
        "grow": "1",
        "flexDirection": "row",
        "maxWidth": "100%",
        "height": "100%",
        "padding": "5px",
    });
    container.id = "leetime-values-container";
    const d1 = create_leetime_element("span", '', ":");
    const d2 = create_leetime_element("span", '', ":");
    const hours = create_leetime_input("hours", '0', (e) => {
        e.preventDefault();
        const hours = parseInt(get_hours().toString().slice(0, 2));
        set_hours(hours);
    });
    const minutes = create_leetime_input("minutes", '0', (e) => {
        e.preventDefault();
        const minutes = parseInt(get_minutes().toString().slice(0, 2));
        set_minutes(minutes);
    });
    const seconds = create_leetime_input("seconds", '0', (e) => {
        e.preventDefault();
        const seconds = parseInt(get_seconds().toString().slice(0, 2));
        set_seconds(seconds);
    });
    values_container.appendChild(hours);
    values_container.appendChild(d1);
    values_container.appendChild(minutes);
    values_container.appendChild(d2);
    values_container.appendChild(seconds);
    container.appendChild(values_container);
    container.appendChild(TOGGLE_BTN);
    container.appendChild(RESET_BTN);
    leetcode_parent === null || leetcode_parent === void 0 ? void 0 : leetcode_parent.insertBefore(container, leetcode_parent.lastChild);
};
const toggle_leetime = () => {
    if (PLAY) {
        PLAY = false;
        TOGGLE_BTN.src = PLAY_IMG;
    }
    else {
        PLAY = true;
        TOGGLE_BTN.src = PAUSE_IMG;
        if (!TIMER) {
            start_leetime();
        }
    }
};
const start_leetime = () => {
    let time = get_hours() * 3600 + get_minutes() * 60 + get_seconds();
    ALARM.src = get_leetime_asset("alarm.mp3");
    TIMER = setInterval(() => {
        if (time > 0 && PLAY) {
            time -= 1;
            set_time(time);
        }
        else if (time <= 0) {
            time = 0;
            ALARM.play();
        }
    }, 990);
};
const set_time = (time) => {
    if (time <= 0) {
        set_hours(0);
        set_minutes(0);
        set_seconds(0);
        return;
    }
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time - hours * 3600) / 60);
    const seconds = time - hours * 3600 - minutes * 60;
    set_hours(hours);
    set_minutes(minutes);
    set_seconds(seconds);
};
const reset_leetime = () => {
    PLAY = false;
    TOGGLE_BTN.src = PLAY_IMG;
    ALARM.pause();
    clearInterval(TIMER);
    TIMER = null;
    set_time(0);
};
TOGGLE_BTN.addEventListener("click", (e) => {
    e.preventDefault();
    toggle_leetime();
});
RESET_BTN.addEventListener("click", (e) => {
    e.preventDefault();
    reset_leetime();
});
//# sourceMappingURL=content.js.map