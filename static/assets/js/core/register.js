function submit_login_screen() {
    location.href = "/";
}
function ValidateEmail(mail)
{
 if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}
window.onload = function() { //register function to the system
    document.getElementById("register").addEventListener("click", function() {//this function contain constraint for the register logic
        if (document.getElementById("your_name").value == "" || document.getElementById("your_pass").value == "" || document.getElementById("your_username").value == null)
            alerty.toasts("1 or more of the fields is empty, please fill the all fields");
        else if (ValidateEmail(document.getElementById("your_name").value)==0)
            alerty.toasts("You have entered an invalid email address!");
        else {
            document.getElementById("loadingbar").style.visibility = 'visible';
            var form_data = new FormData();
            form_data.append('inputEmail', document.getElementById("your_name").value);
            form_data.append('password', document.getElementById("your_pass").value);
            form_data.append('userFullName', document.getElementById("your_username").value);
            $.ajax({
                    type: 'POST',
                    url: '/register',
                    data: form_data,
                    contentType: false,
                    cache: false,
                    processData: false,
                    success: function(data) {
                        console.log('Success!');

                    },
                })
                .done(function(data) {
                    if (data.error) {
                        alerty.toasts(data.error);
                        setTimeout(function() {
                            location.reload();
                        }, 2500);

                    } else {
                        alerty.toasts('Registration complete!', {
                            bgColor: '#ccc',
                            fontColor: '#000',
                            place: 'top',
                        })
                        setTimeout(function() {
                            location.href = "/";
                        }, 2500);
                    }
                });
        }
    });
};