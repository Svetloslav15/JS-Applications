function solution() {
    $('#firstname').on("input", changeEmail);
    $('#lastname').on("input", changeEmail);
    $('#company').on("input", changeEmail);
    $('#branch').on("input", changeEmail);

    function changeEmail() {
        let firstName = $('#firstname').val();
        let lastname = $('#lastname').val();
        let company = $('#company').val();
        let branch = $('#branch').val();
        let result = `${firstName[0]}_${lastname}@${branch}-${company}.com`;
        $('#result').val(result);
    }
}