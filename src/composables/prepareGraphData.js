const prepareGraphData = (data) => {
    let myData = {};
    let keys = Object.keys(data[0]);
    let graph_date = [];
    let graph_series = [];

    // extract the incoming data into pair of key and array. Key => column name, Value (array) is all data of that column
    for (let i = 0; i < keys.length; i++) {
        myData[keys[i]] = data.map((a) => a[keys[i]]);
    }

    // it is an array of objects where each object is a collection of column name and data in that column
    let plottingData = [];

    // separate the myData object into an array where each element is an object (i.e curve having name and value)
    for (let i = 0; i < keys.length; i++) {
        let curve = { name: keys[i], data: myData[keys[i]] };
        plottingData.push(curve);
    }

    // separate the x-axis and y-axis (series) for plot
    let date = plottingData.filter((item) => item.name === "Date");
    graph_date = date[0].data;
    graph_series = plottingData.filter((item) => item.name !== "Date");

    return {graph_date, graph_series};
}

export default prepareGraphData