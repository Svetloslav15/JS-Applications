function attachEvents() {
    const BASE_URL = 'https://messenger-37991.firebaseio.com/messenger.json';
    $('#submit').on("click", submitFunction);
    $('#refresh').on("click", refreshFunction);
    
    function submitFunction() {
        let author = $('#author').val();
        let content = $('#content').val();
        let timestamp = Date.now();
        let message = {
            author,
            content,
            timestamp
        };
        $.ajax({
            method: "POST",
            url: BASE_URL,
            data: JSON.stringify(message),
        });
    }
    
    function refreshFunction() {
        $('textarea').empty();
        $.ajax({
            method: 'GET',
            url: BASE_URL,
            success: function (data) {
                let keys = Object.keys(data).sort((a, b) => a.timestamp - b.timestamp);
                console.log(data);
                for (let id of keys) {
                    let currentMessage = `${data[id].author}: ${data[id].content}\n`;
                    console.log(currentMessage);
                    $('textarea').append(currentMessage);
                }
            }
        })
    }
}