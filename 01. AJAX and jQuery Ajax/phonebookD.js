const BASE_URL = "https://phonebook-4640e.firebaseio.com/";
const TABLE = $('phonebook');

$('#btnLoad').on("click", loadContacts);


function loadContacts() {
    $.ajax({
        method: "GET",
        url: BASE_URL + ".json"
    }).then(appendContacts)
        .catch(handleError);
}

function appendContacts(contacts) {
    for (let key in contacts) {
        let li = $('<li>');
        li.text(`${contacts[key].name}: ${contacts[key].phone}`);
        TABLE.append(li);
    }
}

function handleError(error) {

}
