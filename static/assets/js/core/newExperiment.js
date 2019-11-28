var currId;
document.getElementById("createExp").addEventListener("click", function() {
  var userNameDB = JSON.parse(window.localStorage.getItem("userNameDB"));
  var name = document.getElementById("name").value;
  var description = document.getElementById("description").value;
  var form_data = new FormData();
  form_data.append('name', name);
  form_data.append('description',description);
  form_data.append('userName',userNameDB);//document.getElementById("userName").value);
    $.ajax({
        type: 'POST',
        url: '/createExperiment',
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
        success: function (data) {
            console.log('Success!');
        },
    })
        .done(function (data) {
            if (data.error) {
                confirm(data.error);
            }
            var experiments = JSON.parse(window.localStorage.getItem("experiments"));
            experiments.push(new Experiment(data.nextId,name,description,userNameDB,null));
            window.localStorage.setItem("experiments",JSON.stringify(experiments));
            alert("Experiment has been added successfully");
        });

});