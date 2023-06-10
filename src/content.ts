console.log("hello from leetime.");

enum LeetimeColors {
    "light_black" = "#3e3e3e",
    "orange" = "#ffa116",
    "light_gray" = "#eff1f6bf",
}

let leetcode_parent: HTMLDivElement | null = null;
const isLoaded = setInterval(() => {
    leetcode_parent = document.querySelector("#__next > div > div > div > nav > div > div")
    if (leetcode_parent) {
        setup_component();
        clearInterval(isLoaded);
    }
}, 500);

const get_leetime_element = <T>(id: string): T | null => {
    return document.getElementById("leetime-" + id) as T | null;
}

const create_leetime_element = <T>(type: string, id: string, innerHTML?: string): T => {
    const ele = document.createElement(type);
    ele.id = id === "" ? "" : "leetime-" + id;
    ele.innerHTML = innerHTML || "";
    return ele as T;
}

const create_leetime_input = (id: string, default_val: string, onchange?: (e: Event) => void) => {
    const ele = create_leetime_element<HTMLInputElement>("input", id);
    Object.assign(ele.style, {
        "width": "30px",
        "height": "100%",
        "padding": "0px 5px",
        "outline": "none",
    })
    ele.onchange = (e) => {
        onchange && onchange(e);
    }
    ele.placeholder = "00";
    ele.maxLength = 2;
    ele.type = "number";
    ele.value = default_val.padStart(2, "0");
    return ele;
}

const get_leetime_asset = (asset_name: string) => {
    return chrome.runtime.getURL(`assets/${asset_name}`);
}

const create_leetime_image = (img_path: string) => {
    const ele = create_leetime_element<HTMLImageElement>("img", "img_path", "");
    ele.src = get_leetime_asset(img_path);
    Object.assign(ele.style, {
        "height": "100%",
        "width": "auto",
        "padding": "9px",
        "cursor": "pointer",
    })
    return ele;
}

// Global elements
const PLAY_IMG = get_leetime_asset("play.png");
const PAUSE_IMG = get_leetime_asset("pause.png");
const TOGGLE_BTN = create_leetime_image("play.png");
const RESET_BTN = create_leetime_image("reset.png");
const ALARM = create_leetime_element<HTMLAudioElement>("audio", "alarm");
ALARM.src = get_leetime_asset("alarm.mp3");

// Global variables
let TIMER: number | null = null;
let PLAY: boolean = false;

const set_input_element = (id: string, val: number) => {
    const ele = document.getElementById("leetime-" + id) as HTMLInputElement;
    if (ele) {
        ele.value = val.toString().padStart(2, "0");
    }
}

const get_hours = () => {
    return parseInt(get_leetime_element<HTMLInputElement>("hours")?.value || "0");
}

const get_minutes = () => {
    return parseInt(get_leetime_element<HTMLInputElement>("minutes")?.value || "0");
}

const get_seconds = () => {
    return parseInt(get_leetime_element<HTMLInputElement>("seconds")?.value || "0");
}

const set_hours = (val: number) => {
    val = Math.abs(val);
    if (val >= 24) {
        val = val % 24;
    }
    set_input_element("hours", val);
}

const set_minutes = (val: number) => {
    val = Math.abs(val);
    if (val >= 60) {
        set_hours(get_hours() + Math.floor(val / 60));
        val = val % 60;
    }
    set_input_element("minutes", val);
}

const set_seconds = (val: number) => {
    val = Math.abs(val);
    if (val >= 60) {
        set_minutes(get_minutes() + Math.floor(val / 60));
        val = val % 60;
    }
    set_input_element("seconds", val);
}

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
    })
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


    const d1 = create_leetime_element<HTMLSpanElement>("span", '', ":");
    const d2 = create_leetime_element<HTMLSpanElement>("span", '', ":");

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

    leetcode_parent?.insertBefore(container, leetcode_parent.lastChild);
}

const toggle_leetime = () => {
    if (PLAY) {
        PLAY = false;
        TOGGLE_BTN.src = PLAY_IMG;
    } else {
        PLAY = true;
        TOGGLE_BTN.src = PAUSE_IMG;
        if (!TIMER) {
            start_leetime();
        }
    }
}

const start_leetime = () => {
    let time = get_hours() * 3600 + get_minutes() * 60 + get_seconds();
    ALARM.src = get_leetime_asset("alarm.mp3");
    TIMER = setInterval(() => {
        if (time > 0 && PLAY) {
            time -= 1
            set_time(time);
        } else if (time <= 0) {
            time = 0;
            ALARM.play();
        }
    }, 990)

}

const set_time = (time: number) => {
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
}

const reset_leetime = () => {
    PLAY = false;
    TOGGLE_BTN.src = PLAY_IMG;
    ALARM.pause();
    clearInterval(TIMER!);
    TIMER = null;
    set_time(0);
}

TOGGLE_BTN.addEventListener("click", (e) => {
    e.preventDefault();
    toggle_leetime();
});

RESET_BTN.addEventListener("click", (e) => {
    e.preventDefault();
    reset_leetime();
}); 
