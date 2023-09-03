$(document).ready(function(){
    $('.statusBtn').click(function() {
        var id = $(this).attr('id').split("-")[1];
        if($(this).text() === 'Play') {
            $(this).text('Pause');
        }
        else {
            $(this).text('Play');
        }
    });
    
    $('.delBtn').click(function() {
        var id = $(this).attr('id').split("-")[1];
        // AJAX call to delete entry
        $.ajax({
            url: '/delete/' + id,
            type: 'DELETE',
            success: function(result) {
                $('#tr-'+id).remove();
            }
        })
    });
});