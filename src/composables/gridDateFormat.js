import dayjs from "dayjs";

const gridDateFormat = (data) => {
    for (let i = 0; i < data.length; i++) {
        data[i].Date = dayjs(data[i].Date).format("MM/DD/YY");
    }
    
    return data;
}

export default gridDateFormat