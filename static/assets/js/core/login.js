
document.getElementById("signin").addEventListener("click", function() {
  var form_data = new FormData();
  form_data.append('inputEmail', document.getElementById("your_name").value);
  form_data.append('password', document.getElementById("your_pass").value);
    $.ajax({
        type: 'POST',
        url: '/login',
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
            if(data.pstatus=="OK")
            {
                var userNameDB = document.getElementById("your_name").value;
                window.localStorage.setItem("userNameDB", JSON.stringify(userNameDB));
                window.location.pathname = 'static/examples/home.html'
            }

            else
                alert("The details are incorrect, please try again.");
        });

});