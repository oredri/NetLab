var lastX = [2];
var lastY = [2];

function addListenerToBar(xCord, yCord, index, clustering) {
    xCord.addEventListener("change", function() {
        if (xCord.value == yCord.value) {
            alerty.toasts("Choose different values.");
            xCord.selectedIndex = lastX[index];
        } else {
            clustering.plotPoints();
            window.myScatter.update();
            lastX[index] = xCord.selectedIndex;
        }
    });

    yCord.addEventListener("change", function() {
        if (xCord.value == yCord.value) {
            alerty.toasts("Choose different values.");
            yCord.selectedIndex = lastY[index];
        } else {
            clustering.plotPoints();
            window.myScatter.update();
            lastY[index] = yCord.selectedIndex;
        }
    });
}

function TriggerAnotherValue(clustering, idx, numOfGroup, numberOfFlag) { //when user move on some point, he see the same point in the second clustering model
    if (numberOfFlag == 1)
        flagTrigger1 = 1;
    if (numberOfFlag == 2)
        flagTrigger2 = 1;
    indexForTrigger = idx;
    var meta = (clustering.scatter).getDatasetMeta(numOfGroup);
    rect = (clustering.scatter).canvas.getBoundingClientRect();
    point = meta.data[idx].getCenterPoint();
    evt = new MouseEvent('mousemove', {
            clientX: rect.left + point.x,
            clientY: rect.top + point.y
        }),
        node = (clustering.scatter).canvas;
    node.dispatchEvent(evt);
}

$(document).ready(function() {
    var task1 = JSON.parse(window.localStorage.getItem("task1"));
    var task2 = JSON.parse(window.localStorage.getItem("task2"));
    var coclusteringtable = JSON.parse(window.localStorage.getItem("coclusteringtable"));

    var ctx1 = document.getElementById('canvas1').getContext('2d');
    var ctx2 = document.getElementById('canvas2').getContext('2d');

    var xCord1 = document.getElementById("xCord1");
    var xCord2 = document.getElementById("xCord2");

    var yCord1 = document.getElementById("yCord1");
    var yCord2 = document.getElementById("yCord2");

    var kmeansLabels1 = JSON.parse(window.localStorage.getItem("labels1"));
    var data1 = task1[0].dataset;
    var dataset_clustering_cols1 = task1[0].datasetcols;

    var kmeansLabels2 = JSON.parse(window.localStorage.getItem("labels2"));
    var data2 = task2[0].dataset;
    var dataset_clustering_cols2 = task2[0].datasetcols;

    var dataLength = data1[0].length;
    for (i = 0; i < data1.length; i++)
        data1[i][dataLength] = i + 1;

    var dataLength = data2[0].length;
    for (i = 0; i < data2.length; i++)
        data2[i][dataLength] = i + 1;
    var indexForTrigger = 0;
    var flagTrigger1 = 0;
    var flagTrigger2 = 0;
    //create 2 clustering models for Comparison
    var clustering1 = new Clustering(kmeansLabels1, data1, dataset_clustering_cols1, ctx1, xCord1, yCord1, JSON.parse(window.localStorage.getItem("taskName1")));
    var clustering2 = new Clustering(kmeansLabels2, data2, dataset_clustering_cols2, ctx2, xCord2, yCord2, JSON.parse(window.localStorage.getItem("taskName2")));

    clustering1.plotPoints();//ploting points to cluster1

    clustering2.plotPoints();//ploting points to cluster2

    addListenerToBar(xCord1, yCord1, 0, clustering1);
    addListenerToBar(xCord2, yCord2, 1, clustering2);
    var cell;
    var subcluster;
    var row;
    var co_length = coclusteringtable.length;
    var table = document.getElementById("myTable");
    header = table.insertRow(0);
    header.style.backgroundColor = "red";
    head_cell = header.insertCell(0);
    head_cell.style.position = "absolute";
    head_cell.style.textAlign = "left";
    head_cell.style.color = "white";
    head_cell.style.backgroundColor = "#2980B9";

    for (var i = 0; i < co_length; i++) { //create the co-clustering table.
        head_cell = header.insertCell(i + 1);
        head_cell.innerHTML = clustering2.headline + ' Cluster' + (i + 1);
        head_cell.style.backgroundColor = "#2980B9";
        head_cell.style.color = "white";
        subcluster = coclusteringtable[i]
        row = table.insertRow(-1);
        cell = row.insertCell(0);
        cell.innerHTML = clustering1.headline + ' Cluster' + (i + 1);
        cell.style.backgroundColor = "#2980B9";
        cell.style.color = "white";
        for (var j = 0; j < subcluster.length; j++) {
            cell = row.insertCell(j + 1);
            cell.innerHTML = subcluster[j];
            cell.style.backgroundColor = "#F8F8F8";
        }
    }

    window.myScatter = Chart.Scatter(clustering1.ctx, { //print the first clustering on the screen
        data: {
            datasets: clustering1.datasetValue
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var index;
                        var numOfGroup;
                        for (j = 0; j < clustering2.datasetValue.length; j++) {
                            for (i = 0; i < clustering2.scatter.tooltip._data.datasets[j].data.length; i++) {
                                if (parseInt(clustering2.scatter.tooltip._data.datasets[j].data[i].id) == this._data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].id) {
                                    index = i;
                                    numOfGroup = j;
                                }
                            }
                        }
                        if (flagTrigger1 == 1) {
                            flagTrigger1 = 0;
                            return "ID:" + this._data.datasets[tooltipItem.datasetIndex].data[indexForTrigger].id + ': ' + tooltipItem.yLabel + "," + tooltipItem.xLabel;
                        } else {
                            TriggerAnotherValue(clustering2, index, numOfGroup, 2);
                            return "ID:" + this._data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].id + ': ' + tooltipItem.yLabel + "," + tooltipItem.xLabel;
                        }

                    }
                }
            },
            title: {
                display: true,
                text: clustering1.headline
            },
        }
    });
    window.myScatter = Chart.Scatter(clustering2.ctx, { //print the first clustering on the screen
        data: {
            datasets: clustering2.datasetValue
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var index;
                        var numOfGroup;
                        for (j = 0; j < clustering1.datasetValue.length; j++) {
                            for (i = 0; i < clustering1.scatter.tooltip._data.datasets[j].data.length; i++) {
                                if (parseInt(clustering1.scatter.tooltip._data.datasets[j].data[i].id) == this._data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].id) {
                                    index = i;
                                    numOfGroup = j;
                                }
                            }
                        }
                        if (flagTrigger2 == 1) {
                            flagTrigger2 = 0;
                            return "ID:" + this._data.datasets[tooltipItem.datasetIndex].data[indexForTrigger].id + ': ' + tooltipItem.yLabel + "," + tooltipItem.xLabel;
                        } else {
                            TriggerAnotherValue(clustering1, index, numOfGroup, 1);
                            return "ID:" + this._data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].id + ': ' + tooltipItem.yLabel + "," + tooltipItem.xLabel;

                        }
                    }
                }
            },
            title: {
                display: true,
                text: clustering2.headline
            },
        }
    });
})