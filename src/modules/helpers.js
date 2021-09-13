import moment from 'moment';

function sanitizeString(str) {
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
    return str.trim();
}

function parseDateString(string, settings) { //parseFormat = null, returnFormat = null
    let date = null;
    if (settings.parsingMode === 'auto') {
        //try default
        date = moment(string, true);

        //convert to number and try again
        if (!date.isValid()) {
            let number = parseFloat(string);
            if (!isNaN(number)) date = moment(number, true);
        }
    }

    //Given format
    else {
        date = moment(string, settings.parsingString);
    }

    //Error
    if (!date.isValid()) return null;

    //Successfully parsed
    return settings.outputMode === 'auto' ? date.valueOf() : date.format(settings.outputString);
}

function extractEntries(parsedData, page = null, length = null) {

    //check length
    if (!["5", "10", "20", "50", "100", "500"].includes(length)) length = 10;

    //get pages
    let pages = Math.ceil(parsedData.length / length);

    //Check page number
    if (isNaN(page) || page === null || page < 1) page = 1;
    if (page > pages) page = pages;

    //get data
    let start = (page - 1) * length;
    let end = page == pages ? null : page * length;
    let data = end === null ? parsedData.slice(start) : parsedData.slice(start, end);

    return {
        data: data,
        info: {
            total: parsedData.length,
            pages: pages,
            currentPage: page,
            isLastPage: page == pages,
            isFirstPage: page == 1,
            from: start + 1,
            to: end,
            pageLength: length
        }
    }
}

function getTimeMultiplier(timeUnit) {
    let multipliers = {
        ms: {
            text: "Milliseconds",
            multiplier: 1,
        },
        s: {
            text: "Seconds",
            multiplier: 1000,
        },
        m: {
            text: "Minutes",
            multiplier: 60000,
        },
        h: {
            text: "Hours",
            multiplier: 3600000,
        },
        d: {
            text: "Days",
            multiplier: 86400000,
        },
        y: {
            text: "Years",
            multiplier: 31536000000,
        }
    };
    if (multipliers.hasOwnProperty(timeUnit)) return multipliers[timeUnit];
    return null;

}

function timespanToMs(timespan) {
    //shortcuts
    if (timespan == 0 || timespan === "0") return 0;

    //check if number
    if (timespan.trim().replace(/^\d+/g, '').length == 0) {
        if (!isNaN(timespan))
            return parseInt(timespan);
    }

    let ms = 0;

    let arr = timespan.split(" ");
    arr.forEach(item => {
        let unit = item.trim().replace(/^\d+/g, '');
        let multiplierInfo = getTimeMultiplier(unit);
        let numberStr = item.replace(unit, '');
        if (!isNaN(numberStr) && multiplierInfo !== null) {

            let int = parseInt(numberStr);

            ms += int * multiplierInfo.multiplier;
        }
    });
    return ms;
}

function msToTimespan(ms, magnitudes = null) {

    if (ms === null) return null;
    let timeArr = [];
    let multiplier = 1;
    let started = false;

    //Years
    multiplier = getTimeMultiplier('y').multiplier;
    let years = Math.floor(ms / multiplier);
    let years_str = years + "y";
    let years_in_ms = years * multiplier;
    if (years > 0) {
        started = true;
        timeArr.push(years_str);
        ms = ms - years_in_ms;
    }

    //Days
    multiplier = getTimeMultiplier('d').multiplier;
    let days = Math.floor(ms / multiplier);
    let days_str = days + "d";
    let days_in_ms = days * multiplier;
    if (days > 0 || started) {
        started = true;
        timeArr.push(days_str);
        ms = ms - days_in_ms;
    }

    //Hours
    multiplier = getTimeMultiplier('h').multiplier;
    let hours = Math.floor(ms / multiplier);
    let hours_str = hours + "h";
    let hours_in_ms = hours * multiplier;
    if (hours > 0 || started) {
        started = true;
        timeArr.push(hours_str);
        ms = ms - hours_in_ms;
    }

    //Minutes
    multiplier = getTimeMultiplier('m').multiplier;
    let minutes = Math.floor(ms / multiplier);
    let minutes_str = minutes + "m";
    let minutes_in_ms = minutes * multiplier;
    if (minutes > 0 || started) {
        started = true;
        timeArr.push(minutes_str);
        ms = ms - minutes_in_ms;
    }

    //Seconds
    multiplier = getTimeMultiplier('s').multiplier;
    let seconds = Math.floor(ms / multiplier);
    let seconds_str = seconds + "s";
    let seconds_in_ms = seconds * multiplier;
    if (seconds > 0 || started) {
        started = true;
        timeArr.push(seconds_str);
        ms = ms - seconds_in_ms;
    }

    //Milliseconds
    let ms_str = ms + "ms";
    timeArr.push(ms_str);

    if (magnitudes === null) return timeArr.join(" ");
    else return timeArr.slice(0, magnitudes).join(" ");
}

function timeToMs(time) {
    //shortcuts
    if (time == 0 || time === "0" || time === "" || time === null) return 0;

    let ms = 0;
    let timeKeys = {
        0: 'h',
        1: 'm',
        2: 's',
        3: 'ms'
    }

    let arr = time.split(":");
    arr.forEach((item, index) => {
        let multiplierInfo = getTimeMultiplier(timeKeys[index]);
        //Hours
        if (index == 0) {
            if (!isNaN(item)) {
                let int = parseInt(item);
                if (int > 23) int = 23;
                ms += int * multiplierInfo.multiplier;
            }
        }

        //Minutes
        if (index == 1) {
            if (!isNaN(item)) {
                let int = parseInt(item);
                if (int > 59) int = 59;
                ms += int * multiplierInfo.multiplier;
            }
        } else if (index == 2) {
            let arr2 = item.split(".");

            //seconds
            let secondsStr = item.split(".")[0];
            if (!isNaN(secondsStr)) {
                let seconds = parseInt(secondsStr);
                if (seconds > 59) seconds = 59;
                ms += seconds * multiplierInfo.multiplier;
            }

            //milliseconds
            if (arr2.length > 1) {
                let msStr = item.split(".")[1];
                if (!isNaN(msStr)) {
                    let milliseconds = parseInt(msStr);
                    if (milliseconds > 999) milliseconds = 999;
                    ms += milliseconds;
                }
            }
        }
    });
    return ms;
}

function msToTime(ms) {
    let limit = 24 * 3600 * 1000 - 1;
    if (ms > limit) ms = limit;

    let timeString = [];
    let leadingZero = function (int, digits = 2) {
        if (digits == 2)
            return int > 9 ? int : "0" + int;
        else if (digits == 3) {
            return int <= 9 ? "00" + int : int <= 99 ? int + "0" : int;
        }
        return int;
    }


    //Hours
    multiplier = getTimeMultiplier('h').multiplier;
    let hours = Math.floor(ms / multiplier);
    timeString = leadingZero(hours);
    let hours_in_ms = hours * multiplier;
    ms = ms - hours_in_ms;

    //Minutes
    multiplier = getTimeMultiplier('m').multiplier;
    let minutes = Math.floor(ms / multiplier);
    timeString += ":" + leadingZero(minutes);
    let minutes_in_ms = minutes * multiplier;
    ms = ms - minutes_in_ms;

    //Seconds
    multiplier = getTimeMultiplier('s').multiplier;
    let seconds = Math.floor(ms / multiplier);
    timeString += ":" + leadingZero(seconds);
    let seconds_in_ms = seconds * multiplier;
    ms = ms - seconds_in_ms;

    //Milliseconds
    timeString += "." + leadingZero(ms, 3);
    return timeString;
}

function bytesToString(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if (bytes == 0) {
        return "n/a";
    }

    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

    if (i == 0) {
        return bytes + " " + sizes[i];
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

export const helpers = {
    sanitizeString: sanitizeString,
    parseDateString: parseDateString,
    extractEntries: extractEntries,
    getTimeMultiplier: getTimeMultiplier,
    timespanToMs: timespanToMs,
    msToTimespan: msToTimespan,
    timeToMs: timeToMs,
    msToTime: msToTime,
    bytesToString: bytesToString
}