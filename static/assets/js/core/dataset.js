function getDataFromjexcel(){
    var form_data = new FormData();
    form_data.append('dataset',JSON.stringify(jexcelSpreadSheet.getData()));
    form_data.append('datasetcols',JSON.stringify(jexcelSpreadSheet.getHeaders()));
    return(form_data);
}

$( document ).ready(function() {
    var idExp = JSON.parse(window.localStorage.getItem("idExp"));
    var idTask = JSON.parse(window.localStorage.getItem("idTask"));
    var experiments = JSON.parse(window.localStorage.getItem("experiments"));

                jexcelSpreadSheet=jexcel(document.getElementById('spreadsheet1'), {
                    //colHeaders: data.excelCols,
                    //data:data.excelDetails,
                    data:experiments[parseInt(idExp)-1].task[parseInt(idTask)-1].dataset,
                    csvHeaders:true,
                    tableOverflow:true,

                    loadingSpin:true,
                    colWidths: [ 300, 80, 100 ],
                });
    window.localStorage.setItem("dataset_clustering", JSON.stringify(experiments[parseInt(idExp)-1].task[parseInt(idTask)-1].dataset));
    window.localStorage.setItem("dataset_clustering_cols",JSON.stringify(jexcelSpreadSheet.getHeaders()));
});

$('#goK2').click(function() {
    var form_data = getDataFromjexcel();
    $.ajax({
    type: 'POST',
    url: '/goK2',
    data: form_data,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {
        console.log('Success!');
    },
})
    .done(function (data) {
        if (data.error) {
            confirm(data.error);
        }
    alert(data.dataset_k2)
    window.localStorage.setItem("dataset_k2", JSON.stringify(data.dataset_k2));
    window.localStorage.setItem("categories", JSON.stringify(data.categories));

    });
});
$('#goKmeans').click(function() {
    var form_data = getDataFromjexcel();
    form_data.append('clusteringNum', document.getElementById("clusteringNum").value);
    $.ajax({
    type: 'POST',
    url: '/goKmeans',
    data: form_data,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {
        console.log('Success!');
    },
})
    .done(function (data) {
        if (data.error) {
            confirm(data.error);
        }
    window.localStorage.setItem("dataset_clustering", JSON.stringify(data.inputArray));
    window.localStorage.setItem("kmeansLabels", JSON.stringify(data.kmeansLabels));
    window.localStorage.setItem("dataset_clustering_cols",JSON.stringify(jexcelSpreadSheet.getHeaders()));
    });
});