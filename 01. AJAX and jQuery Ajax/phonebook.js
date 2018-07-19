const BASE_URL = "https://phonebook-4640e.firebaseio.com/phonebook";
const TABLE = $('#phonebook');
const PERSON = $('#person');
const PHONE = $('#phone');

$('#btnLoad').on("click", loadContacts);
$('#btnCreate').on("click", addContact);
$('#btnDelete').on('click', deleteContact);

function deleteContact() {
    let nameContact = $('#name');
    let name = $(nameContact).val();
    $.ajax({
        method: "GET",
        url: BASE_URL + ".json",
        success: contactFunction,
        error: handleError
    });
    function contactFunction(contacts) {
        for (let contactId in contacts) {
            if (contacts[contactId].name == name){
                $.ajax({
                    method: "Delete",
                    url: `${BASE_URL}/${contactId}/.json`,
                    success: "",
                    error: handleError,
                });
                break;
            }
        }
    }
}

function loadContacts() {
    $.ajax({
        method: "GET",
        url: BASE_URL + ".json",
        success: appendContacts,
        error: handleError
    });
    function appendContacts(contacts) {
        TABLE.empty();
        for (let key in contacts) {
            console.log(key);
            let li = $('<li>');
            li.text(`${contacts[key].name}: ${contacts[key].phone}`);
            TABLE.append(li);
        }
    }
}

function addContact() {
    let name = PERSON.val();
    let phone = PHONE.val();
    if (name !== "" && phone !== "") {
        $.ajax({
            method: 'POST',
            url: BASE_URL + '.json',
            data: JSON.stringify({name, phone}),
            success: appendContact,
            error: handleError
        });
    }
    function appendContact() {
        let li = $('<li>');
        li.text(`${name}: ${phone}`);
        TABLE.append(li);
        PERSON.val("");
        PHONE.val("");
    }
}

function handleError(error) {
    console.log(error);
}
